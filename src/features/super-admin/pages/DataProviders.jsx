import { Card, DataTable, Head, Status, Toggle, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

export function SaProviders() {
  const s = useStore(); const toast = useToast();
  return <><Head title="Data providers" desc="Enable, disable and monitor providers." /><Card><DataTable tools={false} rows={s.providers} cols={[{ h: 'Provider', render: (p) => <b>{p.name}</b> }, { h: 'Purpose', render: (p) => p.purpose }, { h: 'Licence', render: (p) => p.licence }, { h: 'Latency', render: (p) => (p.lat ? `${p.lat} ms` : '—') }, { h: 'Error rate', render: (p) => `${p.err}%` }, { h: 'Status', render: (p) => <Status s={p.on ? p.status : 'Disabled'} /> }, { h: 'Enabled', render: (p) => <Toggle on={p.on} onChange={(v) => { act.providerPatch(p.id, { on: v }, v ? 'Enabled provider' : 'Disabled provider'); toast(v ? 'Provider enabled' : 'Provider disabled'); }} label={p.name} /> }]} /></Card></>;
}

export default SaProviders;
