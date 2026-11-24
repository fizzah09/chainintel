"""Step 1: download the free label sources into data/raw/.

Positives (risky addresses): Forta labelled phishing and malicious-address lists.
Negatives (normal addresses): public fraud dataset rows with FLAG = 0.
"""
import csv
import io
import json
import re
import urllib.request

from config import (ETHERSCAMDB, FORTA_MALICIOUS, FORTA_PHISHING, MEW_DARKLIST, OFAC_ETH,
                    PUBLIC_FRAUD_DATASET, RAW)

ADDR = re.compile(r"0x[0-9a-fA-F]{40}")
UA = {"User-Agent": "Mozilla/5.0 (chainintel-research-ml)"}


def download(url: str, dest) -> None:
    print("downloading", url)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        dest.write_bytes(r.read())


def read_addresses(path) -> set[str]:
    """Return the address column of a CSV, whatever its header is called."""
    text = path.read_text(encoding="utf-8", errors="ignore")
    rows = csv.DictReader(io.StringIO(text))
    col = next(c for c in rows.fieldnames if "address" in c.lower())
    return {r[col].strip().lower() for r in rows if r[col] and r[col].strip().startswith("0x")}


def read_darklist(path) -> set[str]:
    return {item["address"].strip().lower() for item in json.loads(path.read_text(encoding="utf-8"))
            if str(item.get("address", "")).startswith("0x")}


def read_regex(path) -> set[str]:
    return {a.lower() for a in ADDR.findall(path.read_text(encoding="utf-8", errors="ignore"))}


def positive_sources() -> dict[str, set[str]]:
    """Free risky-address lists, keyed by source name (kept so results can be checked per source)."""
    return {
        "forta_phishing": read_addresses(RAW / "forta_phishing.csv"),
        "forta_malicious": read_addresses(RAW / "forta_malicious.csv"),
        "ofac_eth": read_addresses(RAW / "ofac_eth.csv"),
        "mew_darklist": read_darklist(RAW / "mew_darklist.json"),
        "etherscamdb": read_regex(RAW / "etherscamdb.yaml"),
    }


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    download(FORTA_PHISHING, RAW / "forta_phishing.csv")
    download(FORTA_MALICIOUS, RAW / "forta_malicious.csv")
    download(OFAC_ETH, RAW / "ofac_eth.csv")
    download(MEW_DARKLIST, RAW / "mew_darklist.json")
    download(ETHERSCAMDB, RAW / "etherscamdb.yaml")
    download(PUBLIC_FRAUD_DATASET, RAW / "public_fraud.csv")
    for name, addrs in positive_sources().items():
        print(f"{name}: {len(addrs)} addresses")


if __name__ == "__main__":
    main()
