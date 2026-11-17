import { Card, Dl, Head, Note, Row } from '../../../components/ui';
import { useStore } from '../../../mocks/store';
import { ENGINE, CAT_NAME, MODEL_INFO } from '../../../engine';

export function ErMethod() {
  const s = useStore();
  return <><Head title="Risk methodology" desc={`Version ${s.cfg.version} · read-only`} />
    <Row>
      <Card title="Logical score (rules)" style={{ flex: '1 1 440px' }}>
        <p style={{ marginTop: 0 }}>Score = sum of factor points, capped at 100. Exposure points = maximum × distance multiplier × amount factor, using the strongest path per category. Direct sanctions exposure is always Critical.</p>
        <Dl w={210} items={Object.entries(ENGINE.points).map(([k, v]) => [CAT_NAME[k], `up to ${v} points`])} />
        <p className="mu sm">Distance multipliers: {ENGINE.hopDecay.map((d, i) => `${i + 1} hop ×${d}`).join(', ')}. Amount factor: 0.4 to 1.0, full at ${ENGINE.fullAmountUsd.toLocaleString('en-US')}.</p>
      </Card>
      <Card title="Tiers" style={{ flex: '1 1 300px' }}><Dl w={110} items={[['Low', `0–${s.cfg.thr[0] - 1}`], ['Moderate', `${s.cfg.thr[0]}–${s.cfg.thr[1] - 1}`], ['High', `${s.cfg.thr[1]}–${s.cfg.thr[2] - 1}`], ['Critical', `${s.cfg.thr[2]}–100`]]} /></Card>
    </Row>
    <Row>
      <Card title="Predictive signals" style={{ flex: '1 1 440px' }}>
        <Dl w={170} items={[['Illicit probability', `Gradient-boosted trees, ${MODEL_INFO.metrics.rows.toLocaleString('en-US')} public labelled accounts, test ROC AUC ${MODEL_INFO.metrics.roc_auc}`], ['Anomaly detection', `Last ${ENGINE.recentDays} days vs ${ENGINE.baselineDays}-day baseline (median and MAD), plus pass-through, fan-out, dormancy and structuring patterns`], ['Trend forecast', 'Damped Holt trend on 12 weekly scores, 4 weeks ahead with a ~90% range']]} />
      </Card>
      <Card title="Governance" style={{ flex: '1 1 300px' }}><Note k="info" icon="help">The model never changes the rule score; it is reported beside it. Disagreement lowers confidence and calls for manual review.</Note></Card>
    </Row>
  </>;
}

export default ErMethod;
