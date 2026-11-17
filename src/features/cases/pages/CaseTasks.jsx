import { useState } from 'react';
import { Btn, Card, DataTable, Modal, Person, Prio, SelectIn, Stack, Status, TextIn, useToast } from '../../../components/ui';
import { CW, assignees, overdue, useCase } from '../shared';
import { fd } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function CTasks() {
  const [c, s] = useCase(); const toast = useToast(); const [m, setM] = useState(false); const [v, setV] = useState({}); const [err, setErr] = useState(''); const edit = can(s, 'create_case');
  const rows = s.tasks.filter((t) => t.caseId === c.id).map((t) => ({ ...t, shown: overdue(t) ? 'Overdue' : t.status }));
  return <CW active="Tasks"><Card title="Tasks" act={<Btn kind="pri" sm icon="plus" disabled={!edit} onClick={() => { setV({ assignee: c.assignee || assignees(s)[0], priority: 'Medium' }); setErr(''); setM(true); }}>New task</Btn>}>
    <DataTable exportName="tasks" search="Search tasks" searchText={(t) => t.title} rows={rows} filters={[{ label: 'Status', options: ['In Progress', 'Waiting', 'Completed', 'Overdue'], test: (t, x) => t.shown === x }]}
      cols={[{ h: 'Task', render: (t) => t.title, val: (t) => t.title }, { h: 'Assignee', render: (t) => <Person n={t.assignee} /> }, { h: 'Due', render: (t) => fd(t.due), val: (t) => t.due }, { h: 'Status', render: (t) => <Status s={t.shown} /> }, { h: 'Priority', render: (t) => <Prio p={t.priority} /> }, { h: '', render: (t) => edit && (t.status === 'Completed' ? <Btn sm onClick={() => act.taskStatus(t.id, 'In Progress')}>Reopen</Btn> : <Btn sm onClick={() => { act.taskStatus(t.id, 'Completed'); toast('Task completed'); }}>Complete</Btn>) }]} /></Card>
    <Modal open={m} title="New task" onClose={() => setM(false)} footer={<><Btn onClick={() => setM(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { if (!(v.title || '').trim()) return setErr('Task title is required.'); if (!v.due) return setErr('Choose a due date.'); act.addTask({ caseId: c.id, title: v.title.trim(), assignee: v.assignee, priority: v.priority, due: new Date(v.due).toISOString() }); toast('Task created'); setM(false); }}>Create task</Btn></>}><Stack gap={14}><TextIn label="Task" req value={v.title} onChange={(x) => setV({ ...v, title: x })} err={err} /><SelectIn label="Assignee" value={v.assignee} onChange={(x) => setV({ ...v, assignee: x })} options={assignees(s)} /><SelectIn label="Priority" value={v.priority} onChange={(x) => setV({ ...v, priority: x })} options={['Low', 'Medium', 'High', 'Critical']} /><TextIn label="Due date" type="date" req value={v.due} onChange={(x) => setV({ ...v, due: x })} /></Stack></Modal></CW>;
}

export default CTasks;
