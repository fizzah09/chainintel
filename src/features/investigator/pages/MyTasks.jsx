import { Btn, Card, DataTable, Head, Prio, Status, useToast } from '../../../components/ui';
import { overdueT } from '../../../components/domain/workspace';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function InvTasks() {
  const s = useStore(); const me = s.session.name; const toast = useToast();
  const rows = s.tasks.filter((t) => t.assignee === me).map((t) => ({
    ...t,
    shown: overdueT(t) ? 'Overdue' : t.status,
    assignedBy: s.cases.find((c) => c.id === t.caseId)?.createdBy ?? '—',
  }));
  return <>
    <Head title="My tasks" desc="Tasks across all your cases." />
    <Card>
      <DataTable rows={rows} cols={[
        { h: 'Task', render: (t) => t.title, val: (t) => t.title },
        { h: 'Assigned by', render: (t) => t.assignedBy, val: (t) => t.assignedBy },
        { h: 'Due', render: (t) => fd(t.due), val: (t) => t.due },
        { h: 'Status', render: (t) => <Status s={t.shown} />, val: (t) => t.shown },
        { h: 'Priority', render: (t) => <Prio p={t.priority} />, val: (t) => t.priority },
        { h: '', render: (t) => (t.status === 'Completed'
          ? <Btn sm onClick={() => act.taskStatus(t.id, 'In Progress')}>Reopen</Btn>
          : <Btn sm onClick={() => { act.taskStatus(t.id, 'Completed'); toast('Task completed'); }}>Complete</Btn>) },
      ]} />
    </Card>
  </>;
}

export default InvTasks;
