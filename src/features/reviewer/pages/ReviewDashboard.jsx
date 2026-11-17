import { pathOf } from '../../../app/config/paths';
import { Queue, queueRows } from '../../../components/domain/workspace';
import { Btn, Card, Donut, Empty, Head, Kpis, Row, SetRow } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function RevDash() {
  const s = useStore(); const q = queueRows(s); const rv = s.reviews;
  return <><Head title="Reviewer dashboard" desc="Pending reviews and recent decisions." acts={<Btn kind="pri" to={pathOf('REV_Queue')}>Open queue</Btn>} />
    <Kpis items={[['Pending', q.length, 'In your queue', 'mod'], ['Approved', rv.filter((r) => r.decision === 'Approved').length, 'Total'], ['Returned', rv.filter((r) => r.decision === 'Returned').length, 'For changes', 'high'], ['Escalated', rv.filter((r) => r.decision === 'Escalated').length, 'To manager', 'crit']]} />
    <Row><Card title="Decision mix" style={{ flex: '1 1 340px' }}><Donut items={['Approved', 'Returned', 'Escalated'].map((d, i) => [d, rv.filter((r) => r.decision === d).length, ['#16A34A', '#EA580C', '#DC2626'][i]])} center={rv.length} sub="reviews" /></Card><Card title="Waiting" style={{ flex: '2 1 480px' }}>{q.length ? q.map((c) => <SetRow key={c.id} title={`${c.id} · ${c.title}`} desc={`${c.assignee} · ${c.priority}`}><Btn sm to={pathOf('REV_Queue')}>Open</Btn></SetRow>) : <Empty title="Queue is empty" />}</Card></Row></>;
}

export default RevDash;
