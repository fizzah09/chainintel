import { Btn, Card, Head, SelectIn, SetRow, TextIn, Toggle, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

// SA-09: global defaults for every tenant. Schedule maintenance and discard are not in this release.
export function SuperSettings() {
  const s = useStore(); const toast = useToast(); const st = s.settings;
  const set = (k) => (v) => act.setting(k, v);
  const save = () => { act.saveSettings('platform'); toast('Settings saved'); };

  return <>
    <Head title="Platform settings" desc="Global defaults for every tenant." acts={<Btn kind="pri" onClick={save}>Save changes</Btn>} />
    <Card title="General" style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectIn label="Data retention" value={st.retention} onChange={set('retention')} options={['3 years', '5 years', '7 years', '10 years']} />
        <SelectIn label="Default time zone" value={st.tz} onChange={set('tz')} options={['UTC+00:00', 'UTC+05:00', 'UTC+01:00', 'UTC-05:00']} />
      </div>
    </Card>
    <Card title="Platform controls" style={{ maxWidth: 780 }}>
      <SetRow title="Maintenance mode" desc="Shows a banner to all users"><Toggle on={st.maintenance} onChange={set('maintenance')} label="Maintenance" /></SetRow>
      <SetRow title="Self-registration"><Toggle on={st.selfReg} onChange={set('selfReg')} label="Self reg" /></SetRow>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <TextIn label="Error alert threshold (%)" type="number" value={st.errAlert} onChange={(v) => act.setting('errAlert', Number(v))} />
        <TextIn label="Queue alert depth" type="number" value={st.queueAlert} onChange={(v) => act.setting('queueAlert', Number(v))} />
      </div>
    </Card>
  </>;
}

export default SuperSettings;
