import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Kpis, Person, Prio, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useCases } from '../../../lib/apiHooks';
import { mapCases } from '../../../lib/apiAdapters';
import { STAGES, act, can, useStore } from '../../../mocks/store';

export function CaseList({ mine, title = 'Cases', readonly }) {
  const s = useStore(); const nav = useNavigate(); const me = s.session.name;

  // Real data from M6 API
  const { data: apiCases } = useCases(mine ? { assignee: me } : {}, s.session);
  const realCases = apiCases ? mapCases(apiCases) : null;

  // Fall back to mock when backend unavailable
  const rows0 = (realCases ?? s.cases).filter((c) => !mine || c.assignee === me);
  const rows = rows0;

  const navigate = (c) => {
    // For API-sourced cases use the API id; for mock cases use the mock id
    const id = c._apiId ?? c.id;
    act.setCtx({ caseId: c.id });
    if (c._apiId) act.setCtx({ caseId: c.id, caseApiId: c._apiId });
    nav(pathOf('CaseDetails'));
  };

  const over = (c) => c.due && c.status !== 'Closed' && new Date(c.due) < new Date();
  const allCases = realCases ?? s.cases;

  return <><Head title={title} desc={mine ? 'Cases assigned to you.' : readonly ? 'Read-only access to case records.' : 'All investigations in your workspace.'} acts={!readonly && <Btn kind="pri" icon="plus" to={pathOf('CaseCreate')} disabled={!can(s, 'create_case')}>Create case</Btn>} />
    {!mine && <Kpis items={[['Open', allCases.filter((c) => c.status === 'Open').length, 'Awaiting assignment'], ['In progress', allCases.filter((c) => ['Assigned', 'Evidence Collection', 'Analysis'].includes(c.status)).length, 'Being worked'], ['Under review', allCases.filter((c) => ['Under Review', 'Decision'].includes(c.status)).length, 'Pending decision', 'mod'], ['Closed', allCases.filter((c) => c.status === 'Closed').length, 'Total'], ['Overdue', allCases.filter(over).length, 'Past due date', 'crit']]} />}
    <Card><DataTable exportName="cases" search="Search cases" searchText={(c) => c.id + c.title + c.assignee} rows={rows} size={8}
      filters={[{ label: 'Status', options: [...STAGES, 'Escalated', 'On Hold', 'Reopened'], test: (c, v) => c.status === v }, { label: 'Priority', options: ['Low', 'Medium', 'High', 'Critical'], test: (c, v) => c.priority === v }, { label: 'Assignee', options: [...new Set(rows.map((c) => c.assignee).filter(Boolean))], test: (c, v) => c.assignee === v }]}
      cols={[{ h: 'Case ID', render: (c) => <button className="link mono" onClick={() => navigate(c)}>{c.id}</button>, val: (c) => c.id }, { h: 'Title', render: (c) => c.title, val: (c) => c.title }, { h: 'Status', render: (c) => <Status s={c.status} />, val: (c) => c.status }, { h: 'Priority', render: (c) => <Prio p={c.priority} />, val: (c) => c.priority }, { h: 'Assignee', render: (c) => <Person n={c.assignee} />, val: (c) => c.assignee }, { h: 'Opened', render: (c) => fd(c.opened), val: (c) => c.opened }, { h: 'Due', render: (c) => (c.due ? <span style={{ color: over(c) ? '#B91C1C' : undefined, fontWeight: over(c) ? 600 : 400 }}>{fd(c.due)}</span> : '—'), val: (c) => c.due }]} defaultSort={{ i: 5, d: -1 }} /></Card></>;
}

export default CaseList;
