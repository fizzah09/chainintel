import { Card, DataTable, Head, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// AUD-04: every review decision with its comment.
export function AudReview() {
  const s = useStore();
  return <>
    <Head title="Review history" desc="All review decisions with comments." />
    <Card>
      <DataTable exportName="reviews" search="Search reviews" searchText={(r) => r.caseId + r.comment} rows={s.reviews} cols={[
        { h: 'Case', render: (r) => r.caseId },
        { h: 'Decision', render: (r) => <Status s={r.decision} /> },
        { h: 'Reviewer', render: (r) => r.by },
        { h: 'Date', render: (r) => fd(r.date) },
        { h: 'Comment', render: (r) => r.comment },
      ]} />
    </Card>
  </>;
}

export default AudReview;
