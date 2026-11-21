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
  // Monthly transaction counts from the loaded transfers; the latest transfer sets the 12-month window.
  const { trend, trendLabels, histLabels } = useMemo(() => {
    const anchor = new Date(p.txs?.[0]?.time || Date.now());
    const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - (11 - i), 1)));
    const counts = months.map((m) => (p.txs || []).filter((t) => { const d = new Date(t.time); return d.getUTCFullYear() === m.getUTCFullYear() && d.getUTCMonth() === m.getUTCMonth(); }).length);
    const weekly = (p.history || []).map((_, i, arr) => new Date(anchor.getTime() - (arr.length - 1 - i) * 7 * 864e5));
    return {
      trend: counts,
      trendLabels: months.map((m) => m.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })),
      histLabels: weekly.map((d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })),
    };
  }, [p.address, p.txs, p.history]);
  const alerts = s.alerts.filter((a) => a.wallet.toLowerCase() === p.address.toLowerCase() && a.status !== 'Resolved');
  return <W active="Overview"><LiveWalletCard address={p.address} />
    <Kpis items={[
      ['Current balance', `${num(p.bal, 2)} ETH`, `≈ $${num(p.bal * 1900)}`],
      ['Total transactions', num(p.tx), `${num(p.counts.in)} in · ${num(p.counts.out)} out`],
      ['Total volume', usd(p.vol), 'Last 12 months'],
      ['Unique counterparties', num(p.cp), `${p.cps.filter((c) => c.risk >= CFG.thr[1]).length} flagged`, 'high'],
      ['Last activity', ago(p.last), fdt(p.last) + ' UTC'],
    ]} />
    <Row>
      <Col flex="1 1 380px">
        <Card title="Risk summary">
          <div style={{ display: 'flex', justifyContent: 'center' }}><Gauge score={p.score} size={230} /></div>
          <div style={{ textAlign: 'center', margin: '-6px 0 12px' }}><Tier score={p.score} /></div>
          <div className="mu sm" style={{ textAlign: 'center', marginBottom: 14 }}>Methodology v{CFG.version} · Based on {p.evidence.length} evidence items</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Btn icon="right" to={pathOf('RiskAssessment')}>View score explanation</Btn></div>
        </Card>
        <Card title="Active alerts">
          {alerts.length
            ? alerts.map((a) => <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #EDF1F6' }}><Icon n="alert" s={17} /><div style={{ flex: 1 }}><b>{a.trigger}</b><div className="mu sm">{a.id} · {ago(a.at)}</div></div><Tier score={a.score} /></div>)
            : <div className="mu">No active alerts for this wallet.</div>}
        </Card>
      </Col>
      <Col flex="2 1 520px">
        <Card title="Transaction activity" sub="Transfers per month, last 12 months (loaded transfers)"><Area series={trend} labels={trendLabels} uid="bt" /></Card>
        <Card title="Risk score history" sub="Weekly score, most recent last"><Area series={p.history} labels={histLabels} h={200} ymin={0} ymax={100} col="#DC2626" uid="rh" /></Card>
        <Card title="Top counterparties">
          <DataTable tools={false} size={4} rows={p.cps.slice(0, 4)} cols={[
            { h: 'Counterparty', render: (c) => <Addr a={c.a} label="" /> },
            { h: 'Label', render: (c) => c.label },
            { h: 'Direction', render: (c) => c.dir },
            { h: 'Volume', render: (c) => usd(c.vol) },
            { h: 'Risk', render: (c) => <Tier score={c.risk} /> },
          ]} />
        </Card>
      </Col>
    </Row>
  </W>;
}

export default Overview;
