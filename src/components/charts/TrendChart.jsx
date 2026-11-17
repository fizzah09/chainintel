import { FF } from './theme';

export function Area({ series, labels, w = 640, h = 240, ymin, ymax, col = '#1769E0', ticks = 4, uid = 'a' }) {
  const pl = 48, pr = 14, pt = 12, pb = 28; const lo = ymin ?? Math.min(...series), hi = ymax ?? Math.max(...series), rg = hi - lo || 1;
  const X = (i) => pl + (i * (w - pl - pr)) / (series.length - 1), Y = (v) => pt + (h - pt - pb) * (1 - (v - lo) / rg);
  const d = 'M' + series.map((v, i) => `${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('L');
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Trend chart" style={{ display: 'block' }}>
    {Array.from({ length: ticks + 1 }, (_, k) => { const v = lo + (rg * k) / ticks, y = Y(v); return <g key={k}><line x1={pl} x2={w - pr} y1={y} y2={y} stroke="#E2E8F0" /><text x={pl - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#5B6B82" fontFamily={FF}>{Math.round(v).toLocaleString()}</text></g>; })}
    {labels.map((l, i) => l && <text key={i} x={X(i)} y={h - 8} textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily={FF}>{l}</text>)}
    <path d={`${d}L${X(series.length - 1)} ${h - pb}L${X(0)} ${h - pb}Z`} fill={col} fillOpacity=".08" /><path d={d} fill="none" stroke={col} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
