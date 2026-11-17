import { txHistory, historyProvider } from '../lib/web3/chain';
import { ETH_USD } from './config';
import { labelFor } from './labels';

/**
 * Live data: the wallet's transfers from Etherscan or Alchemy, plus the transfers of its five largest
 * unlabelled counterparties so the engine can see 2-hop exposure. Deeper hops need an indexer
 * (see docs/RISK-ENGINE.md); each extra hop multiplies API calls.
 */
export const liveAvailable = () => !!historyProvider;

const STABLE = new Set(['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP']);
const toTx = (row, address) => ({
  hash: row.hash, time: row.time, cp: row.cp, dir: row.dir,
  from: row.dir === 'in' ? row.cp : address, to: row.dir === 'in' ? address : row.cp,
  sym: row.sym, value: row.amt,
  usd: row.sym === 'ETH' ? row.amt * ETH_USD : STABLE.has(row.sym) ? row.amt : 0, // other tokens: no price feed yet
  contract: false,
});
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchLiveData(address, { neighbours = 5 } = {}) {
  const rows = (await txHistory(address, 200)) || [];
  const txs = rows.map((r) => toTx(r, address)).sort((a, b) => (a.time < b.time ? -1 : 1));
  const edges = txs.map((t) => ({ from: t.from, to: t.to, usd: t.usd, hash: t.hash, time: t.time }));
  const vol = new Map();
  for (const t of txs) if (!labelFor(t.cp)) vol.set(t.cp.toLowerCase(), (vol.get(t.cp.toLowerCase()) || 0) + t.usd);
  const top = [...vol.entries()].sort((a, b) => b[1] - a[1]).slice(0, neighbours).map(([a]) => a);
  for (const n of top) {
    await pause(250); // stay under free-tier rate limits
    try {
      const nr = (await txHistory(n, 50)) || [];
      for (const r of nr) { const t = toTx(r, n); edges.push({ from: t.from, to: t.to, usd: t.usd, hash: t.hash, time: t.time }); }
    } catch { /* a failed neighbour fetch only reduces depth */ }
  }
  return { mode: 'live', txs, edges };
}
