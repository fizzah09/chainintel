import { open } from '../../../components/domain/workspace';
import { Card, DataTable, Head, Person } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function CmTeam() {
  const s = useStore(); const rows = s.users.filter((u) => u.status === 'Active').map((u) => ({ ...u, open: s.cases.filter((c) => c.assignee === u.name && open(c)).length, tasks: s.tasks.filter((t) => t.assignee === u.name && t.status !== 'Completed').length }));
  return <><Head title="Team performance" /><Card><DataTable exportName="team" rows={rows} cols={[{ h: 'Member', render: (u) => <Person n={u.name} sub={u.team} />, val: (u) => u.name }, { h: 'Open cases', render: (u) => u.open, val: (u) => u.open }, { h: 'Open tasks', render: (u) => u.tasks, val: (u) => u.tasks }, { h: 'Closed', render: (u) => s.cases.filter((c) => c.assignee === u.name && c.status === 'Closed').length }]} /></Card></>;
}

export default CmTeam;
