import { useState } from 'react';
import { Card, Chip, DataTable, Head, Toggle, useToast } from '../../../components/ui';

// SA-04: supported networks. Only Ethereum is enabled in this release; the others are planned.
const NETWORKS = [
  { name: 'Ethereum', chainId: 1, status: 'Mainnet', supported: true },
  { name: 'Polygon', chainId: 137, status: 'Planned', supported: false },
  { name: 'Arbitrum', chainId: 42161, status: 'Planned', supported: false },
  { name: 'Tron', chainId: null, status: 'Out of scope v1', supported: false },
];

export function SaNetworks() {
  const toast = useToast();
  const [on, setOn] = useState({ Ethereum: true });
  return <>
    <Head title="Blockchain networks" desc="Supported networks. Networks beyond Ethereum are pending (OI-05)." />
    <Card>
      <DataTable tools={false} rows={NETWORKS} cols={[
        { h: 'Network', render: (n) => <b>{n.name}</b> },
        { h: 'Chain ID', render: (n) => n.chainId ?? '—' },
        { h: 'Status', render: (n) => n.status },
        { h: 'Latest block', render: () => '—' },
        { h: 'Lag', render: () => '—' },
        { h: 'Connection', render: (n) => (n.supported ? <Chip k={on[n.name] ? 'ok' : 'gray'}>{on[n.name] ? 'Connected' : 'Disabled'}</Chip> : <Chip k="gray">Planned</Chip>) },
        { h: 'Enabled', render: (n) => <Toggle on={!!on[n.name]} disabled={!n.supported} onChange={(v) => { setOn({ ...on, [n.name]: v }); toast(v ? 'Network enabled' : 'Network disabled'); }} label={n.name} /> },
      ]} />
    </Card>
  </>;
}

export default SaNetworks;
