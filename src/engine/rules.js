import { ENGINE, CAT_NAME, tierFor } from './config';
import { labelFor } from './labels';

/**
 * Logical (rule-based) score, spec steps 10-12. Every point is traceable:
 * score -> factor -> calculation -> transaction -> address -> source.
 */
const r1 = (x) => Math.round(x * 10) / 10;
const amountFactor = (usd) => Math.max(0.4, Math.min(1, 0.4 + 0.6 * (usd / ENGINE.fullAmountUsd)));
const severity = (pts, max) => (pts >= max * 0.75 ? 'Critical' : pts >= max * 0.45 ? 'High' : pts >= max * 0.2 ? 'Medium' : 'Low');

export function scoreRules({ exposure, behaviour, counterparties, facts, txs, asOf }) {
  const factors = [];

  // Exposure factors: the strongest path per category sets the points (no double counting).
  for (const cat of ['sanctions', 'mixer', 'ransomware', 'scam']) {
    const items = exposure.filter((e) => e.cat === cat);
    if (!items.length) continue;
    const scored = items.map((e) => {
      const hop = ENGINE.hopDecay[e.hops - 1] ?? 0;
      const amt = amountFactor(e.usd);
      return { e, pts: ENGINE.points[cat] * hop * amt, hop, amt };
    }).sort((a, b) => b.pts - a.pts);
    const best = scored[0];
    const pts = r1(best.pts);
    factors.push({
      id: cat, name: CAT_NAME[cat], points: pts, max: ENGINE.points[cat], severity: severity(pts, ENGINE.points[cat]),
      summary: `${best.e.relationship} exposure of $${best.e.usd.toLocaleString('en-US')} to ${best.e.name || 'a labelled address'}`,
      calc: `${ENGINE.points[cat]} max × ${best.hop} (${best.e.relationship.toLowerCase()}) × ${best.amt.toFixed(2)} (amount) = ${pts}`,
      evidence: items.slice(0, 5).map((e) => ({ counterparty: e.address, relationship: e.relationship, hops: e.hops, usd: e.usd, txs: e.txs, firstObserved: e.firstObserved, direction: e.direction, source: e.source, sourceName: e.name, path: e.path })),
    });
  }

  if (behaviour.score > 0) {
    const pts = r1(ENGINE.points.behaviour * behaviour.score / 100);
    factors.push({ id: 'behaviour', name: CAT_NAME.behaviour, points: pts, max: ENGINE.points.behaviour, severity: severity(pts, ENGINE.points.behaviour), summary: behaviour.signals.map((s) => s.title).join('; '), calc: `${ENGINE.points.behaviour} max × ${behaviour.score}/100 anomaly score = ${pts}`, evidence: behaviour.signals.map((s) => ({ signal: s.title, detail: s.detail, txs: s.txs || [], source: 'Risk engine computation' })) });
  }

  const risky = counterparties.risky.length;
  if (risky) {
    const pts = r1(ENGINE.points.counterparties * Math.min(1, risky / 3));
    factors.push({ id: 'counterparties', name: CAT_NAME.counterparties, points: pts, max: ENGINE.points.counterparties, severity: severity(pts, ENGINE.points.counterparties), summary: `${risky} direct counterpart${risky > 1 ? 'ies are' : 'y is'} labelled high-risk`, calc: `${ENGINE.points.counterparties} max × min(1, ${risky}/3) = ${pts}`, evidence: counterparties.risky.slice(0, 5).map((a) => ({ counterparty: a, label: labelFor(a)?.name, source: labelFor(a)?.source })) });
  }

  // Cross-chain: bridge use after receiving risky funds, or a large share of volume through bridges.
  const bridgeTx = txs.filter((t) => labelFor(t.cp)?.cat === 'bridge');
  if (bridgeTx.length) {
    const vol = bridgeTx.reduce((a, t) => a + (t.usd || 0), 0);
    const share = vol / Math.max(1, facts.inflowUsd + facts.outflowUsd);
    const afterRisk = exposure.length > 0;
    const pts = r1(ENGINE.points.crossChain * Math.min(1, (afterRisk ? 0.6 : 0) + share * 4));
    if (pts > 0) factors.push({ id: 'crossChain', name: CAT_NAME.crossChain, points: pts, max: ENGINE.points.crossChain, severity: severity(pts, ENGINE.points.crossChain), summary: `${bridgeTx.length} bridge transfer(s), ${Math.round(share * 100)}% of volume${afterRisk ? ', alongside risky exposure' : ''}`, calc: `${ENGINE.points.crossChain} max × min(1, ${afterRisk ? '0.6 + ' : ''}${(share * 4).toFixed(2)}) = ${pts}`, evidence: bridgeTx.slice(0, 5).map((t) => ({ counterparty: t.cp, usd: Math.round(t.usd || 0), txs: [t.hash], source: 'Workspace label: bridge' })) });
  }

  // New wallet moving large value.
  const ageDays = facts.firstSeen ? (Date.parse(asOf) - Date.parse(facts.firstSeen)) / 864e5 : 0;
  if (ageDays < 30 && facts.inflowUsd + facts.outflowUsd > 50000) {
    factors.push({ id: 'newWallet', name: CAT_NAME.newWallet, points: ENGINE.points.newWallet, max: ENGINE.points.newWallet, severity: 'Medium', summary: `${Math.round(ageDays)} days old with $${Math.round(facts.inflowUsd + facts.outflowUsd).toLocaleString('en-US')} moved`, calc: `${ENGINE.points.newWallet} points when age < 30 days and volume > $50,000`, evidence: [] });
  }

  factors.sort((a, b) => b.points - a.points);
  let score = Math.min(100, Math.round(factors.reduce((a, f) => a + f.points, 0)));
  let floor = null;
  if (ENGINE.sanctionsFloor && exposure.some((e) => e.cat === 'sanctions' && e.hops === 1) && score < ENGINE.tiers[2]) {
    floor = `Raised from ${score} to ${ENGINE.tiers[2]}: direct sanctions exposure is always Critical.`;
    score = ENGINE.tiers[2];
  }
  return { score, tier: tierFor(score), factors, floor, version: ENGINE.version };
}
