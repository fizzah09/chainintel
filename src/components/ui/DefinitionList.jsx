
export const Dl = ({ items, w = 150 }) => <div className="dl" style={{ gridTemplateColumns: `${w}px 1fr` }}>{items.flatMap(([k, v], i) => [<span className="t" key={'k' + i}>{k}</span>, <span key={'v' + i}>{v}</span>])}</div>;
