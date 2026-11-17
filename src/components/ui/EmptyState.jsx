import { Icon } from './Icon';

export const Empty = ({ icon = 'inbox', title, desc, action }) => <div style={{ textAlign: 'center', padding: '48px 20px' }}><div style={{ width: 56, height: 56, borderRadius: 4, background: 'var(--pril)', color: 'var(--pri)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon n={icon} s={26} /></div><h3 style={{ marginTop: 14, fontSize: 17 }}>{title}</h3>{desc && <p className="mu" style={{ maxWidth: '44ch', margin: '6px auto 16px' }}>{desc}</p>}{action}</div>;
