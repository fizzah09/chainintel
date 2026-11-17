import { ENGINE, ETH_USD } from './config';

/**
 * Behavioural analysis (spec step 4 and Feature 2 §16). Compares the recent window with the wallet's
 * own baseline using robust statistics (median and MAD), and looks for laundering-style patterns.
 * Returns signals with plain-language reasons and a 0-100 anomaly score.
 */
const DAY = 864e5;
const usdOf = (t) => t.usd ?? (t.sym === 'ETH' ? t.value * ETH_USD : t.value);
const median = (xs) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mad = (xs, m) => median(xs.map((x) => Math.abs(x - m)));

function daily(txs, from, to) {
  const n = Math.max(1, Math.round((to - from) / DAY));
  const count = Array(n).fill(0), vol = Array(n).fill(0), fresh = Array(n).fill(0);
  const seen = new Set();
  for (const t of [...txs].sort((a, b) => (a.time < b.time ? -1 : 1))) {
    const ts = Date.parse(t.time);
    const cp = t.cp.toLowerCase();
    const isNew = !seen.has(cp); seen.add(cp);
    if (ts < from || ts >= to) continue;
    const i = Math.min(n - 1, Math.floor((ts - from) / DAY));
    count[i] += 1; vol[i] += usdOf(t); if (isNew) fresh[i] += 1;
  }
  return { count, vol, fresh };
}

function compare(name, unit, base, recent) {
  const m = median(base), d = mad(base, m);
  const r = recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length);
  const floor = unit === 'USD' ? 50 : 0.5;
  const ratio = r / Math.max(m, floor);
  const z = (r - m) / (1.4826 * d + floor * 0.5);
  return { metric: name, unit, baseline: m, recent: r, ratio, z };
}

export function analyseBehaviour(txs, asOf) {
  const now = Date.parse(asOf);
  const recentFrom = now - ENGINE.recentDays * DAY;
  const baseFrom = recentFrom - ENGINE.baselineDays * DAY;
  const b = daily(txs, baseFrom, recentFrom);
  const r = daily(txs, recentFrom, now);
  const metrics = [
    compare('Transactions per day', 'tx', b.count, r.count),
    compare('Volume per day', 'USD', b.vol, r.vol),
    compare('New counterparties per day', 'cp', b.fresh, r.fresh),
  ];
  const signals = [];
  for (const m of metrics) {
    if (m.ratio >= 3 && m.z >= 3) {
      signals.push({ type: 'spike', severity: m.ratio >= 6 ? 'High' : 'Medium', title: `${m.metric} ${m.ratio.toFixed(1)}x above baseline`, detail: `Last ${ENGINE.recentDays} days average ${fmt(m.recent, m.unit)} vs ${ENGINE.baselineDays}-day median ${fmt(m.baseline, m.unit)}.`, weight: m.ratio >= 6 ? 35 : 20 });
    }
  }

  const sorted = [...txs].sort((a, c) => (a.time < c.time ? -1 : 1));
  // Rapid pass-through: most of an inbound amount leaves within 30 minutes.
  const pass = [];
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    if (t.dir !== 'in' || Date.parse(t.time) < baseFrom) continue;
    const ts = Date.parse(t.time); let out = 0; const outs = [];
    for (let j = i + 1; j < sorted.length && Date.parse(sorted[j].time) - ts <= 30 * 60000; j++) if (sorted[j].dir === 'out') { out += usdOf(sorted[j]); outs.push(sorted[j]); }
    if (usdOf(t) >= 1000 && out >= 0.8 * usdOf(t)) pass.push({ in: t, outs, share: out / usdOf(t) });
  }
  if (pass.length) {
    const top = pass.reduce((a, c) => (usdOf(c.in) > usdOf(a.in) ? c : a));
    const mins = Math.round((Date.parse(top.outs[top.outs.length - 1].time) - Date.parse(top.in.time)) / 60000);
    signals.push({ type: 'pass-through', severity: pass.length >= 3 ? 'High' : 'Medium', title: `Rapid pass-through (${pass.length} time${pass.length > 1 ? 's' : ''})`, detail: `Example: received ${fmt(usdOf(top.in), 'USD')}, ${Math.round(top.share * 100)}% sent on within ${mins} minutes to ${new Set(top.outs.map((o) => o.cp)).size} address(es).`, txs: [top.in.hash, ...top.outs.map((o) => o.hash)].slice(0, 5), weight: pass.length >= 3 ? 30 : 18 });
  }
  // Fan-out: one inbound split to 5+ addresses within an hour.
  const fan = pass.filter((p) => new Set(p.outs.map((o) => o.cp)).size >= 3);
  if (fan.length) signals.push({ type: 'fan-out', severity: 'Medium', title: 'Funds split across several wallets', detail: `${fan.length} inbound transfer(s) split to 3 or more addresses within 30 minutes.`, weight: 12 });
  // Dormant wallet reactivated.
  for (let i = 1; i < sorted.length; i++) {
    const gap = (Date.parse(sorted[i].time) - Date.parse(sorted[i - 1].time)) / DAY;
    if (gap >= 90 && Date.parse(sorted[i].time) >= baseFrom) { signals.push({ type: 'dormancy', severity: 'Medium', title: `Reactivated after ${Math.round(gap)} days dormant`, detail: `Inactive from ${sorted[i - 1].time.slice(0, 10)} to ${sorted[i].time.slice(0, 10)}.`, weight: 12 }); break; }
  }
  // Structuring: repeated transfers just under 10,000 USD in the recent window.
  const under = sorted.filter((t) => Date.parse(t.time) >= recentFrom && usdOf(t) >= 9000 && usdOf(t) < 10000);
  if (under.length >= 3) signals.push({ type: 'structuring', severity: 'Medium', title: `${under.length} transfers just under 10,000 USD`, detail: `Within the last ${ENGINE.recentDays} days.`, txs: under.slice(0, 5).map((t) => t.hash), weight: 15 });

  const score = Math.min(100, signals.reduce((a, s) => a + s.weight, 0));
  return { score, level: score >= 50 ? 'High' : score >= 20 ? 'Medium' : score > 0 ? 'Low' : 'None', signals, metrics, windows: { recentDays: ENGINE.recentDays, baselineDays: ENGINE.baselineDays } };
}

function fmt(v, unit) {
  if (unit === 'USD') return `$${Math.round(v).toLocaleString('en-US')}`;
  return v >= 10 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1);
}
