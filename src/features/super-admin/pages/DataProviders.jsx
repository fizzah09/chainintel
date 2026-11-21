import { Card, DataTable, Head, Status, Toggle, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

// SA-05: data sources, their quota, latency and status. Enabling or disabling a provider is kept here.
export function SaProviders() {
  const s = useStore(); const toast = useToast();
  return <>
    <Head title="Data providers" desc="Configure sources, keys, quotas and fallbacks." />
    <Card>
      <DataTable tools={false} rows={s.providers} cols={[
        { h: 'Provider', render: (p) => <b>{p.name}</b> },
        { h: 'Purpose', render: (p) => p.purpose },
        { h: 'Quota used', render: (p) => `${p.used}%`, val: (p) => p.used },
        { h: 'Latency', render: (p) => (p.lat ? `${p.lat} ms` : '—'), val: (p) => p.lat },
        { h: 'Status', render: (p) => <Status s={p.on ? p.status : 'Disabled'} />, val: (p) => p.status },
        { h: 'Last checked', render: () => '—' },
        { h: 'Enabled', render: (p) => <Toggle on={p.on} onChange={(v) => { act.providerPatch(p.id, { on: v }, v ? 'Enabled provider' : 'Disabled provider'); toast(v ? 'Provider enabled' : 'Provider disabled'); }} label={p.name} /> },
      ]} />
    </Card>
  </>;
}

export default SaProviders;
