import { Card, DataTable, Head, Status } from '../../../components/ui';
import { fdt } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// SA-08: the global audit trail across tenants.
export function SaAudit() {
  const s = useStore();
  const rows = s.audit.slice().reverse();
  return <>
    <Head title="Platform audit logs" desc="Global audit trail across tenants." />
    <Card>
      <DataTable exportName="platform-audit" search="Search by actor, action or object" searchText={(a) => a.actor + a.action + a.object} rows={rows} size={10} cols={[
        { h: 'Time (UTC)', render: (a) => fdt(a.at), val: (a) => a.at },
        { h: 'Actor', render: (a) => a.actor, val: (a) => a.actor },
        { h: 'Tenant', render: () => s.settings.orgName },
        { h: 'Action', render: (a) => a.action },
        { h: 'Result', render: (a) => <Status s={a.result} />, val: (a) => a.result },
      ]} />
    </Card>
  </>;
}

export default SaAudit;
