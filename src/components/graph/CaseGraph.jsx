import { FF } from '../charts/theme';
import { Node } from './GraphNode';
import { sh } from '../../lib/format';
import { labelOf, quickScore as walletScore, tierOf } from '../../lib/risk';

export function CaseGraph({ wallets, txs, findings, evidence }) {
  const W = 960, H = 460; const cx = 470, cy = 230;
  const ring = (arr, rx, ry, off = 0) => arr.map((x, i) => { const a = (360 / Math.max(arr.length, 1)) * i + off; return [cx + rx * Math.cos((a * Math.PI) / 180), cy + ry * Math.sin((a * Math.PI) / 180)]; });
  const wp = ring(wallets.slice(1), 320, 150), tp = ring(txs, 170, 90, 30), fp = ring(findings, 200, 175, 100), ep = ring(evidence, 400, 195, 20);
  const P = [[cx, cy], ...wp];
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Case investigation graph" style={{ display: 'block', background: '#F8FAFD', borderRadius: 4 }}>
    {wp.map((p, i) => <line key={'w' + i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#94A3B8" strokeWidth="1.8" />)}{tp.map((p, i) => <line key={'t' + i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#94A3B8" strokeWidth="1.8" />)}{fp.map((p, i) => <line key={'f' + i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#94A3B8" strokeWidth="1.8" />)}{ep.map((p, i) => <line key={'e' + i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="5 5" />)}
    <Node x={cx} y={cy} r={28} tk={tierOf(walletScore(wallets[0]))} label="Primary wallet" sub={sh(wallets[0])} sel />
    {wp.map((p, i) => <Node key={i} x={p[0]} y={p[1]} r={22} tk={tierOf(walletScore(wallets[i + 1]))} label={labelOf(wallets[i + 1]) === 'Unknown' ? sh(wallets[i + 1]) : labelOf(wallets[i + 1])} sub={sh(wallets[i + 1])} />)}
    {tp.map((p, i) => <g key={i}><rect x={p[0] - 13} y={p[1] - 13} width="26" height="26" rx="5" transform={`rotate(45 ${p[0]} ${p[1]})`} fill="#fff" stroke="#475569" strokeWidth="2.4" /><text x={p[0]} y={p[1] + 32} textAnchor="middle" fontSize="11" fill="#334155" fontFamily="ui-monospace,monospace">{sh(txs[i], 6, 4)}</text></g>)}
    {fp.map((p, i) => <g key={i}><polygon points={Array.from({ length: 6 }, (_, k) => `${p[0] + 20 * Math.cos(((60 * k + 30) * Math.PI) / 180)},${p[1] + 20 * Math.sin(((60 * k + 30) * Math.PI) / 180)}`).join(' ')} fill="#FFF7ED" stroke="#EA580C" strokeWidth="2.4" /><text x={p[0]} y={p[1] + 38} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#9A3412" fontFamily={FF}>{findings[i]}</text></g>)}
    {ep.map((p, i) => <g key={i}><rect x={p[0] - 15} y={p[1] - 18} width="30" height="36" rx="5" fill="#EFF6FF" stroke="#1769E0" strokeWidth="2.2" /><path d={`M${p[0] - 7} ${p[1] - 5}h14M${p[0] - 7} ${p[1] + 2}h14M${p[0] - 7} ${p[1] + 9}h8`} stroke="#1769E0" strokeWidth="1.8" /><text x={p[0]} y={p[1] + 34} textAnchor="middle" fontSize="11" fontWeight="600" fill="#124FB5" fontFamily={FF}>{evidence[i]}</text></g>)}</svg>;
}
