import { Card, Head, TextIn } from '../../../components/ui';
import { ROLE_NAMES } from '../../../mocks/seed';
import { useStore } from '../../../mocks/store';

// My profile: the account details the bank admin manages. Personal preferences were removed.
export function Prefs() {
  const s = useStore();
  return <>
    <Head title="My profile" desc="Your account details." />
    <Card title="Profile details" sub="Name and contact details shown to your team." style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TextIn label="Full name" value={s.session.name} disabled onChange={() => {}} />
        <TextIn label="Work email" value={s.session.email || ''} disabled onChange={() => {}} />
        <TextIn label="Role" value={ROLE_NAMES[s.session.role] || ''} disabled onChange={() => {}} />
      </div>
      <div className="mu sm" style={{ marginTop: 12 }}>Name, email and role are managed by your bank admin.</div>
    </Card>
  </>;
}

export default Prefs;
