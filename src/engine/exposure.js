import { ENGINE, RISK_CATS } from './config';
import { labelFor } from './labels';

/**
 * Direct and indirect exposure (spec steps 5-6). Walks the transaction graph up to ENGINE.maxHops
 * from the wallet and records every risky labelled address it reaches, with the shortest path,
 * the amount that could have flowed along it (the smallest pair total on the path) and the transactions.
 * edges: [{ from, to, usd, hash, time }]
 */
export function computeExposure(address, edges, asOf) {
  const me = address.toLowerCase();
  const cutoff = asOf ? Date.parse(asOf) : Infinity;
  const pair = new Map(); // "a|b" -> { usd, txs[], first }
  const adj = new Map();
  for (const e of edges) {
    if (Date.parse(e.time) > cutoff) continue;
    const a = e.from.toLowerCase(), b = e.to.toLowerCase();
    if (a === b) continue;
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    const p = pair.get(k) || { usd: 0, txs: [], first: e.time };
    p.usd += e.usd; p.txs.push(e.hash); if (e.time < p.first) p.first = e.time;
    pair.set(k, p);
    if (!adj.has(a)) adj.set(a, new Map()); if (!adj.has(b)) adj.set(b, new Map());
    adj.get(a).set(b, e); adj.get(b).set(a, e);
  }
  const pairOf = (a, b) => pair.get(a < b ? `${a}|${b}` : `${b}|${a}`);

  // breadth-first search; risky nodes are recorded but not expanded (exposure stops at the risky entity)
  const prev = new Map([[me, null]]);
  let frontier = [me];
  const found = [];
  for (let hop = 1; hop <= ENGINE.maxHops && frontier.length; hop++) {
    const next = [];
    for (const n of frontier) {
      for (const m of adj.get(n)?.keys() || []) {
        if (prev.has(m)) continue;
        prev.set(m, n);
        const label = labelFor(m);
        if (label && RISK_CATS[label.cat]) found.push({ node: m, hop, label });
        else next.push(m);
      }
    }
    frontier = next;
  }

  return found.map(({ node, hop, label }) => {
    const path = [node];
    while (prev.get(path[0])) path.unshift(prev.get(path[0]));
    let usd = Infinity; const txs = []; let first = null;
    for (let i = 0; i < path.length - 1; i++) {
      const p = pairOf(path[i], path[i + 1]);
      usd = Math.min(usd, p.usd); txs.push(...p.txs.slice(0, 3));
      if (i === path.length - 2) first = p.first;
    }
    const firstEdge = adj.get(path[0]).get(path[1]);
    return {
      cat: RISK_CATS[label.cat], labelCat: label.cat, address: node, name: label.name, source: label.source, labelConfidence: label.confidence ?? 0.8,
      hops: hop, relationship: hop === 1 ? 'Direct' : `${hop}-hop`, usd: Math.round(usd), path, txs, firstObserved: first,
      direction: firstEdge.to.toLowerCase() === me ? 'Incoming (source of funds)' : 'Outgoing (destination of funds)',
    };
  }).sort((a, b) => a.hops - b.hops || b.usd - a.usd);
}

/** Labelled entity mix among direct counterparties (spec step 7). */
export function counterpartyMix(address, txs) {
  const seen = new Map();
  for (const t of txs) {
    const a = t.cp.toLowerCase();
    if (!seen.has(a)) seen.set(a, labelFor(a)?.cat || 'unknown');
  }
  const mix = {};
  for (const c of seen.values()) mix[c] = (mix[c] || 0) + 1;
  return { total: seen.size, mix, risky: [...seen.entries()].filter(([, c]) => RISK_CATS[c]).map(([a]) => a) };
}
