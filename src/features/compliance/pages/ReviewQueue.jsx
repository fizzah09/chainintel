import { useState } from 'react';
import { CaseLink, queueRows } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, Head, Prio, Status } from '../../../components/ui';
import { ago } from '../../../lib/format';
import { useStore } from '../../../mocks/store';
import { AssignReviewDialog } from './AssignReviewDialog';

export const CmReviewQueue = () => {
  const s = useStore(); const [target, setTarget] = useState(null);
  const rows = queueRows(s);
  return <>
    <Head title="Review queue" desc="Cases submitted by investigators. Open a case to change its status and assign people." />
    <Card>
      <DataTable exportName="queue" search="Search queue" searchText={(c) => c.id + c.title} rows={rows} cols={[
        { h: 'Case', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Submitted by', render: (c) => c.assignee ?? '—' },
        { h: 'Submitted', render: (c) => ago(c.submitted || c.opened) },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Status', render: () => <Status s="Pending" /> },
        { h: 'Reviewer', render: (c) => c.reviewer ?? '—' },
        { h: '', render: (c) => <Btn sm kind="pri" onClick={() => setTarget(c)}>Update case</Btn> },
      ]} />
    </Card>
    <AssignReviewDialog caseItem={target} onClose={() => setTarget(null)} />
  </>;
};

export default CmReviewQueue;
