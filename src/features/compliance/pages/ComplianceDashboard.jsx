import { pathOf } from '../../../app/config/paths';
import { byStatus, CaseLink, open, queueRows } from '../../../components/domain/workspace';
import { Bars, Btn, Card, Donut, DataTable, HBars, Head, Kpis, Prio, Row, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useCases, useAlerts } from '../../../lib/apiHooks';
import { mapCases, mapAlerts } from '../../../lib/apiAdapters';
import { STAGES, useStore } from '../../../mocks/store';

// CM-01: portfolio, workload and team metrics in one place.
export function CmDash() {
  const s = useStore();
  const { data: apiCases } = useCases({}, s.session);
  const { data: apiAlerts } = useAlerts({}, s.session);
  const cs = apiCases ? mapCases(apiCases) : s.cases;
  const alerts = apiAlerts ? mapAlerts(apiAlerts) : s.alerts;
  const openCs = cs.filter(open);
  const unassigned = openCs.filter((c) => !c.assignee);
  const wallets = new Set(alerts.map((a) => a.wallet).filter(Boolean));
  const staff = s.users.filter((u) => u.status === 'Active' && ['inv', 'cm'].includes(u.role));
  const load = (n) => openCs.filter((c) => c.assignee === n).length;
  const closedFor = (n) => cs.filter((c) => c.assignee === n && c.status === 'Closed').length;

  return <>
    <Head title="Compliance dashboard" desc="Portfolio view of cases, alerts, workload and team activity." acts={<Btn kind="pri" to={pathOf('ReportBuilder')}>Generate report</Btn>} />
    <Kpis items={[
      ['Total wallets', wallets.size, 'Wallets with alerts'],
      ['Open investigations', openCs.length, `${unassigned.length} unassigned`],
      ['Under review', queueRows(s).length, 'Pending decision', 'mod'],
      ['Closed cases', cs.filter((c) => c.status === 'Closed').length, 'All time'],
      ['Team notes', s.notes.length, `${staff.length} active team members`],
    ]} />
    <Row>
      <Card title="Cases by stage" style={{ flex: '2 1 400px' }}>
        <Bars vals={byStatus(cs).map((x) => x[1])} labels={STAGES.map((x) => x.split(' ')[0])} />
      </Card>
      <Card title="Priority" style={{ flex: '1 1 260px' }}>
        <Donut items={['Low', 'Medium', 'High', 'Critical'].map((p, i) => [p, cs.filter((c) => c.priority === p).length, ['#16A34A', '#2563EB', '#EA580C', '#DC2626'][i]])} center={String(cs.length)} sub="cases" />
      </Card>
    </Row>
    <Row>
      <Card title="Workload by investigator" sub="Open cases per person" style={{ flex: '1 1 320px' }}>
        <HBars items={staff.map((u) => [u.name, load(u.name), '#1769E0'])} />
      </Card>
      <Card title="Open vs closed cases" sub="Per team member" style={{ flex: '1 1 320px' }}>
        <HBars items={staff.map((u) => [u.name, closedFor(u.name), '#16A34A'])} />
        <div className="mu sm">Closed cases per team member · open cases are shown under workload</div>
      </Card>
    </Row>
    <Card title="Active cases" act={<Btn sm to={pathOf('CaseList')}>View all</Btn>}>
      <DataTable tools={false} rows={openCs} size={5} cols={[
        { h: 'Case ID', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Status', render: (c) => <Status s={c.status} /> },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Assigned by', render: (c) => c.createdBy ?? '—' },
        { h: 'Opened', render: (c) => fd(c.opened) },
        { h: 'Due', render: (c) => fd(c.due) },
      ]} />
    </Card>
  </>;
}

export default CmDash;
