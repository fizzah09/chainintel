"""Step 2: fetch transactions for each labelled address and write data/dataset.csv.

Usage:  python build_dataset.py --per-class 300

Positives come from the Forta lists. Negatives come from the public fraud dataset (FLAG = 0).
Addresses with too little history are written with abstained=1 and are not used for training.
"""
import argparse
import csv
import random

from blockscout import fetch_transactions
from config import DATASET, RAW
from features import FEATURE_NAMES, compute
from free_sources import positive_sources


def negatives_from_public(path) -> set[str]:
    with open(path, encoding="utf-8", errors="ignore", newline="") as f:
        rows = csv.DictReader(f)
        rows.fieldnames = [c.strip() for c in rows.fieldnames]
        return {r["Address"].strip().lower() for r in rows if r["FLAG"].strip() == "0"}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-class", type=int, default=300, help="max addresses per class")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    rng = random.Random(args.seed)

    # Each risky address keeps the first source that listed it.
    source_of: dict[str, str] = {}
    for name, addrs in positive_sources().items():
        for a in addrs:
            source_of.setdefault(a, name)
    neg_all = negatives_from_public(RAW / "public_fraud.csv") - set(source_of)
    pos = rng.sample(sorted(source_of), min(args.per_class, len(source_of)))
    neg = rng.sample(sorted(neg_all), min(args.per_class, len(neg_all)))

    DATASET.parent.mkdir(parents=True, exist_ok=True)
    fields = ["address", "label", "source", "abstained"] + FEATURE_NAMES
    kept = abstained = 0
    with open(DATASET, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for label, group in ((1, pos), (0, neg)):
            for i, addr in enumerate(group, 1):
                try:
                    feats = compute(addr, fetch_transactions(addr))
                except Exception as exc:  # keep going if one address fails
                    print("skip", addr, exc)
                    continue
                source = source_of.get(addr, "public_fraud_normal")
                row = {"address": addr, "label": label, "source": source, "abstained": int(feats is None)}
                if feats is None:
                    abstained += 1
                    row.update({k: "" for k in FEATURE_NAMES})
                else:
                    kept += 1
                    row.update(feats)
                w.writerow(row)
                if i % 25 == 0:
                    print(f"label {label}: {i}/{len(group)}")
    print(f"wrote {DATASET}: usable={kept} abstained={abstained}")


if __name__ == "__main__":
    main()
