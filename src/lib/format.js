import { keccak256, toHex, isAddress, getAddress } from 'viem';
export const hash32 = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export const rng = (seed) => { let a = typeof seed === 'string' ? hash32(seed) : seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
export const hex = (r, n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
export const addr = (seed) => '0x' + hex(rng('a:' + seed), 40);
export const txh = (seed) => '0x' + hex(rng('t:' + seed), 64);
export const sh = (a, n = 6, m = 4) => (a && a.length > n + m + 1 ? a.slice(0, n) + '…' + a.slice(-m) : a || '');
// Any-case hex address (mock data uses unchecksummed casing); use checksum() for display.
export const isAddr = (a) => isAddress((a || '').trim(), { strict: false });
export const checksum = (a) => { try { return getAddress(a.trim()); } catch { return a; } };
export const isEns = (a) => /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i.test((a || '').trim());
// keccak-256 over UTF-8, the hash Ethereum itself uses; audit and evidence hashes are anchored on-chain with it.
export const kec = (str) => keccak256(toHex(String(str)));
export const isTx = (a) => /^0x[0-9a-fA-F]{64}$/.test((a || '').trim());
export const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
export const num = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const usd = (n) => (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`);
export const cyrb53 = (str, seed = 0) => { let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed; for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0'); };
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fd = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getUTCDate()).padStart(2, '0')} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const fdt = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getUTCDate()).padStart(2, '0')} ${M[d.getUTCMonth()]} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
export const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 48) return `${h} h ago`; return `${Math.round(h / 24)} d ago`; };
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const csv = (cols, rows) => [cols, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
export const download = (name, text, type = 'text/csv') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
export const strip = (h) => (h || '').replace(/<[^>]+>/g, '');

/** s***a.ali@examplebank.com: for display only. */
export const maskEmail = (e = '') => { const [u, d] = e.split('@'); if (!d) return e; return u.length <= 2 ? `${u[0]}***@${d}` : `${u[0]}***${u.slice(-Math.min(5, u.length - 1))}@${d}`; };
