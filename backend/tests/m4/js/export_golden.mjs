/**
 * Exports "golden" input/output pairs from the JavaScript risk engine (src/engine) so the Python port
 * can prove it produces the same assessments. Run from the repository root:
 *
 *   npx vite-node backend/tests/m4/js/export_golden.mjs
 *
 * Writes backend/tests/m4/fixtures/golden.json. Re-run only when the JS engine (rule set v1) changes.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { assessFromData, ENGINE, labelFor, registerLabels } from '../../../../src/engine/index.js';
import { simulateWallet, BASE_AS_OF } from '../../../../src/engine/sim.js';

const a = (n) => '0x' + n.toString(16).padStart(40, '0');
const EXCHANGE = a(0xe1), DEX = a(0xd1), BRIDGE = a(0xb1), MIXER = a(0x31), SANC = a(0x51), DARK = a(0xda);
registerLabels({
  [EXCHANGE]: { cat: 'exchange', name: 'Demo Exchange hot wallet', source: 'Workspace label', confidence: 0.95 },
  [DEX]: { cat: 'dex', name: 'Demo DEX router', source: 'Workspace label', confidence: 0.9 },
  [BRIDGE]: { cat: 'bridge', name: 'Demo bridge', source: 'Workspace label', confidence: 0.9 },
  [MIXER]: { cat: 'mixer', name: 'Demo mixer', source: 'Workspace label' }, // no confidence: engine defaults apply
  [SANC]: { cat: 'sanctions', name: 'Demo SDN', source: 'Test list', confidence: 0.99 },
  [DARK]: { cat: 'darknet', name: 'Demo market', source: 'Test list', confidence: 0.8 },
});
const entities = { exchange: EXCHANGE, dex: DEX, bridge: BRIDGE, mixer: MIXER };

const later = (days) => new Date(Date.parse(BASE_AS_OF) + days * 864e5).toISOString();
const sims = [
  ['sim-high-everything', { first: '2025-03-01', tx: 900, vol: 2e6, cp: 120, c: { T: 90, E: 80, B: 85, A: 60, O: 70 } }, BASE_AS_OF],
  ['sim-low-risk', { first: '2025-03-01', tx: 200, vol: 1e5, cp: 30, c: { T: 10, E: 10, B: 10, A: 10, O: 10 } }, BASE_AS_OF],
  ['sim-3hop-sanctions', { first: '2025-06-01', tx: 300, vol: 4e5, cp: 60, c: { T: 20, E: 55, B: 20, A: 20, O: 20 } }, BASE_AS_OF],
  ['sim-2hop-sanctions-bridges', { first: '2025-08-01', tx: 400, vol: 9e5, cp: 80, c: { T: 30, E: 75, B: 30, A: 30, O: 90 } }, BASE_AS_OF],
  ['sim-mixer-direct', { first: '2025-01-01', tx: 500, vol: 6e5, cp: 50, c: { T: 72, E: 30, B: 40, A: 30, O: 30 } }, BASE_AS_OF],
  ['sim-behaviour-spike', { first: '2025-09-01', tx: 600, vol: 3e5, cp: 40, c: { T: 10, E: 10, B: 95, A: 10, O: 10 } }, BASE_AS_OF],
  ['sim-new-wallet', { first: '2026-10-20', tx: 120, vol: 9e5, cp: 25, c: { T: 20, E: 20, B: 20, A: 20, O: 20 } }, BASE_AS_OF],
  ['sim-advanced-30d', { first: '2025-03-01', tx: 700, vol: 1e6, cp: 90, c: { T: 70, E: 60, B: 70, A: 40, O: 50 } }, later(30)],
  ['sim-empty-history', { first: '2026-11-01', tx: 1, vol: 100, cp: 1, c: { T: 0, E: 0, B: 0, A: 0, O: 0 } }, BASE_AS_OF],
];

const W = a(0x11), A = a(0x22), B = a(0x33);
const tx = (cp, dir, usd, time, sym = 'ETH', hash) => ({ hash: hash || `0x${(cp + dir + time).replace(/[^0-9a-f]/g, '').slice(-60)}`, time, cp, dir, sym, value: sym === 'ETH' ? usd / 3000 : usd, usd, from: dir === 'in' ? cp : W, to: dir === 'in' ? W : cp, contract: false });
const toEdges = (txs) => txs.map((t) => ({ from: t.from, to: t.to, usd: t.usd, hash: t.hash, time: t.time }));
const hand = [];
{
  const txs = [tx(SANC, 'in', 500, '2026-01-02T00:00:00.000Z')];
  hand.push(['hand-direct-sanctions-floor', W, txs, toEdges(txs), '2026-02-01T00:00:00.000Z']);
}
{
  const txs = Array.from({ length: 120 }, (_, i) => tx(A, i % 2 ? 'in' : 'out', 200, new Date(Date.UTC(2025, 9, 1 + i)).toISOString()));
  hand.push(['hand-clean-wallet', W, txs, toEdges(txs), '2026-02-01T00:00:00.000Z']);
}
{
  const txs = [];
  for (let d = 0; d < 90; d++) txs.push(tx(A, 'in', 300, new Date(Date.UTC(2025, 10, 1 + d, 12)).toISOString()));
  for (let d = 0; d < 7; d++) for (let k = 0; k < 20; k++) txs.push(tx(B, 'out', 300, new Date(Date.UTC(2026, 0, 25 + d, k)).toISOString()));
  txs.push(tx(A, 'in', 50000, '2026-01-30T10:00:00.000Z'), tx(B, 'out', 45000, '2026-01-30T10:10:00.000Z'));
  // dormancy and structuring
  txs.push(tx(A, 'in', 9500, '2026-01-29T01:00:00.000Z'), tx(A, 'in', 9800, '2026-01-29T02:00:00.000Z'), tx(A, 'in', 9100, '2026-01-29T03:00:00.000Z'));
  txs.sort((x, y) => (x.time < y.time ? -1 : 1));
  hand.push(['hand-spike-passthrough-structuring', W, txs, toEdges(txs), '2026-02-01T00:00:00.000Z']);
}
{
  const txs = [tx(A, 'in', 1000, '2025-01-01T00:00:00.000Z'), tx(A, 'out', 900, '2025-06-01T00:00:00.000Z'), tx(DARK, 'in', 20000, '2026-01-20T00:00:00.000Z'), tx(BRIDGE, 'out', 19000, '2026-01-21T00:00:00.000Z')];
  const edges = [...toEdges(txs), { from: MIXER, to: A, usd: 3000, hash: '0xmixA', time: '2024-12-30T00:00:00.000Z' }];
  hand.push(['hand-darknet-bridge-dormancy', W, txs, edges, '2026-02-01T00:00:00.000Z']);
}

function labelMap(address, txs, edges) {
  const out = {};
  const seen = new Set([address.toLowerCase(), ...txs.map((t) => t.cp.toLowerCase()), ...edges.flatMap((e) => [e.from.toLowerCase(), e.to.toLowerCase()])]);
  for (const x of [...seen].sort()) { const l = labelFor(x); if (l) out[x] = l; }
  return out;
}

const cases = [];
for (const [name, hints, asOf] of sims) {
  const address = a(0xabc000 + cases.length);
  const d = simulateWallet(address, { ...hints, entities }, asOf);
  cases.push({ name, input: { address, txs: d.txs, edges: d.edges, asOf, mode: 'simulated', labels: labelMap(address, d.txs, d.edges) } });
}
for (const [name, address, txs, edges, asOf] of hand) cases.push({ name, input: { address, txs, edges, asOf, mode: 'live', labels: labelMap(address, txs, edges) } });

for (const c of cases) {
  const { recentTxs, ...report } = assessFromData(c.input);
  c.output = { ...report, recentTxHashes: recentTxs.map((t) => t.hash) };
}

const outDir = new URL('../fixtures/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL('golden.json', outDir), JSON.stringify({ engine: ENGINE, generated: new Date().toISOString(), cases }));
console.log(`wrote ${cases.length} cases`, cases.map((c) => `${c.name}: score ${c.output.score} (${c.output.tierName})`));
