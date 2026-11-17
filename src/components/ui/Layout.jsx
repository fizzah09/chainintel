
export const Row = ({ children, gap = 16, stretch }) => <div className="row" style={{ gap, alignItems: stretch ? 'stretch' : 'flex-start' }}>{children}</div>;

export const Col = ({ flex = '1 1 300px', children }) => <div style={{ flex, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>{children}</div>;

export const Stack = ({ children, gap = 20 }) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;
