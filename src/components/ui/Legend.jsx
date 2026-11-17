
export const Legend = ({ items }) => <div className="legend">{items.map(([t, c]) => <span key={t}><i style={{ background: c }} />{t}</span>)}</div>;
