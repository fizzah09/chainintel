"""Settings for the free-data risk model (v2). Every source here is free to use."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "data" / "raw"
CACHE = ROOT / "cache"          # one JSON file per address (transactions from Blockscout)
DATASET = ROOT / "data" / "dataset.csv"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"

# Free sources (no API key needed).
FORTA_PHISHING = "https://raw.githubusercontent.com/forta-network/labelled-datasets/main/labels/1/phishing_scams.csv"
FORTA_MALICIOUS = "https://raw.githubusercontent.com/forta-network/labelled-datasets/main/labels/1/etherscan_malicious_labels.csv"
PUBLIC_FRAUD_DATASET = "https://raw.githubusercontent.com/Vagif12/Ethereum-Fraud-Detection/master/datasets/final_combined_dataset.csv"
# More free positives. Licences checked on GitHub:
#   OFAC list: US government work (public domain); extract in a MIT repo.
#   MyEtherWallet ethereum-lists: MIT. EtherScamDB: MIT (last update 2022).
OFAC_ETH = "https://raw.githubusercontent.com/ultrasoundmoney/ofac-ethereum-addresses/main/data.csv"
MEW_DARKLIST = "https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/addresses/addresses-darklist.json"
ETHERSCAMDB = "https://raw.githubusercontent.com/MrLuit/EtherScamDB/master/_data/scams.yaml"
# Deliberately NOT included (licence does not allow this use or is missing):
#   ScamSniffer scam-database (GPL-3.0, domain lists only), CryptoScamDB blacklist (no licence),
#   brianleect/etherscan-labels (data scraped from Etherscan, whose terms restrict reuse).
BLOCKSCOUT_API = "https://eth.blockscout.com/api/v2"   # free public explorer API

# Collection limits (small enough that a first run finishes in reasonable time).
PAGES_PER_ADDRESS = 5          # Blockscout returns about 50 transactions per page
REQUEST_DELAY_S = 0.6          # polite delay between requests
MAX_RETRIES = 4

# A wallet with fewer transactions than this gets no score (the model abstains).
MIN_TX = 5
