import { Bars, Card, Check, Donut, Head, Kpis, Row } from '../../../components/ui';
import { num } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

export function SaDash() {
  const s = useStore();
  return <><Head title="Platform overview" desc="All tenants, providers and jobs." /><Kpis items={[['Tenants', s.tenants.length, `${s.tenants.filter((t) => t.status === 'Active').length} active`], ['Users', s.tenants.reduce((a, t) => a + t.users, 0), 'Across tenants'], ['Wallets monitored', num(s.tenants.reduce((a, t) => a + t.wallets, 0)), 'Total'], ['Failed jobs', s.jobs.filter((j) => j.status === 'Failed').length, 'Needs attention', 'crit'], ['Degraded providers', s.providers.filter((p) => p.status !== 'Healthy').length, 'Check health', 'mod']]} />
    <Row><Card title="API calls today" style={{ flex: '2 1 480px' }}><Bars vals={s.providers.map((p) => p.calls)} labels={s.providers.map((p) => p.name.split(' ')[0])} /></Card><Card title="Tenant status" style={{ flex: '1 1 300px' }}><Donut items={['Active', 'Suspended'].map((x, i) => [x, s.tenants.filter((t) => t.status === x).length, ['#16A34A', '#DC2626'][i]])} center={s.tenants.length} sub="tenants" /></Card></Row></>;
}

export default SaDash;
