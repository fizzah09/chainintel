import { Card, DataTable, Head, Status } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

// PA-02: chain sync and node health. Read-only. Live block, lag and peer data is not connected in this release.
const NETWORKS = [
  { name: 'Ethereum', chain: 'Mainnet', planned: false },
  { name: 'Polygon', chain: 'Planned', planned: true },
  { name: 'Arbitrum', chain: 'Planned', planned: true },
  { name: 'Tron', chain: 'Out of scope v1', planned: true },
];

export function PlatformNetwork() {
  const s = useStore();
  const eth = s.providers.some((p) => p.on);
  const rows = NETWORKS.map((n) => ({ ...n, status: n.planned ? (n.chain === 'Planned' ? 'Planned' : 'Out of scope') : eth ? 'Healthy' : 'Disabled' }));
  return <>
    <Head title="Network monitoring" desc="Chain sync and node health. Read-only status view." />
    <Card>
      <DataTable tools={false} rows={rows} cols={[
        { h: 'Network', render: (n) => <b>{n.name}</b> },
        { h: 'Latest block', render: () => '—' },
        { h: 'Lag', render: () => '—' },
        { h: 'Peers', render: () => '—' },
        { h: 'Status', render: (n) => <Status s={n.status} /> },
      ]} />
    </Card>
  </>;
}

export default PlatformNetwork;
