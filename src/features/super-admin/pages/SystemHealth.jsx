import { Card, DataTable, Head, Kpis, Status } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

export function SaHealth() {
  const s = useStore();
  return <><Head title="System health" /><Kpis items={[['API uptime', '99.97%', '30 days'], ['Median latency', '212 ms', 'p50'], ['Error rate', '0.4%', 'Last hour'], ['Queue depth', '37', `Alert at ${s.settings.queueAlert}`]]} /><Card title="Providers"><DataTable tools={false} rows={s.providers} cols={[{ h: 'Provider', render: (p) => p.name }, { h: 'Latency', render: (p) => (p.lat ? `${p.lat} ms` : '—') }, { h: 'Error rate', render: (p) => `${p.err}%` }, { h: 'Status', render: (p) => <Status s={p.status} /> }]} /></Card></>;
}

export default SaHealth;
