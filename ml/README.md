# Chain Intel ML pipeline (Python)

Trains and evaluates the predictive part of the risk engine. The trained model is exported as JSON and
runs inside the React app (`src/engine/classifier.js`); when the Python API is added, the same files serve it.

```bash
cd ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python fetch_data.py         # public dataset + OFAC + darklist into ml/data/ (not committed)
python build_labels.py       # -> src/engine/data/labels.json
python train_classifier.py   # -> src/engine/models/illicit-classifier.json, ml/reports/classifier-metrics.json
pytest                       # checks export parity, metrics, labels
cd .. && npm test            # JS engine reproduces the Python probabilities
```

## What is trained

- **Data:** 9,841 public Ethereum accounts labelled fraud/scam (2,179) or normal (7,662), with 17 features
  computed from transaction history. Features are defined in `config.py` and computed identically by
  `src/engine/features.js`.
- **Model:** gradient-boosted trees (200 trees, depth 3). A logistic regression is trained as a baseline.
- **Evaluation:** stratified 80/20 split plus 5-fold cross-validation; ROC AUC, PR AUC, Brier score,
  precision/recall/F1 at 0.5 and at the best-F1 threshold. Results: `reports/classifier-metrics.json`.

## Limits to keep in mind

- Labels come from public scam lists, so the model learns "looks like known scam accounts", not every kind of illicit activity.
- The dataset is from earlier years of Ethereum; retrain on your own reviewed cases before relying on it.
- Check the dataset licence before commercial use.
- The probability never overrides the rule-based score; it is shown beside it with its reasons.
