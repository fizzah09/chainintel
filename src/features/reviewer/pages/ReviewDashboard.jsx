import { pathOf } from '../../../app/config/paths';
import { CaseLink, queueRows } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Donut, DataTable, Head, Kpis, Prio, Row } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// REV-01: the reviewer's queue and the decisions recorded so far.
export function RevDash() {
  const s = useStore();
  const q = queueRows(s);
  const rv = s.reviews;
  const decided = (d) => rv.filter((r) => r.decision === d).length;

  // Reviews recorded per month, oldest first, for the last six months.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1)));
  const perMonth = months.map((m) => rv.filter((r) => { const d = new Date(r.date); return d.getUTCFullYear() === m.getUTCFullYear() && d.getUTCMonth() === m.getUTCMonth(); }).length);
  const monthLabels = months.map((m) => m.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }));

  return <>
    <Head title="Review dashboard" desc="Cases waiting for your decision." acts={<Btn kind="pri" to={pathOf('REV_Queue')}>Open queue</Btn>} />
    <Kpis items={[
      ['Pending reviews', q.length, `${q.filter((c) => c.priority === 'Critical').length} critical`, 'mod'],
      ['Approved', decided('Approved'), 'All recorded reviews'],
      ['Returned', decided('Returned'), 'Sent back for changes', 'high'],
      ['Escalated', decided('Escalated'), 'Passed to a manager', 'crit'],
    ]} />
    <Row>
      <Card title="Decisions" sub="All recorded reviews" style={{ flex: '1 1 300px' }}>
        <Donut items={[['Approved', decided('Approved'), '#16A34A'], ['Returned', decided('Returned'), '#EA580C'], ['Escalated', decided('Escalated'), '#DC2626']]} center={String(rv.length)} sub="reviews" />
      </Card>
      <Card title="Queue by priority" style={{ flex: '1 1 300px' }}>
        <Bars vals={['Low', 'Medium', 'High', 'Critical'].map((p) => q.filter((c) => c.priority === p).length)} labels={['Low', 'Medium', 'High', 'Critical']} />
      </Card>
      <Card title="Reviews per month" sub="Last six months" style={{ flex: '1 1 300px' }}>
        <Bars vals={perMonth} labels={monthLabels} />
      </Card>
    </Row>
    <Card title="Review queue" act={<Btn sm to={pathOf('REV_Queue')}>Open queue</Btn>}>
      <DataTable tools={false} rows={q} size={5} cols={[
        { h: 'Case', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Due date', render: (c) => fd(c.due) },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
      ]} />
    </Card>
  </>;
}

export default RevDash;
