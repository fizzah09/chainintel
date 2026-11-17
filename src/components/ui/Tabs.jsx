import { Link } from 'react-router-dom';

export const Tabs = ({ items, active }) => <div className="tabs" role="tablist">{items.map(([label, to]) => <Link key={label} to={to} className={label === active ? 'on' : ''} role="tab" aria-selected={label === active}>{label}</Link>)}</div>;
