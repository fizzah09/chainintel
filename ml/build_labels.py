"""Build src/engine/data/labels.json from public lists: OFAC SDN Ethereum addresses and the MyEtherWallet darklist."""
import csv
import json
from datetime import date
from config import DATA, ENGINE_DATA, OFAC_URL, DARKLIST_URL


def build():
    labels = {}
    with open(DATA / "ofac_eth.csv", newline="") as f:
        for row in csv.DictReader(f):
            a = row["address"].strip().lower()
            if a.startswith("0x") and len(a) == 42:
                labels[a] = {"cat": "sanctions", "name": row["name"].strip(), "source": "OFAC SDN list", "confidence": 0.99}
    for item in json.load(open(DATA / "darklist.json")):
        a = item["address"].strip().lower()
        if a.startswith("0x") and len(a) == 42 and a not in labels:
            labels[a] = {"cat": "scam", "name": item.get("comment", "")[:120], "source": "MyEtherWallet darklist", "confidence": 0.85, "date": item.get("date")}
    out = {
        "generated": date.today().isoformat(),
        "sources": [
            {"name": "OFAC SDN list (Ethereum addresses)", "url": OFAC_URL, "count": sum(v["cat"] == "sanctions" for v in labels.values())},
            {"name": "MyEtherWallet darklist", "url": DARKLIST_URL, "count": sum(v["cat"] == "scam" for v in labels.values())},
        ],
        "labels": labels,
    }
    ENGINE_DATA.mkdir(parents=True, exist_ok=True)
    json.dump(out, open(ENGINE_DATA / "labels.json", "w"), indent=0, sort_keys=True)
    print(f"wrote {len(labels)} labels -> {ENGINE_DATA / 'labels.json'}")


if __name__ == "__main__":
    build()
