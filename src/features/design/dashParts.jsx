// Shared pieces for store-driven design dashboards (tables, bar lists, empty states).

export const fmtDate = (x) => (x ? new Date(x).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const shortAddr = (a = '') => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

export function Empty({ children }) {
  return <div className="mu" style={{ padding: '18px 0' }}>{children}</div>;
}

// Horizontal bars from [{ label, value }].
export function Bars({ items, empty }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      {items.map((i) => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
          <span style={{ width: 160, fontSize: 13 }}>{i.label}</span>
          <div className="bar" style={{ flex: 1 }}><i style={{ width: `${(i.value / max) * 100}%`, background: '#1769E0' }} /></div>
          <b style={{ width: 32, textAlign: 'right' }}>{i.value}</b>
        </div>
      ))}
    </div>
  );
}
