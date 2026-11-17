import { pathOf } from '../../../app/config/paths';
import { Btn, Card, HBars, Head, Kpis, Row, SetRow } from '../../../components/ui';
import { ROLE_OPTS } from '../shared';
import { fdt } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

export function BaDash() { const s = useStore(); return <><Head title="Business admin" desc="Users, teams and workspace settings." acts={<Btn kind="pri" icon="plus" to={pathOf('BA_Invite')}>Invite user</Btn>} /><Kpis items={[['Active users', s.users.filter((u) => u.status === 'Active').length, 'Of ' + s.users.length], ['Pending invites', s.users.filter((u) => u.status === 'Invited').length, 'Not yet accepted', 'mod'], ['Teams', s.teams.length, 'Configured'], ['MFA', s.settings.mfaRequired ? 'Required' : 'Optional', 'Workspace policy']]} /><Row><Card title="Users by role" style={{ flex: '1 1 340px' }}><HBars items={ROLE_OPTS.map(([k, n]) => [n, s.users.filter((u) => u.role === k).length, '#1769E0'])} /></Card><Card title="Recent admin activity" style={{ flex: '1 1 440px' }}>{s.audit.slice(-5).reverse().map((a) => <SetRow key={a.id} title={a.action} desc={`${a.actor} · ${fdt(a.at)}`} />)}</Card></Row></>; }

export default BaDash;
