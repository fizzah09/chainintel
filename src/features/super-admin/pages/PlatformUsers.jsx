import { Card, DataTable, Head, Person, Status } from '../../../components/ui';
import { ROLE_NAMES } from '../../../mocks/seed';
import { useStore } from '../../../mocks/store';

export function SaUsers() { const s = useStore(); return <><Head title="Platform users" /><Card><DataTable exportName="users" search="Search" searchText={(u) => u.name + u.email} rows={s.users} cols={[{ h: 'User', render: (u) => <Person n={u.name} sub={u.email} /> }, { h: 'Role', render: (u) => ROLE_NAMES[u.role] }, { h: 'Tenant', render: (u) => s.settings.orgName }, { h: 'Status', render: (u) => <Status s={u.status} /> }]} /></Card></>; }

export default SaUsers;
