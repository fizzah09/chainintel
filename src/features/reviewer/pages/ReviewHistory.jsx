import { Card, DataTable, Head, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

export function RevHistory() { const s = useStore(); return <><Head title="Review history" /><Card><DataTable exportName="reviews" rows={s.reviews} search="Search" searchText={(r) => r.caseId + r.comment} cols={[{ h: 'Case', render: (r) => r.caseId }, { h: 'Decision', render: (r) => <Status s={r.decision} /> }, { h: 'Reviewer', render: (r) => r.by }, { h: 'Date', render: (r) => fd(r.date) }, { h: 'Comment', render: (r) => r.comment }]} /></Card></>; }

export default RevHistory;
