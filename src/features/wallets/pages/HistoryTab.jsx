import { Area, Card, DataTable, Row, Tier } from '../../../components/ui';
import { W, useWallet } from '../shared';
import { CFG } from '../../../lib/risk';

export function WHistory() {
  const [p] = useWallet(); const labels = ['20 Sep', '04 Oct', '14 Oct', '20 Oct', '24 Oct', '28 Oct', '31 Oct', '02 Nov'];
  return <W active="History"><Row><Card title="Score history" style={{ flex: '1 1 440px' }}><Area series={p.history} labels={labels} ymin={0} ymax={100} col="#DC2626" uid="hs" h={220} /></Card>
    <Card title="Analysis runs" style={{ flex: '1 1 440px' }}><DataTable tools={false} rows={[...p.history].map((v, i) => ({ v, i, d: labels[i] })).reverse()} size={8} cols={[{ h: 'Run', render: (r) => `v${r.i + 1}` }, { h: 'Date', render: (r) => r.d }, { h: 'Methodology', render: () => `v${CFG.version}` }, { h: 'Score', render: (r) => <b>{r.v}</b> }, { h: 'Tier', render: (r) => <Tier score={r.v} /> }]} /></Card></Row></W>;
}

export default WHistory;
