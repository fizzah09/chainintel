"""Model risk management: a model scores live wallets only after independent validation and approval.

Lifecycle: registered -> validated -> approved -> retired (or rejected at any step before approval).
- Validation: someone who did not train the model, with the `model_validator` role. Automatic checks
  run and are stored as evidence (artefact integrity, minimum test metrics).
- Approval: a `model_approver` who is neither the trainer nor the validator (four eyes). Approving a
  model retires the previously approved one; only one is active per model name.
- Every decision is appended to `model_reviews`, which cannot be edited.
- Artefacts are stored content-addressed (<sha256>.json) and never overwritten.
"""

import hashlib
import json
import shutil
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m4_risk.engine.classifier import DEFAULT_MODEL, Model, load_model
from app.modules.m4_risk.models import ModelReview, ModelVersion


def _now() -> datetime:
    return datetime.now(UTC)


class GovernanceError(Exception):
    pass


class ModelRegistry:
    def __init__(self, db: Session, settings: Settings, clock: Callable[[], datetime] = _now):
        self.db = db
        self.settings = settings
        self.clock = clock

    @property
    def store(self) -> Path:
        return Path(self.settings.model_store_dir)

    def artefact_path(self, sha256: str) -> Path:
        return self.store / f"{sha256}.json"

    # ---- lifecycle --------------------------------------------------------------------------------

    def register(
        self, artefact: Path, *, trained_by: str, actor: Principal, training_report: dict | None = None, notes: str | None = None
    ) -> ModelVersion:
        raw = Path(artefact).read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        if self.db.scalar(select(ModelVersion).where(ModelVersion.sha256 == sha)):
            raise GovernanceError(f"model {sha[:12]} is already registered")
        data = json.loads(raw)
        for key in ("name", "version", "features", "trees", "metrics"):
            if key not in data:
                raise GovernanceError(f"artefact is missing '{key}'")
        target = self.artefact_path(sha)
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            shutil.copyfile(artefact, target)
        report = training_report or {}
        mv = ModelVersion(
            name=data["name"], version=data["version"], sha256=sha, status="registered", trained_by=trained_by,
            trained_at=report.get("trained"),
            training_data={
                **report.get("dataset", {}),
                "description": data.get("notes"),
                "licence": "Public research dataset (Kaggle Ethereum Fraud Detection); confirm licence before commercial use",
            },
            metrics={**data["metrics"], **({"test": report["test"]} if "test" in report else {})},
            registered_by=actor.user_id, registered_at=self.clock(), notes=notes,
        )
        self.db.add(mv)
        self.db.flush()
        self._log(mv, "registered", actor, notes or "registered", {"sha256": sha, "stored_as": target.name})
        self.db.commit()
        return mv

    def validate(self, model_id: int, actor: Principal, comment: str) -> ModelReview:
        mv = self._get(model_id)
        self._require(mv, "registered", actor, "model_validator")
        if actor.user_id == mv.trained_by:
            raise GovernanceError("the person who trained a model cannot validate it")
        evidence = self._checks(mv)
        if not evidence["passed"]:
            raise GovernanceError("automatic checks failed: " + "; ".join(evidence["failures"]))
        mv.status = "validated"
        review = self._log(mv, "validated", actor, comment, evidence)
        self.db.commit()
        return review

    def approve(self, model_id: int, actor: Principal, comment: str) -> ModelReview:
        mv = self._get(model_id)
        self._require(mv, "validated", actor, "model_approver")
        validator = self.db.scalar(
            select(ModelReview.actor).where(ModelReview.model_id == mv.id, ModelReview.decision == "validated").order_by(ModelReview.id.desc())
        )
        if actor.user_id in (mv.trained_by, validator):
            raise GovernanceError("approval needs a fourth pair of eyes: not the trainer and not the validator")
        current = self.active(mv.name)
        if current is not None:
            current.status = "retired"
            self._log(current, "retired", actor, f"superseded by {mv.version} ({mv.sha256[:12]})", {})
            self.db.flush()  # free the one-approved-per-name slot first
        mv.status = "approved"
        review = self._log(mv, "approved", actor, comment, {"supersedes": current.sha256 if current else None})
        self.db.commit()
        return review

    def reject(self, model_id: int, actor: Principal, comment: str) -> ModelReview:
        mv = self._get(model_id)
        if mv.status not in ("registered", "validated"):
            raise GovernanceError(f"cannot reject a model that is {mv.status}")
        self._require_role(actor, "model_validator", "model_approver")
        mv.status = "rejected"
        review = self._log(mv, "rejected", actor, comment, {})
        self.db.commit()
        return review

    def retire(self, model_id: int, actor: Principal, comment: str) -> ModelReview:
        mv = self._get(model_id)
        if mv.status != "approved":
            raise GovernanceError("only an approved model can be retired")
        self._require_role(actor, "model_approver")
        mv.status = "retired"
        review = self._log(mv, "retired", actor, comment, {})
        self.db.commit()
        return review

    # ---- lookup -----------------------------------------------------------------------------------

    def active(self, name: str) -> ModelVersion | None:
        return self.db.scalar(select(ModelVersion).where(ModelVersion.name == name, ModelVersion.status == "approved"))

    def model_for_assessment(self) -> tuple[Model, str, int | None]:
        """(model, status, model_version_id). Production refuses to score without an approved model;
        development falls back to the bundled artefact and marks every assessment 'unapproved'."""
        mv = self.active(self.settings.model_name)
        if mv is not None:
            path = self.artefact_path(mv.sha256)
            if not path.exists():
                raise GovernanceError(f"approved model artefact {path.name} is missing from the model store")
            # Hash the file itself each time: the in-memory model cache would not notice a swapped file.
            if hashlib.sha256(path.read_bytes()).hexdigest() != mv.sha256:
                raise GovernanceError("approved model artefact does not match its registered fingerprint")
            return load_model(path), "approved", mv.id
        if self.settings.env in ("staging", "production"):
            raise GovernanceError("no approved model: register, validate and approve one before scoring")
        return load_model(DEFAULT_MODEL), "unapproved", None

    # ---- helpers ----------------------------------------------------------------------------------

    def _checks(self, mv: ModelVersion) -> dict:
        failures = []
        path = self.artefact_path(mv.sha256)
        if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != mv.sha256:
            failures.append("stored artefact missing or does not match its fingerprint")
        auc = (mv.metrics.get("test") or {}).get("roc_auc", mv.metrics.get("roc_auc"))
        brier = (mv.metrics.get("test") or {}).get("brier", mv.metrics.get("brier"))
        if auc is None or auc < self.settings.model_min_roc_auc:
            failures.append(f"ROC AUC {auc} below the minimum {self.settings.model_min_roc_auc}")
        if brier is None or brier > self.settings.model_max_brier:
            failures.append(f"Brier score {brier} above the maximum {self.settings.model_max_brier}")
        return {
            "passed": not failures, "failures": failures, "roc_auc": auc, "brier": brier,
            "thresholds": {"min_roc_auc": self.settings.model_min_roc_auc, "max_brier": self.settings.model_max_brier},
        }

    def _get(self, model_id: int) -> ModelVersion:
        mv = self.db.get(ModelVersion, model_id)
        if mv is None:
            raise GovernanceError("model not found")
        return mv

    def _require(self, mv: ModelVersion, status: str, actor: Principal, role: str) -> None:
        if mv.status != status:
            raise GovernanceError(f"model is {mv.status}; expected {status}")
        self._require_role(actor, role)

    @staticmethod
    def _require_role(actor: Principal, *roles: str) -> None:
        if not set(roles) & set(actor.roles):
            raise GovernanceError(f"requires role {' or '.join(roles)}")

    def _log(self, mv: ModelVersion, decision: str, actor: Principal, comment: str, evidence: dict) -> ModelReview:
        review = ModelReview(model_id=mv.id, decision=decision, actor=actor.user_id, comment=comment, evidence=evidence, created_at=self.clock())
        self.db.add(review)
        return review
