"""Address formats for every network a sanctions list can name, with checksum validation.

Official lists (OFAC, UK, EU) name Bitcoin, Tron, Monero and other addresses besides EVM ones. Every
address is checked against its network's format and checksum before it becomes a label, so a typo in
a list, or a random word that happens to look like an address in free text, is never imported.

`validate(network, address)` returns the canonical form (EVM and bech32 lowercased; base58 kept as is,
because base58 is case-sensitive) and how strongly it was checked: "checksum" or "format" (Monero and
Solana have no checksum we can verify offline).
"""

import hashlib
import re
from dataclasses import dataclass

EVM = "evm"
NETWORKS = (
    EVM, "bitcoin", "tron", "litecoin", "bitcoin_cash", "bitcoin_sv", "bitcoin_gold", "dogecoin", "dash",
    "zcash", "monero", "ripple", "solana", "verge", "bnb_beacon",
)

# Ticker as written in the OFAC SDN list ("Digital Currency Address - XBT") -> network. Tickers that
# are tokens on several networks (USDT, USDC) map to None: the address format decides.
TICKER_NETWORK: dict[str, str | None] = {
    "XBT": "bitcoin", "BTC": "bitcoin", "ETH": EVM, "ETC": EVM, "ARB": EVM, "BSC": EVM, "USDC": None,
    "USDT": None, "TRX": "tron", "LTC": "litecoin", "BCH": "bitcoin_cash", "BSV": "bitcoin_sv",
    "BTG": "bitcoin_gold", "DOGE": "dogecoin", "DASH": "dash", "ZEC": "zcash", "XMR": "monero",
    "XRP": "ripple", "SOL": "solana", "XVG": "verge", "BNB": "bnb_beacon",
}


@dataclass(frozen=True)
class Checked:
    network: str
    address: str  # canonical form
    validation: str  # checksum | format


# ---- base58 ---------------------------------------------------------------------------------------

_B58_BTC = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
_B58_XRP = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"


def b58decode(s: str, alphabet: str = _B58_BTC) -> bytes | None:
    n = 0
    for ch in s:
        i = alphabet.find(ch)
        if i < 0:
            return None
        n = n * 58 + i
    body = n.to_bytes((n.bit_length() + 7) // 8, "big") if n else b""
    pad = len(s) - len(s.lstrip(alphabet[0]))
    return b"\x00" * pad + body


def _b58check(s: str, alphabet: str = _B58_BTC) -> bytes | None:
    """Payload (version + data) when the 4-byte double-SHA256 checksum matches, else None."""
    raw = b58decode(s, alphabet)
    if raw is None or len(raw) < 5:
        return None
    payload, check = raw[:-4], raw[-4:]
    return payload if hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4] == check else None


def _b58_versions(s: str, versions: set[int], length: int = 21) -> bool:
    p = _b58check(s)
    return p is not None and len(p) == length and p[0] in versions


# ---- bech32 / bech32m (BIP-173, BIP-350) ----------------------------------------------------------

_BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"


def _bech32_polymod(values: list[int]) -> int:
    gen = (0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3)
    chk = 1
    for v in values:
        top = chk >> 25
        chk = (chk & 0x1FFFFFF) << 5 ^ v
        for i in range(5):
            chk ^= gen[i] if (top >> i) & 1 else 0
    return chk


def bech32_decode(s: str) -> tuple[str, list[int], str] | None:
    """(hrp, data without checksum, "bech32" | "bech32m"), or None if the checksum fails."""
    if s.lower() != s and s.upper() != s:
        return None
    s = s.lower()
    pos = s.rfind("1")
    if pos < 1 or pos + 7 > len(s) or len(s) > 90:
        return None
    hrp, data = s[:pos], []
    for ch in s[pos + 1 :]:
        i = _BECH32.find(ch)
        if i < 0:
            return None
        data.append(i)
    poly = _bech32_polymod([ord(c) >> 5 for c in hrp] + [0] + [ord(c) & 31 for c in hrp] + data)
    kind = {1: "bech32", 0x2BC830A3: "bech32m"}.get(poly)
    return (hrp, data[:-6], kind) if kind else None


def _segwit(s: str, hrp: str) -> bool:
    d = bech32_decode(s)
    if d is None or d[0] != hrp or not d[1]:
        return False
    version, prog5 = d[1][0], d[1][1:]
    if version > 16 or (version == 0) != (d[2] == "bech32"):
        return False
    nbytes = len(prog5) * 5 // 8
    return 2 <= nbytes <= 40 and (version != 0 or nbytes in (20, 32))


# ---- BCH cashaddr ---------------------------------------------------------------------------------


def _cashaddr(s: str) -> bool:
    s = s.lower()
    if not s.startswith("bitcoincash:"):
        s = "bitcoincash:" + s
    prefix, _, payload = s.partition(":")
    if not payload or payload[0] not in "qp":
        return False
    data = []
    for ch in payload:
        i = _BECH32.find(ch)
        if i < 0:
            return False
        data.append(i)
    c = 1
    for d in [ord(ch) & 31 for ch in prefix] + [0] + data:
        c0 = c >> 35
        c = ((c & 0x07FFFFFFFF) << 5) ^ d
        for bit, g in enumerate((0x98F2BC8E61, 0x79B76D99E2, 0xF33E5FB3C4, 0xAE2EABE2A8, 0x1E4F43E470)):
            if (c0 >> bit) & 1:
                c ^= g
    return c ^ 1 == 0 and len(payload) == 42


# ---- keccak-256 for EIP-55 (hashlib.sha3_256 is the NIST variant, which pads differently) ----------

_RC = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000, 0x000000000000808B,
    0x0000000080000001, 0x8000000080008081, 0x8000000000008009, 0x000000000000008A, 0x0000000000000088,
    0x0000000080008009, 0x000000008000000A, 0x000000008000808B, 0x800000000000008B, 0x8000000000008089,
    0x8000000000008003, 0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]
_ROT = [[0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61], [28, 55, 25, 21, 56], [27, 20, 39, 8, 14]]
_M = (1 << 64) - 1


def _keccak_f(a: list[list[int]]) -> None:
    for rc in _RC:
        c = [a[x][0] ^ a[x][1] ^ a[x][2] ^ a[x][3] ^ a[x][4] for x in range(5)]
        d = [c[(x - 1) % 5] ^ (((c[(x + 1) % 5] << 1) | (c[(x + 1) % 5] >> 63)) & _M) for x in range(5)]
        for x in range(5):
            for y in range(5):
                a[x][y] ^= d[x]
        b = [[0] * 5 for _ in range(5)]
        for x in range(5):
            for y in range(5):
                r = _ROT[x][y]
                b[y][(2 * x + 3 * y) % 5] = ((a[x][y] << r) | (a[x][y] >> (64 - r))) & _M if r else a[x][y]
        for x in range(5):
            for y in range(5):
                a[x][y] = b[x][y] ^ ((~b[(x + 1) % 5][y]) & b[(x + 2) % 5][y])
        a[0][0] ^= rc


def keccak256(data: bytes) -> bytes:
    rate = 136
    msg = bytearray(data) + b"\x01" + b"\x00" * ((-len(data) - 2) % rate) + b"\x80"
    if len(msg) % rate:  # single padding byte case: 0x01 and 0x80 share one byte
        msg = bytearray(data) + b"\x81"
    a = [[0] * 5 for _ in range(5)]
    for off in range(0, len(msg), rate):
        block = msg[off : off + rate]
        for i in range(rate // 8):
            a[i % 5][i // 5] ^= int.from_bytes(block[8 * i : 8 * i + 8], "little")
        _keccak_f(a)
    return b"".join(a[i % 5][i // 5].to_bytes(8, "little") for i in range(4))


def eip55_ok(address: str) -> bool:
    """True for all-lower / all-upper hex (no checksum given) or a correct EIP-55 mixed-case checksum."""
    body = address[2:]
    if body == body.lower() or body == body.upper():
        return True
    h = keccak256(body.lower().encode()).hex()
    return all((ch.upper() if int(h[i], 16) >= 8 else ch.lower()) == ch for i, ch in enumerate(body))


# ---- per-network validation -----------------------------------------------------------------------

_EVM_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")
_XMR_RE = re.compile(r"^[458][1-9A-HJ-NP-Za-km-z]{94}([1-9A-HJ-NP-Za-km-z]{11})?$")


def _check(network: str, a: str) -> str | None:
    """'checksum' / 'format' when `a` is a valid address on `network`, else None."""
    if network == EVM:
        if not _EVM_RE.match(a) or not eip55_ok(a):
            return None
        body = a[2:]
        return "format" if body in (body.lower(), body.upper()) else "checksum"  # single case = no checksum
    if network in ("bitcoin", "bitcoin_sv"):
        if a.lower().startswith("bc1"):
            return "checksum" if network == "bitcoin" and _segwit(a, "bc") else None
        return "checksum" if _b58_versions(a, {0x00, 0x05}) else None
    if network == "bitcoin_cash":
        if a[:1] in "13":
            return "checksum" if _b58_versions(a, {0x00, 0x05}) else None
        return "checksum" if _cashaddr(a) else None
    if network == "tron":
        return "checksum" if _b58_versions(a, {0x41}) else None
    if network == "litecoin":
        if a.lower().startswith("ltc1"):
            return "checksum" if _segwit(a, "ltc") else None
        return "checksum" if _b58_versions(a, {0x30, 0x32, 0x05}) else None
    if network in ("dogecoin", "verge"):
        return "checksum" if _b58_versions(a, {0x1E, 0x16}) else None
    if network == "dash":
        return "checksum" if _b58_versions(a, {0x4C, 0x10}) else None
    if network == "bitcoin_gold":
        return "checksum" if _b58_versions(a, {0x26, 0x17}) else None
    if network == "zcash":
        p = _b58check(a)
        return "checksum" if p is not None and len(p) == 22 and p[:2] in (b"\x1c\xb8", b"\x1c\xbd") else None
    if network == "ripple":
        p = _b58check(a, _B58_XRP)
        return "checksum" if p is not None and len(p) == 21 and p[0] == 0 else None
    if network == "bnb_beacon":
        d = bech32_decode(a)
        return "checksum" if d is not None and d[0] == "bnb" and d[2] == "bech32" else None
    if network == "monero":
        return "format" if _XMR_RE.match(a) else None
    if network == "solana":
        raw = b58decode(a)
        return "format" if raw is not None and len(raw) == 32 and 32 <= len(a) <= 44 else None
    return None


def canonical(network: str, address: str) -> str:
    a = address.strip()
    if network == EVM:
        return a.lower()
    if network == "bitcoin_cash" and a.lower().startswith("bitcoincash:"):
        a = a.split(":", 1)[1]
    if network in ("bitcoin", "litecoin", "bnb_beacon", "bitcoin_cash") and a[:1].lower() in ("b", "l", "q", "p"):
        # bech32 / cashaddr are case-insensitive; base58 addresses on these networks start with 1/3/L/M
        return a.lower()
    return a


def validate(network: str, address: str) -> Checked | None:
    a = address.strip()
    if network == "bitcoin_cash" and a.lower().startswith("bitcoincash:"):
        a = a.split(":", 1)[1]
    level = _check(network, a)
    return Checked(network, canonical(network, a), level) if level else None


def detect(address: str) -> Checked | None:
    """Network from the address alone, for the common formats (EVM, Tron, Bitcoin). Used when the
    ticker is a multi-network token (USDT) or when free text gives no ticker at all."""
    a = address.strip()
    for network in (EVM, "tron", "bitcoin"):
        c = validate(network, a)
        if c:
            return c
    return None


def from_ticker(ticker: str, address: str) -> tuple[Checked | None, bool]:
    """(checked address, ticker_mismatch). The ticker's own network first; if the address is not valid
    there but is a valid address of another common network (OFAC lists one Tron address under XBT),
    the address is labelled where it actually lives and the mismatch is flagged."""
    network = TICKER_NETWORK.get(ticker.upper())
    if network:
        c = validate(network, address)
        if c:
            return c, False
    c = detect(address)
    return c, bool(c and network)


# Free text (UK and EU lists put wallet addresses in remarks). Candidates only; `detect` decides.
FREE_TEXT_CANDIDATE = re.compile(
    r"(?<![0-9A-Za-z])("
    r"0x[0-9a-fA-F]{40}"
    r"|T[1-9A-HJ-NP-Za-km-z]{33}"
    r"|bc1[02-9ac-hj-np-zA-HJ-NP-Z]{8,87}"
    r"|[13][1-9A-HJ-NP-Za-km-z]{25,34}"
    r")(?![0-9A-Za-z])"
)


def addresses_in_text(text: str) -> list[Checked]:
    seen: dict[tuple[str, str], Checked] = {}
    for m in FREE_TEXT_CANDIDATE.finditer(text):
        c = detect(m.group(1))
        if c:
            seen.setdefault((c.network, c.address), c)
    return list(seen.values())
