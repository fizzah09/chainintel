import { ENGINE, BASE_AS_OF } from '../engine';

// Risk thresholds and tier names. Wallet scores come only from the backend risk engine.
export const CFG = { thr: [25, 50, 75], version: 3 };
export const setCfg = (c) => {
  CFG.thr = [...c.thr]; CFG.version = c.version;
  ENGINE.tiers = [...c.thr]; if (c.points) Object.assign(ENGINE.points, c.points); if (c.hopDecay) ENGINE.hopDecay = [...c.hopDecay]; ENGINE.version = c.version;
};
let AS_OF = BASE_AS_OF;
export const setAsOf = (t) => { AS_OF = t; };
export const tierOf = (s) => (s == null ? 'unk' : s < CFG.thr[0] ? 'low' : s < CFG.thr[1] ? 'mod' : s < CFG.thr[2] ? 'high' : 'crit');
export const TN = { low: 'Low', mod: 'Moderate', high: 'High', crit: 'Critical', unk: 'Unknown' };
export const TC = { low: '#16A34A', mod: '#F59E0B', high: '#EA580C', crit: '#DC2626', unk: '#64748B' };

// No address is known in the frontend: labels, scores and activity come from the backend only.
export const labelOf = () => 'Unknown';

// Empty profile for any address until the backend returns data for it.
export function walletProfile(address) {
  return {
    address, label: 'Unknown', cat: 'unknown', c: {}, bal: null, tx: 0, vol: null, cp: 0, first: null, last: null,
    score: null, tier: 'unk', history: [], evidence: [], cps: [], txs: [], counts: { in: 0, out: 0 }, report: null, hints: null,
  };
}
export const quickScore = () => null;
// Evidence rows come from the backend risk report; nothing is generated here.
export const evidenceFor = () => [];
// Transaction breakdowns come from the backend; the frontend no longer generates them.
export const txDetail = () => null;
export const attribute = () => [];

export const PERIODS = { '24 hours': 1, '7 days': 7, '30 days': 30, '90 days': 90 };
export const LIM = { nodes: 100, edges: 250 };
