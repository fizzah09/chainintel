import { createPublicClient, http, formatEther, formatUnits, getAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';
import { RPC } from './config';

// Read-only clients used by the wallet, transaction and audit screens.
export const mainnetClient = createPublicClient({ chain: mainnet, transport: http(RPC.mainnet, { timeout: 8000, retryCount: 1 }) });
export const sepoliaClient = createPublicClient({ chain: sepolia, transport: http(RPC.sepolia, { timeout: 8000, retryCount: 1 }) });

const ETHERSCAN_KEY = import.meta.env.VITE_ETHERSCAN_KEY || '';
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY || '';
export const historyProvider = ETHERSCAN_KEY ? 'Etherscan' : ALCHEMY_KEY ? 'Alchemy' : null;

/** Live account state straight from an Ethereum node. */
export async function liveWallet(address) {
  const a = getAddress(address);
  const [wei, nonce, code, block] = await Promise.all([
    mainnetClient.getBalance({ address: a }),
    mainnetClient.getTransactionCount({ address: a }),
    mainnetClient.getCode({ address: a }),
    mainnetClient.getBlockNumber(),
  ]);
  let ens = null;
  try { ens = await mainnetClient.getEnsName({ address: a }); } catch { /* no reverse record */ }
  return { address: a, balance: Number(formatEther(wei)), nonce, isContract: !!code && code !== '0x', ens, block: Number(block) };
}

export async function resolveEns(name) {
  return mainnetClient.getEnsAddress({ name: normalize(name.trim()) });
}

/** Live receipt for a transaction hash. Returns null if the hash is not on mainnet. */
export async function liveTx(hash) {
  try {
    const [tx, rc] = await Promise.all([mainnetClient.getTransaction({ hash }), mainnetClient.getTransactionReceipt({ hash })]);
    const blk = await mainnetClient.getBlock({ blockNumber: rc.blockNumber });
    const head = await mainnetClient.getBlockNumber();
    return { hash, from: tx.from, to: tx.to, value: Number(formatEther(tx.value)), status: rc.status, block: Number(rc.blockNumber), time: new Date(Number(blk.timestamp) * 1000).toISOString(), gasUsed: Number(rc.gasUsed), fee: Number(formatEther(rc.gasUsed * (rc.effectiveGasPrice || 0n))), confirmations: Number(head - rc.blockNumber) + 1, logs: rc.logs.length };
  } catch (e) {
    if (/could not be found|not found/i.test(e.message || '')) return null;
    throw e;
  }
}

/** Normalised transaction history from Etherscan (v2 API) or Alchemy transfers. */
export async function txHistory(address, limit = 50) {
  const a = getAddress(address); const me = a.toLowerCase();
  const row = (hash, time, from, to, amt, sym) => ({ hash, time, cp: (from.toLowerCase() === me ? to : from) || '0x0000000000000000000000000000000000000000', dir: from.toLowerCase() === me ? 'out' : 'in', amt, sym, live: true });
  if (ETHERSCAN_KEY) {
    const base = `https://api.etherscan.io/v2/api?chainid=1&address=${a}&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_KEY}&module=account`;
    const [n, t] = await Promise.all([fetch(base + '&action=txlist').then((r) => r.json()), fetch(base + '&action=tokentx').then((r) => r.json())]);
    if (n.status === '0' && !/No transactions/i.test(n.message || '')) throw new Error(n.result || 'Etherscan error');
    const out = [
      ...(Array.isArray(n.result) ? n.result : []).map((x) => row(x.hash, new Date(x.timeStamp * 1000).toISOString(), x.from, x.to, Number(formatEther(BigInt(x.value))), 'ETH')),
      ...(Array.isArray(t.result) ? t.result : []).map((x) => row(x.hash, new Date(x.timeStamp * 1000).toISOString(), x.from, x.to, Number(formatUnits(BigInt(x.value), Number(x.tokenDecimal))), x.tokenSymbol)),
    ];
    return out.sort((p, q) => (p.time < q.time ? 1 : -1)).slice(0, limit);
  }
  if (ALCHEMY_KEY) {
    const call = (dir) => fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'alchemy_getAssetTransfers', params: [{ [dir]: a, category: ['external', 'erc20'], withMetadata: true, order: 'desc', maxCount: '0x' + limit.toString(16) }] }) }).then((r) => r.json());
    const [i, o] = await Promise.all([call('toAddress'), call('fromAddress')]);
    const tr = [...(i.result?.transfers || []), ...(o.result?.transfers || [])];
    return tr.map((x) => row(x.hash, x.metadata.blockTimestamp, x.from, x.to || '', Number(x.value || 0), x.asset || 'ETH')).sort((p, q) => (p.time < q.time ? 1 : -1)).slice(0, limit);
  }
  return null;
}
