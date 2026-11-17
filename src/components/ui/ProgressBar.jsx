import { TC, tierOf } from '../../lib/risk';

export const ScoreBar = ({ s, w = 80 }) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b style={{ minWidth: 24 }}>{s}</b><div className="bar" style={{ width: w }}><i style={{ width: `${s}%`, background: TC[tierOf(s)] }} /></div></div>;
