import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Head, SelectIn, Stack, TextIn, useToast } from '../../../components/ui';
import { ROLE_OPTS } from '../shared';
import { isEmail } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function BaInvite() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();
  const [v, setV] = useState({ name: '', email: '', role: 'inv', team: s.teams[0]?.name });
  const [err, setErr] = useState({});

  const send = () => {
    const e = {};
    if (!v.name.trim()) e.name = 'Enter a name.';
    if (!isEmail(v.email)) e.email = 'Enter a valid email address.';
    else if (s.users.some((u) => u.email.toLowerCase() === v.email.trim().toLowerCase())) e.email = 'This email already has an account.';
    setErr(e);
    if (Object.keys(e).length) return;
    const r = act.invite({ name: v.name.trim(), email: v.email.trim(), role: v.role, team: v.team });
    if (r && r.ok === false) return setErr({ email: r.error });
    toast('Invitation sent');
    nav(pathOf('BA_Users'));
  };

  return <>
    <Head title="Invite user" desc="The user gets an email link to set a password, then signs in with OTP." />
    <Card style={{ maxWidth: 680 }}>
      <Stack gap={14}>
        <TextIn label="Full name" req value={v.name} onChange={(x) => setV({ ...v, name: x })} err={err.name} />
        <TextIn label="Work email" req value={v.email} onChange={(x) => setV({ ...v, email: x })} err={err.email} />
        <SelectIn label="Role" value={v.role} onChange={(x) => setV({ ...v, role: x })} options={ROLE_OPTS.map(([k, n]) => [k, n])} />
        <SelectIn label="Team" value={v.team} onChange={(x) => setV({ ...v, team: x })} options={s.teams.map((t) => t.name)} />
      </Stack>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Btn onClick={() => nav(pathOf('BA_Users'))}>Cancel</Btn>
        <Btn kind="pri" icon="send" onClick={send}>Send invitation</Btn>
      </div>
    </Card>
  </>;
}

export default BaInvite;
