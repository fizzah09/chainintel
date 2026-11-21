import { useState } from 'react';
import { Btn, Card, Chip, DataTable, Head, Note, Row, TextIn, useToast } from '../../../components/ui';
import { useStore, act } from '../../../mocks/store';
import { ENGINE, CAT_NAME, MODEL_INFO, LABEL_SOURCES } from '../../../engine';

// SA-06: the global methodology. Publishing creates a new version and re-scores every wallet.
export function SaRisk() {
  const s = useStore(); const toast = useToast();
  const [pts, setPts] = useState({ ...ENGINE.points });
  const [decay, setDecay] = useState([...ENGINE.hopDecay]);
  const [t, setT] = useState([...s.cfg.thr]);
  const okT = Number(t[0]) < Number(t[1]) && Number(t[1]) < Number(t[2]) && Number(t[0]) > 0 && Number(t[2]) < 100;
  const okP = Object.values(pts).every((v) => Number(v) >= 0 && Number(v) <= 100);
  const okD = decay.every((v, i) => Number(v) >= 0 && Number(v) <= 1 && (i === 0 || Number(v) <= Number(decay[i - 1])));
  const publish = () => {
    act.saveCfg({ weights: s.cfg.weights, thr: t.map(Number), points: Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, Number(v)])), hopDecay: decay.map(Number) });
    toast(`Methodology v${s.cfg.version + 1} published. All wallets re-scored.`);
  };

  // Tier ranges from the thresholds being edited: Low below t[0], Moderate to t[1], High to t[2], Critical to 100.
  const tiers = [
    { name: 'Low', from: 0, to: t[0] },
    { name: 'Moderate', from: t[0], to: t[1] },
    { name: 'High', from: t[1], to: t[2] },
    { name: 'Critical', from: t[2], to: 100 },
  ];

  return <>
    <Head title="Risk engine" desc="Global methodology, weights and tier thresholds."
      acts={<Btn kind="pri" disabled={!okT || !okP || !okD} onClick={publish}>Publish methodology v{s.cfg.version + 1}</Btn>} />
    <Note k="warn" icon="alert">Points are the illustrative weights from the product spec. Set final values only after back-testing on reviewed cases; every change is versioned and audited.</Note>
    <div style={{ height: 14 }} />
    <Row>
      <Card title="Weights" sub="Maximum points per factor" style={{ flex: '1 1 420px' }}>
        {Object.keys(pts).map((k) => <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}><span style={{ flex: 1 }}>{CAT_NAME[k]}</span><input className="in" style={{ width: 90, minHeight: 34 }} type="number" min="0" max="100" aria-label={`Points ${CAT_NAME[k]}`} value={pts[k]} onChange={(e) => setPts({ ...pts, [k]: e.target.value })} /></div>)}
        {!okP && <Chip k="bad">Points must be between 0 and 100</Chip>}
        <div style={{ height: 8 }} />
        {decay.map((v, i) => <div key={i} style={{ marginBottom: 10 }}><TextIn label={i === 0 ? 'Direct (1 hop) multiplier' : `${i + 1} hops multiplier`} type="number" value={v} onChange={(x) => setDecay(decay.map((d, j) => (j === i ? x : d)))} /></div>)}
        {!okD && <Chip k="bad">Multipliers must be 0–1 and fall with distance</Chip>}
      </Card>
      <Card title="Tier thresholds" style={{ flex: '1 1 360px' }}>
        <DataTable tools={false} rows={tiers} cols={[
          { h: 'Tier', render: (r) => r.name },
          { h: 'From', render: (r) => (r.name === 'Low' ? '0' : r.name === 'Moderate' ? <input className="in" style={{ width: 80, minHeight: 32 }} type="number" aria-label="Moderate from" value={t[0]} onChange={(e) => setT(t.map((x, j) => (j === 0 ? e.target.value : x)))} /> : r.name === 'High' ? <input className="in" style={{ width: 80, minHeight: 32 }} type="number" aria-label="High from" value={t[1]} onChange={(e) => setT(t.map((x, j) => (j === 1 ? e.target.value : x)))} /> : <input className="in" style={{ width: 80, minHeight: 32 }} type="number" aria-label="Critical from" value={t[2]} onChange={(e) => setT(t.map((x, j) => (j === 2 ? e.target.value : x)))} />) },
          { h: 'To', render: (r) => (r.name === 'Critical' ? '100' : r.to) },
        ]} />
        {!okT && <div style={{ marginTop: 10 }}><Chip k="bad">Thresholds must increase and stay within 1–99</Chip></div>}
      </Card>
    </Row>
    <Row>
      <Card title="Predictive model" style={{ flex: '1 1 420px' }}>
        <div>{MODEL_INFO.name} · {MODEL_INFO.version}</div>
        <div className="mu sm">Test ROC AUC {MODEL_INFO.metrics.roc_auc} · PR AUC {MODEL_INFO.metrics.pr_auc} · 5-fold CV AUC {MODEL_INFO.metrics.cv_roc_auc} · {MODEL_INFO.metrics.rows.toLocaleString('en-US')} labelled accounts</div>
        <div className="mu sm" style={{ marginTop: 8 }}>Retrain with <span className="mono">ml/train_classifier.py</span>; the exported model replaces <span className="mono">src/engine/models/illicit-classifier.json</span>.</div>
      </Card>
      <Card title="Label sources" style={{ flex: '1 1 360px' }}>
        {LABEL_SOURCES.map((x) => <div key={x.name} style={{ marginBottom: 8 }}><b>{x.name}</b><div className="mu sm">{x.count.toLocaleString('en-US')} addresses</div></div>)}
      </Card>
    </Row>
  </>;
}

export default SaRisk;
