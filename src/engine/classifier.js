import MODEL from './models/illicit-classifier.json';

/**
 * Illicit-probability model trained in ml/train_classifier.py (gradient-boosted trees).
 * Prediction follows sklearn exactly (x <= threshold goes left). Per-feature contributions use the
 * tree-path method: each split's change in node value is credited to its feature, so
 * bias + sum(contributions) = log-odds of the prediction.
 */
export const MODEL_INFO = { name: MODEL.name, version: MODEL.version, metrics: MODEL.metrics, notes: MODEL.notes, features: MODEL.features, labels: MODEL.featureLabels, medians: MODEL.featureMedians };

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

export function predictIllicit(features) {
  const x = MODEL.features.map((f) => Number(features[f]) || 0);
  const contrib = new Array(x.length).fill(0);
  let raw = MODEL.init;
  for (const t of MODEL.trees) {
    let n = 0;
    raw += MODEL.learningRate * t.value[0];
    while (t.left[n] !== -1) {
      const f = t.feature[n];
      const next = x[f] <= t.threshold[n] ? t.left[n] : t.right[n];
      contrib[f] += MODEL.learningRate * (t.value[next] - t.value[n]);
      raw += MODEL.learningRate * (t.value[next] - t.value[n]);
      n = next;
    }
  }
  const probability = sigmoid(raw);
  const reasons = MODEL.features
    .map((f, i) => ({ feature: f, label: MODEL.featureLabels[f], value: x[i], impact: contrib[i], typicalIllicit: MODEL.featureMedians.illicit[f], typicalLicit: MODEL.featureMedians.licit[f] }))
    .filter((r) => Math.abs(r.impact) > 0.01)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return { probability, logOdds: raw, band: probability >= 0.7 ? 'High' : probability >= 0.4 ? 'Elevated' : probability >= 0.15 ? 'Low' : 'Very low', reasons, model: { version: MODEL.version, rocAuc: MODEL.metrics.roc_auc, trainedRows: MODEL.metrics.rows } };
}
