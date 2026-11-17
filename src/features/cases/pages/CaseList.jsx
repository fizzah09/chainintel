import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Kpis, Person, Prio, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { STAGES, act, can, useStore } from '../../../mocks/store';

export function CaseList({ mine, title = 'Cases', readonly }) {
  const s = useStore(); const nav = useNavigate(); const me = s.session.name;
  const rows = s.cases.filter((c) => !mine || c.assignee === me);
  const over = (c) => c.due && c.status !== 'Closed' && new Date(c.due) < new Date();
  return <><Head title={title} desc={mine ? 'Cases assigned to you.' : readonly ? 'Read-only access to case records.' : 'All investigations in your workspace.'} acts={!readonly && <Btn kind="pri" icon="plus" to={pathOf('CaseCreate')} disabled={!can(s, 'create_case')}>Create case</Btn>} />
    {!mine && <Kpis items={[['Open', s.cases.filter((c) => c.status === 'Open').length, 'Awaiting assignment'], ['In progress', s.cases.filter((c) => ['Assigned', 'Evidence Collection', 'Analysis'].includes(c.status)).length, 'Being worked'], ['Under review', s.cases.filter((c) => ['Under Review', 'Decision'].includes(c.status)).length, 'Pending decision', 'mod'], ['Closed', s.cases.filter((c) => c.status === 'Closed').length, 'Total'], ['Overdue', s.cases.filter(over).length, 'Past due date', 'crit']]} />}
    <Card><DataTable exportName="cases" search="Search cases" searchText={(c) => c.id + c.title + c.assignee} rows={rows} size={8}
      filters={[{ label: 'Status', options: [...STAGES, 'Escalated', 'On Hold', 'Reopened'], test: (c, v) => c.status === v }, { label: 'Priority', options: ['Low', 'Medium', 'High', 'Critical'], test: (c, v) => c.priority === v }, { label: 'Assignee', options: [...new Set(s.cases.map((c) => c.assignee).filter(Boolean))], test: (c, v) => c.assignee === v }]}
      cols={[{ h: 'Case ID', render: (c) => <button className="link mono" onClick={() => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseDetails')); }}>{c.id}</button>, val: (c) => c.id }, { h: 'Title', render: (c) => c.title, val: (c) => c.title }, { h: 'Status', render: (c) => <Status s={c.status} />, val: (c) => c.status }, { h: 'Priority', render: (c) => <Prio p={c.priority} />, val: (c) => ['Low', 'Medium', 'High', 'Critical'].indexOf(c.priority) }, { h: 'Assignee', render: (c) => <Person n={c.assignee} />, val: (c) => c.assignee }, { h: 'Opened', render: (c) => fd(c.opened), val: (c) => c.opened }, { h: 'Due', render: (c) => (c.due ? <span style={{ color: over(c) ? '#B91C1C' : undefined, fontWeight: over(c) ? 600 : 400 }}>{fd(c.due)}</span> : '—'), val: (c) => c.due }]} defaultSort={{ i: 5, d: -1 }} /></Card></>;
}

export default CaseList;
