import { rng, addr, txh } from '../lib/format';
import { ETH_USD } from './config';
import { registerLabels } from './labels';

/**
 * Deterministic simulated transaction history, used when no blockchain API key is configured.
 * It turns a wallet's demo profile hints into transactions and second-hop links so the real engine
 * (features, exposure, behaviour, model) has something realistic to analyse.
 * Days after BASE_AS_OF are generated day by day, so monitoring runs can "advance time".
 *
 * hints: { first, tx, vol, cp, c: { T, E, B, A, O } (0-100 demo intensities), entities: { exchange, dex, bridge, mixer }, anchor }
 */
export const BASE_AS_OF = '2026-11-02T09:41:00Z';
const DAY = 864e5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const baseCache = new Map();

// Simulated histories link only to demo-labelled addresses, never to real listed people or entities.
const DEMO = {
  sanctions: Array.from({ length: 6 }, (_, i) => addr(`demo-sdn-${i}`)),
  scam: Array.from({ length: 6 }, (_, i) => addr(`demo-scam-${i}`)),
};
registerLabels(Object.fromEntries([
  ...DEMO.sanctions.map((a, i) => [a, { cat: 'sanctions', name: `Sanctioned entity ${i + 1} (demo)`, source: 'Demo sanctions list (simulated)', confidence: 0.99 }]),
  ...DEMO.scam.map((a, i) => [a, { cat: 'scam', name: `Reported scam wallet ${i + 1} (demo)`, source: 'Demo scam list (simulated)', confidence: 0.85 }]),
]));
const demoAddressOf = (cat, seed) => DEMO[cat][Math.abs(seed) % DEMO[cat].length];

function mkTx(address, cp, dir, usd, time, sym, seed, extra = {}) {
  const value = sym === 'ETH' ? usd / ETH_USD : usd;
  return { hash: extra.hash || txh(`sim:${address}:${seed}`), time: new Date(time).toISOString(), from: dir === 'in' ? cp : address, to: dir === 'in' ? address : cp, cp, dir, sym, value: Math.round(value * 1e6) / 1e6, usd: Math.round(usd * 100) / 100, contract: false };
}

function setup(address, h) {
  const r = rng('sim:' + address.toLowerCase());
  const c = h.c || { T: 30, E: 30, B: 30, A: 30, O: 30 };
  const now = Date.parse(BASE_AS_OF);
  const start = Math.max(Date.parse(h.first || '2025-06-01'), now - 300 * DAY);
  const days = Math.max(14, (now - start) / DAY);
  const avgUsd = clamp((h.vol || 50000) / Math.max(1, h.tx || 50), 80, 40000);
  const rate = clamp((h.tx || 50) / days / 3, 0.12, 2.5);
  const pool = Array.from({ length: clamp(Math.round((h.cp || 20) / 3), 6, 30) }, (_, i) => addr(`simcp:${address}:${i}`));
  return { r, c, now, start, avgUsd, rate, pool, e: h.entities || {} };
}

function pickCp(S, r) {
  const x = r();
  if (S.e.exchange && x < 0.15) return S.e.exchange;
  if (S.e.dex && x < 0.25) return S.e.dex;
  return S.pool[Math.floor(r() * S.pool.length)];
}

function dayTxs(address, S, r, dayStart, mult, seed) {
  const out = [];
  const k = Math.floor(S.rate * mult + r());
  for (let j = 0; j < k; j++) {
    const cp = pickCp(S, r);
    const dir = r() < (cp === S.e.exchange ? 0.6 : 0.5) ? 'in' : 'out';
    const usd = S.avgUsd * Math.exp((r() - 0.5) * 2.4);
    const sym = r() < 0.5 ? 'ETH' : r() < 0.7 ? 'USDT' : 'USDC';
    out.push(mkTx(address, cp, dir, usd, dayStart + Math.floor(r() * DAY), sym, `${seed}:${j}`));
  }
  return out;
}

function passThrough(address, r, at, usdIn, seed) {
  const src = addr(`simsrc:${address}:${seed}`);
  const txs = [mkTx(address, src, 'in', usdIn, at, 'USDT', `pt:${seed}:in`)];
  let t = at;
  for (let j = 0; j < 3; j++) { t += (3 + Math.floor(r() * 8)) * 60000; txs.push(mkTx(address, addr(`simdst:${address}:${seed}:${j}`), 'out', usdIn * 0.31, t, 'USDT', `pt:${seed}:${j}`)); }
  return txs;
}

function base(address, h) {
  const key = address.toLowerCase() + JSON.stringify(h.c || {});
  if (baseCache.has(key)) return baseCache.get(key);
  const S = setup(address, h);
  const { r, c, now } = S;
  const txs = []; const edges = [];
  const spikeFrom = now - 7 * DAY;
  for (let d = S.start; d < now; d += DAY) {
    const mult = c.B >= 60 && d >= spikeFrom ? 2 + (c.B - 60) / 5 : 1;
    txs.push(...dayTxs(address, S, r, d, mult, `d${Math.round(d / DAY)}`));
  }
  if (txs.length > 650) txs.splice(0, txs.length - 650);

  // Direct mixer use, scaled by T.
  if (c.T >= 60 && S.e.mixer) [40, 20, 6].slice(0, c.T >= 85 ? 3 : c.T >= 70 ? 2 : 1).forEach((ago, i) => txs.push(mkTx(address, S.e.mixer, i % 2 ? 'in' : 'out', 8000 + c.T * 400, now - ago * DAY, 'ETH', `mix${i}`)));
  // Direct receipt from a known scam address.
  const scam = demoAddressOf('scam', Math.floor(r() * 1e6));
  if (c.T >= 85 && scam) txs.push(mkTx(address, scam, 'in', 9200, now - 12 * DAY, 'ETH', 'scam-direct'));
  // Indirect sanctions exposure through a counterparty (2 hops) or through two (3 hops).
  const sanc = demoAddressOf('sanctions', Math.floor(r() * 1e6));
  if (sanc && c.E >= 50) {
    const x = S.pool[1];
    txs.push(mkTx(address, x, 'in', 6000 + c.E * 150, now - 30 * DAY, 'USDT', 'sx'));
    if (c.E >= 70) edges.push({ from: sanc, to: x, usd: 8400, hash: txh(`sim:${address}:s2`), time: new Date(now - 33 * DAY).toISOString() });
    else { const y = addr(`simmid:${address}`); edges.push({ from: sanc, to: y, usd: 9000, hash: txh(`sim:${address}:s3a`), time: new Date(now - 36 * DAY).toISOString() }, { from: y, to: x, usd: 7000, hash: txh(`sim:${address}:s3b`), time: new Date(now - 34 * DAY).toISOString() }); }
  }
  if (scam && c.E >= 40) { const x = S.pool[2]; txs.push(mkTx(address, x, 'in', 4000 + c.E * 60, now - 25 * DAY, 'ETH', 'cx')); edges.push({ from: scam, to: x, usd: 5200, hash: txh(`sim:${address}:c2`), time: new Date(now - 27 * DAY).toISOString() }); }
  // Bridges.
  if (c.O >= 40 && S.e.bridge) for (let i = 0; i < 2 + Math.floor(c.O / 30); i++) txs.push(mkTx(address, S.e.bridge, 'out', S.avgUsd * 2, now - (3 + i * 9) * DAY, 'ETH', `br${i}`));
  // Rapid pass-through bursts.
  if (c.B >= 60) for (let i = 0; i < (c.B >= 80 ? 3 : 1); i++) txs.push(...passThrough(address, r, now - (2 + i * 4) * DAY, 20000 + c.B * 500, `b${i}`));
  if (h.anchor) txs.push(mkTx(address, h.anchor.from, 'in', h.anchor.usd, Date.parse(h.anchor.time), h.anchor.sym, 'anchor', { hash: h.anchor.hash }));

  txs.sort((a, b) => (a.time < b.time ? -1 : 1));
  const out = { S, txs, edges };
  baseCache.set(key, out);
  return out;
}

/** Simulated history up to `asOf` (days after BASE_AS_OF add new deterministic activity). */
export function simulateWallet(address, hints = {}, asOf = BASE_AS_OF) {
  const b = base(address, hints);
  const txs = [...b.txs]; const edges = [...b.edges];
  const { S } = b; const end = Date.parse(asOf);
  for (let d = S.now, i = 0; d < end; d += DAY, i++) {
    const r = rng(`simday:${address.toLowerCase()}:${i}`);
    const spike = r() < S.c.B / 250;
    const day = dayTxs(address, S, r, d, spike ? 6 : 1, `x${i}`).filter((t) => Date.parse(t.time) <= end);
    txs.push(...day);
    if (spike && d + DAY / 2 <= end) txs.push(...passThrough(address, r, d + DAY / 3, 25000 + S.c.B * 400, `x${i}`));
    if (S.e.mixer && r() < S.c.T / 400 && d + DAY / 2 <= end) txs.push(mkTx(address, S.e.mixer, 'out', 9000 + S.c.T * 300, d + DAY / 2, 'ETH', `xm${i}`));
    if (r() < S.c.E / 700 && d + DAY / 2 <= end) {
      const sanc = demoAddressOf('sanctions', i * 7919); const x = addr(`simnew:${address}:${i}`);
      txs.push(mkTx(address, x, 'in', 7000, d + DAY / 2, 'USDT', `xs${i}`));
      edges.push({ from: sanc, to: x, usd: 7500, hash: txh(`sim:${address}:xs2:${i}`), time: new Date(d + DAY / 4).toISOString() });
    }
  }
  txs.sort((a, c) => (a.time < c.time ? -1 : 1));
  return { mode: 'simulated', txs, edges: [...txs.map((t) => ({ from: t.from, to: t.to, usd: t.usd, hash: t.hash, time: t.time })), ...edges] };
}

export const clearSimCache = () => baseCache.clear();
