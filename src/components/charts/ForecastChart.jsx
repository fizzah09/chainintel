import { TC } from '../../lib/risk';

/** Weekly score history (solid), forecast (dashed) with its ~90% interval band, and tier lines. */
export function ForecastChart({ history, forecast, tiers, w = 680, h = 260 }) {
  const pl = 40, pr = 16, pt = 14, pb = 30;
  const pts = [...history.map((x) => ({ ...x, kind: 'h' })), ...forecast.map((x) => ({ ...x, kind: 'f' }))];
  const X = (i) => pl + (i * (w - pl - pr)) / (pts.length - 1);
  const Y = (v) => pt + (h - pt - pb) * (1 - v / 100);
  const hi = history.length - 1;
  const line = (arr, off) => arr.map((p, i) => `${i ? 'L' : 'M'}${X(i + off).toFixed(1)} ${Y(p.score).toFixed(1)}`).join('');
  const band = forecast.length ? `M${X(hi)} ${Y(history[hi].score)}` + forecast.map((p, i) => `L${X(hi + 1 + i)} ${Y(p.hi)}`).join('') + [...forecast].reverse().map((p, i) => `L${X(hi + forecast.length - i)} ${Y(p.lo)}`).join('') + 'Z' : '';
  const tierLines = [[tiers[1], 'High', TC.high], [tiers[2], 'Critical', TC.crit]];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Risk score history and 30-day forecast">
      {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1={pl} x2={w - pr} y1={Y(v)} y2={Y(v)} stroke="#EDF1F6" /><text x={pl - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill="#5B6B82">{v}</text></g>)}
      {tierLines.map(([v, n, c]) => <g key={n}><line x1={pl} x2={w - pr} y1={Y(v)} y2={Y(v)} stroke={c} strokeDasharray="2 4" /><text x={w - pr} y={Y(v) - 4} textAnchor="end" fontSize="10.5" fill={c}>{n} {v}</text></g>)}
      {band && <path d={band} fill="#1769E0" fillOpacity="0.1" />}
      <path d={line(history, 0)} fill="none" stroke="#0F172A" strokeWidth="2" />
      {forecast.length > 0 && <path d={`M${X(hi)} ${Y(history[hi].score)}` + forecast.map((p, i) => `L${X(hi + 1 + i)} ${Y(p.score)}`).join('')} fill="none" stroke="#1769E0" strokeWidth="2" strokeDasharray="5 4" />}
      {pts.map((p, i) => <circle key={i} cx={X(i)} cy={Y(p.score)} r="3" fill={p.kind === 'h' ? '#0F172A' : '#1769E0'} />)}
      <line x1={X(hi)} x2={X(hi)} y1={pt} y2={h - pb} stroke="#CBD5E1" />
      <text x={X(hi) + 4} y={pt + 10} fontSize="10.5" fill="#5B6B82">today</text>
      {pts.map((p, i) => (i % 2 === 0 || i === pts.length - 1) && <text key={'d' + i} x={X(i)} y={h - 10} textAnchor="middle" fontSize="10.5" fill="#5B6B82">{p.date.slice(5)}</text>)}
    </svg>
  );
}
