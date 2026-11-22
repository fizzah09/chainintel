# Free-data risk model (v2)

Everything here uses free sources: Forta labelled datasets (GitHub), a public fraud dataset (GitHub),
and the free Blockscout explorer API (no key). No paid services are needed.

## What it does
- **Positives (risky addresses), all free and checked for licence:**
  - Forta labelled datasets (MIT): phishing and malicious addresses.
  - OFAC SDN Ethereum addresses (US public domain, extract MIT): sanctions.
  - MyEtherWallet darklist (MIT): scam and phishing addresses.
  - EtherScamDB (MIT, last updated 2022): scam addresses.
- **Negatives:** addresses from the public fraud dataset marked `FLAG = 0`.
- Each row records its `source`, so you can check whether results depend on one list.

Excluded on purpose: ScamSniffer (GPL-3.0, domain lists), CryptoScamDB blacklist (no licence),
and the etherscan-labels scrape (its data comes from Etherscan, whose terms restrict reuse).
- **Features:** 15 wallet-behaviour features computed from up to 250 recent transactions per address.
- **Model:** logistic regression and gradient boosting, both calibrated. The better one on the test set is saved.
- **Abstention:** wallets with fewer than 5 transactions get no score.

## Run it (Windows PowerShell)

```powershell
cd D:\chainintel\chainintel\ml\v2
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

python free_sources.py                  # download the label files (about 1 minute)
python build_dataset.py --per-class 300 # fetch transactions (about 1 hour; cached, safe to re-run)
python train.py                         # train, evaluate, save the model
python score.py 0xYOUR_ADDRESS          # score one wallet
pytest tests                            # feature checks
```

Outputs:
- `data/dataset.csv`: one row per address, with features and label.
- `models/risk_model.joblib`: the trained model.
- `reports/metrics.json`: test-set results and the limits of the run.
- `cache/`: raw transactions per address. Delete a file to re-fetch that address.

## Read the results carefully
- A few hundred labelled addresses is a small sample. Compare the models on the confidence you get
  from repeated runs, not on one number.
- The split is random, not by time, so the results can look better than real use would be.
- The positive and negative groups come from different sources. The model may learn the source,
  not the behaviour. A useful check is to test on addresses from a third source.
- The 250-transaction cap means busy wallets are described by their most recent activity only.

## Not done yet
- A time-based split, which needs the date each label was assigned.
- Review of the labels by analysts. Your own reviewed cases are the best training data.
- Approval by someone who did not train the model, before any output is used in production.
