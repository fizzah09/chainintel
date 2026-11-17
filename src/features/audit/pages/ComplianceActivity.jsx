import { Card, DataTable, Head, Status } from '../../../components/ui';
import { fdt } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

export function AudActivity() { const s = useStore(); return <><Head title="User activity" /><Card><DataTable exportName="activity" search="Search" searchText={(a) => a.actor + a.action} rows={s.audit.slice().reverse()} size={10} cols={[{ h: 'Time', render: (a) => fdt(a.at) }, { h: 'User', render: (a) => a.actor }, { h: 'Action', render: (a) => a.action }, { h: 'Object', render: (a) => a.object }, { h: 'Result', render: (a) => <Status s={a.result} /> }]} /></Card></>; }

export default AudActivity;
