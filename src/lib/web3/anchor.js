import { keccak256, toHex } from 'viem';
import abi from './AuditAnchor.abi.json';
import { sepoliaClient } from './chain';

export const ANCHOR_ABI = abi;
export const ANCHOR_ADDRESS = import.meta.env.VITE_ANCHOR_ADDRESS || '';
export const ANCHOR_CHAIN_ID = 11155111; // Sepolia
export const tenantId = (name) => keccak256(toHex(`tenant:${name.trim().toLowerCase()}`));
export const explorerTx = (h) => `https://sepolia.etherscan.io/tx/${h}`;

/** Latest anchor for a tenant, or null if none has been written yet. */
export async function readLatest(tenant) {
  if (!ANCHOR_ADDRESS) return null;
  const n = await sepoliaClient.readContract({ address: ANCHOR_ADDRESS, abi, functionName: 'anchorCount', args: [tenant] });
  if (n === 0n) return null;
  const a = await sepoliaClient.readContract({ address: ANCHOR_ADDRESS, abi, functionName: 'latest', args: [tenant] });
  return { head: a.head, count: Number(a.count), at: new Date(Number(a.at) * 1000).toISOString(), by: a.by, total: Number(n) };
}

/** Compares an on-chain anchor with the local audit log. */
export function compareAnchor(anchor, audit) {
  if (!anchor) return { state: 'none' };
  if (audit.length < anchor.count) return { state: 'bad', msg: `Local log has ${audit.length} entries but ${anchor.count} were anchored. Entries were deleted.` };
  const e = audit[anchor.count - 1];
  if (e.hash !== anchor.head) return { state: 'bad', msg: `Entry ${anchor.count} does not match the anchored hash. The log was changed after anchoring.` };
  return { state: 'ok', msg: `First ${anchor.count} entries match the on-chain anchor.`, pending: audit.length - anchor.count };
}
