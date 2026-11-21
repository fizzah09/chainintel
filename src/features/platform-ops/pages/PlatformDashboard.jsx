import { pathOf } from '../../../app/config/paths';
import { Bars, Card, Donut, Head, HBars, Kpis, Row, SetRow, Status, Btn } from '../../../components/ui';
import { num } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// PA-01: operations overview across all tenants, providers and support tickets.
export function PlatformDashboard() {
  const s = useStore();
  const active = s.tenants.filter((t) => t.status === 'Active').length;
  const users = s.tenants.reduce((n, t) => n + t.users, 0);
  const errs = s.providers.length ? s.providers.reduce((n, p) => n + p.err, 0) / s.providers.length : 0;
  const tickets = s.complaints || [];
  const open = tickets.filter((c) => c.status === 'Open').length;
  const inProgress = tickets.filter((c) => c.status === 'In progress').length;
  const resolved = tickets.filter((c) => c.status === 'Resolved').length;

  return <>
    <Head title="Operations dashboard" desc="Health and usage across all tenants and providers." />
    <Kpis items={[
      ['Tenants', s.tenants.length, `${active} active`],
      ['Platform users', users, 'Across tenants'],
      ['Open tickets', open + inProgress, `${open} open · ${inProgress} in progress`, 'mod'],
      ['Provider errors', `${errs.toFixed(1)}%`, `Alert above ${s.settings.errAlert}%`, errs > s.settings.errAlert ? 'crit' : undefined],
    ]} />
    <Row>
      <Card title="Tenant status" style={{ flex: '1 1 300px' }}>
        <Donut items={['Active', 'Suspended'].map((x, i) => [x, s.tenants.filter((t) => t.status === x).length, ['#16A34A', '#DC2626'][i]])} center={String(s.tenants.length)} sub="tenants" />
      </Card>
      <Card title="Tickets by status" sub="Complaints raised by bank admins" style={{ flex: '1 1 300px' }}>
        <Bars vals={[open, inProgress, resolved]} labels={['Open', 'In progress', 'Resolved']} />
      </Card>
      <Card title="API calls by provider" style={{ flex: '2 1 380px' }}>
        <HBars items={s.providers.map((p) => [p.name, p.calls, '#1769E0'])} />
        <div className="mu sm">Calls in the last 24 hours · {num(s.providers.reduce((n, p) => n + p.calls, 0))} total</div>
      </Card>
    </Row>
    <Card title="Provider status" sub="Health of each data provider" act={<Btn sm to={pathOf('PA_Provider')}>Provider monitoring</Btn>}>
      {s.providers.map((p) => <SetRow key={p.id} title={p.name} desc={p.purpose}><Status s={p.on ? p.status : 'Disabled'} /></SetRow>)}
    </Card>
  </>;
}

export default PlatformDashboard;
