# Chain Intel backend

One Python (FastAPI) service, one package per module. All blockchain data enters through M3 and is stored with its source and time; the other modules never call providers directly, so any score can be re-run on the same data.

| Package | Module | Status |
|---|---|---|
| `app/core`, `app/api` | Foundation: settings, PostgreSQL, Redis, health probes, migrations | Done (M3.1) |
| `app/modules/m3_data/providers` | Provider adapters: Etherscan, Alchemy, rate limits, retries, fallback | Done (M3.2) |
| `app/modules/m3_data` (models, sync, queries) | Stored transfers with provenance, reorg handling, stale flag, contract-verified token decimals, as-of history | Done (M3.3) |
| `app/modules/m3_data/labels` | Versioned labels, licence register, OFAC/darklist/community importers, as-of lookup | Done (M3.4) |
| `app/modules/m3_data/api.py` | HTTP API for the frontend | Done (M3.5). **M3 complete.** |
| `app/modules/m4_risk/engine` | Wallet risk engine: Python port of `src/engine/` (rule set 1), proven identical on 13 golden wallets | Done (M4.1) |
| `app/modules/m3_data/prices`, `app/modules/m4_risk/inputs.py`, rule set 2 | Daily USD prices (Chainlink, then CoinGecko) with provenance; engine fed from M3 with 2-hop neighbours; rule set 2 fixes | Done (M4.2) |
| `app/modules/m4_risk/service.py`, `models.py` | Stored assessments: append-only (database trigger), hash-chained per tenant, re-runnable "as of" with identical result | Done (M4.3) |
| `app/modules/m4_risk/governance.py`, `review.py`, `drift.py` | Model register with independent validation and four-eyes approval; rules-first review flags; monthly drift (PSI) | Done (M4.4) |
| `app/modules/m4_risk/api.py`, `backtest.py`, rule set 3 | M4 API; reviewed cases and back-tests (precision/recall per tier, per category, ROC AUC); rule set 3 scores the wallet's own label | Done (M4.5). **M4 complete.** |
| `app/modules/m5_flow` | Fund flow tracing and attribution | Not started |
| `app/modules/m6_cases` | Case management and evidence | Not started |
| `app/modules/m7_monitoring` | Monitoring jobs and alerts | Not started |

## Run locally

Needs Python 3.12+ and Docker Desktop (engine running). From `backend/`:

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"   # macOS/Linux: .venv/bin/...
docker compose up -d --wait                       # PostgreSQL 16 + Redis 7, bound to 127.0.0.1
.venv/Scripts/alembic upgrade head                # apply migrations
.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

- `GET /health`: process is up (never checks dependencies).
- `GET /health/ready`: PostgreSQL and Redis reachable; `503` if not, with only the error type (no hosts or passwords).
- `GET /docs`: API docs (disabled when `CI_ENV=production`).

Tests: `pytest` (unit, no services needed) and `pytest -m integration` (needs Docker services). Settings come from `CI_*` environment variables; copy `.env.example` to `.env` to override. Use `127.0.0.1`, not `localhost`, on Windows: `localhost` tries IPv6 first and adds about 2 s per connection.

`legacy/wallet-graph-api/` is the earlier Node service (Etherscan fetch, labels, graph builder). It is reference only: its Etherscan adapter and labels are being ported into M3, its graph builder into M5.

## Labels

```bash
.venv/Scripts/python -m app.modules.m3_data.labels.cli sources            # licence register
.venv/Scripts/python -m app.modules.m3_data.labels.cli import ofac_sdn    # download + versioned import
.venv/Scripts/python -m app.modules.m3_data.labels.cli import etherscan_labels_community --file legacy/wallet-graph-api/data/labels-ethereum.json
```

Labels are never overwritten: a change closes the old row and adds a new one, a dropped label is closed and kept. Identical downloads are logged as `unchanged`; a download with under half the active labels is `rejected` (use `--force` after checking it). In production, read labels with `commercial_only=True`: `etherscan_labels_community` is `unverified` and is for development only.

Sanctions and hack sources (R2), refreshed daily/weekly:

```bash
.venv/Scripts/python -m app.modules.m3_data.labels.cli import ofac_sdn_official   # OFAC sdn.xml, every network
.venv/Scripts/python -m app.modules.m3_data.labels.cli import uk_sanctions_list
.venv/Scripts/python -m app.modules.m3_data.labels.cli import eu_sanctions_list
.venv/Scripts/python -m app.modules.m3_data.labels.cli import defihacklabs
.venv/Scripts/python -m app.modules.m3_data.labels.cli import curated_law_enforcement --file analysts/curated.csv
```

Labels carry a `network` (`evm`, `bitcoin`, `tron`, `litecoin` ...). Every address is checksum-validated for its network before import (`labels/address_formats.py`); invalid ones are skipped and listed in the import log message. Screen non-EVM addresses with `GET /api/v1/networks/{network}/labels?address=...`. The curated CSV (template: `docs/curated-labels-template.csv`) needs an official https evidence URL, a publication date and a reviewer on every row.

## M3 API

Interactive docs at http://localhost:8000/docs while the server runs. Amounts are strings (`value_raw` in base units, `amount` formatted with the token's decimals) because JSON numbers lose precision above 2^53.

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1/chains` | Supported chains, which providers cover each, reorg depth |
| POST | `/api/v1/chains/{chain}/addresses/{addr}/sync` | Fetch new transfers from providers and store them (503 if no API key is set) |
| GET | `/api/v1/chains/{chain}/addresses/{addr}/transfers` | Stored transfers only, with `stale` and per-kind freshness. Params: `kinds`, `as_of`, `limit`, `offset`, `order` |
| GET | `/api/v1/chains/{chain}/labels?address=…` | Labels with source, licence and import id. Params: `as_of`, `commercial_only` (forced on in production) |
| GET | `/api/v1/label-sources` | Licence register with active label counts |
| GET | `/api/v1/label-imports` | Import history. Params: `source`, `limit` |

Authentication is a placeholder: development has no sign-in, and staging/production answer 503 on every `/api/v1` call until Keycloak SSO is added.

## Risk engine rule sets

| Version | What it is |
|---|---|
| 1 | Exact port of the JavaScript prototype (`src/engine/`). Kept for comparison; proven identical on 13 golden wallets. |
| 2 | USD from the price store, never a fixed ETH price (unpriced transfers are counted in `dataQuality`); exposure tracing stops at exchanges, bridges, DeFi and other services; phishing and hack labels count as scam/fraud exposure. |
| 3 | Default. Rule set 2 plus the wallet's own risk label is scored (full points for its category; a wallet on a sanctions list is always Critical). |

Prices: Chainlink feeds (ETH, BTC/WBTC, USDC, USDT, DAI, LINK; addresses verified on-chain 2026-11-17) are read through the M3 providers; other tokens fall back to CoinGecko (`CI_COINGECKO_API_KEY` optional). CoinGecko's free plan is non-commercial: production ignores it unless `CI_COINGECKO_COMMERCIAL_PLAN=true`.

## Stored assessments

Every assessment is appended to `risk_assessments` with: knowledge time (`as_of`), who ran it, rule set version, model version and SHA-256, app version, score, tier, confidence, the full report (every factor, calculation and source), a manifest (fetch ids, label import ids, price row ids, neighbours) and data quality.

- **Permanent:** a database trigger rejects `UPDATE` and `DELETE` on `risk_assessments`, `chain_fetch_log` and `asset_prices`.
- **Tamper-evident:** each row's hash covers its content and the previous row's hash (one chain per tenant). `verify_chain(db, tenant)` finds the first edited, removed or reordered row, even if a DBA disabled the trigger.
- **Reproducible:** `RiskService.rerun(id)` rebuilds the inputs as known at `as_of` (transfers first seen, labels valid, prices fetched, token decimals checked by then), uses the stored rule set and model, fetches nothing, and compares input and report hashes. The re-run is stored too (`trigger = reproduction`).

## Model governance

```bash
.venv/Scripts/python -m app.modules.m4_risk.cli models
.venv/Scripts/python -m app.modules.m4_risk.cli validate <id> --as "<validator>" --comment "..."
.venv/Scripts/python -m app.modules.m4_risk.cli approve <id> --as "<approver>" --comment "..."
.venv/Scripts/python -m app.modules.m4_risk.cli drift --tenant <tenant>
```

- **Lifecycle:** registered, then validated (by someone other than the trainer; automatic checks: artefact fingerprint, ROC AUC >= 0.80, Brier <= 0.15), then approved (by someone who is neither trainer nor validator). Approving retires the previous model; only one is approved per name. Every decision is in `model_reviews`, which cannot be edited.
- **Scoring:** staging and production refuse to score without an approved model. Development falls back to the bundled model and flags each assessment for review.
- **Rules first:** the score and tier come from the rules only. An assessment goes to manual review when rules and model disagree, when the wallet itself carries a risk label, when the model is unapproved, when the data refresh failed, or when more than 20% of transfers are unpriced. Reasons are stored in plain language with the assessment.
- **Drift:** PSI of the model output and all 17 features, last 30 days vs the 30 before; needs 100 assessments per window.

## Entity classification (R3)

`GET /api/v1/entity?address=…&network=evm|tron|bitcoin…&chain_id=…` says what an address is (sanctioned, exchange, mixer, defi …) with a confidence, the sources behind it and any conflict between risk and service labels. Labels only: no label means `unknown`, never clean. Logic: `app/modules/m4_risk/entity.py`.

## Feature store (R4)

`POST /api/v1/chains/{chain_id}/addresses/{address}/features` appends a snapshot of the 17 features the illicit model reads (roles: compliance_manager, model_owner). `GET …/features/latest` returns the newest one. Snapshots are append-only (`feature_snapshots`), built only from stored transfers, and `feature_store.verify` recomputes one to prove it. Code: `app/modules/m4_risk/feature_store.py`. EVM wallets only.

## M4 API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/v1/chains/{chain}/addresses/{addr}/assessments` | Score a wallet now and store it (`ruleset_version`, `refresh`) |
| GET | `/api/v1/chains/{chain}/addresses/{addr}/assessments` | Past assessments of a wallet |
| GET | `/api/v1/assessments/{id}` | Full assessment: report, manifest, data quality, hashes |
| POST | `/api/v1/assessments/{id}/reproduce` | Re-run as of the original time; says whether it is identical |
| GET | `/api/v1/assessments/verify-chain` | Recompute the tenant's hash chain |
| GET | `/api/v1/rulesets` | Rule set versions and their settings |
| GET | `/api/v1/models`, `/api/v1/models/{id}` | Model register and its decision log |
| POST | `/api/v1/models/{id}/{validate,approve,reject,retire}` | Governance decision by the caller |
| GET | `/api/v1/models/drift` | Drift report for the approved model |
| POST/GET | `/api/v1/reviewed-cases` | Import or list analyst decisions |
| POST/GET | `/api/v1/backtests`, `/api/v1/backtests/{id}` | Run or read a back-test |

In development, `X-Dev-User`, `X-Dev-Roles` and `X-Dev-Tenant` headers choose who you act as (to try four-eyes approval); other environments ignore them.
