import { Bars, Card, Donut, Head, HBars, Kpis, Row, SetRow, Status } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

// SA-01: platform overview across all tenants and providers.
export function SaDash() {
  const s = useStore();
  const active = s.tenants.filter((t) => t.status === 'Active').length;
  const users = s.tenants.reduce((n, t) => n + t.users, 0);
  const errs = s.providers.length ? s.providers.reduce((n, p) => n + p.err, 0) / s.providers.length : 0;

  return <>
    <Head title="Platform overview" desc="Health and usage across all tenants and providers." />
    <Kpis items={[
      ['Tenants', s.tenants.length, `${active} active`],
      ['Platform users', users, 'Across tenants'],
      ['Provider errors', `${errs.toFixed(1)}%`, `Alert above ${s.settings.errAlert}%`, errs > s.settings.errAlert ? 'crit' : undefined],
    ]} />
    <Row>
      <Card title="Tenant status" style={{ flex: '1 1 300px' }}>
        <Donut items={['Active', 'Suspended'].map((x, i) => [x, s.tenants.filter((t) => t.status === x).length, ['#16A34A', '#DC2626'][i]])} center={String(s.tenants.length)} sub="tenants" />
      </Card>
      <Card title="Users by tenant" style={{ flex: '2 1 380px' }}>
        <Bars vals={s.tenants.map((t) => t.users)} labels={s.tenants.map((t) => t.name.split(' ')[0])} />
      </Card>
    </Row>
    <Card title="API calls by provider" style={{ flex: '1 1 100%' }}>
      <HBars items={s.providers.map((p) => [p.name, p.calls, '#1769E0'])} />
    </Card>
    <Card title="Provider status" sub="Health of each data provider">
      {s.providers.map((p) => <SetRow key={p.id} title={p.name} desc={p.purpose}><Status s={p.on ? p.status : 'Disabled'} /></SetRow>)}
    </Card>
  </>;
}

export default SaDash;
