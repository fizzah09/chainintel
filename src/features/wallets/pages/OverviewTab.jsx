import { useMemo } from 'react';
import { pathOf } from '../../../app/config/paths';
import { LiveWalletCard } from '../../../components/domain/OnChain';
import { Addr, Area, Btn, Card, Col, DataTable, Gauge, Icon, Kpis, Row, Tier } from '../../../components/ui';
import { Risk } from './RiskTab';
import { W, useWallet } from '../shared';
import { ago, fdt, num, usd } from '../../../lib/format';
import { CFG } from '../../../lib/risk';

export function Overview() {
  const [p, s] = useWallet();
  const trend = useMemo(() => { const base = Math.max(30, p.tx / 4); return [0.45, 0.5, 0.48, 0.55, 0.65, 0.6, 0.8, 0.75, 0.95, 0.9, 1.05, 1.15].map((x) => Math.round(base * x)); }, [p.address]);
  const alerts = s.alerts.filter((a) => a.wallet.toLowerCase() === p.address.toLowerCase() && a.status !== 'Resolved');
  return <W active="Overview"><LiveWalletCard address={p.address} /><Kpis items={[['Current balance', `${num(p.bal, 2)} ETH`, `≈ $${num(p.bal * 1900)}`], ['Total transactions', num(p.tx), `${num(p.counts.in)} in · ${num(p.counts.out)} out`], ['Total volume', usd(p.vol), 'Last 12 months'], ['Unique counterparties', num(p.cp), `${p.cps.filter((c) => c.risk >= CFG.thr[1]).length} flagged`, 'high'], ['Last activity', ago(p.last), fdt(p.last) + ' UTC']]} />
    <Row><Col flex="1 1 380px"><Card title="Risk summary"><div style={{ display: 'flex', justifyContent: 'center' }}><Gauge score={p.score} size={230} /></div><div style={{ textAlign: 'center', margin: '-6px 0 12px' }}><Tier score={p.score} /></div><div className="mu sm" style={{ textAlign: 'center', marginBottom: 14 }}>Methodology v{CFG.version} · Based on {p.evidence.length} evidence items</div><div style={{ display: 'flex', justifyContent: 'center' }}><Btn icon="right" to={pathOf('RiskAssessment')}>View score explanation</Btn></div></Card>
      <Card title="Active alerts">{alerts.length ? alerts.map((a) => <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #EDF1F6' }}><Icon n="alert" s={17} /><div style={{ flex: 1 }}><b>{a.trigger}</b><div className="mu sm">{a.id} · {ago(a.at)}</div></div><Tier score={a.score} /></div>) : <div className="mu">No active alerts for this wallet.</div>}</Card></Col>
      <Col flex="2 1 520px"><Card title="Transaction activity" sub="12-month transaction count"><Area series={trend} labels={['Dec', '', 'Feb', '', 'Apr', '', 'Jun', '', 'Aug', '', 'Oct', 'Nov']} uid="bt" /></Card>
        <Card title="Risk score history" sub="Score recalculated on each methodology run"><Area series={p.history} labels={['Mar', 'May', 'Jun', '20 Oct', '', '28 Oct', '', '02 Nov']} h={200} ymin={0} ymax={100} col="#DC2626" uid="rh" /></Card>
        <Card title="Top counterparties"><DataTable tools={false} size={4} rows={p.cps.slice(0, 4)} cols={[{ h: 'Counterparty', render: (c) => <Addr a={c.a} label="" /> }, { h: 'Label', render: (c) => c.label }, { h: 'Direction', render: (c) => c.dir }, { h: 'Volume', render: (c) => usd(c.vol) }, { h: 'Risk', render: (c) => <Tier score={c.risk} /> }]} /></Card></Col></Row></W>;
}

export default Overview;
