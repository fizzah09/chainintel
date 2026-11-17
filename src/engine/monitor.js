import { TIER_NAME } from './config';

/**
 * Continuous monitoring: re-assess every watched wallet and raise alerts when something changed
 * since the last run. The first run for a wallet records a baseline without alerting.
 * entries: [{ address, list, rule: 'score'|'any', thr }]
 * previous: { [address]: snapshot }
 * assess: (address) => report
 */
const RANK = { low: 0, mod: 1, high: 2, crit: 3 };

export function snapshotOf(report) {
  return {
    score: report.score, tier: report.tier, cats: [...new Set(report.exposure.map((e) => e.cat))],
    anomaly: report.behaviour.level, probability: Math.round(report.ml.probability * 1000) / 1000,
    lastTx: report.recentTxs[0]?.time || null, asOf: report.asOf,
  };
}

export function monitorWallets(entries, previous, assess) {
  const snapshots = {}; const alerts = [];
  for (const w of entries) {
    const key = w.address.toLowerCase();
    if (snapshots[key]) continue;
    const rep = assess(w.address);
    const now = snapshotOf(rep); const was = previous[key];
    snapshots[key] = now;
    if (!was) continue;
    const base = { wallet: w.address, list: w.list, from: was.score, score: now.score, tx: rep.recentTxs[0]?.hash };
    const reasons = [];
    for (const c of now.cats) if (!was.cats.includes(c)) { const e = rep.exposure.find((x) => x.cat === c); reasons.push(`New ${c} exposure (${e.relationship.toLowerCase()}, $${e.usd.toLocaleString('en-US')})`); }
    if (RANK[now.tier] > RANK[was.tier]) reasons.push(`Risk tier rose from ${TIER_NAME[was.tier]} to ${TIER_NAME[now.tier]}`);
    if (w.rule === 'score' && was.score < w.thr && now.score >= w.thr) reasons.push(`Score crossed the list threshold of ${w.thr}`);
    if (now.anomaly === 'High' && was.anomaly !== 'High') reasons.push(`Behavioural anomaly: ${rep.behaviour.signals[0]?.title || 'high'}`);
    if (now.probability - was.probability >= 0.2) reasons.push(`Model illicit probability rose from ${Math.round(was.probability * 100)}% to ${Math.round(now.probability * 100)}%`);
    if (w.rule === 'any' && now.lastTx && now.lastTx !== was.lastTx) reasons.push('New on-chain activity');
    if (reasons.length) alerts.push({ ...base, trigger: reasons[0], reasons, tier: now.tier });
  }
  return { snapshots, alerts };
}
