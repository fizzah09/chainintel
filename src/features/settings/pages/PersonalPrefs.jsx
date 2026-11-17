import { useState } from 'react';
import { Btn, Card, Head, Row, SelectIn, SetRow, TextIn, Toggle, useToast } from '../../../components/ui';
import { Notifications } from '../../notifications/pages/NotificationCenter';
import { Profile } from './ProfilePage';
import { act, useStore } from '../../../mocks/store';

export function Prefs() {
  const s = useStore(); const toast = useToast(); const [sec, setSec] = useState('Profile'); const [name, setName] = useState(s.session.name);
  return <><Head title="Personal preferences" desc="Settings that apply only to your account." />
    <Row gap={20}><div className="snav card" style={{ padding: 8, flex: '0 0 240px' }}>{['Profile', 'Notifications', 'Display', 'Security', 'Sessions'].map((t) => <a key={t} href="#" className={sec === t ? 'on' : ''} onClick={(e) => { e.preventDefault(); setSec(t); }}>{t}</a>)}</div>
      <Card title={sec} style={{ flex: '1 1 560px' }}>
        {sec === 'Profile' && <><div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}><TextIn label="Full name" value={name} onChange={setName} /><TextIn label="Work email" value={s.session.email || ''} disabled onChange={() => {}} /></div><div style={{ height: 14 }} /><div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}><SelectIn label="Language" value={s.prefs.lang} onChange={(v) => act.pref('lang', v)} options={['English', 'Urdu']} /><SelectIn label="Time zone" value={s.prefs.tz} onChange={(v) => act.pref('tz', v)} options={['UTC+05:00 Karachi', 'UTC+00:00 London', 'UTC+04:00 Dubai']} /></div></>}
        {sec === 'Notifications' && <><SetRow title="Email notifications" desc="Alerts, assignments and review requests"><Toggle on={s.prefs.email} onChange={(v) => act.pref('email', v)} label="Email notifications" /></SetRow><SetRow title="In-app notifications" desc="Show in the notification centre"><Toggle on onChange={() => {}} label="In-app" /></SetRow></>}
        {sec === 'Display' && <SetRow title="Compact tables" desc="Show more rows per page"><Toggle on={false} onChange={() => toast('Saved')} label="Compact" /></SetRow>}
        {sec === 'Security' && <SetRow title="Two-step verification" desc="Authenticator app enrolled"><Toggle on={s.prefs.mfa} onChange={(v) => act.pref('mfa', v)} label="MFA" /></SetRow>}
        {sec === 'Sessions' && <div className="dl"><span className="t">This device</span><span>Chrome · Karachi · active now</span><span className="t">Last sign-in</span><span>02 Nov 2026 09:02 UTC</span></div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}><Btn onClick={() => setName(s.session.name)}>Cancel</Btn><Btn kind="pri" onClick={() => { act.saveSettings('personal'); toast('Preferences saved'); }}>Save changes</Btn></div></Card></Row></>;
}

export default Prefs;
