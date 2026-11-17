import { FF } from '../charts/theme';
import { Node } from './GraphNode';
import { Legend } from '../ui/Legend';
import { sh } from '../../lib/format';
import { TC, TN, tierOf } from '../../lib/risk';

export function WalletGraph({ center, nodes, sel, onSel, h = 540 }) {
  const cx = 480, cy = 265;
  const pos = nodes.map((n, i) => { const a = (360 / nodes.length) * i - 160; const d = 215 + (i % 2) * 22; return [cx + d * 1.25 * Math.cos((a * Math.PI) / 180), cy + d * 0.95 * Math.sin((a * Math.PI) / 180)]; });
  return <div style={{ position: 'relative' }}><svg viewBox={`0 0 960 ${h}`} width="100%" role="img" aria-label="Wallet relationship graph" style={{ display: 'block', background: '#F8FAFD', borderRadius: 4 }}><defs><marker id="am" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7C8CA3" /></marker></defs>
    {nodes.map((n, i) => { const [x, y] = pos[i]; const inb = n.dir !== 'Outbound'; const [x1, y1, x2, y2] = inb ? [x, y, cx, cy] : [cx, cy, x, y]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; const r1 = inb ? 24 : 38, r2 = inb ? 38 : 24; const sx = x1 + ux * (r1 + 3), sy = y1 + uy * (r1 + 3), ex = x2 - ux * (r2 + 7), ey = y2 - uy * (r2 + 7); const mx = (sx + ex) / 2, my = (sy + ey) / 2;
      return <g key={n.a}><line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#7C8CA3" strokeWidth={1.4 + Math.min(n.vol / 120000, 2)} strokeDasharray={n.label === 'Mixing service' || n.label === 'Bridge' ? '6 5' : undefined} markerEnd="url(#am)" /><rect x={mx - 28} y={my - 11} width="56" height="22" rx="11" fill="#fff" stroke="#CBD5E1" /><text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600" fontFamily={FF}>{n.n} tx</text></g>; })}
    {nodes.map((n, i) => <Node key={n.a} x={pos[i][0]} y={pos[i][1]} r={24} tk={tierOf(n.risk)} label={n.label === 'Unknown' ? sh(n.a, 6, 4) : n.label} sub={`${n.risk} · ${TN[tierOf(n.risk)]}`} sel={sel === n.a} onClick={() => onSel(n.a)} />)}
    <Node x={cx} y={cy} r={36} tk={tierOf(center.score)} label="Selected wallet" sub={sh(center.address)} sel /><text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0F172A" fontFamily={FF}>{center.score}</text></svg>
    <div style={{ position: 'absolute', left: 12, bottom: 12, background: '#fff', border: '1px solid var(--ln)', borderRadius: 4, padding: '8px 12px' }}><Legend items={[['Low', TC.low], ['Moderate', TC.mod], ['High', TC.high], ['Critical', TC.crit]]} /><div className="legend" style={{ marginTop: 6 }}><span>── Observed</span><span>╌╌ Possible relationship</span></div></div></div>;
}
