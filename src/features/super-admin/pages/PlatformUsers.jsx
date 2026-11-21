import { Card, DataTable, Head, Person, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { ROLE_NAMES } from '../../../mocks/seed';
import { useStore } from '../../../mocks/store';

// SA-07: platform-level users and their roles.
export function SaUsers() {
  const s = useStore();
  return <>
    <Head title="Platform users" desc="Platform-level users and their roles." />
    <Card>
      <DataTable exportName="users" search="Search users" searchText={(u) => u.name + u.email} rows={s.users} cols={[
        { h: 'User', render: (u) => <Person n={u.name} sub={u.email} />, val: (u) => u.name },
        { h: 'Role', render: (u) => ROLE_NAMES[u.role] },
        { h: 'Tenant', render: () => s.settings.orgName },
        { h: 'Status', render: (u) => <Status s={u.status} />, val: (u) => u.status },
        { h: 'Last active', render: (u) => (u.last ? fd(u.last) : '—') },
      ]} />
    </Card>
  </>;
}

export default SaUsers;
