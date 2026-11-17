import { Card, DataTable, Head, Status } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function ErSources() { const s = useStore(); return <><Head title="Data sources" desc="Providers and licences." /><Card><DataTable rows={s.providers} cols={[{ h: 'Provider', render: (p) => p.name }, { h: 'Purpose', render: (p) => p.purpose }, { h: 'Licence', render: (p) => p.licence }, { h: 'Enabled', render: (p) => (p.on ? 'Yes' : 'No') }, { h: 'Status', render: (p) => <Status s={p.status} /> }]} /></Card></>; }

export default ErSources;
