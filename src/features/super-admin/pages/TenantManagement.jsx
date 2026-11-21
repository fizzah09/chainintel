import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Status, useToast } from '../../../components/ui';
import { num } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

// SA-02: create and manage bank tenants.
export function SaTenants() {
  const s = useStore(); const toast = useToast();
  return <>
    <Head title="Tenant management" desc="Create and manage bank tenants." acts={<Btn kind="pri" icon="plus" to={pathOf('SA_TenantCreate')}>Create tenant</Btn>} />
    <Card>
      <DataTable exportName="tenants" search="Search tenants" searchText={(t) => t.id + t.name} rows={s.tenants} cols={[
        { h: 'Tenant', render: (t) => <b>{t.name}</b>, val: (t) => t.name },
        { h: 'ID', render: (t) => t.id },
        { h: 'Plan', render: (t) => t.plan },
        { h: 'Users', render: (t) => t.users, val: (t) => t.users },
        { h: 'Wallets', render: (t) => num(t.wallets), val: (t) => t.wallets },
        { h: 'Status', render: (t) => <Status s={t.status} />, val: (t) => t.status },
        { h: '', render: (t) => t.status === 'Active'
          ? <Btn sm kind="danger" onClick={() => { act.tenantStatus(t.id, 'Suspended'); toast('Tenant suspended'); }}>Suspend</Btn>
          : <Btn sm onClick={() => { act.tenantStatus(t.id, 'Active'); toast('Tenant reactivated'); }}>Reactivate</Btn> },
      ]} />
    </Card>
  </>;
}

export default SaTenants;
