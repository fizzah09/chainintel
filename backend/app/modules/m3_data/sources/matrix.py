"""Data Source Matrix: every candidate source for the risk engine, with the research checklist's fields.

Buckets (from the research checklist):
  ground_truth      known bad addresses or entities (sanctions, law enforcement, hacks, ransomware, scams)
  blockchain_data   what actually happened on-chain (explorers, SQL warehouses, nodes, prices)
  behaviour_rules   what behaviour is suspicious (FATF indicators, research); no wallet data
  entity_labels     who or what an address is (exchanges, bridges, protocols, mixers)

Values here are the research starting point. Facts that a probe confirms are recorded in the
`source_probes` table with the time they were checked; anything not confirmed shows as unverified.
"Unknown" means nobody has checked yet, not "no".
"""

from dataclasses import dataclass, field
from typing import Literal

Bucket = Literal["ground_truth", "blockchain_data", "behaviour_rules", "entity_labels"]
YesNo = Literal["yes", "no", "partial", "unknown"]
Commercial = Literal["allowed", "paid_plan", "not_allowed", "unverified"]
Status = Literal["integrated", "partial", "to_test", "later"]
Probe = Literal["ofac_xml", "un_xml", "eu_xml", "uk_page", "json_addresses", "github_repo", "http", "needs_key", "manual"]


@dataclass(frozen=True)
class Source:
    key: str
    name: str
    bucket: Bucket
    tier: int  # 1 must have, 2 very important, 3 our own intelligence / later
    priority: int  # 1-10, from the research checklist
    url: str
    chains: tuple[str, ...]
    wallet_addresses: YesNo
    entity_labels: YesNo
    risk_labels: YesNo
    transaction_data: YesNo
    historical: YesNo
    api: YesNo
    downloadable: YesNo
    formats: tuple[str, ...]
    update_frequency: str
    evidence: YesNo  # does each record carry evidence (case, document, tx)?
    false_positive_risk: Literal["low", "medium", "high", "unknown"]
    licence: str
    commercial_use: Commercial
    free: YesNo
    rate_limit: str
    status: Status
    integrated_as: str | None  # where the code uses it today
    probe: Probe
    probe_url: str | None = None  # machine-readable endpoint the probe reads (defaults to url)
    notes: str = ""
    use_for: tuple[str, ...] = field(default_factory=tuple)


S = Source
SOURCES: tuple[Source, ...] = (
    # ---- A. Ground truth: sanctions ----------------------------------------------------------------
    S("ofac_sdn_official", "OFAC SDN list (official XML)", "ground_truth", 1, 10,
      "https://ofac.treasury.gov/sanctions-list-service", ("BTC", "ETH", "TRX", "USDT", "XMR", "LTC", "other"),
      "yes", "yes", "yes", "no", "partial", "yes", "yes", ("XML", "CSV"), "on each designation (irregular, often weekly)",
      "yes", "low", "US government public data", "allowed", "yes", "none published", "to_test", None, "ofac_xml",
      probe_url="https://www.treasury.gov/ofac/downloads/sdn.xml",
      notes="Probed 2026-11-17: 19,565 entries, 1,064 wallet addresses (XBT 534, TRX 272, ETH 124, USDT 94, LTC 14, XMR 11, others). The ETH-only extract covers 124 of them.",
      use_for=("sanctions labels on every chain", "entity names and programs")),
    S("ofac_eth_extract", "OFAC Ethereum addresses (ultrasoundmoney extract)", "ground_truth", 1, 10,
      "https://github.com/ultrasoundmoney/ofac-ethereum-addresses", ("ETH",),
      "yes", "yes", "yes", "no", "no", "no", "yes", ("CSV",), "community-maintained", "no", "low",
      "Derived from US government data; repository licence to confirm", "unverified", "yes", "GitHub", "integrated",
      "m3_data/labels/sources.py:ofac_sdn", "github_repo",
      probe_url="https://api.github.com/repos/ultrasoundmoney/ofac-ethereum-addresses",
      notes="Interim source (repo MIT, last push 2026-09-21). Replace with the official list in R2."),
    S("un_consolidated", "UN Security Council Consolidated List", "ground_truth", 1, 8,
      "https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list", (),
      "no", "yes", "yes", "no", "unknown", "no", "yes", ("XML", "HTML", "PDF"), "on each change",
      "yes", "low", "UN public data", "allowed", "yes", "none published", "to_test", None, "un_xml",
      probe_url="https://scsanctions.un.org/resources/xml/en/consolidated.xml",
      notes="Probed 2026-11-17: 733 individuals, 274 entities, no wallet addresses. Name screening only.",
      use_for=("name screening when a case links a wallet to a person or company",)),
    S("eu_consolidated", "EU consolidated financial sanctions list", "ground_truth", 1, 8,
      "https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions",
      ("BTC", "TRX", "ETH"), "partial", "yes", "yes", "no", "unknown", "no", "yes", ("XML", "CSV"), "on each change",
      "yes", "low", "EU public data (re-use policy to confirm)", "unverified", "yes", "none published", "to_test", None, "eu_xml",
      probe_url="https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw",
      notes="Probed 2026-11-17: 6,269 entities (26 MB XML); a few address-shaped strings to confirm in R2.",
      use_for=("name screening",)),
    S("uk_sanctions_list", "UK Sanctions List (FCDO)", "ground_truth", 1, 8,
      "https://www.gov.uk/government/publications/the-uk-sanctions-list", ("TRX", "ETH", "BTC"),
      "partial", "yes", "yes", "no", "unknown", "no", "yes", ("CSV", "XML", "ODS"), "on each change",
      "yes", "low", "Open Government Licence (to confirm)", "unverified", "yes", "none published", "to_test", None, "uk_page",
      notes="Primary UK source since the OFSI list closed 28 Jan 2026. Probed 2026-11-17: CSV at sanctionslist.fcdo.gov.uk, ~58,900 rows, about 46 TRX-shaped, 5 ETH and 4 BTC address strings to confirm in R2.",
      use_for=("name screening",)),
    # ---- A. Ground truth: law enforcement, hacks, ransomware, scams --------------------------------
    S("law_enforcement_curated", "FBI / DOJ / Treasury case documents (curated)", "ground_truth", 1, 9,
      "https://www.justice.gov/news", ("BTC", "ETH", "TRX", "other"),
      "partial", "yes", "yes", "partial", "yes", "no", "no", ("press release", "court filing PDF"), "per case",
      "yes", "low", "Public records; cite each document", "allowed", "yes", "n/a", "later", None, "manual",
      notes="No feed: analysts extract address, chain, tx hash, category, case number, date, amount, source URL and confidence. Needs a curation form (R2).",
      use_for=("high-confidence illicit labels with evidence",)),
    S("ransomwhere", "Ransomwhere (ransomware payment addresses)", "ground_truth", 1, 9,
      "https://ransomwhe.re", ("BTC",), "yes", "yes", "yes", "partial", "yes", "yes", "yes", ("JSON",),
      "crowd-sourced, continuous", "partial", "medium", "Open data (licence to confirm)", "unverified", "yes", "unknown",
      "to_test", None, "json_addresses", probe_url="https://api.ransomwhe.re/export",
      notes="Probed 2026-11-17: 11,186 addresses, all Bitcoin. Useful once Bitcoin is supported.",
      use_for=("ransomware labels", "ransomware family")),
    S("defihacklabs", "DeFiHackLabs (reproduced DeFi exploits)", "ground_truth", 1, 10,
      "https://github.com/SunWeb3Sec/DeFiHackLabs", ("ETH", "BSC", "Polygon", "Arbitrum", "other EVM"),
      "partial", "yes", "yes", "partial", "yes", "no", "yes", ("Solidity tests", "Markdown"), "community, frequent",
      "yes", "low", "Apache-2.0 (GitHub, 2026-11-17)", "allowed", "yes", "GitHub", "to_test", None, "github_repo",
      probe_url="https://api.github.com/repos/SunWeb3Sec/DeFiHackLabs",
      notes="Attacker and exploit-contract addresses must be extracted from each case file.",
      use_for=("hack / stolen-funds labels",)),
    S("forta_labelled", "Forta labelled datasets", "ground_truth", 1, 9,
      "https://github.com/forta-network/labelled-datasets", ("ETH", "Optimism"),
      "yes", "yes", "yes", "no", "yes", "no", "yes", ("CSV",), "stale: last update Jan 2023", "partial", "medium", "MIT (GitHub, 2026-11-17)",
      "allowed", "yes", "GitHub", "to_test", None, "github_repo",
      probe_url="https://api.github.com/repos/forta-network/labelled-datasets",
      use_for=("phishing, exploit and malicious-contract labels", "training positives")),
    S("mew_darklist", "MyEtherWallet darklist", "ground_truth", 1, 8,
      "https://github.com/MyEtherWallet/ethereum-lists", ("ETH",), "yes", "no", "yes", "no", "partial", "no", "yes",
      ("JSON",), "irregular", "partial", "medium", "MIT", "allowed", "yes", "GitHub", "integrated",
      "m3_data/labels/sources.py:mew_darklist", "github_repo",
      probe_url="https://api.github.com/repos/MyEtherWallet/ethereum-lists"),
    S("chainabuse", "Chainabuse (TRM) scam reports", "ground_truth", 1, 8,
      "https://www.chainabuse.com", ("BTC", "ETH", "TRX", "SOL", "other"), "yes", "no", "yes", "partial", "yes", "yes", "no",
      ("API JSON",), "continuous", "yes", "medium", "Proprietary; API by agreement", "paid_plan", "unknown", "by agreement",
      "later", None, "needs_key", use_for=("scam labels with evidence",)),
    S("scamsniffer", "ScamSniffer scam database", "ground_truth", 1, 8,
      "https://github.com/scamsniffer/scam-database", ("ETH", "EVM"), "yes", "no", "yes", "no", "unknown", "no", "yes",
      ("JSON",), "frequent", "no", "medium", "GPL-3.0 (copyleft: legal review before commercial use); full feed is commercial", "unverified", "partial", "GitHub",
      "to_test", None, "github_repo", probe_url="https://api.github.com/repos/scamsniffer/scam-database",
      use_for=("phishing / drainer labels",)),
    # ---- B. Blockchain data ------------------------------------------------------------------------
    S("etherscan", "Etherscan API V2", "blockchain_data", 1, 9, "https://etherscan.io/apis",
      ("ETH", "BSC", "Polygon", "Arbitrum", "Optimism", "Base", "other EVM"), "no", "partial", "partial", "yes", "yes", "yes",
      "no", ("JSON",), "real time", "no", "low", "Free plan non-commercial; paid from Advanced", "paid_plan", "partial",
      "free: 3/s, 100k/day", "integrated", "m3_data/providers/etherscan.py", "needs_key"),
    S("alchemy", "Alchemy (RPC and transfers API)", "blockchain_data", 1, 8, "https://www.alchemy.com",
      ("ETH", "Polygon", "Arbitrum", "Optimism", "Base", "Solana", "other"), "no", "no", "no", "yes", "yes", "yes", "no",
      ("JSON-RPC",), "real time", "no", "low", "Check terms for production", "unverified", "partial", "free: 30M CU/month",
      "integrated", "m3_data/providers/alchemy.py", "needs_key"),
    S("dune", "Dune (SQL over 100+ chains)", "blockchain_data", 1, 10, "https://dune.com",
      ("ETH", "BTC", "BSC", "Polygon", "Arbitrum", "Optimism", "Base", "Avalanche", "Solana", "Tron", "other"),
      "no", "partial", "no", "yes", "yes", "yes", "yes", ("SQL", "CSV", "JSON"), "near real time", "no", "low",
      "Dune terms; commercial use to confirm", "unverified", "partial", "plan-based credits", "to_test", None, "needs_key",
      use_for=("bulk features", "training datasets", "multi-hop history")),
    S("bigquery_public", "Google BigQuery public crypto datasets", "blockchain_data", 1, 9,
      "https://cloud.google.com/blog/products/data-analytics/introducing-six-new-cryptocurrencies-in-bigquery-public-datasets",
      ("ETH", "BTC", "other"), "no", "no", "no", "yes", "yes", "yes", "yes", ("SQL",), "daily", "no", "low",
      "Google Cloud terms", "allowed", "partial", "1 TB queries free per month", "to_test", None, "needs_key",
      use_for=("bulk history", "training datasets")),
    S("mempool_space", "mempool.space (Bitcoin explorer API)", "blockchain_data", 1, 9, "https://mempool.space/docs/api",
      ("BTC",), "no", "no", "no", "yes", "yes", "yes", "no", ("JSON",), "real time", "no", "low",
      "Open source, self-hostable (licence to confirm)", "unverified", "yes", "public instance limits", "to_test", None, "http",
      probe_url="https://mempool.space/api/blocks/tip/height", use_for=("Bitcoin history",)),
    S("blockchair", "Blockchair (multi-chain explorer API)", "blockchain_data", 1, 8, "https://blockchair.com/api",
      ("BTC", "ETH", "LTC", "other"), "no", "no", "no", "yes", "yes", "yes", "partial", ("JSON", "TSV dumps"), "real time",
      "no", "low", "Paid for commercial use (to confirm)", "paid_plan", "partial", "free tier limited", "to_test", None, "http",
      probe_url="https://api.blockchair.com/bitcoin/stats"),
    S("trongrid", "TronGrid / Tron public API", "blockchain_data", 1, 9, "https://developers.tron.network",
      ("TRX", "USDT-TRC20"), "no", "no", "no", "yes", "yes", "yes", "no", ("JSON",), "real time", "no", "low",
      "TRON terms (to confirm)", "unverified", "partial", "key recommended", "to_test", None, "http",
      probe_url="https://api.trongrid.io/wallet/getnowblock",
      notes="USDT on Tron is widely used for retail transfers; confirm the pilot bank's exposure.", use_for=("Tron history",)),
    S("solana_rpc", "Solana public RPC", "blockchain_data", 3, 7, "https://solana.com/docs/rpc", ("SOL",),
      "no", "no", "no", "yes", "partial", "yes", "no", ("JSON-RPC",), "real time", "no", "low", "Public endpoint for testing only",
      "not_allowed", "yes", "strict public limits", "later", None, "http", probe_url="https://api.mainnet-beta.solana.com"),
    S("eth_public_rpc", "Ethereum public RPC (publicnode)", "blockchain_data", 1, 8, "https://ethereum-rpc.publicnode.com",
      ("ETH",), "no", "no", "no", "yes", "partial", "yes", "no", ("JSON-RPC",), "real time", "no", "low",
      "Public endpoint for testing only", "not_allowed", "yes", "best effort", "partial",
      "used to verify Chainlink feeds (M4.2)", "http"),
    S("own_nodes", "Own nodes (Reth, Bitcoin Core, java-tron)", "blockchain_data", 3, 8, "https://reth.rs",
      ("ETH", "BTC", "TRX"), "no", "no", "no", "yes", "yes", "yes", "no", ("JSON-RPC",), "real time", "no", "low",
      "Open source", "allowed", "yes", "none (own hardware)", "later", None, "manual",
      notes="Full ETH node about 1.2 TB, archive about 2.8 TB. Keeps data inside the bank."),
    S("chainlink_feeds", "Chainlink price feeds", "blockchain_data", 1, 8, "https://data.chain.link",
      ("ETH",), "no", "no", "no", "no", "yes", "yes", "no", ("contract calls",), "per heartbeat", "no", "low",
      "Public on-chain data", "allowed", "yes", "via providers", "integrated", "m3_data/prices/chainlink.py", "manual"),
    S("coingecko", "CoinGecko prices", "blockchain_data", 2, 7, "https://www.coingecko.com/en/api", ("most",),
      "no", "no", "no", "no", "yes", "yes", "no", ("JSON",), "minutes", "no", "low", "Free plan non-commercial",
      "paid_plan", "partial", "demo: 30/min", "integrated", "m3_data/prices/coingecko.py", "http",
      probe_url="https://api.coingecko.com/api/v3/ping"),
    # ---- C. Behavioural intelligence ---------------------------------------------------------------
    S("fatf_red_flags", "FATF red-flag indicators for virtual assets", "behaviour_rules", 1, 10,
      "https://www.fatf-gafi.org/en/publications/Methodsandtrends/Virtual-assets-red-flag-indicators.html", (),
      "no", "no", "no", "no", "yes", "no", "yes", ("PDF",), "occasional", "yes", "low", "FATF publication",
      "allowed", "yes", "n/a", "partial", "m4_risk/engine/anomaly.py (some patterns)", "manual",
      notes="Site blocks automated requests (HTTP 403, 2026-11-17): read manually. Indicators become features and rules (R4, R5): size and frequency, rapid movement, anonymity services, structuring, geography, source of funds."),
    S("security_reports", "Blockchain security and LE reports", "behaviour_rules", 2, 7, "https://www.ic3.gov", (),
      "partial", "no", "partial", "no", "yes", "no", "yes", ("PDF", "HTML"), "occasional", "yes", "low", "Cite each report",
      "allowed", "yes", "n/a", "later", None, "manual"),
    # ---- D. Entity / address labels ----------------------------------------------------------------
    S("etherscan_labels_community", "etherscan-labels (community scrape)", "entity_labels", 2, 9,
      "https://github.com/brianleect/etherscan-labels", ("ETH", "other EVM"), "yes", "yes", "partial", "no", "no", "no", "yes",
      ("JSON",), "stale: last update Oct 2023", "no", "medium", "Repo MIT; data scraped from Etherscan", "unverified", "yes", "GitHub",
      "integrated", "m3_data/labels/sources.py:etherscan_labels_community", "github_repo",
      probe_url="https://api.github.com/repos/brianleect/etherscan-labels",
      notes="Development only. Its 'ofac-sanctions-lists' tags are outdated (Tornado Cash delisted March 2025)."),
    S("etherscan_metadata", "Etherscan Address Metadata API (name tags)", "entity_labels", 2, 9,
      "https://docs.etherscan.io", ("ETH", "other EVM"), "yes", "yes", "partial", "no", "unknown", "yes", "partial",
      ("JSON", "CSV"), "continuous", "no", "low", "Licensed (Pro Plus; full CSV Enterprise)", "paid_plan", "no", "plan-based",
      "later", None, "needs_key"),
    S("eth_labels_dawsbot", "eth-labels (dawsbot)", "entity_labels", 2, 7, "https://github.com/dawsbot/eth-labels",
      ("ETH", "other EVM"), "yes", "yes", "partial", "no", "no", "yes", "yes", ("JSON", "SQLite"), "irregular", "no", "medium",
      "Repo MIT; some data scraped from explorers", "unverified", "yes", "GitHub", "to_test", None, "github_repo",
      probe_url="https://api.github.com/repos/dawsbot/eth-labels"),
    S("open_labels_initiative", "Open Labels Initiative (OLI)", "entity_labels", 2, 7,
      "https://github.com/openlabelsinitiative/OLI", ("EVM",), "yes", "yes", "no", "no", "unknown", "unknown", "unknown",
      ("unknown",), "active (Nov 2026)", "unknown", "medium", "MIT (GitHub, 2026-11-17)", "allowed", "yes", "unknown", "to_test", None,
      "github_repo", probe_url="https://api.github.com/repos/openlabelsinitiative/OLI"),
    S("vendor_intel", "Chainalysis / TRM / Elliptic label feed", "entity_labels", 2, 10, "https://www.chainalysis.com",
      ("most",), "yes", "yes", "yes", "partial", "yes", "yes", "partial", ("API",), "continuous", "yes", "low",
      "Commercial licence", "paid_plan", "no", "contract", "later", None, "needs_key",
      notes="What regulators often expect; budget for the first paying bank."),
    # ---- Training datasets (ground truth for the model) --------------------------------------------
    S("kaggle_vagif12", "Ethereum Fraud Detection dataset (Vagif12)", "ground_truth", 3, 7,
      "https://github.com/Vagif12/Ethereum-Fraud-Detection", ("ETH",), "yes", "no", "yes", "no", "no", "no", "yes", ("CSV",),
      "static", "no", "medium", "No licence stated (GitHub, 2026-11-17): research use only", "not_allowed", "yes", "GitHub", "integrated",
      "ml/ (current model training data)", "github_repo", probe_url="https://api.github.com/repos/Vagif12/Ethereum-Fraud-Detection"),
    S("bert4eth", "BERT4ETH phishing and normal accounts", "ground_truth", 3, 7, "https://github.com/git-disl/BERT4ETH",
      ("ETH",), "yes", "no", "yes", "yes", "yes", "no", "yes", ("CSV via Google Drive",), "static", "no", "medium",
      "Not stated: research use only", "not_allowed", "yes", "n/a", "to_test", None, "github_repo",
      probe_url="https://api.github.com/repos/git-disl/BERT4ETH", use_for=("training positives and negatives",)),
)

BY_KEY = {s.key: s for s in SOURCES}
