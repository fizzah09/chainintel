import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Gauge, Head, Row, Tier } from '../../../components/ui';
import { TN, tierOf, txDetail } from '../../../lib/risk';
import { useStore } from '../../../mocks/store';

export function TxRisk() {
  const s = useStore(); const tx = txDetail(s.ctx.tx); const shares = [0.4, 0.25, 0.19, 0.06]; const names = [['Source reputation', 'Source wallet linked to flagged counterparties'], ['Amount anomaly', 'Above the wallet median'], ['Timing', 'Part of a rapid pass-through'], ['Token', 'Stablecoin, low volatility'], ['Other', 'No additional signals']];
  const pts = shares.map((x) => Math.round(tx.risk * x * 10) / 10); pts.push(Math.round((tx.risk - pts.reduce((a, b) => a + b, 0)) * 10) / 10);
  return <><Head title="Transaction risk drilldown" desc={`Why this transaction scored ${tx.risk} (${TN[tierOf(tx.risk)]}).`} acts={<Btn icon="left" to={pathOf('TransactionDetail')}>Back to transaction</Btn>} />
    <Row><Card title="Score" style={{ flex: '1 1 320px' }}><div style={{ display: 'flex', justifyContent: 'center' }}><Gauge score={tx.risk} size={210} /></div><div style={{ textAlign: 'center' }}><Tier score={tx.risk} /></div></Card><Card title="Risk factors" style={{ flex: '2 1 560px' }}><DataTable tools={false} rows={names.map((n, i) => ({ n, p: pts[i], w: [35, 25, 20, 10, 10][i] }))} cols={[{ h: 'Factor', render: (r) => <b>{r.n[0]}</b> }, { h: 'Observation', render: (r) => r.n[1] }, { h: 'Weight', render: (r) => `${r.w}%` }, { h: 'Points', r: true, render: (r) => `+${r.p}` }]} /><div className="mu sm" style={{ paddingTop: 12 }}>Total {tx.risk}.0 · Tier {TN[tierOf(tx.risk)]}</div></Card></Row></>;
}

export default TxRisk;
