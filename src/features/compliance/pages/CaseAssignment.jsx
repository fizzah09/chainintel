import { useState } from 'react';
import { CaseLink, open } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, HBars, Head, Prio, Row, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

export function CmAssign() {
  const s = useStore(); const toast = useToast(); const [pick, setPick] = useState({}); const staff = s.users.filter((u) => u.status === 'Active' && ['inv', 'cm'].includes(u.role)).map((u) => u.name);
  const rows = s.cases.filter((c) => open(c) && (!c.assignee || c.status === 'Open'));
  return <><Head title="Case assignment" desc="Assign unowned cases and balance workload." /><Row><Card title="Unassigned cases" style={{ flex: '2 1 560px' }}><DataTable tools={false} rows={rows} cols={[{ h: 'Case', render: (c) => <CaseLink c={c} /> }, { h: 'Title', render: (c) => c.title }, { h: 'Priority', render: (c) => <Prio p={c.priority} /> }, { h: 'Assign to', render: (c) => <select className="in" style={{ minHeight: 32 }} aria-label="Assignee" value={pick[c.id] || ''} onChange={(e) => setPick({ ...pick, [c.id]: e.target.value })}><option value="">Choose…</option>{staff.map((n) => <option key={n}>{n}</option>)}</select> }, { h: '', render: (c) => <Btn sm kind="pri" onClick={() => { if (!pick[c.id]) return toast('Choose an assignee first', 'bad'); act.assign(c.id, pick[c.id]); toast('Assigned'); }}>Assign</Btn> }]} empty="Every open case has an owner." /></Card>
    <Card title="Workload" style={{ flex: '1 1 300px' }}><HBars items={staff.map((n) => [n, s.cases.filter((c) => c.assignee === n && open(c)).length, '#1769E0'])} /></Card></Row></>;
}

export default CmAssign;
