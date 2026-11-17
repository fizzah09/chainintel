import { TC } from '../../lib/risk';

export const Kpis = ({ items }) => <div className="kpis">{items.map(([l, v, s, dot], i) => <div className="kpi" key={i}><div className="l">{dot && <i style={{ background: TC[dot] }} />}{l}</div><div className="v">{v}</div><div className="s">{s}</div></div>)}</div>;
