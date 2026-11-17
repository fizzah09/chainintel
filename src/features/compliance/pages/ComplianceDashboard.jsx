import { pathOf } from '../../../app/config/paths';
import { byStatus, open, overdueC, queueRows } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Donut, Head, Kpis, Row } from '../../../components/ui';
import { STAGES, useStore } from '../../../mocks/store';

export function CmDash() {
  const s = useStore(); const cs = s.cases; const un = cs.filter((c) => !c.assignee && open(c));
  return <><Head title="Compliance dashboard" desc="Case load, review flow and overdue work." acts={<Btn kind="pri" to={pathOf('CM_Assignment')}>Assign cases</Btn>} />
    <Kpis items={[['Open cases', cs.filter(open).length, 'All teams'], ['Unassigned', un.length, 'Needs owner', 'mod'], ['Under review', queueRows(s).length, 'Awaiting decision'], ['Overdue', cs.filter(overdueC).length, 'Past due', 'crit'], ['Escalated', cs.filter((c) => c.status === 'Escalated').length, 'Needs attention', 'high']]} />
    <Row><Card title="Cases by stage" style={{ flex: '2 1 480px' }}><Bars vals={byStatus(cs).map((x) => x[1])} labels={STAGES.map((x) => x.split(' ')[0])} /></Card><Card title="Priority" style={{ flex: '1 1 320px' }}><Donut items={['Low', 'Medium', 'High', 'Critical'].map((p, i) => [p, cs.filter((c) => c.priority === p).length, ['#16A34A', '#2563EB', '#EA580C', '#DC2626'][i]])} center={cs.length} sub="cases" /></Card></Row></>;
}

export default CmDash;
