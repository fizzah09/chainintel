import { homeOf } from '../../../app/config/paths';
import { Btn, Card, Head, Icon } from '../../../components/ui';
import { ROLE_NAMES } from '../../../mocks/seed';
import { useStore } from '../../../mocks/store';

export function StateDenied() { const s = useStore(); return <><Head title="Access denied" /><Card><div style={{ textAlign: 'center', padding: '56px 20px' }}><div style={{ color: 'var(--mu)' }}><Icon n="lock" s={40} /></div><h3 style={{ marginTop: 12, fontSize: 18 }}>You do not have permission to view this page</h3><p className="mu" style={{ maxWidth: '48ch', margin: '6px auto 18px' }}>Your role ({ROLE_NAMES[s.session.role]}) does not include this permission. Ask your Bank Admin if you need more access.</p><Btn kind="pri" icon="left" to={homeOf(s.session.role)}>Back to dashboard</Btn></div></Card></>; }

export default StateDenied;
