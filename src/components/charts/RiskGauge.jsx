import { FF } from './theme';
import { TC, TN, tierOf } from '../../lib/risk';

export function Gauge({ score, size = 220 }) {
  const t = tierOf(score), col = TC[t], c = size / 2, r = size * 0.36, ro = size * 0.455;
  const pol = (rr, a) => [c + rr * Math.cos((a * Math.PI) / 180), c + rr * Math.sin((a * Math.PI) / 180)];
  const arc = (rr, a0, a1) => { const [x0, y0] = pol(rr, a0), [x1, y1] = pol(rr, a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const end = 135 + 2.7 * score; const [ex, ey] = pol(r, end);
  return <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Risk score ${score} out of 100, ${TN[t]}`} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
    {['low', 'mod', 'high', 'crit'].map((k, i) => <path key={k} d={arc(ro, 135 + 2.7 * i * 25 + 1.2, 135 + 2.7 * (i + 1) * 25 - 1.2)} stroke={TC[k]} strokeWidth={size * 0.018} fill="none" strokeLinecap="round" opacity=".7" />)}
    <path d={arc(r, 135, 405)} stroke="#E8EDF4" strokeWidth={size * 0.075} fill="none" strokeLinecap="round" />
    <path d={arc(r, 135, Math.max(end, 136))} stroke={col} strokeWidth={size * 0.075} fill="none" strokeLinecap="round" />
    <circle cx={ex} cy={ey} r={size * 0.026} fill="#fff" stroke={col} strokeWidth="3" />
    <text x={c} y={c + size * 0.04} textAnchor="middle" fontFamily={FF} fontWeight="700" fontSize={size * 0.26} fill="#0F172A" letterSpacing="-2">{score}</text>
    <text x={c} y={c + size * 0.16} textAnchor="middle" fontSize={size * 0.06} fill="#5B6B82" fontFamily={FF}>out of 100</text></svg>;
}
