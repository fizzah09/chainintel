import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../app/config/paths';
import { Btn, Card, DataTable, Head, Person, Prio } from '../ui';
import { ago } from '../../lib/format';
import { STAGES, act, useStore } from '../../mocks/store';

export const open = (c) => c.status !== 'Closed';

export const overdueT = (t) => t.status !== 'Completed' && t.due && new Date(t.due) < new Date();

export const overdueC = (c) => open(c) && c.due && new Date(c.due) < new Date();

export const goCase = (nav, c) => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseDetails')); };

export const CaseLink = ({ c }) => { const nav = useNavigate(); return <button className="link mono" onClick={() => goCase(nav, c)}>{c.id}</button>; };

export const byStatus = (cs) => STAGES.map((st) => [st, cs.filter((c) => c.status === st).length]);

export const queueRows = (s) => s.cases.filter((c) => c.status === 'Under Review');

export function Queue({ title, desc }) {
  const s = useStore(); const nav = useNavigate(); const rows = queueRows(s);
  return <><Head title={title} desc={desc} /><Card><DataTable exportName="queue" search="Search queue" searchText={(c) => c.id + c.title} rows={rows} cols={[{ h: 'Case', render: (c) => <CaseLink c={c} /> }, { h: 'Title', render: (c) => c.title }, { h: 'Assignee', render: (c) => <Person n={c.assignee} /> }, { h: 'Priority', render: (c) => <Prio p={c.priority} /> }, { h: 'Submitted', render: (c) => ago(c.submitted || c.opened) }, { h: '', render: (c) => <Btn sm kind="pri" onClick={() => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseReview')); }}>Review</Btn> }]} /></Card></>;
}
