
export const Head = ({ title, desc, acts, badge }) => <div className="ph"><div><div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><h1>{title}</h1>{badge}</div>{desc && <p>{desc}</p>}</div><div className="acts">{acts}</div></div>;
