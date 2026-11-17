/**
 * Confidence in the assessment (spec step 13): how much the evidence supports the score,
 * separate from how high the score is.
 */
export function assessConfidence({ mode, facts, exposure, rules, ml }) {
  const parts = [];
  const add = (name, value, note) => parts.push({ name, value: Math.round(value * 100), note });

  add('Data source', mode === 'live' ? 1 : 0.6, mode === 'live' ? 'Live blockchain data' : 'Simulated history (no API key set)');
  add('History depth', Math.min(1, facts.transactions / 100), `${facts.transactions} transactions analysed`);
  const top = rules.factors.find((f) => ['sanctions', 'mixer', 'ransomware', 'scam'].includes(f.id));
  if (top) {
    const e = exposure.find((x) => x.cat === top.id);
    add('Label reliability', e?.labelConfidence ?? 0.8, e?.source || 'Workspace label');
    add('Path certainty', e ? [1, 0.8, 0.6][e.hops - 1] : 0.7, e ? `${e.relationship} link` : '');
  }
  const rulesHigh = rules.score >= 50, mlHigh = ml.probability >= 0.5;
  add('Model agreement', rulesHigh === mlHigh ? 1 : 0.55, rulesHigh === mlHigh ? 'Rules and model agree' : 'Rules and model disagree; review manually');
  const value = Math.round(parts.reduce((a, p) => a + p.value, 0) / parts.length);
  return { value, parts, label: value >= 80 ? 'High' : value >= 60 ? 'Medium' : 'Low' };
}
