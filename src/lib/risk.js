import { rng, addr, txh, pick } from './format';
import { assessSimulated, registerLabels, ENGINE, BASE_AS_OF } from '../engine';

export const CFG = { weights: { T: 0.35, E: 0.25, B: 0.2, A: 0.1, O: 0.1 }, thr: [25, 50, 75], version: 3 };
export const setCfg = (c) => {
  CFG.weights = { ...c.weights }; CFG.thr = [...c.thr]; CFG.version = c.version;
  ENGINE.tiers = [...c.thr]; if (c.points) Object.assign(ENGINE.points, c.points); if (c.hopDecay) ENGINE.hopDecay = [...c.hopDecay]; ENGINE.version = c.version;
  cache.clear();
};
// Point in time the demo wallets are assessed at (advanced by monitoring runs).
let AS_OF = BASE_AS_OF;
export const setAsOf = (t) => { if (t !== AS_OF) { AS_OF = t; cache.clear(); } };
export const tierOf = (s) => (s == null ? 'unk' : s < CFG.thr[0] ? 'low' : s < CFG.thr[1] ? 'mod' : s < CFG.thr[2] ? 'high' : 'crit');
export const TN = { low: 'Low', mod: 'Moderate', high: 'High', crit: 'Critical', unk: 'Unknown' };
export const TC = { low: '#16A34A', mod: '#F59E0B', high: '#EA580C', crit: '#DC2626', unk: '#64748B' };
export const COMP = { T: 'Transaction risk', E: 'Exposure risk', B: 'Behaviour risk', A: 'Attribute risk', O: 'Other signals' };
export const calc = (c) => Math.round(Object.keys(CFG.weights).reduce((s, k) => s + CFG.weights[k] * c[k], 0) * 10) / 10;

export const TG = '0x7a3f1c5e8b2d4096a1f7c3e5d8b2a49e0c619B21';
export const KW = {
  B: '0xB7c4a91e2f6d38054c7be1a09d3f52e8640c0e21', C: '0xC1a2e47b9d05f38a6c2e1b4d7f90a35c8e1255d0', D: '0xD9e41b7a3c58f20e6d4a9b1c7e3f5082a41a1a33',
  E: '0xE5f7a30c91d64b28e5f3a7c1d9b40e62f7a190b8', F: '0xF2c6d84a1b79e30f5c2a8d6b4e1f09a73c507e14', G: '0x98b1c5e3a7d204f6b9c1e8a35d70f24b6e0c2c70',
  H: '0x84d9a2f6c1b3e5078d4a9c2f1e6b3507a8d46e05', ex: '0x28c6c06298d514db089934071355e5743bf21d60', dex: '0xd4b3e7a1c9f2058e6a3d1b7c4e90f5a2863b11c4',
  mix: '0x5a8e2c1f7b4d9036e1a5c8f2b7d40e93a6c1fd02', bridge: '0x3f9a6d2e8c1b57049e2a7d5c1f83b60e4a9d2b77',
};
const K = {
  [TG]: { label: 'Unknown', cat: 'unknown', c: { T: 90, E: 80, B: 80, A: 60, O: 45 }, bal: 48.2, tx: 1284, vol: 2410000, cp: 137, first: '2025-03-14', last: '2026-11-02T09:41:00Z' },
  [KW.B]: { label: 'Unknown', cat: 'unknown', c: { T: 70, E: 65, B: 60, A: 50, O: 40 }, bal: 12.4, tx: 412, vol: 410000, cp: 51, first: '2025-06-02', last: '2026-11-02T06:12:00Z' },
  [KW.C]: { label: 'Unknown', cat: 'unknown', c: { T: 55, E: 60, B: 60, A: 50, O: 45 }, bal: 3.1, tx: 221, vol: 140000, cp: 33, first: '2025-08-11', last: '2026-11-01T18:00:00Z' },
  [KW.D]: { label: 'Unknown', cat: 'unknown', c: { T: 40, E: 45, B: 40, A: 40, O: 35 }, bal: 1.9, tx: 64, vol: 22000, cp: 12, first: '2026-01-04', last: '2026-10-31T10:00:00Z' },
  [KW.E]: { label: 'Unknown', cat: 'unknown', c: { T: 85, E: 90, B: 80, A: 70, O: 60 }, bal: 6.8, tx: 412, vol: 680000, cp: 64, first: '2025-04-19', last: '2026-11-02T08:30:00Z' },
  [KW.F]: { label: 'Unknown', cat: 'unknown', c: { T: 10, E: 15, B: 10, A: 15, O: 10 }, bal: 0.4, tx: 17, vol: 4100, cp: 5, first: '2026-05-02', last: '2026-10-28T10:00:00Z' },
  [KW.G]: { label: 'Unknown', cat: 'unknown', c: { T: 65, E: 70, B: 60, A: 55, O: 50 }, bal: 2.2, tx: 98, vol: 91000, cp: 18, first: '2025-12-01', last: '2026-11-02T08:15:00Z' },
  [KW.H]: { label: 'Unknown', cat: 'unknown', c: { T: 30, E: 35, B: 35, A: 30, O: 30 }, bal: 0.8, tx: 31, vol: 9000, cp: 9, first: '2026-02-11', last: '2026-10-20T10:00:00Z' },
  [KW.ex]: { label: 'Exchange', cat: 'exchange', c: { T: 10, E: 20, B: 25, A: 20, O: 15 }, bal: 91200, tx: 210884, vol: 1.9e9, cp: 88000, first: '2019-01-01', last: '2026-11-12T09:00:00Z' },
  [KW.dex]: { label: 'DEX router', cat: 'dex', c: { T: 25, E: 30, B: 40, A: 40, O: 35 }, bal: 1200, tx: 58402, vol: 1.22e8, cp: 20000, first: '2021-05-05', last: '2026-11-12T09:00:00Z' },
  [KW.mix]: { label: 'Mixing service', cat: 'mixer', c: { T: 100, E: 100, B: 85, A: 80, O: 70 }, bal: 2100, tx: 9210, vol: 1.42e7, cp: 4100, first: '2022-02-01', last: '2026-11-02T08:15:00Z' },
  [KW.bridge]: { label: 'Bridge', cat: 'bridge', c: { T: 35, E: 40, B: 40, A: 40, O: 35 }, bal: 800, tx: 8800, vol: 5.1e7, cp: 3300, first: '2022-03-01', last: '2026-11-02T08:00:00Z' },
};
export const LABELS = Object.fromEntries(Object.entries(K).map(([a, v]) => [a.toLowerCase(), v.label]));
export const labelOf = (a) => LABELS[(a || '').toLowerCase()] || 'Unknown';
registerLabels({
  [KW.ex]: { cat: 'exchange', name: 'Exchange hot wallet', source: 'Workspace label', confidence: 0.98 },
  [KW.dex]: { cat: 'dex', name: 'DEX router', source: 'Workspace label', confidence: 0.97 },
  [KW.bridge]: { cat: 'bridge', name: 'Cross-chain bridge', source: 'Workspace label', confidence: 0.95 },
  [KW.mix]: { cat: 'mixer', name: 'Mixing service', source: 'Workspace label', confidence: 0.95 },
});
const KL = Object.fromEntries(Object.entries(K).map(([a, v]) => [a.toLowerCase(), v]));

const cache = new Map();
const TEXT = {
  T: ['Direct transfer to a mixing service', 'Transfers within two hops of a flagged address', 'Large outbound value to unlabelled wallets', 'Unusual token swaps before outbound transfer'],
  E: ['Exposure to flagged counterparties', 'Funds sourced from high-risk wallets', 'Indirect exposure to a sanctioned cluster'],
  B: ['Velocity above 30-day baseline', 'Rapid pass-through of inbound funds', 'Repeated sub-threshold transfers', 'Dormant wallet reactivated with large transfer'],
  A: ['Attribute: no ENS, fresh funding source', 'Attribute: wallet younger than 90 days', 'Attribute: funded by a single address'],
  O: ['Other: repeated micro-transfers', 'Other: ML anomaly score above baseline'],
};
export function evidenceFor(a, c) {
  const r = rng('ev' + a);
  let n = 184;
  const items = [];
  for (const k of Object.keys(CFG.weights)) {
    const contrib = Math.round(CFG.weights[k] * c[k] * 10) / 10;
    if (k === 'T' && a.toLowerCase() === TG.toLowerCase()) { items.push({ id: 'EVD-000184', text: TEXT.T[0], comp: 'T', pts: 18.0 }, { id: 'EVD-000185', text: 'Exposure to 9 flagged counterparties', comp: 'T', pts: Math.round((contrib - 18) * 10) / 10 }); n = 186; continue; }
    items.push({ id: 'EVD-' + String(n++).padStart(6, '0'), text: TEXT[k][Math.floor(r() * TEXT[k].length)], comp: k, pts: contrib });
  }
  return items;
}
export function walletProfile(address) {
  const key = address.toLowerCase() + '|' + CFG.version + '|' + AS_OF;
  if (cache.has(key)) return cache.get(key);
  const known = KL[address.toLowerCase()];
  const r = rng('w' + address.toLowerCase());
  let p;
  if (known) p = { label: known.label, cat: known.cat, c: known.c, bal: known.bal, tx: known.tx, vol: known.vol, cp: known.cp, first: known.first, last: known.last };
  else {
    const base = r() * 100;
    const j = (x) => Math.max(5, Math.min(100, Math.round(x + (r() - 0.5) * 40)));
    p = { label: 'Unknown', cat: 'unknown', c: { T: j(base), E: j(base), B: j(base), A: j(base), O: j(base) }, bal: Math.round(r() * 800) / 10, tx: 10 + Math.floor(r() * 3000), vol: Math.round(r() * 2e6), cp: 4 + Math.floor(r() * 140), first: `202${4 + Math.floor(r() * 2)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`, last: new Date(Date.UTC(2026, 10, 2 - Math.floor(r() * 20), 9, 41)).toISOString() };
  }
  // Score from the risk engine (rules on the wallet's simulated history; live data on the Risk tab when a key is set).
  const hints = { first: p.first, tx: p.tx, vol: p.vol, cp: p.cp, c: p.c, entities: { exchange: KW.ex, dex: KW.dex, bridge: KW.bridge, mixer: KW.mix }, anchor: address.toLowerCase() === TG.toLowerCase() ? { hash: txh('1'), from: KW.B, usd: 1000, sym: 'USDT', time: '2026-11-02T09:41:00Z' } : null };
  const report = assessSimulated(address, hints, AS_OF, { withForecast: false });
  const score = report.score;
  const hist = [], end = score;
  for (let i = 0; i < 8; i++) hist.push(Math.max(2, Math.min(100, Math.round(end - (7 - i) * (3 + r() * 5) + (r() - 0.5) * 4))));
  hist[7] = end;
  const evidence = evidenceFor(address, p.c);
  const pool = [KW.E, KW.mix, KW.dex, KW.B, KW.ex, KW.G, KW.C, KW.D, KW.F, KW.bridge].filter((x) => x.toLowerCase() !== address.toLowerCase());
  const cps = (address.toLowerCase() === TG.toLowerCase() ? [KW.E, KW.mix, KW.dex, KW.B, KW.ex, KW.G] : [...pool].sort(() => r() - 0.5).slice(0, 4 + Math.floor(r() * 3))).map((a, i) => {
    const kp = KL[a.toLowerCase()];
    const dir = ['Inbound', 'Outbound', 'Both'][Math.floor(r() * 3)];
    return { a, label: kp.label, n: 2 + Math.floor(r() * 30), vol: Math.round(kp.cat === 'exchange' ? 401000 : 20000 + r() * 200000), dir, risk: Math.round(calc(kp.c)) };
  });
  const txs = [];
  let t = new Date('2026-11-02T09:41:00Z').getTime();
  const toks = [['USDT', 'ERC-20'], ['ETH', 'Native'], ['USDC', 'ERC-20']];
  for (let i = 0; i < 42; i++) {
    const cp = cps[Math.floor(r() * cps.length)];
    const [sym, ty] = toks[Math.floor(r() * 3)];
    const inb = r() > 0.45;
    const amt = sym === 'ETH' ? Math.round(r() * 1400) / 100 : Math.round(r() * 4800 + 100);
    const hash = i === 0 && address.toLowerCase() === TG.toLowerCase() ? txh('1') : txh(address + i);
    txs.push({ hash, time: new Date(t).toISOString(), from: inb ? cp.a : address, to: inb ? address : cp.a, cp: cp.a, dir: inb ? 'in' : 'out', amt: i === 0 && address.toLowerCase() === TG.toLowerCase() ? 1000 : amt, sym: i === 0 && address.toLowerCase() === TG.toLowerCase() ? 'USDT' : sym, ty, risk: i === 0 && address.toLowerCase() === TG.toLowerCase() ? 64 : Math.max(3, Math.min(97, Math.round(cp.risk * 0.7 + r() * 30))), status: 'Confirmed' });
    t -= Math.round((2 + r() * 40) * 3600 * 1000);
  }
  const out = { address, ...p, hints, report, score, tier: tierOf(score), history: hist, evidence, cps, txs, counts: { in: Math.round(p.tx * 0.63), out: p.tx - Math.round(p.tx * 0.63) } };
  cache.set(key, out);
  return out;
}
export const quickScore = (a) => walletProfile(a).score;

export function txDetail(hash) {
  const main = hash === txh('1');
  const r = rng('td' + hash);
  const ins = main
    ? [{ w: KW.C, amt: 600, t: 1 }, { w: KW.D, amt: 250, t: 2 }, { w: KW.E, amt: 400, t: 3 }, { w: KW.F, amt: 150, t: 4 }]
    : [KW.C, KW.D, KW.E, KW.F, KW.G].sort(() => r() - 0.5).slice(0, 3 + Math.floor(r() * 2)).map((w, i) => ({ w, amt: Math.round(150 + r() * 700), t: i + 1 }));
  const total = ins.reduce((s, x) => s + x.amt, 0);
  const amount = main ? 1000 : Math.min(total, Math.round(total * (0.5 + r() * 0.5)));
  const from = main ? KW.B : pick(r, Object.values(KW));
  const to = main ? TG : pick(r, Object.values(KW).filter((x) => x !== from));
  const risk = main ? 64 : Math.round(30 + r() * 60);
  const time = main ? '2026-11-02T09:41:12Z' : new Date(Date.UTC(2026, 10, 1 + Math.floor(r() * 2), Math.floor(r() * 24), Math.floor(r() * 60))).toISOString();
  return { hash, from, to, amount, sym: 'USDT', ty: 'ERC-20', risk, time, block: 21044310 - Math.floor(r() * 4000), gas: 51204, gwei: 14.2, fee: 0.000727, nonce: 388, conf: 1142, ins, status: 'Success' };
}
export function attribute(ins, amount, method) {
  const total = ins.reduce((s, x) => s + x.amt, 0);
  let res;
  if (method === 'prop') res = ins.map((x) => ({ w: x.w, v: (amount * x.amt) / total }));
  else {
    const order = [...ins].sort((a, b) => (method === 'fifo' ? a.t - b.t : b.t - a.t));
    let left = amount;
    res = order.map((x) => { const v = Math.min(x.amt, left); left -= v; return { w: x.w, v }; });
  }
  return res;
}

export const PERIODS = { '24 hours': 1, '7 days': 7, '30 days': 30, '90 days': 90 };
export const LIM = { nodes: 100, edges: 250 };
export function trace(start, o) {
  const hops = Number(o.hops || 3), days = PERIODS[o.period] || 30;
  const total = Math.max(hops + 1, Math.round(38 * Math.pow(hops / 3, 2.2) * Math.sqrt(days / 30) * (o.min ? Math.max(0.4, 1 - Number(o.min) / 20000) : 1)));
  const edgesT = Math.round(total * 1.87);
  const r = rng('tr' + start + hops);
  const dir = o.dir || 'Forward and backward';
  const chain = [];
  const pool = Object.values(KW);
  const n = hops + 1;
  for (let i = 0; i < n; i++) chain.push(i === (dir === 'Forward' ? 0 : n - 1) ? start : (start.toLowerCase() === TG.toLowerCase() && hops === 3 && i < 4 ? [KW.B, KW.C, KW.E, KW.G][i] : addr('tr' + start + i + hops)));
  if (dir === 'Forward') chain.reverse(), chain.reverse();
  let amt = 1200;
  const hopsArr = [];
  for (let i = 0; i < n - 1; i++) {
    hopsArr.push({ from: chain[i], to: chain[i + 1], amt: Math.round(amt), hash: txh('h' + start + i), time: new Date(Date.UTC(2026, 10, 2, 6 + Math.floor(i * 0.8), (12 + i * 29) % 60)).toISOString(), basis: i === 2 && r() < 0.8 ? 'Heuristic' : r() < 0.15 ? 'Heuristic' : 'Observed' });
    amt *= 0.8 + r() * 0.15;
  }
  const truncated = total > LIM.nodes || edgesT > LIM.edges;
  return { chain, hops: hopsArr, total, shown: Math.min(total, LIM.nodes), edges: Math.min(edgesT, LIM.edges), truncated };
}
