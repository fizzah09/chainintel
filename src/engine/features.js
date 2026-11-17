import { ETH_USD } from './config';

/**
 * The 17 features the classifier was trained on (ml/config.py FEATURES), computed from a wallet's
 * transactions. Values are in ETH and minutes, as in the training data.
 * tx: { hash, time (ISO), from, to, cp, dir: 'in'|'out', sym, value (token units), usd }
 */
export const FEATURE_KEYS = ['avg_min_between_sent', 'avg_min_between_received', 'time_diff_first_last_min', 'sent_tnx', 'received_tnx', 'unique_received_from', 'unique_sent_to', 'min_value_received', 'max_value_received', 'avg_value_received', 'min_value_sent', 'max_value_sent', 'avg_value_sent', 'total_ether_sent', 'total_ether_received', 'total_ether_balance', 'erc20_total_tnxs'];

const mins = (t) => Date.parse(t) / 60000;
const avgGap = (list) => {
  if (list.length < 2) return 0;
  const ts = list.map((x) => mins(x.time)).sort((a, b) => a - b);
  return (ts[ts.length - 1] - ts[0]) / (ts.length - 1);
};
const stats = (vals) => (vals.length ? { min: Math.min(...vals), max: Math.max(...vals), avg: vals.reduce((a, b) => a + b, 0) / vals.length, sum: vals.reduce((a, b) => a + b, 0) } : { min: 0, max: 0, avg: 0, sum: 0 });

export function computeFeatures(txs) {
  const eth = txs.filter((t) => t.sym === 'ETH');
  const sent = eth.filter((t) => t.dir === 'out');
  const recv = eth.filter((t) => t.dir === 'in');
  const all = txs.map((t) => mins(t.time));
  const s = stats(sent.map((t) => t.value));
  const r = stats(recv.map((t) => t.value));
  return {
    avg_min_between_sent: avgGap(sent),
    avg_min_between_received: avgGap(recv),
    time_diff_first_last_min: all.length > 1 ? Math.max(...all) - Math.min(...all) : 0,
    sent_tnx: sent.length,
    received_tnx: recv.length,
    unique_received_from: new Set(recv.map((t) => t.cp.toLowerCase())).size,
    unique_sent_to: new Set(sent.map((t) => t.cp.toLowerCase())).size,
    min_value_received: r.min,
    max_value_received: r.max,
    avg_value_received: r.avg,
    min_value_sent: s.min,
    max_value_sent: s.max,
    avg_value_sent: s.avg,
    total_ether_sent: s.sum,
    total_ether_received: r.sum,
    total_ether_balance: r.sum - s.sum,
    erc20_total_tnxs: txs.length - eth.length,
  };
}

/** Facts for the wallet profile (Step 2 of the spec): no scoring, only what happened. */
export function profileFacts(txs, address) {
  const usd = (t) => t.usd ?? (t.sym === 'ETH' ? t.value * ETH_USD : t.value);
  const inflow = txs.filter((t) => t.dir === 'in').reduce((a, t) => a + usd(t), 0);
  const outflow = txs.filter((t) => t.dir === 'out').reduce((a, t) => a + usd(t), 0);
  const times = txs.map((t) => t.time).sort();
  const days = times.length ? Math.max(1, (Date.parse(times[times.length - 1]) - Date.parse(times[0])) / 864e5) : 1;
  const largest = txs.reduce((m, t) => Math.max(m, usd(t)), 0);
  return {
    address,
    transactions: txs.length,
    firstSeen: times[0] || null,
    lastActive: times[times.length - 1] || null,
    inflowUsd: inflow,
    outflowUsd: outflow,
    counterparties: new Set(txs.map((t) => t.cp.toLowerCase())).size,
    contracts: new Set(txs.filter((t) => t.contract).map((t) => t.cp.toLowerCase())).size,
    avgTxUsd: txs.length ? (inflow + outflow) / txs.length : 0,
    txPerDay: txs.length / days,
    largestTxUsd: largest,
  };
}
