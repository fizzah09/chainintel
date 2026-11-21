import { Addr, Card, Chip, DataTable, Donut, HBars, Row, Tier } from '../../../components/ui';
import { Risk } from './RiskTab';
import { Transactions } from './TransactionsTab';
import { W, useWallet } from '../shared';
import { usd } from '../../../lib/format';
import { TC, TN, tierOf } from '../../../lib/risk';

export function Counterparties() {
  const [p] = useWallet();
  const cat = {}; p.cps.forEach((c) => { cat[c.label] = (cat[c.label] || 0) + Math.round(c.vol / 1000); });
  return <W active="Counterparties">
    <Row>
      <Card title="Exposure by category" style={{ flex: '1 1 360px' }}>
        <HBars items={Object.entries(cat).map(([k, v]) => [k, v, k === 'Mixing service' ? TC.crit : '#1769E0'])} />
        <div className="mu sm">Volume in $K · last 12 months</div>
      </Card>
    </Row>
    <Card title="All counterparties">
      <DataTable exportName="counterparties" search="Search counterparties" searchText={(c) => c.a + c.label} rows={p.cps}
        filters={[{ label: 'Risk', options: ['Low', 'Moderate', 'High', 'Critical'], test: (c, v) => TN[tierOf(c.risk)] === v }]}
        cols={[
          { h: 'Counterparty', render: (c) => <Addr a={c.a} label="" />, val: (c) => c.a },
          { h: 'Transactions', render: (c) => c.n, val: (c) => c.n },
          { h: 'Volume', render: (c) => usd(c.vol), val: (c) => c.vol },
          { h: 'Direction', render: (c) => <Chip k={c.dir === 'Inbound' ? 'ok' : c.dir === 'Both' ? 'blue' : 'gray'}>{c.dir}</Chip> },
          { h: 'Risk', render: (c) => <Tier score={c.risk} />, val: (c) => c.risk },
        ]} />
    </Card>
  </W>;
}

export default Counterparties;
