
export const SetRow = ({ title, desc, children }) => <div className="set"><div><b>{title}</b>{desc && <span className="d">{desc}</span>}</div>{children}</div>;
