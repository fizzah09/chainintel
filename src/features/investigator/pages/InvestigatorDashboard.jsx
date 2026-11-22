import { pathOf } from '../../../app/config/paths';
import { CaseLink, open, overdueT } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Col, Donut, DataTable, Empty, Head, Kpis, Prio, Row, SetRow, Status, Tier } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { tierOf } from '../../../lib/risk';
import { useCases, useAlerts } from '../../../lib/apiHooks';
import { mapCases, mapAlerts } from '../../../lib/apiAdapters';
import { STAGES, useStore } from '../../../mocks/store';

// INV-01: cases, tasks and alerts, with charts (no under-review or risk-tier card, per feedback).
export function InvDash() {
  const s = useStore(); const me = s.session.name;
  const { data: apiCases } = useCases({}, s.session);
  const { data: apiAlerts } = useAlerts({}, s.session);
  const cases = apiCases ? mapCases(apiCases) : s.cases;
  const alerts = apiAlerts ? mapAlerts(apiAlerts) : s.alerts;

  const mine = cases.filter((c) => c.assignee === me && open(c));
  const myTasks = s.tasks.filter((t) => t.assignee === me).map((t) => ({ ...t, shown: overdueT(t) ? 'Overdue' : t.status }));
  const tasks = myTasks.filter((t) => t.status !== 'Completed');
  const unack = alerts.filter((a) => a.status === 'Unacknowledged');

  const stageCounts = STAGES.map((st) => mine.filter((c) => c.status === st).length);
  const taskCount = (st) => myTasks.filter((t) => t.shown === st).length;

  return <>
    <Head title="Investigator dashboard" desc="Your assigned cases, tasks and wallets that need attention today." acts={<Btn kind="pri" icon="plus" to={pathOf('CaseCreate')}>Create case</Btn>} />
    <Kpis items={[
      ['My open cases', mine.length, `${mine.filter((c) => c.due).length} with a due date`],
      ['Open tasks', tasks.length, `${tasks.filter(overdueT).length} overdue`, 'crit'],
      ['Watchlist alerts', unack.length, `${unack.filter((a) => tierOf(a.score) === 'crit').length} critical`, 'high'],
    ]} />
    <Row>
      <Card title="My cases by stage" style={{ flex: '2 1 400px' }}>
        <Bars vals={stageCounts} labels={STAGES.map((x) => x.split(' ')[0])} />
      </Card>
      <Card title="My tasks by status" style={{ flex: '1 1 260px' }}>
        <Donut items={[['In Progress', taskCount('In Progress'), '#1769E0'], ['Waiting', taskCount('Waiting'), '#F59E0B'], ['Overdue', taskCount('Overdue'), '#DC2626'], ['Completed', taskCount('Completed'), '#16A34A']]} center={String(myTasks.length)} sub="tasks" />
      </Card>
    </Row>
    <Row>
      <Col flex="2 1 560px">
        <Card title="Active cases" act={<Btn sm to={pathOf('INV_MyCases')}>View all</Btn>}>
          <DataTable tools={false} rows={mine} size={5} cols={[
            { h: 'Case ID', render: (c) => <CaseLink c={c} /> },
            { h: 'Title', render: (c) => c.title },
            { h: 'Status', render: (c) => <Status s={c.status} /> },
            { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
            { h: 'Assignee', render: (c) => c.assignee },
            { h: 'Opened', render: (c) => fd(c.opened) },
            { h: 'Due', render: (c) => fd(c.due) },
          ]} />
          {!mine.length && <Empty title="No active cases" />}
        </Card>
        <Card title="My tasks due" act={<Btn sm to={pathOf('INV_MyTasks')}>All tasks</Btn>}>
          <DataTable tools={false} rows={tasks} size={5} cols={[
            { h: 'Task', render: (t) => t.title },
            { h: 'Case', render: (t) => <span className="mono">{t.caseId}</span> },
            { h: 'Due', render: (t) => fd(t.due) },
            { h: 'Status', render: (t) => <Status s={t.shown} /> },
          ]} />
          {!tasks.length && <Empty title="All caught up" />}
        </Card>
      </Col>
      <Col flex="1 1 320px">
        <Card title="Recent alerts" act={<Btn sm to={pathOf('AlertsDashboard')}>All alerts</Btn>}>
          {alerts.slice(0, 4).map((a) => <SetRow key={a.id} title={a.trigger} desc={`${a.wallet.slice(0, 10)}… · ${a.id}`}><Tier score={a.score} /></SetRow>)}
          {!alerts.length && <Empty title="No alerts" />}
        </Card>
      </Col>
    </Row>
  </>;
}

export default InvDash;
