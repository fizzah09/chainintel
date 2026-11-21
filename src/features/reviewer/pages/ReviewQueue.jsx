import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { CaseLink, queueRows } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, Head, Prio, Status } from '../../../components/ui';
import { ago } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export const RevQueue = () => {
  const s = useStore(); const nav = useNavigate(); const rows = queueRows(s);
  return <>
    <Head title="Review queue" desc="Cases submitted for review." />
    <Card>
      <DataTable exportName="queue" search="Search queue" searchText={(c) => c.id + c.title} rows={rows} cols={[
        { h: 'Case', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Submitted by', render: (c) => c.createdBy ?? c.assignee },
        { h: 'Submitted', render: (c) => ago(c.submitted || c.opened) },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Status', render: () => <Status s="Pending" /> },
        { h: '', render: (c) => <Btn sm kind="pri" onClick={() => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseReview')); }}>Review</Btn> },
      ]} />
    </Card>
  </>;
};

export default RevQueue;
