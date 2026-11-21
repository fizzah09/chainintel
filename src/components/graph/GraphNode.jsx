import { FF } from '../charts/theme';

// graphs
export const Node = ({ x, y, r, label, sub, sel, onClick }) => <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} role={onClick ? 'button' : undefined} aria-label={label}>{sel && <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#1769E0" strokeWidth="2.5" strokeDasharray="4 4" />}<circle cx={x} cy={y} r={r} fill="#fff" stroke="#94A3B8" strokeWidth="3" /><circle cx={x} cy={y} r={r * 0.42} fill="#1769E0" opacity=".16" /><text x={x} y={y + r + 18} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0F172A" fontFamily={FF}>{label}</text>{sub && <text x={x} y={y + r + 33} textAnchor="middle" fontSize="11" fill="#5B6B82" fontFamily={FF}>{sub}</text>}</g>;
