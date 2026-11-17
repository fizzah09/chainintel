import { FF } from './theme';

export function Bars({ vals, labels, w = 560, h = 220, col = '#1769E0', cols }) {
  const pl = 40, pr = 10, pt = 12, pb = 28, hi = Math.max(...vals, 1) * 1.15, n = vals.length, bw = (w - pl - pr) / n;
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Bar chart" style={{ display: 'block' }}>
    {[0, 1, 2, 3, 4].map((k) => { const v = (hi * k) / 4, y = pt + (h - pt - pb) * (1 - v / hi); return <g key={k}><line x1={pl} x2={w - pr} y1={y} y2={y} stroke="#E2E8F0" /><text x={pl - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily={FF}>{Math.round(v).toLocaleString()}</text></g>; })}
    {vals.map((v, i) => { const bh = ((h - pt - pb) * v) / hi, x = pl + i * bw + bw * 0.22; return <g key={i}><rect x={x} y={h - pb - bh} width={bw * 0.56} height={bh} rx="4" fill={cols ? cols[i] : col} /><text x={x + bw * 0.28} y={h - 9} textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily={FF}>{labels[i]}</text></g>; })}</svg>;
}
