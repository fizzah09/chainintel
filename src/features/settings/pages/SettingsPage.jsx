import { Btn, Card, Head, SelectIn, SetRow, TextIn, Toggle, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

export function Settings({ scope }) {
  const s = useStore(); const toast = useToast(); const st = s.settings; const set = (k) => (v) => act.setting(k, v); const sec = scope === 'security'; const plat = scope === 'platform';
  return <><Head title={sec ? 'Security settings' : plat ? 'Platform settings' : 'Settings'} acts={<Btn kind="pri" onClick={() => { act.saveSettings(scope || 'general'); toast('Settings saved'); }}>Save changes</Btn>} />
    <Card style={{ maxWidth: 780 }}>{sec || plat ? <>
      <SetRow title="Require MFA for all users"><Toggle on={st.mfaRequired} onChange={set('mfaRequired')} label="MFA" /></SetRow><SetRow title="Restrict by IP allow-list"><Toggle on={st.ipAllow} onChange={set('ipAllow')} label="IP" /></SetRow><SetRow title="Single sign-on (SSO)"><Toggle on={st.sso} onChange={set('sso')} label="SSO" /></SetRow><SetRow title="Lock account after repeated failures"><Toggle on={st.lockFails} onChange={set('lockFails')} label="Lock" /></SetRow>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}><TextIn label="Session timeout (min)" type="number" value={st.timeout} onChange={(v) => act.setting('timeout', Number(v))} /><SelectIn label="Password policy" value={st.pwPolicy} onChange={set('pwPolicy')} options={['Standard', 'Strong']} /></div>
      {plat && <><div style={{ height: 8 }} /><SetRow title="Maintenance mode" desc="Shows a banner to all users"><Toggle on={st.maintenance} onChange={set('maintenance')} label="Maintenance" /></SetRow><SetRow title="Self-registration"><Toggle on={st.selfReg} onChange={set('selfReg')} label="Self reg" /></SetRow><div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}><TextIn label="Error alert threshold (%)" type="number" value={st.errAlert} onChange={(v) => act.setting('errAlert', Number(v))} /><TextIn label="Queue alert depth" type="number" value={st.queueAlert} onChange={(v) => act.setting('queueAlert', Number(v))} /></div></>}</> : <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}><TextIn label="Organisation name" value={st.orgName} onChange={set('orgName')} /><SelectIn label="Time zone" value={st.tz} onChange={set('tz')} options={['UTC+00:00', 'UTC+05:00', 'UTC+01:00', 'UTC-05:00']} /></div>
      <SetRow title="Show organisation branding"><Toggle on={st.branding} onChange={set('branding')} label="Branding" /></SetRow><SelectIn label="Data retention" value={st.retention} onChange={set('retention')} options={['3 years', '5 years', '7 years', '10 years']} />
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}><TextIn label="Default trace hops" type="number" value={st.traceHops} onChange={(v) => act.setting('traceHops', Math.min(3, Number(v)))} hint="Max 3 in this release" /><TextIn label="Max nodes" type="number" value={st.traceNodes} onChange={(v) => act.setting('traceNodes', Math.min(100, Number(v)))} hint="Max 100" /></div></>}</Card></>;
}

export default Settings;
