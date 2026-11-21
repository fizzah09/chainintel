import { Card, DataTable, Head, Status } from '../../../components/ui';
import { num } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// PA-03: rate limits, latency and error rates per provider. Read-only.
export function PlatformProviders() {
  const s = useStore();
  return <>
    <Head title="Provider monitoring" desc="Rate limits, latency and error rates per provider." />
    <Card>
      <DataTable tools={false} rows={s.providers} cols={[
        { h: 'Provider', render: (p) => <b>{p.name}</b> },
        { h: 'Calls (24 h)', render: (p) => num(p.calls), val: (p) => p.calls },
        { h: 'Errors', render: (p) => `${p.err}%`, val: (p) => p.err },
        { h: 'Latency p95', render: (p) => (p.lat ? `${p.lat} ms` : '—'), val: (p) => p.lat },
        { h: 'Status', render: (p) => <Status s={p.on ? p.status : 'Disabled'} /> },
      ]} />
    </Card>
  </>;
}

export default PlatformProviders;
