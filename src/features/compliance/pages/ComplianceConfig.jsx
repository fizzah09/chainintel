import { Btn, Card, Head, SetRow, TextIn, Toggle, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

export function CmConfig() {
  const s = useStore(); const toast = useToast(); const set = (k) => (v) => act.setting(k, v);
  return <><Head title="Case configuration" desc="Rules applied to every case in your workspace." acts={<Btn kind="pri" onClick={() => { act.saveSettings('case'); toast('Configuration saved'); }}>Save</Btn>} /><Card style={{ maxWidth: 760 }}>
    <SetRow title="Require review before closure" desc="Cases must pass Under Review"><Toggle on={s.settings.requireReview} onChange={set('requireReview')} label="Review" /></SetRow><SetRow title="Auto-assign new cases" desc="Round-robin across active investigators"><Toggle on={s.settings.autoAssign} onChange={set('autoAssign')} label="Auto" /></SetRow>
    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}><TextIn label="Review SLA (hours)" type="number" value={s.settings.reviewSla} onChange={(v) => act.setting('reviewSla', Number(v))} /><TextIn label="Critical score threshold" type="number" value={s.settings.critThr} onChange={(v) => act.setting('critThr', Number(v))} /></div></Card></>;
}

export default CmConfig;
