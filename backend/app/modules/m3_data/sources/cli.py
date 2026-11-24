"""Data Source Matrix from the command line.

    python -m app.modules.m3_data.sources.cli list [--bucket ground_truth]
    python -m app.modules.m3_data.sources.cli probe all
    python -m app.modules.m3_data.sources.cli probe ofac_sdn_official un_consolidated
    python -m app.modules.m3_data.sources.cli export data-sources.csv     # the matrix as a sheet
"""

import argparse
import csv
import json
from dataclasses import asdict, fields

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_engine
from app.modules.m3_data.sources.matrix import SOURCES, Source
from app.modules.m3_data.sources.service import get_source, latest_probes, probe_and_store


def _summary(findings: dict) -> str:
    keep = ("entries", "individuals", "entities", "records", "rows", "digital_currency_addresses", "addresses_by_ticker",
            "address_candidates", "by_chain", "licence", "last_push", "published", "generated", "key_configured", "sample")
    return json.dumps({k: v for k, v in findings.items() if k in keep}, default=str)[:300]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="sources")
    sub = ap.add_subparsers(dest="cmd", required=True)
    ls = sub.add_parser("list")
    ls.add_argument("--bucket")
    pr = sub.add_parser("probe")
    pr.add_argument("keys", nargs="+")
    ex = sub.add_parser("export")
    ex.add_argument("path")
    args = ap.parse_args(argv)
    settings = get_settings()

    with Session(get_engine()) as db:
        if args.cmd == "list":
            last = latest_probes(db)
            for s in SOURCES:
                if args.bucket and s.bucket != args.bucket:
                    continue
                p = last.get(s.key)
                probe = f"{p.outcome} {p.checked_at:%Y-%m-%d}" if p else "not probed"
                print(f"T{s.tier} P{s.priority:<2} {s.bucket:15} {s.status:10} {s.commercial_use:11} {probe:22} {s.key}")
            return 0
        if args.cmd == "export":
            last = latest_probes(db)
            cols = [f.name for f in fields(Source)] + ["last_probe_at", "last_probe_outcome", "last_probe_findings"]
            with open(args.path, "w", newline="", encoding="utf-8") as fh:
                w = csv.writer(fh)
                w.writerow(cols)
                for s in SOURCES:
                    p = last.get(s.key)
                    row = [", ".join(v) if isinstance(v, tuple) else v for v in asdict(s).values()]
                    w.writerow(row + ([p.checked_at.isoformat(), p.outcome, _summary(p.findings)] if p else ["", "", ""]))
            print(f"wrote {len(SOURCES)} sources to {args.path}")
            return 0
        keys = [s.key for s in SOURCES] if args.keys == ["all"] else args.keys
        failed = 0
        for key in keys:
            source = get_source(key)
            if source is None:
                print(f"{key}: unknown source")
                failed += 1
                continue
            p = probe_and_store(db, source, settings, actor="cli")
            failed += not p.ok and p.outcome not in ("needs_key", "manual")
            detail = p.error or _summary(p.findings)
            mark = "OK " if p.ok else {"needs_key": "KEY", "manual": "MAN"}.get(p.outcome, "ERR")
            print(f"{mark} {key:28} {p.outcome:12} {p.http_status or '':>4} {detail}")
        return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
