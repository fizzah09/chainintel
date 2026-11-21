import { Link, useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, Icon } from '../../../components/ui';
import { ROLE_NAMES } from '../../../mocks/seed';
import { act, useStore } from '../../../mocks/store';

export function Profile() {
  const s = useStore(); const nav = useNavigate();
  return <><Head title="Profile menu" desc="Account menu opened from the avatar in the top bar." /><div style={{ display: 'flex', justifyContent: 'flex-end' }}><div className="card" style={{ width: 320, padding: 8, boxShadow: '0 16px 40px rgba(15,23,42,.18)' }}>
    <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--ln)' }}><span className="av" style={{ width: 44, height: 44 }}>{s.session.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span><div><b>{s.session.name}</b><div className="mu sm">{ROLE_NAMES[s.session.role]}</div></div></div>
    {[['My profile', 'user']].map(([t, i]) => <Link key={t} to={pathOf('PersonalPrefs')} style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 44, padding: '0 14px', borderRadius: 4, fontWeight: 500 }}><Icon n={i} />{t}</Link>)}
    <div style={{ borderTop: '1px solid var(--ln)', marginTop: 6 }}><a href="/login" onClick={(e) => { e.preventDefault(); act.logout(); nav('/login'); }} style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 44, padding: '0 14px', color: '#B91C1C', fontWeight: 600 }}><Icon n="logout" />Sign out</a></div></div></div>
    <Card title="Prototype tools" sub="Only in this demo build"><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Btn icon="refresh" onClick={() => { if (window.confirm('Reset all demo data?')) { act.reset(); nav('/login'); } }}>Reset demo data</Btn></div></Card></>;
}

export default Profile;
