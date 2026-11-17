import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { overdueT } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, Head, Prio, Status, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function InvTasks() {
  const s = useStore(); const me = s.session.name; const toast = useToast(); const nav = useNavigate();
  const rows = s.tasks.filter((t) => t.assignee === me).map((t) => ({ ...t, shown: overdueT(t) ? 'Overdue' : t.status }));
  return <><Head title="My tasks" desc="Tasks assigned to you across all cases." /><Card><DataTable exportName="tasks" search="Search tasks" searchText={(t) => t.title + t.caseId} rows={rows} filters={[{ label: 'Status', options: ['In Progress', 'Waiting', 'Completed', 'Overdue'], test: (t, v) => t.shown === v }]}
    cols={[{ h: 'Task', render: (t) => t.title, val: (t) => t.title }, { h: 'Case', render: (t) => <button className="link mono" onClick={() => { act.setCtx({ caseId: t.caseId }); nav(pathOf('CaseTasks')); }}>{t.caseId}</button> }, { h: 'Due', render: (t) => fd(t.due), val: (t) => t.due }, { h: 'Priority', render: (t) => <Prio p={t.priority} /> }, { h: 'Status', render: (t) => <Status s={t.shown} />, val: (t) => t.shown }, { h: '', render: (t) => (t.status === 'Completed' ? <Btn sm onClick={() => act.taskStatus(t.id, 'In Progress')}>Reopen</Btn> : <Btn sm onClick={() => { act.taskStatus(t.id, 'Completed'); toast('Task completed'); }}>Complete</Btn>) }]} /></Card></>;
}

export default InvTasks;
