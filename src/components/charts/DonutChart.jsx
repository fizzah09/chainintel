import { FF } from './theme';

export function Donut({ items, size = 160, center, sub }) {
  const tot = items.reduce((s, i) => s + i[1], 0) || 1, c = size / 2, r = size * 0.37, circ = 2 * Math.PI * r; let off = 0;
  return <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}><svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Distribution chart" style={{ display: 'block', maxWidth: '100%' }}>{items.map(([l, v, col]) => { const ln = (v / tot) * circ; const el = <circle key={l} cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={size * 0.13} strokeDasharray={`${Math.max(ln - 2, 0)} ${circ - ln + 2}`} strokeDashoffset={-off} transform={`rotate(-90 ${c} ${c})`} />; off += ln; return el; })}
    <text x={c} y={c + 3} textAnchor="middle" fontWeight="700" fontSize={size * 0.15} fill="#0F172A" fontFamily={FF}>{center}</text><text x={c} y={c + size * 0.1} textAnchor="middle" fontSize={size * 0.062} fill="#5B6B82" fontFamily={FF}>{sub}</text></svg>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 150 }}>{items.map(([l, v, col]) => <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: col }} /><span style={{ flex: 1 }}>{l}</span><b>{v.toLocaleString()}</b></div>)}</div></div>;
}
