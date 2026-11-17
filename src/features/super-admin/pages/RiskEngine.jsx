import { useState } from 'react';
import { Btn, Card, Chip, Head, Note, Row, TextIn, useToast } from '../../../components/ui';
import { useStore, act } from '../../../mocks/store';
import { ENGINE, CAT_NAME, MODEL_INFO, LABEL_SOURCES } from '../../../engine';

/** Rule points, distance decay and tier thresholds of the logical score. Publishing creates a new version. */
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
  return <>
    <Head title="Risk engine" desc={`Logical scoring rules, version ${s.cfg.version}. Publishing re-scores every wallet with the new settings.`} acts={<Btn kind="pri" disabled={!okT || !okP || !okD} onClick={publish}>Publish v{s.cfg.version + 1}</Btn>} />
    <Note k="warn" icon="alert">Points are the illustrative weights from the product spec. Set final values only after back-testing on reviewed cases; every change is versioned and audited.</Note>
    <Row>
      <Card title="Factor points (maximum per factor)" style={{ flex: '1 1 420px' }}>
        {Object.keys(pts).map((k) => <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}><span style={{ flex: 1 }}>{CAT_NAME[k]}</span><input className="in" style={{ width: 90, minHeight: 34 }} type="number" min="0" max="100" aria-label={`Points ${CAT_NAME[k]}`} value={pts[k]} onChange={(e) => setPts({ ...pts, [k]: e.target.value })} /></div>)}
        {!okP && <Chip k="bad">Points must be between 0 and 100</Chip>}
      </Card>
      <Card title="Distance decay and tiers" style={{ flex: '1 1 360px' }}>
        {decay.map((v, i) => <div key={i} style={{ marginBottom: 10 }}><TextIn label={i === 0 ? 'Direct (1 hop) multiplier' : `${i + 1} hops multiplier`} type="number" value={v} onChange={(x) => setDecay(decay.map((d, j) => (j === i ? x : d)))} /></div>)}
        {!okD && <Chip k="bad">Multipliers must be 0–1 and fall with distance</Chip>}
        <div style={{ height: 8 }} />
        {['Moderate from', 'High from', 'Critical from'].map((l, i) => <div key={l} style={{ marginBottom: 10 }}><TextIn label={l} type="number" value={t[i]} onChange={(v) => setT(t.map((x, j) => (j === i ? v : x)))} /></div>)}
        {!okT && <Chip k="bad">Thresholds must increase and stay within 1–99</Chip>}
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
