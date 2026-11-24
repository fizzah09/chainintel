"""Shared settings for the Chain Intel ML pipeline."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
DATA = ROOT / "data"
REPORTS = ROOT / "reports"
ENGINE_MODELS = REPO / "src" / "engine" / "models"
ENGINE_DATA = REPO / "src" / "engine" / "data"

# Public labelled Ethereum accounts (9,841 rows, FLAG = 1 for fraud/scam accounts).
# Originally published on Kaggle as "Ethereum Fraud Detection Dataset"; the author's repo hosts the CSV.
DATASET_URL = "https://raw.githubusercontent.com/Vagif12/Ethereum-Fraud-Detection/master/datasets/final_combined_dataset.csv"
DATASET_FILE = DATA / "transaction_dataset.csv"

# Label sources for the rule engine.
OFAC_URL = "https://raw.githubusercontent.com/ultrasoundmoney/ofac-ethereum-addresses/main/data.csv"
DARKLIST_URL = "https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/addresses/addresses-darklist.json"

# Dataset column -> feature name used by src/engine/features.js. The engine computes exactly these
# from a wallet's transaction history, so training and live scoring use the same definitions.
FEATURES = {
    "avg_min_between_sent": "Avg min between sent tnx",
    "avg_min_between_received": "Avg min between received tnx",
    "time_diff_first_last_min": "Time Diff between first and last (Mins)",
    "sent_tnx": "Sent tnx",
    "received_tnx": "Received Tnx",
    "unique_received_from": "Unique Received From Addresses",
    "unique_sent_to": "Unique Sent To Addresses",
    "min_value_received": "min value received",
    "max_value_received": "max value received ",
    "avg_value_received": "avg val received",
    "min_value_sent": "min val sent",
    "max_value_sent": "max val sent",
    "avg_value_sent": "avg val sent",
    "total_ether_sent": "total Ether sent",
    "total_ether_received": "total ether received",
    "total_ether_balance": "total ether balance",
    "erc20_total_tnxs": " Total ERC20 tnxs",
}

FEATURE_LABELS = {
    "avg_min_between_sent": "Average minutes between outgoing transactions",
    "avg_min_between_received": "Average minutes between incoming transactions",
    "time_diff_first_last_min": "Wallet active span (minutes)",
    "sent_tnx": "Outgoing transactions",
    "received_tnx": "Incoming transactions",
    "unique_received_from": "Unique senders",
    "unique_sent_to": "Unique recipients",
    "min_value_received": "Smallest amount received (ETH)",
    "max_value_received": "Largest amount received (ETH)",
    "avg_value_received": "Average amount received (ETH)",
    "min_value_sent": "Smallest amount sent (ETH)",
    "max_value_sent": "Largest amount sent (ETH)",
    "avg_value_sent": "Average amount sent (ETH)",
    "total_ether_sent": "Total ETH sent",
    "total_ether_received": "Total ETH received",
    "total_ether_balance": "ETH balance (received - sent)",
    "erc20_total_tnxs": "Token (ERC-20) transfers",
}

SEED = 42
