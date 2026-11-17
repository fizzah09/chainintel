import PUBLIC from './data/labels.json';

/**
 * Address labels: public lists (OFAC SDN Ethereum addresses, MyEtherWallet darklist) built by
 * ml/build_labels.py, plus labels registered by the app (exchanges, mixers, bridges known to the workspace).
 */
const extra = new Map();

export function registerLabels(entries) {
  for (const [address, label] of Object.entries(entries)) extra.set(address.toLowerCase(), label);
}

export function labelFor(address) {
  const a = (address || '').toLowerCase();
  return extra.get(a) || PUBLIC.labels[a] || null;
}

export const LABEL_SOURCES = PUBLIC.sources;
export const LABELS_GENERATED = PUBLIC.generated;

/** Deterministically pick a public address of a category (used by the simulator). */
export function publicAddressOf(cat, seed) {
  const list = Object.keys(PUBLIC.labels).filter((a) => PUBLIC.labels[a].cat === cat).sort();
  return list.length ? list[seed % list.length] : null;
}
