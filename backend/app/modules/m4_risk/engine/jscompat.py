"""Exact JavaScript arithmetic and formatting, so the Python engine reproduces the prototype's numbers.

Python differs from JS in ways that silently change scores:
- round() is half-to-even; Math.round is half-up.
- format(x, ".2f") is half-to-even on exact ties; Number.toFixed picks the larger value.
- sum() of floats is compensated (Neumaier) since 3.12; JS reduce adds left to right.
- str(35.0) is "35.0"; JS prints "35".
"""

import math
from collections.abc import Iterable
from datetime import UTC, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

DAY_MS = 86_400_000
_EPOCH = datetime(1970, 1, 1, tzinfo=UTC)


def js_round(x: float) -> int:
    """Math.round: halves go up (towards +infinity)."""
    return math.floor(x + 0.5)


def r1(x: float) -> float:
    """Math.round(x * 10) / 10"""
    return js_round(x * 10) / 10


def js_sum(xs: Iterable[float], start: float = 0) -> float:
    """Array.reduce((a, b) => a + b, start): plain left-to-right addition."""
    total = start
    for x in xs:
        total = total + x
    return total


def to_fixed(x: float, digits: int) -> str:
    """Number.prototype.toFixed: exact binary value, ties away from zero."""
    q = Decimal(1).scaleb(-digits)
    return str(Decimal(x).quantize(q, rounding=ROUND_HALF_UP)) if digits else str(Decimal(x).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def js_str(x: float | int) -> str:
    """Number to string as in a JS template literal: 35.0 -> "35", 17.5 -> "17.5"."""
    if isinstance(x, bool):
        return "true" if x else "false"
    if isinstance(x, int):
        return str(x)
    if math.isfinite(x) and x == int(x) and abs(x) < 1e21:
        return str(int(x))
    return repr(x)


def en_us(n: int | float) -> str:
    """(integer).toLocaleString('en-US')"""
    return f"{int(n):,}"


def parse_ms(iso: str) -> int:
    """Date.parse for ISO 8601 timestamps and plain dates (UTC). Integer milliseconds."""
    s = iso.strip()
    if len(s) == 10:  # YYYY-MM-DD is UTC midnight in JS
        s += "T00:00:00+00:00"
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return (dt - _EPOCH) // timedelta(milliseconds=1)


def to_iso(ms: float) -> str:
    """new Date(ms).toISOString() -> 2026-11-02T09:41:00.000Z"""
    dt = _EPOCH + timedelta(milliseconds=int(ms))
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"
