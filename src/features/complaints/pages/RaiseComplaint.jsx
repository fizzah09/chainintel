import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Note, SelectIn, Stack, Status, TextArea, TextIn, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

const PROBLEMS = ['Something is not working', 'Wrong or missing data', 'Slow or unclear', 'Other'];
const SCREENS = ['Dashboard', 'Wallet monitoring', 'Transaction tracing', 'Cases', 'Alerts', 'Reports', 'Users and roles', 'Bank settings', 'Other'];
const EMPTY = { problem: PROBLEMS[0], where: SCREENS[0], caseId: '', subject: '', details: '', shot: '' };

// Tenant admin (Bank Admin) and platform admins (Platform Admin, Super Admin) can raise a complaint.
export function RaiseComplaint() {
  const s = useStore(); const toast = useToast(); const nav = useNavigate();
  const [v, setV] = useState(EMPTY);
  const [err, setErr] = useState({});

  if (!['ba', 'pa', 'sa'].includes(s.session.role)) {
    return <>
      <Head title="Raise a complaint" />
      <Note k="bad" icon="alert">Only the Bank Admin, Platform Admin and Super Admin can raise a complaint.</Note>
    </>;
  }

  const mine = s.complaints.filter((c) => c.by === s.session.name);

  const submit = () => {
    const e = {};
    if (v.subject.trim().length < 5) e.subject = 'Enter a subject of at least 5 characters.';
    if (v.details.trim().length < 10) e.details = 'Describe the problem in at least 10 characters.';
    setErr(e);
    if (Object.keys(e).length) return;
    const id = act.raiseComplaint({ ...v, subject: v.subject.trim(), details: v.details.trim() });
    toast(`${id} submitted`);
    setV(EMPTY);
  };

  return <>
    <Head title="Raise a complaint" desc="Something not working? Tell the Chain Intel team. The Platform Admin will reply here and by email." />
    <Card title="New complaint" style={{ maxWidth: 760 }}>
      <Stack gap={14}>
        <SelectIn label="What is the problem?" value={v.problem} onChange={(x) => setV({ ...v, problem: x })} options={PROBLEMS} />
        <SelectIn label="Where did it happen?" value={v.where} onChange={(x) => setV({ ...v, where: x })} options={SCREENS} />
        <SelectIn label="Linked case (optional)" value={v.caseId} onChange={(x) => setV({ ...v, caseId: x })} options={[['', 'No linked case'], ...s.cases.map((c) => [c.id, `${c.id} · ${c.title}`])]} />
        <TextIn label="Subject" req value={v.subject} onChange={(x) => { setV({ ...v, subject: x }); setErr({}); }} err={err.subject} />
        <TextArea label="Details" req value={v.details} onChange={(x) => { setV({ ...v, details: x }); setErr({}); }} err={err.details} />
        <div className="fld">
          <label htmlFor="cp-shot">Screenshot (optional)</label>
          <input id="cp-shot" type="file" accept="image/*" onChange={(e) => setV({ ...v, shot: e.target.files?.[0]?.name || '' })} />
        </div>
      </Stack>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <Btn onClick={() => { setV(EMPTY); setErr({}); }}>Cancel</Btn>
        <Btn kind="pri" onClick={submit}>Submit complaint</Btn>
      </div>
    </Card>
    <Card title="My complaints">
      <DataTable tools={false} rows={mine} size={10} empty="You have not raised any complaints yet." cols={[
        { h: 'ID', render: (c) => <button className="link mono" onClick={() => { act.setCtx({ complaint: c.id }); nav(pathOf('ComplaintDetail')); }}>{c.id}</button> },
        { h: 'Subject', render: (c) => c.subject },
        { h: 'Status', render: (c) => <Status s={c.status} /> },
        { h: 'Updated', render: (c) => fd(c.updated) },
        { h: 'Reply', render: (c) => c.reply || '—' },
      ]} />
    </Card>
  </>;
}

export default RaiseComplaint;
