"""Label imports from the command line (the daily refresh job will call the same code in M7).

    python -m app.modules.m3_data.labels.cli sources
    python -m app.modules.m3_data.labels.cli import ofac_sdn
    python -m app.modules.m3_data.labels.cli import ofac_sdn_official      # every network, official XML
    python -m app.modules.m3_data.labels.cli import uk_sanctions_list
    python -m app.modules.m3_data.labels.cli import eu_sanctions_list
    python -m app.modules.m3_data.labels.cli import defihacklabs
    python -m app.modules.m3_data.labels.cli import curated_law_enforcement --file analysts/curated.csv
    python -m app.modules.m3_data.labels.cli import mew_darklist --file path/to/darklist.json
    python -m app.modules.m3_data.labels.cli import etherscan_labels_community --file legacy/wallet-graph-api/data/labels-ethereum.json

`--file` lets an air-gapped bank deployment import a file reviewed and copied in by its own staff.
"""

import argparse
import sys
from pathlib import Path

import httpx

from app.core.db import get_engine
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES

MAX_DOWNLOAD = 50 * 1024 * 1024


def download(url: str) -> bytes:
    with httpx.stream("GET", url, timeout=60, follow_redirects=True, headers={"User-Agent": "chainintel-backend"}) as r:
        r.raise_for_status()
        chunks, size = [], 0
        for chunk in r.iter_bytes():
            size += len(chunk)
            if size > MAX_DOWNLOAD:
                raise ValueError("download larger than 50 MB; refusing")
            chunks.append(chunk)
    return b"".join(chunks)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="labels")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("sources", help="show the licence register")
    imp = sub.add_parser("import", help="import one source")
    imp.add_argument("source", choices=sorted(SOURCES))
    imp.add_argument("--file", type=Path, help="read from a local file instead of the source URL")
    imp.add_argument("--force", action="store_true", help="re-apply identical content / bypass the shrink guard")
    args = ap.parse_args(argv)

    if args.cmd == "sources":
        for s in SOURCES.values():
            print(f"{s.key:28} commercial={s.commercial_use:11} refresh={s.refresh:7} {s.name}\n{'':28} {s.licence}")
        return 0

    spec = SOURCES[args.source]
    if args.file:
        raw, origin = args.file.read_bytes(), f"file:{args.file.name}"
    else:
        if not spec.url or spec.url.startswith("https://github.com/"):
            print(f"{spec.key} has no direct download; use --file", file=sys.stderr)
            return 2
        raw, origin = download(spec.url), spec.url

    from sqlalchemy.orm import Session

    with Session(get_engine()) as db:
        report = LabelImporter(db).run(spec, raw, origin, force=args.force)
    print(report.model_dump_json(indent=2))
    return 0 if report.status != "rejected" else 1


if __name__ == "__main__":
    raise SystemExit(main())
