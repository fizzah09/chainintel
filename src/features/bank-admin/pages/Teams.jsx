import { useState } from 'react';
import { Btn, Card, DataTable, Head, Modal, Person, SelectIn, Stack, TextIn, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function BaTeams() {
  const s = useStore(); const toast = useToast(); const [m, setM] = useState(false); const [v, setV] = useState({}); const [err, setErr] = useState('');
  return <><Head title="Teams" acts={<Btn kind="pri" icon="plus" onClick={() => { setV({ lead: s.users[0].name }); setErr(''); setM(true); }}>New team</Btn>} /><Card><DataTable tools={false} rows={s.teams} cols={[{ h: 'Team', render: (t) => <b>{t.name}</b> }, { h: 'Lead', render: (t) => <Person n={t.lead} /> }, { h: 'Members', render: (t) => s.users.filter((u) => u.team === t.name).length || t.members }, { h: 'Open cases', render: (t) => t.cases }, { h: 'Created', render: (t) => fd(t.created) }]} /></Card>
    <Modal open={m} title="New team" onClose={() => setM(false)} footer={<><Btn onClick={() => setM(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { const n = (v.name || '').trim(); if (!n) return setErr('Enter a team name.'); if (s.teams.some((t) => t.name.toLowerCase() === n.toLowerCase())) return setErr('Team already exists.'); act.createTeam({ name: n, lead: v.lead }); toast('Team created'); setM(false); }}>Create</Btn></>}><Stack gap={14}><TextIn label="Team name" req value={v.name} onChange={(x) => setV({ ...v, name: x })} err={err} /><SelectIn label="Lead" value={v.lead} onChange={(x) => setV({ ...v, lead: x })} options={s.users.filter((u) => u.status === 'Active').map((u) => u.name)} /></Stack></Modal></>;
}

export default BaTeams;
