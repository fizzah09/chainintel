"""Model governance from the command line (an admin tool; the API with SSO identities comes in M4.5).

    python -m app.modules.m4_risk.cli models
    python -m app.modules.m4_risk.cli register --artefact app/modules/m4_risk/artifacts/illicit-classifier.json \\
        --trained-by "<name>" --training-report ../ml/reports/classifier-metrics.json --as "<your name>"
    python -m app.modules.m4_risk.cli validate 1 --as "<validator>" --comment "..."
    python -m app.modules.m4_risk.cli approve 1 --as "<approver>" --comment "..."
    python -m app.modules.m4_risk.cli drift --tenant dev-tenant

`--as` names the person acting. Validation and approval must be done by different people from the
trainer and from each other; the register records who did what.
"""

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_engine
from app.core.security import Principal
from app.modules.m4_risk.drift import drift_report
from app.modules.m4_risk.governance import GovernanceError, ModelRegistry
from app.modules.m4_risk.models import ModelVersion


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="models")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("models")
    reg = sub.add_parser("register")
    reg.add_argument("--artefact", type=Path, required=True)
    reg.add_argument("--trained-by", required=True)
    reg.add_argument("--training-report", type=Path)
    reg.add_argument("--notes")
    reg.add_argument("--as", dest="actor", required=True)
    for name, role in (("validate", "model_validator"), ("approve", "model_approver"), ("reject", "model_validator"), ("retire", "model_approver")):
        p = sub.add_parser(name)
        p.add_argument("model_id", type=int)
        p.add_argument("--as", dest="actor", required=True)
        p.add_argument("--comment", required=True)
        p.set_defaults(role=role)
    dr = sub.add_parser("drift")
    dr.add_argument("--tenant", required=True)
    dr.add_argument("--model-sha")
    args = ap.parse_args(argv)

    settings = get_settings()
    with Session(get_engine()) as db:
        registry = ModelRegistry(db, settings)
        try:
            if args.cmd == "models":
                for m in db.scalars(select(ModelVersion).order_by(ModelVersion.id)):
                    print(f"{m.id:3} {m.status:10} {m.name} {m.version} sha={m.sha256[:12]} trained_by={m.trained_by} auc={m.metrics.get('roc_auc')}")
                return 0
            if args.cmd == "register":
                report = json.loads(args.training_report.read_text(encoding="utf-8")) if args.training_report else None
                actor = Principal(user_id=args.actor, tenant_id="platform", roles=["model_owner"])
                m = registry.register(args.artefact, trained_by=args.trained_by, actor=actor, training_report=report, notes=args.notes)
                print(f"registered model {m.id}: {m.name} {m.version} sha={m.sha256[:12]}")
                return 0
            if args.cmd == "drift":
                sha = args.model_sha or (registry.active(settings.model_name) or ModelVersion(sha256="")).sha256
                print(drift_report(db, args.tenant, sha, datetime.now(UTC)).model_dump_json(indent=2))
                return 0
            actor = Principal(user_id=args.actor, tenant_id="platform", roles=[args.role])
            review = getattr(registry, args.cmd)(args.model_id, actor, args.comment)
            print(f"{review.decision} by {review.actor}: {review.evidence or ''}")
            return 0
        except GovernanceError as exc:
            print(f"refused: {exc}")
            return 1


if __name__ == "__main__":
    raise SystemExit(main())
