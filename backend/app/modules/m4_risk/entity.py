"""R3 entity classification: what an address is, with a confidence and the sources behind it.

Pure function over the labels that M3 holds for the address (`labels_for`). It never calls a provider and
never decides risk: the rule sets score exposure; this only answers "what kind of entity is this?".

Precedence when labels disagree: the most serious category wins (sanctions over exchange, and so on),
and a conflict between a risk label and a service label is flagged, not hidden.

Limits (stated in the output): no contract/EOA detection yet (needs provider calls), and an address with
no label is "unknown", never "clean".
"""

from collections.abc import Iterable
from dataclasses import dataclass, field

from app.modules.m3_data.labels.lookup import LabelView

# Most serious first. Each label category maps to one entity type.
PRECEDENCE: tuple[tuple[str, str, str], ...] = (
    # (label category, entity type, group)
    ("sanctions", "sanctioned", "risk"),
    ("ransomware", "ransomware", "risk"),
    ("hack", "hack", "risk"),
    ("phishing", "phishing", "risk"),
    ("scam", "scam", "risk"),
    ("mixer", "mixer", "risk"),
    ("darknet", "darknet", "risk"),
    ("gambling", "gambling", "risk"),
    ("exchange", "exchange", "service"),
    ("bridge", "bridge", "service"),
    ("defi", "defi", "service"),
    ("service", "service", "service"),
    ("other", "other", "service"),
)
ENTITY_BY_CATEGORY = {cat: (entity, group) for cat, entity, group in PRECEDENCE}
RISK_TYPES = frozenset(entity for _, entity, group in PRECEDENCE if group == "risk")
MAX_CONFIDENCE = 0.99
AGREEMENT_STEP = 0.02  # each extra independent source for the same entity adds this much, capped below


@dataclass
class EntityClass:
    entity_type: str  # sanctioned | ransomware | ... | exchange | defi | service | other | unknown
    group: str  # risk | service | unknown
    confidence: float  # 0..0.99; 0 when unknown
    conflict: bool  # risk and service labels both present
    primary_source: str | None
    sources: list[str] = field(default_factory=list)  # distinct source keys backing the entity type
    name: str | None = None
    reasons: list[str] = field(default_factory=list)


def classify(views: Iterable[LabelView]) -> EntityClass:
    views = list(views)
    if not views:
        return EntityClass("unknown", "unknown", 0.0, False, None, reasons=["no label held for this address"])

    by_entity: dict[str, list[LabelView]] = {}
    for v in views:
        entity, _group = ENTITY_BY_CATEGORY.get(v.category, ("other", "service"))
        by_entity.setdefault(entity, []).append(v)

    chosen = next(entity for _cat, entity, _g in PRECEDENCE if entity in by_entity)
    group = ENTITY_GROUP_OF[chosen]
    conflict = {"risk", "service"} <= {ENTITY_GROUP_OF[e] for e in by_entity}

    labels = by_entity[chosen]
    top = max(labels, key=lambda v: v.confidence)
    sources = sorted({v.source_key for v in labels})
    confidence = min(MAX_CONFIDENCE, top.confidence + AGREEMENT_STEP * (len(sources) - 1))

    reasons = [f"{chosen} label from {len(sources)} source(s): {', '.join(sources)}"]
    if len(sources) > 1:
        reasons.append("several independent sources agree")
    if conflict:
        reasons.append("also carries service labels; scored as the risk entity (conservative)")
    if top.commercial_use != "allowed":
        reasons.append(f"top label source is not cleared for commercial use ({top.commercial_use})")

    return EntityClass(
        entity_type=chosen,
        group=group,
        confidence=round(confidence, 2),
        conflict=conflict,
        primary_source=top.source_key,
        sources=sources,
        name=top.name or None,
        reasons=[r for r in reasons if r],
    )


ENTITY_GROUP_OF = {entity: group for _cat, entity, group in PRECEDENCE}
