import { useNavigate } from 'react-router-dom';
import { Addr, Btn, Card, Chip, Col, DataTable, Dl, Gauge, Kpis, Note, Row, Tier } from '../../../components/ui';
import { ForecastChart } from '../../../components/charts/ForecastChart';
import { W, useWallet } from '../shared';
import { useRiskReport } from '../useRiskReport';
import { ENGINE, MODEL_INFO } from '../../../engine';
import { CFG } from '../../../lib/risk';
import { csv, download, fd, sh } from '../../../lib/format';
import { act } from '../../../mocks/store';
import { pathOf } from '../../../app/config/paths';

const usd = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const pct = (v) => `${Math.round(v * 100)}%`;
const SEV = { Critical: 'bad', High: 'bad', Medium: 'warn', Low: 'gray' };
const num = (v) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString('en-US') : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(4));

export function Risk() {
  const [p] = useWallet();
  const nav = useNavigate();
  const { status, report: r, error } = useRiskReport(p.address);
  if (!r) return <W active="Risk Assessment"><Card><div className="mu">{status === 'loading' ? 'Fetching transactions and scoring this wallet…' : status === 'error' ? `Risk engine unavailable: ${error}` : 'No risk assessment exists for this wallet yet. The backend has no on-chain data for it.'}</div></Card></W>;

  const openTx = (h) => { act.setCtx({ tx: h, wallet: p.address }); nav(pathOf('TransactionDetail')); };
  const evidenceRows = r.factors.flatMap((f) => f.evidence.map((e, i) => ({ ...e, factor: f.name, key: f.id + i })));
  const f = r.forecast;
  const exportJson = () => download(`risk-report-${sh(p.address)}.json`, JSON.stringify({ ...r, recentTxs: undefined }, null, 2), 'application/json');
  const exportCsv = () => download(`risk-factors-${sh(p.address)}.csv`, csv(['Factor', 'Points', 'Max', 'Severity', 'Calculation', 'Summary'], r.factors.map((x) => [x.name, x.points, x.max, x.severity, x.calc, x.summary])));

  return (
    <W active="Risk Assessment">

      <Kpis items={[
        ['Risk score (rules)', `${r.score} / 100`, r.tierName, r.tier],
        ['Confidence', `${r.confidence.value}%`, r.confidence.label],
        ['Illicit probability (model)', pct(r.ml.probability), `${r.ml.band} · AUC ${r.ml.model.rocAuc}`, r.ml.probability >= 0.7 ? 'crit' : r.ml.probability >= 0.4 ? 'high' : undefined],
        ['Anomaly', r.behaviour.level, `${r.behaviour.signals.length} signal${r.behaviour.signals.length === 1 ? '' : 's'}`, r.behaviour.level === 'High' ? 'high' : r.behaviour.level === 'Medium' ? 'mod' : undefined],
        ['30-day outlook', f ? `${f.projected30}` : '—', f ? `${f.trend} · ${pct(f.chanceHigh)} chance of High` : ''],
      ]} />

      <Row>
        <Col flex="2 1 560px">
          <Card title="Score explanation" sub="Logical score: each factor's points, how they were calculated, and the cap per factor" act={<><Btn sm icon="dl" onClick={exportCsv}>CSV</Btn><Btn sm icon="dl" onClick={exportJson}>Full report</Btn></>}>
            {r.factors.length === 0 && <div className="mu">No risk factors found. The wallet has no labelled risky exposure or unusual behaviour in the analysed history.</div>}
            {r.factors.map((x) => (
              <div key={x.id} style={{ padding: '12px 0', borderBottom: '1px solid #EDF1F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <div><b>{x.name}</b> <Chip k={SEV[x.severity]}>{x.severity}</Chip></div>
                  <b style={{ fontSize: 16 }}>+{x.points}</b>
                </div>
                <div className="bar" style={{ margin: '8px 0 6px' }}><i style={{ width: `${(x.points / x.max) * 100}%`, background: x.severity === 'Critical' || x.severity === 'High' ? 'var(--crit)' : 'var(--mod)' }} /></div>
                <div className="sm">{x.summary}</div>
                <div className="mu sm mono" style={{ whiteSpace: 'normal' }}>{x.calc}</div>
              </div>
            ))}
            {r.floor && <div style={{ marginTop: 12 }}><Note k="bad" icon="shield">{r.floor}</Note></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}><b>Total (capped at 100)</b><b style={{ fontSize: 18 }}>{r.score}</b></div>
          </Card>
        </Col>
        <Col flex="1 1 320px">
          <Card title="Overall risk"><div style={{ display: 'flex', justifyContent: 'center' }}><Gauge score={r.score} size={210} /></div><div style={{ textAlign: 'center' }}><Tier score={r.score} /></div><div className="mu sm" style={{ textAlign: 'center', marginTop: 10 }}>Methodology v{ENGINE.version} · {r.factors.length} factor{r.factors.length === 1 ? '' : 's'} · Computed {fd(r.asOf)}</div></Card><Card title="Tier thresholds"><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#16A34A', marginRight: 8 }} />Low: 0–{CFG.thr[0] - 1}</span><span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#F59E0B', marginRight: 8 }} />Moderate: {CFG.thr[0]}–{CFG.thr[1] - 1}</span><span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#EA580C', marginRight: 8 }} />High: {CFG.thr[1]}–{CFG.thr[2] - 1}</span><span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#DC2626', marginRight: 8 }} />Critical: {CFG.thr[2]}–100</span></div><div className="hint" style={{ marginTop: 10 }}>Thresholds are set by Super Admin in the risk engine.</div></Card>
          <Card title="Entity" sub="What the wallet is, kept separate from how risky it is">
            <Dl w={110} items={[['Type', r.entity.label], ['Category', r.entity.type], ['Confidence', r.entity.confidence ? pct(r.entity.confidence) : 'Not attributed'], ['Source', r.entity.source]]} />
          </Card>
        </Col>
      </Row>

      <Card title="Contributing evidence" sub="Score → factor → transaction → address → source">
        <DataTable exportName={`evidence-${sh(p.address)}`} size={8} rows={evidenceRows} cols={[
          { h: 'Factor', render: (e) => e.factor },
          { h: 'Counterparty / signal', render: (e) => (e.counterparty ? <Addr a={e.counterparty} /> : e.signal) },
          { h: 'Relationship', render: (e) => e.relationship || e.detail || '—' },
          { h: 'Amount', render: (e) => (e.usd != null ? usd(e.usd) : '—'), val: (e) => e.usd || 0 },
          { h: 'First seen', render: (e) => (e.firstObserved ? fd(e.firstObserved) : '—') },
          { h: 'Transactions', render: (e) => (e.txs || []).slice(0, 2).map((h) => <button key={h} className="link mono" style={{ marginRight: 6 }} onClick={() => openTx(h)}>{sh(h)}</button>) },
          { h: 'Source', render: (e) => e.source || '—' },
        ]} />
      </Card>

      <Row>
        <Card title="Exposure" sub="Direct counterparties and indirect paths up to 3 hops" style={{ flex: '1 1 460px' }}>
          {r.exposure.length ? <DataTable tools={false} size={6} rows={r.exposure} cols={[
            { h: 'Category', render: (e) => <Chip k={e.cat === 'sanctions' ? 'bad' : 'warn'}>{e.cat}</Chip> },
            { h: 'Relationship', render: (e) => e.relationship },
            { h: 'Exposure', render: (e) => usd(e.usd), val: (e) => e.usd },
            { h: 'Direction', render: (e) => e.direction },
            { h: 'Path', render: (e) => <span className="mono" style={{ whiteSpace: 'normal' }}>{e.path.map((x) => sh(x)).join(' → ')}</span> },
          ]} /> : <div className="mu">No exposure to sanctioned, mixer, scam or ransomware addresses within 3 hops.</div>}
          <div className="mu sm" style={{ marginTop: 10 }}>Amount on an indirect path is the smallest total between consecutive wallets, so it never overstates what could have flowed. Points decay by distance: {ENGINE.hopDecay.map((d, i) => `${i + 1} hop ×${d}`).join(', ')}.</div>
        </Card>
        <Card title="Behaviour vs baseline" sub={`Last ${r.behaviour.windows.recentDays} days against the previous ${r.behaviour.windows.baselineDays}`} style={{ flex: '1 1 420px' }}>
          <DataTable tools={false} rows={r.behaviour.metrics} cols={[
            { h: 'Metric', render: (m) => m.metric },
            { h: 'Baseline (median)', render: (m) => (m.unit === 'USD' ? usd(m.baseline) : m.baseline.toFixed(1)) },
            { h: 'Recent (avg)', render: (m) => (m.unit === 'USD' ? usd(m.recent) : m.recent.toFixed(1)) },
            { h: 'Ratio', render: (m) => <b style={{ color: m.ratio >= 3 ? 'var(--crit)' : undefined }}>{m.ratio.toFixed(1)}x</b> },
          ]} />
          <div style={{ marginTop: 12 }}>{r.behaviour.signals.length ? r.behaviour.signals.map((s) => <div key={s.title} className="ev" style={{ marginBottom: 8 }}><b>{s.title}</b> <Chip k={SEV[s.severity]}>{s.severity}</Chip><div className="mu sm">{s.detail}</div></div>) : <div className="mu">No unusual behaviour detected.</div>}</div>
        </Card>
      </Row>

      <Row>
        <Card title="Predictive model" sub="Probability this wallet behaves like known scam/fraud accounts" style={{ flex: '1 1 480px' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'baseline', flexWrap: 'wrap' }}><span className="serif" style={{ fontSize: 40 }}>{pct(r.ml.probability)}</span><Chip k={r.ml.probability >= 0.7 ? 'bad' : r.ml.probability >= 0.4 ? 'warn' : 'gray'}>{r.ml.band}</Chip><span className="mu sm">Gradient-boosted trees, {r.ml.model.trainedRows.toLocaleString('en-US')} labelled accounts, test ROC AUC {r.ml.model.rocAuc}</span></div>
          <div style={{ marginTop: 12 }}>
            <DataTable tools={false} size={6} rows={r.ml.reasons.slice(0, 6)} cols={[
              { h: 'Feature', render: (x) => x.label },
              { h: 'This wallet', render: (x) => num(x.value) },
              { h: 'Typical scam', render: (x) => num(x.typicalIllicit) },
              { h: 'Typical normal', render: (x) => num(x.typicalLicit) },
              { h: 'Pushes toward', render: (x) => <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: x.impact > 0 ? 'var(--crit)' : 'var(--low)' }}>{x.impact > 0 ? '▲ scam' : '▼ normal'} <span className="mono">{x.impact > 0 ? '+' : ''}{x.impact.toFixed(2)}</span></span> },
            ]} />
          </div>
          <div style={{ marginTop: 10 }}><Note k="info" icon="help">The model estimate sits beside the rule score and never changes it. Where they disagree, confidence drops and the wallet should be reviewed by hand. {MODEL_INFO.notes}</Note></div>
        </Card>
        <Card title="Risk trend forecast" sub={f ? f.method : ''} style={{ flex: '1 1 480px' }}>
          {f && f.forecast.length ? <>
            <ForecastChart history={f.history} forecast={f.forecast} tiers={ENGINE.tiers} />
            <div className="legend" style={{ marginTop: 6 }}><span><i style={{ background: '#0F172A' }} />Weekly score</span><span><i style={{ background: '#1769E0' }} />Forecast, shaded ~90% range</span></div>
            <Dl w={190} items={[['Trend', f.trend], ['Projected in ~30 days', `${f.projected30} (range ${f.forecast.at(-1).lo}–${f.forecast.at(-1).hi})`], ['Chance of reaching High', pct(f.chanceHigh)]]} />
          </> : <div className="mu">Not enough history to forecast.</div>}
        </Card>
      </Row>

      <Row>
        <Card title="Confidence" sub={`${r.confidence.value}% · ${r.confidence.label}: how strongly the evidence supports the score`} style={{ flex: '1 1 420px' }}>
          <DataTable tools={false} rows={r.confidence.parts} cols={[{ h: 'Part', render: (x) => x.name }, { h: 'Value', render: (x) => `${x.value}%` }, { h: 'Why', render: (x) => x.note }]} />
        </Card>
        <Card title="Wallet profile (facts only)" sub="Collected before any scoring" style={{ flex: '1 1 420px' }}>
          <Dl w={170} items={[['Transactions analysed', r.facts.transactions.toLocaleString('en-US')], ['First seen', r.facts.firstSeen ? fd(r.facts.firstSeen) : '—'], ['Last active', r.facts.lastActive ? fd(r.facts.lastActive) : '—'], ['Total inflow', usd(r.facts.inflowUsd)], ['Total outflow', usd(r.facts.outflowUsd)], ['Unique counterparties', r.facts.counterparties], ['Average transaction', usd(r.facts.avgTxUsd)], ['Largest transaction', usd(r.facts.largestTxUsd)], ['Transactions per day', r.facts.txPerDay.toFixed(1)]]} />
        </Card>
      </Row>
      <Card title="Methodology and limitations"><Note k="info" icon="help">Rule points are illustrative until back-tested on reviewed cases (Super Admin → Risk engine). Labels come from public lists and workspace labels and may be incomplete. Indirect exposure uses up to 3 hops on available data. Scores and probabilities support decisions; they are not legal conclusions.</Note></Card>
    </W>
  );
}

export default Risk;
