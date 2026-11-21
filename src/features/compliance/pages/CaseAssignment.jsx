import { pathOf } from '../../../app/config/paths';
import { CaseLink, open } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, Head, Prio, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function CmAssign() {
  const s = useStore(); const toast = useToast();
  const staff = s.users.filter((u) => u.status === 'Active' && ['inv', 'cm'].includes(u.role)).map((u) => u.name);
  const load = (n) => s.cases.filter((c) => c.assignee === n && open(c)).length;
  // Suggested assignee: the investigator with the fewest open cases.
  const suggested = [...staff].sort((a, b) => load(a) - load(b) || a.localeCompare(b))[0];
  const rows = s.cases.filter((c) => open(c) && !c.assignee);

  return <>
    <Head title="Case assignment" desc="Assign unassigned cases to investigators." acts={<Btn kind="pri" icon="plus" to={pathOf('CaseCreate')}>Create case</Btn>} />
    <Card title="Unassigned cases">
      <DataTable tools={false} rows={rows} empty="Every open case has an owner." cols={[
        { h: 'Case ID', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Opened', render: (c) => fd(c.opened) },
        { h: 'Suggested assignee', render: () => suggested ?? '—' },
        { h: '', render: (c) => <Btn sm kind="pri" disabled={!suggested} onClick={() => { act.assign(c.id, suggested); toast(`Assigned to ${suggested}`); }}>Assign</Btn> },
      ]} />
    </Card>
  </>;
}

export default CmAssign;
