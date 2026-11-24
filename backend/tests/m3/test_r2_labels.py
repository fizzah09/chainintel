"""R2 sanctions and hack labels: address checksums, official list parsers (offline), and non-EVM
labels end to end against PostgreSQL (integration). Addresses below are real public list entries."""

import io
import tarfile
from datetime import UTC, datetime

import pytest

from app.modules.m3_data.labels import address_formats as af
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.lookup import labels_for
from app.modules.m3_data.labels.sources import (
    SOURCES,
    parse_curated_evidence,
    parse_defihacklabs_tar,
    parse_eu_sanctions_xml,
    parse_ofac_sdn_xml,
    parse_uk_sanctions_xml,
)

OFAC = SOURCES["ofac_sdn_official"]
T0 = datetime(2026, 11, 17, 9, 0, tzinfo=UTC)

BTC_LEGACY = "12aNKp2iDKuhEde2YfPdd4DFGenRUTKupL"
BTC_P2SH = "33Kja69SQVc8kozpoP7Qw6HFtGxHkiWzTz"
BTC_BECH32 = "bc1qv7k70u2zynvem59u88ctdlaw7hc735d8xep9rq"
BTC_TAPROOT = "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0"  # BIP-350 test vector
TRON = "TNiq9AXBp9EjUqhDhrwrfvAA8U3GUQZH81"
TRON_UNDER_XBT = "TUCsTq7TofTCJRRoHk6RvhMoS2mJLm5Yzq"
EVM = "0x252a8bd2319d8a555b872990601221b3a2053bce"
EIP55 = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"  # EIP-55 test vector


def flip_last(s: str) -> str:
    """Same string with its last character changed (breaks any checksum)."""
    return s[:-1] + ("2" if s[-1] != "2" else "3")


# ---- address formats ------------------------------------------------------------------------------


def test_keccak_and_eip55():
    assert af.keccak256(b"").hex() == "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    assert af.keccak256(b"x" * 135).hex() == af.keccak256(b"x" * 135).hex()  # single-byte padding path
    assert af.eip55_ok(EIP55) and af.eip55_ok(EIP55.lower()) and af.eip55_ok("0x" + EIP55[2:].upper())
    assert not af.eip55_ok(EIP55[:-1] + "D")


@pytest.mark.parametrize(
    ("network", "address"),
    [
        ("bitcoin", BTC_LEGACY), ("bitcoin", BTC_P2SH), ("bitcoin", BTC_BECH32), ("bitcoin", BTC_TAPROOT),
        ("tron", TRON), ("evm", EIP55),
        ("litecoin", "LaizKtS5DUhPuP1nTQcc83MS7HwK6vk85z"), ("litecoin", "M8yFL6SFC6TreATegTyuSYkDfDRbisdpT3"),
        ("litecoin", "ltc1qr8ntsedq8tv0svmxqhzvdcdl5k7kntdmnhwep7"),
        ("bitcoin_cash", "qpf2cphc5dkuclkqur7lhj2yuqq9pk3hmukle77vhq"), ("bitcoin_cash", "18M8bJWMzWHDBMxoLqjHHAffdRy4SrzkfB"),
        ("bitcoin_sv", "12sjrrhoFEsedNRhtgwvvRqjFTh8fZTDX9"), ("bitcoin_gold", "GPwg61XoHqQPNmAucFACuQ5H9sGCDv9TpS"),
        ("dogecoin", "DHzAVdEoL3PjGeLWNdEJwwMA1CeQ9J9Cpo"), ("verge", "DFFJhnQNZf8rf67tYnesPu7MuGUpYtzv7Z"),
        ("dash", "XnPFsRWTaSgiVauosEwQ6dEitGYXgwznz2"), ("zcash", "t1g7wowvQ8gn2v8jrU1biyJ26sieNqNsBJy"),
        ("ripple", "rnXyVQzgxZe7TR1EPzTkGj2jxH4LMJYh66"), ("bnb_beacon", "bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23"),
    ],
)
def test_valid_addresses_pass_and_one_changed_character_fails(network, address):
    c = af.validate(network, address)
    assert c is not None and c.validation == "checksum"
    assert af.validate(network, flip_last(address)) is None


def test_format_only_networks_and_canonical_case():
    xmr = "44dZUJ7w1T3fKAvFW8XyXUVoAGSbFvXef2wcbnsjNKGWYorpLJBjth5VKSFhLGkpYKJb2J341tdZHBnbpv72WL7e8zuxfR2"
    assert af.validate("monero", xmr).validation == "format"
    assert af.validate("solana", "42RLPACwZPx3vYYmxSueqsogfynBDqXK298EDsNoyoHi").validation == "format"
    assert af.validate("monero", "5be5543ff73456ab9f2d207887e2af87322c651ea1a873c5b25b7ffae456c320") is None
    assert af.validate("evm", EIP55).address == EIP55.lower()
    assert af.validate("evm", EVM).validation == "format"  # all lowercase: nothing to check
    assert af.validate("bitcoin", BTC_BECH32.upper()).address == BTC_BECH32
    assert af.validate("tron", TRON).address == TRON  # base58 keeps its case
    assert af.validate("tron", TRON.lower()) is None


def test_ticker_mismatch_is_labelled_where_the_address_lives():
    c, mismatch = af.from_ticker("XBT", TRON_UNDER_XBT)
    assert c.network == "tron" and mismatch
    c, mismatch = af.from_ticker("USDT", "1KUUJPkyDhamZXgpsyXqNGc3x1QPXtdhgz")
    assert c.network == "bitcoin" and not mismatch  # USDT has no fixed network: format decides


def test_free_text_extraction_ignores_tx_hashes_and_random_words():
    text = (
        f"Known wallets: ETH: {EIP55} BTC: {BTC_BECH32} TRX: {TRON}. Tx 0x{'ab' * 32}. "
        f"Reference 1BoatSLRHtKNngkdXEeobR76b53LETtpyX is fake, {flip_last(TRON)} is a typo."
    )
    got = {(c.network, c.address) for c in af.addresses_in_text(text)}
    assert got == {("evm", EIP55.lower()), ("bitcoin", BTC_BECH32), ("tron", TRON)}


# ---- parsers --------------------------------------------------------------------------------------


def sdn_xml(entries: str) -> bytes:
    return f"""<?xml version="1.0"?>
<sdnList xmlns="https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/XML">
  <publshInformation><Publish_Date>11/13/2026</Publish_Date></publshInformation>{entries}
</sdnList>""".encode()


def sdn_entry(uid: str, last: str, ids: list[tuple[str, str]], first: str = "") -> str:
    id_xml = "".join(
        f"<id><uid>{uid}{i}</uid><idType>{k}</idType><idNumber>{n}</idNumber></id>" for i, (k, n) in enumerate(ids)
    )
    return (
        f"<sdnEntry><uid>{uid}</uid><firstName>{first}</firstName><lastName>{last}</lastName>"
        f"<sdnType>Entity</sdnType><programList><program>CYBER2</program><program>DPRK3</program></programList>"
        f"<idList>{id_xml}</idList></sdnEntry>"
    )


def test_parse_ofac_sdn_xml_every_network_merged_and_bad_entries_reported():
    raw = sdn_xml(
        sdn_entry("100", "LAZARUS GROUP", [
            ("Digital Currency Address - XBT", BTC_BECH32),
            ("Digital Currency Address - ETH", EIP55),
            ("Digital Currency Address - TRX", TRON),
            ("Digital Currency Address - USDT", TRON),  # same Tron address under two tickers
            ("Passport", "X123"),
        ])
        + sdn_entry("200", "GARANTEX", [
            ("Digital Currency Address - ETH", EIP55.lower()),  # second entry, same address
            ("Digital Currency Address - XBT", TRON_UNDER_XBT),
            ("Digital Currency Address - XMR", "5be5543ff73456ab9f2d207887e2af87322c651ea1a873c5b25b7ffae456c320"),
        ])
    )
    p = parse_ofac_sdn_xml(raw, OFAC)
    by = {(r.network, r.address): r for r in p.records}
    assert set(by) == {("bitcoin", BTC_BECH32), ("evm", EIP55.lower()), ("tron", TRON), ("tron", TRON_UNDER_XBT)}
    assert p.skipped == 1 and "SDN 200 XMR" in p.problems[0]

    tron = by[("tron", TRON)]
    assert tron.attributes["tickers"] == ["TRX", "USDT"] and tron.category == "sanctions" and tron.chain_id == 0
    evm = by[("evm", EIP55.lower())]
    assert evm.attributes["sdn_uids"] == ["100", "200"] and evm.name == "LAZARUS GROUP"
    assert evm.attributes["programs"] == ["CYBER2", "DPRK3"] and evm.confidence == 0.99
    assert by[("tron", TRON_UNDER_XBT)].attributes["listed_ticker_mismatch"] is True


def test_parse_uk_and_eu_free_text():
    uk = f"""<Designations><Designation><UniqueID>GHR0174</UniqueID>
      <Names><Name><Name6>Byex Exchange Company Limited </Name6><NameType>Primary Name</NameType></Name></Names>
      <RegimeName>Global Human Rights</RegimeName><SanctionsImposed>Asset freeze</SanctionsImposed>
      <OtherInformation>Ethereum: {EIP55} {EIP55}
Tron: {TRON} and a typo {flip_last(TRON)}</OtherInformation></Designation>
      <Designation><UniqueID>RUS0001</UniqueID><OtherInformation>no wallets</OtherInformation></Designation>
    </Designations>""".encode()
    p = parse_uk_sanctions_xml(uk, SOURCES["uk_sanctions_list"])
    assert {(r.network, r.address) for r in p.records} == {("evm", EIP55.lower()), ("tron", TRON)}
    r = p.records[0]
    assert r.name == "Byex Exchange Company Limited" and r.source_ref == "UK GHR0174" and r.confidence == 0.95
    assert r.attributes["extracted_from"] == "free text" and r.attributes["regime"] == "Global Human Rights"

    eu = f"""<export xmlns="http://eu.europa.ec/fpi/fsd/export"><sanctionEntity euReferenceNumber="EU.123.45">
      <regulation programme="RUS"/><nameAlias wholeName="Garantex"/>
      <address><remark>Known blockchain wallet addresses: BTC: {BTC_P2SH} TRX: {TRON}</remark></address>
    </sanctionEntity></export>""".encode()
    p = parse_eu_sanctions_xml(eu, SOURCES["eu_sanctions_list"])
    assert {(r.network, r.address) for r in p.records} == {("bitcoin", BTC_P2SH), ("tron", TRON)}
    assert all(r.name == "Garantex" and r.source_ref == "EU EU.123.45" for r in p.records)


def dhl_tar(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz", format=tarfile.PAX_FORMAT,
                      pax_headers={"comment": "759488f3d6170288cb8d8d5747dff070002dbe56"}) as tf:
        for name, body in files.items():
            data = body.encode()
            info = tarfile.TarInfo(f"DeFiHackLabs-main/{name}")
            info.size = len(data)
            tf.addfile(info, io.BytesIO(data))
    return buf.getvalue()


def test_parse_defihacklabs_roles_chains_and_tx_hashes():
    attacker, contract, victim = "0x" + "11" * 20, "0x" + "22" * 20, "0x" + "33" * 20
    raw = dhl_tar({
        "src/test/2022-04/Foo_exp.sol": (
            f"// Attacker : https://bscscan.com/address/{attacker}\n"
            f"// Attack Contract : https://bscscan.com/address/{contract}\n"
            f"// Vulnerable Contract : https://bscscan.com/address/{victim}\n"
            f"// Attack Tx : https://bscscan.com/tx/0x{'ab' * 32}\n"
        ),
        "src/test/2020-04/Bar_exp.sol": f"contract X {{\n    address attacker = {attacker};\n}}\n",
        "src/test/2026-11/Bad_exp.sol": f"// attacker EOA : {EIP55[:-1]}D\n",
        "README.md": f"// Attacker : {victim}\n",
    })
    p = parse_defihacklabs_tar(raw, SOURCES["defihacklabs"])
    by = {(r.chain_id, r.address): r for r in p.records}
    assert set(by) == {(56, attacker), (56, contract), (0, attacker)}
    assert by[(56, attacker)].attributes["role"] == "attacker" and by[(56, attacker)].confidence == 0.90
    assert by[(56, contract)].attributes["role"] == "attack_contract" and by[(56, contract)].confidence == 0.80
    assert by[(56, attacker)].source_ref == "DeFiHackLabs@759488f3d617 src/test/2022-04/Foo_exp.sol"
    assert by[(56, attacker)].category == "hack" and by[(0, attacker)].attributes["incidents"] == ["Bar"]
    assert p.skipped == 1 and "EIP-55" in p.problems[0]


def test_parse_curated_evidence_requires_official_evidence():
    head = "network,chain_id,address,category,name,agency,evidence_url,published_on,reviewed_by,confidence,notes\n"
    rows = [
        f"bitcoin,,{BTC_LEGACY},ransomware,Example ransomware wallet,FBI,https://www.ic3.gov/PSA/2026/x,2026-03-01,A. Analyst,,",
        f"evm,1,{EIP55},hack,Example heist,DOJ,https://www.justice.gov/opa/pr/x,2026-02-01,A. Analyst,1.0,seized",
        f"tron,,{TRON},scam,Blog claim,Blog,https://example.com/post,2026-01-01,A. Analyst,,",
        f"tron,,{flip_last(TRON)},scam,Typo,FBI,https://www.fbi.gov/x,2026-01-01,A. Analyst,,",
        f"tron,,{TRON},scam,No reviewer,FBI,https://www.fbi.gov/x,2026-01-01,,,",
        f"tron,,{TRON},exchange,Wrong category,FBI,https://www.fbi.gov/x,2026-01-01,A. Analyst,,",
        f"evm,1,{EVM},hack,Spoofed host,DOJ,https://justice.gov.evil.com/x,2026-01-01,A. Analyst,,",
    ]
    p = parse_curated_evidence((head + "\n".join(rows) + "\n").encode(), SOURCES["curated_law_enforcement"])
    assert [(r.network, r.address) for r in p.records] == [("bitcoin", BTC_LEGACY), ("evm", EIP55.lower())]
    assert p.records[1].confidence == 0.99 and p.records[1].chain_id == 1  # capped below certainty
    assert p.records[0].attributes["agency"] == "FBI" and p.records[0].source_ref == "https://www.ic3.gov/PSA/2026/x"
    assert p.skipped == 5 and [x.split(":")[0] for x in p.problems] == ["line 4", "line 5", "line 6", "line 7", "line 8"]
    assert parse_curated_evidence(b"address,name\n", SOURCES["curated_law_enforcement"]).problems[0].startswith("missing")


# ---- end to end (PostgreSQL) ----------------------------------------------------------------------


@pytest.mark.integration
def test_non_evm_labels_import_and_lookup_by_network(db):
    raw = sdn_xml(sdn_entry("100", "LAZARUS GROUP", [
        ("Digital Currency Address - XBT", BTC_BECH32),
        ("Digital Currency Address - ETH", EIP55),
        ("Digital Currency Address - TRX", TRON),
        ("Digital Currency Address - XMR", "5be5543ff73456ab9f2d207887e2af87322c651ea1a873c5b25b7ffae456c320"),
    ]))
    rep = LabelImporter(db, clock=lambda: T0).run(OFAC, raw, "test")
    assert rep.status == "applied" and rep.added == 3 and rep.skipped == 1 and "SDN 100 XMR" in rep.message

    btc = labels_for(db, [BTC_BECH32.upper()], 0, network="bitcoin")
    assert [lv.category for lv in btc[BTC_BECH32]] == ["sanctions"] and btc[BTC_BECH32][0].network == "bitcoin"
    assert labels_for(db, [TRON], 0, network="tron")[TRON][0].name == "LAZARUS GROUP"
    # EVM lookups see the EVM label on any chain and never the Bitcoin or Tron ones.
    assert labels_for(db, [EIP55], 137)[EIP55.lower()][0].network == "evm"
    with pytest.raises(ValueError):
        labels_for(db, [TRON.lower()], 0, network="tron")
    with pytest.raises(ValueError):
        labels_for(db, [TRON], 0, network="dogecoin_classic")

    # Re-import with the Tron address gone: it is closed, not deleted.
    raw2 = sdn_xml(sdn_entry("100", "LAZARUS GROUP", [
        ("Digital Currency Address - XBT", BTC_BECH32), ("Digital Currency Address - ETH", EIP55),
    ]))
    later = datetime(2026, 11, 18, 9, 0, tzinfo=UTC)
    rep2 = LabelImporter(db, clock=lambda: later).run(OFAC, raw2, "test")
    assert (rep2.removed, rep2.unchanged) == (1, 2)
    assert labels_for(db, [TRON], 0, network="tron")[TRON] == []
    assert len(labels_for(db, [TRON], 0, network="tron", as_of=T0)[TRON]) == 1


@pytest.mark.integration
def test_network_labels_api(db):
    from tests.m3.test_api import client as make_client

    client = make_client(db, [])
    LabelImporter(db, clock=lambda: T0).run(
        OFAC, sdn_xml(sdn_entry("100", "LAZARUS GROUP", [("Digital Currency Address - TRX", TRON)])), "test"
    )
    r = client.get("/api/v1/networks/tron/labels", params={"address": TRON})
    assert r.status_code == 200 and r.json()[TRON][0]["source_key"] == "ofac_sdn_official"
    assert client.get("/api/v1/networks/tron/labels", params={"address": "nope"}).status_code == 422
