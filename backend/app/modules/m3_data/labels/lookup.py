"""Label lookup for the engines. Every label comes back with its source, licence and the import that
created it, so a score can show where and when each label came from."""

from collections.abc import Iterable
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.m3_data.labels import address_formats as af
from app.modules.m3_data.models import AddressLabel, LabelSource
from app.modules.m3_data.providers.base import normalize_address


class LabelView(BaseModel):
    address: str
    network: str = af.EVM
    chain_id: int  # 0 = applies on every EVM chain
    category: str
    name: str
    confidence: float
    source_key: str
    source_name: str
    licence: str
    commercial_use: str
    source_ref: str | None
    attributes: dict
    valid_from: datetime
    valid_to: datetime | None
    import_id: int


def labels_for(
    db: Session,
    addresses: Iterable[str],
    chain_id: int,
    as_of: datetime | None = None,
    commercial_only: bool = False,
    network: str = af.EVM,
) -> dict[str, list[LabelView]]:
    """Labels per address, highest confidence first. `as_of` returns the labels that were active at
    that moment. `commercial_only` drops sources not cleared for commercial use (use in production).
    Off EVM (`network` = bitcoin, tron ...) pass chain_id 0; addresses must be valid for that network."""
    if network == af.EVM:
        addrs = sorted({normalize_address(a) for a in addresses})
    else:
        if network not in af.NETWORKS:
            raise ValueError(f"unknown network {network!r}")
        checked = [af.validate(network, a) for a in addresses]
        if any(c is None for c in checked):
            raise ValueError(f"every address must be a valid {network} address")
        addrs, chain_id = sorted({c.address for c in checked if c}), 0
    out: dict[str, list[LabelView]] = {a: [] for a in addrs}
    if not addrs:
        return out

    q = (
        select(AddressLabel, LabelSource)
        .join(LabelSource, LabelSource.key == AddressLabel.source_key)
        .where(
            AddressLabel.address.in_(addrs), AddressLabel.network == network, AddressLabel.chain_id.in_([0, chain_id])
        )
        .order_by(AddressLabel.address, AddressLabel.confidence.desc(), AddressLabel.source_key)
    )
    if as_of is None:
        q = q.where(AddressLabel.valid_to.is_(None))
    else:
        q = q.where(AddressLabel.valid_from <= as_of, or_(AddressLabel.valid_to.is_(None), AddressLabel.valid_to > as_of))
    if commercial_only:
        q = q.where(LabelSource.commercial_use == "allowed")

    for label, src in db.execute(q):
        out[label.address].append(
            LabelView(
                address=label.address, network=label.network, chain_id=label.chain_id, category=label.category, name=label.name,
                confidence=float(label.confidence), source_key=src.key, source_name=src.name, licence=src.licence,
                commercial_use=src.commercial_use, source_ref=label.source_ref, attributes=label.attributes,
                valid_from=label.valid_from, valid_to=label.valid_to, import_id=label.import_id,
            )
        )
    return out
