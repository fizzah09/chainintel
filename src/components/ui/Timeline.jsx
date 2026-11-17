
export const Timeline = ({ items }) => <div>{items.map((it, i) => <div className="tl" key={i}><div className="dot"><i />{i < items.length - 1 && <s />}</div><div style={{ paddingBottom: 16 }}><b style={{ fontWeight: 600 }}>{it.t}</b><div className="mu sm">{it.who} · {it.when}</div>{it.d && <div style={{ marginTop: 2, color: '#334155' }}>{it.d}</div>}</div></div>)}</div>;
