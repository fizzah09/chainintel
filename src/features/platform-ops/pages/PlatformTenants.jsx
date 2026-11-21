import { Card, DataTable, Head, Status } from '../../../components/ui';
import { num } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// PA-04: tenant status and usage. View only: new tenants are invited by the Super Admin.
export function PlatformTenants() {
  const s = useStore();
  return <>
    <Head title="Tenants" desc="Tenant status and usage. View only: new tenants are invited by the Super Admin." />
    <Card>
      <DataTable exportName="tenants" search="Search tenants" searchText={(t) => t.id + t.name} rows={s.tenants} cols={[
        { h: 'Tenant', render: (t) => <b>{t.name}</b>, val: (t) => t.name },
        { h: 'ID', render: (t) => t.id },
        { h: 'Plan', render: (t) => t.plan },
        { h: 'Users', render: (t) => t.users, val: (t) => t.users },
        { h: 'Wallets', render: (t) => num(t.wallets), val: (t) => t.wallets },
        { h: 'Status', render: (t) => <Status s={t.status} />, val: (t) => t.status },
      ]} />
    </Card>
  </>;
}

export default PlatformTenants;
