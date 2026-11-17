import { Card, DataTable, Head, Status } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function AudEvidence() { const s = useStore(); return <><Head title="Evidence register" desc="Read-only." /><Card><DataTable exportName="evidence" search="Search" searchText={(e) => e.id + e.title} rows={s.evidence} cols={[{ h: 'ID', render: (e) => e.id }, { h: 'Case', render: (e) => e.caseId }, { h: 'Title', render: (e) => e.title }, { h: 'Status', render: (e) => <Status s={e.status} /> }, { h: 'Hash', render: (e) => <span className="mono">{(e.hash || '').slice(0, 10)}…</span> }]} /></Card></>; }

export default AudEvidence;
