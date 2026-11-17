# Wallet monitoring and risk scoring engine

Implements Feature 1 (Wallet Risk Assessment Engine) of the product spec, with a logical (rule-based)
score and predictive signals side by side. Code: `src/engine/` (runs in the browser today; pure functions
with no React, so it can move behind a Python/Node API unchanged in behaviour). Training: `ml/`.

## Flow for one wallet

| Step (spec) | Module | Output |
| --- | --- | --- |
| 1-2 Wallet profile | `features.js` `profileFacts` | first seen, last active, inflow, outflow, counterparties, averages (no scoring) |
| 3 Entity | `labels.js` | what the address is (exchange, mixer, unknown...) with confidence and source |
| 4 Behaviour | `anomaly.js` | recent 7 days vs 90-day baseline (median, MAD), pass-through, fan-out, dormancy, structuring |
| 5-6 Exposure | `exposure.js` | direct and indirect (up to 3 hops) exposure to sanctions, mixer, scam, ransomware; path, amount, direction |
| 7 Counterparties | `exposure.js` `counterpartyMix` | labelled mix of direct counterparties |
| 10-12 Score and evidence | `rules.js` | factors with points, calculation, evidence (score → factor → tx → address → source) |
| Predictive | `classifier.js` | probability the wallet behaves like known scam accounts, with per-feature reasons |
| Predictive | `forecast.js` | weekly score history and 4-week forecast with a ~90% range |
| 13 Confidence | `confidence.js` | data source, history depth, label reliability, path certainty, rules/model agreement |
| Monitoring | `monitor.js` | re-assess watched wallets; alert on new exposure, higher tier, threshold crossed, anomaly, model jump |

## Logical score

```
exposure points = max points × distance multiplier × amount factor   (strongest path per category)
distance multiplier = 1 (direct), 0.5 (2 hops), 0.25 (3 hops)
amount factor = 0.4 + 0.6 × min(1, amount / $10,000)
score = min(100, sum of factor points); direct sanctions exposure is always Critical
```

Default maximum points (from the spec, illustrative until back-tested): sanctions 35, mixer 20, ransomware 15,
scam 15, behaviour 10, suspicious counterparties 5, cross-chain 5, new high-value wallet 5. Super Admin →
Risk engine edits them; each publish is a new audited version.

## Predictive part

- **Illicit probability:** gradient-boosted trees trained on 9,841 public labelled Ethereum accounts
  (`ml/train_classifier.py`). Test ROC AUC and other metrics: `ml/reports/classifier-metrics.json`.
  The JS engine reproduces scikit-learn's probabilities (checked by `npm test`).
- **Anomaly detection:** robust statistics against the wallet's own baseline, plus laundering patterns.
- **Trend forecast:** Damped Holt trend on 12 weekly scores.

The model never changes the logical score. Disagreement lowers confidence and asks for manual review.

## Data

- With `VITE_ETHERSCAN_KEY` or `VITE_ALCHEMY_KEY`: live transfers of the wallet and of its 5 largest
  unlabelled counterparties (2-hop view). Deeper hops at scale need an indexer.
- Without a key: a deterministic simulated history built from the demo profile (`sim.js`), so every
  screen works offline. Monitoring runs advance a simulated clock by one day per run.
- Labels: OFAC SDN Ethereum addresses and the MyEtherWallet darklist (`ml/build_labels.py`), plus
  workspace labels for exchanges, DEXs, bridges and mixers.

## Moving to a Python service later

Keep the same contract: `assess(address, asOf) -> report` with the fields above. Port each module
one-to-one (they are small, pure functions); the model is already trained in Python, and the parity
fixture lets both implementations be checked against each other.
