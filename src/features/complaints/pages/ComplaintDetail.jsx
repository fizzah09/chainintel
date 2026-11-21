import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Dl, Head, Note, Prio, Status, TextArea, useToast } from '../../../components/ui';
import { fd, fdt } from '../../../lib/format';
import { ROLE_NAMES } from '../../../mocks/seed';
import { act, useStore } from '../../../mocks/store';

// One complaint: details, the conversation between Bank Admin and Platform Admin, and the linked case's communication.
export function ComplaintDetail() {
  const s = useStore(); const toast = useToast(); const nav = useNavigate();
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const c = s.complaints.find((x) => x.id === s.ctx.complaint);
  const isPlatform = ['pa', 'sa'].includes(s.session.role);
  const canSee = c && (isPlatform || (s.session.role === 'ba' && c.by === s.session.name));

  if (!c || !canSee) {
    return <>
      <Head title="Complaint" />
      <Note k="bad" icon="alert">This complaint is not available to your account.</Note>
    </>;
  }

  const posted = c.thread || [];
  const seededReply = c.reply && !posted.some((m) => m.text === c.reply)
    ? [{ by: c.handledBy || 'Platform Admin', role: 'pa', at: c.updated, text: c.reply }]
    : [];
  const thread = [
    { by: c.by, role: 'ba', at: c.raisedAt, text: c.details },
    ...seededReply,
    ...posted,
  ];
  const linked = c.caseId ? s.cases.find((x) => x.id === c.caseId) : null;
  const comms = c.caseId ? s.comms.filter((m) => m.caseId === c.caseId) : [];

  const send = () => {
    if (text.trim().length < 2) return setErr('Write a message first.');
    act.postComplaintMessage(c.id, text.trim());
    setText('');
    setErr('');
    toast('Message sent');
  };

  return <>
    <Head title={c.id} desc={c.subject}
      badge={<Status s={c.status} />}
      acts={<Btn icon="left" onClick={() => nav(pathOf(isPlatform ? 'Complaints' : 'RaiseComplaint'))}>Back to complaints</Btn>} />

    <Card title="Details">
      <Dl w={150} items={[
        ['Raised by', c.by],
        ['Raised', fdt(c.raisedAt) + ' UTC'],
        ['Problem', c.problem],
        ['Where', c.where],
        ['Priority', <Prio p={c.priority} key="p" />],
        ['Linked case', linked ? <button key="l" className="link mono" onClick={() => { act.setCtx({ caseId: linked.id }); nav(pathOf('CaseDetails')); }}>{linked.id} · {linked.title}</button> : 'None'],
        ['Screenshot', c.shot || 'None'],
        ['Handled by', c.handledBy || '—'],
      ]} />
    </Card>

    <Card title="Conversation" sub="Replies from the Platform Admin and messages from the Bank Admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {thread.map((m, i) => (
          <div key={i} className="ev" style={{ alignSelf: m.role === 'ba' ? 'flex-start' : 'flex-end', maxWidth: '75%' }}>
            <div className="mu sm">{m.by} · {ROLE_NAMES[m.role] || m.role} · {fdt(m.at)}</div>
            <div style={{ marginTop: 4 }}>{m.text}</div>
          </div>
        ))}
      </div>
      <TextArea label="Message" value={text} onChange={(x) => { setText(x); setErr(''); }} err={err} placeholder="Write a reply or follow-up" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Btn kind="pri" onClick={send}>Send message</Btn>
      </div>
    </Card>

    <Card title="Case communication" sub={linked ? `Messages sent for ${linked.id}` : 'No case is linked to this complaint'}>
      {linked
        ? <DataTable tools={false} rows={comms} size={10} empty="No communication recorded for this case yet." cols={[
            { h: 'Recipient', render: (x) => x.to },
            { h: 'Subject', render: (x) => x.subject },
            { h: 'Direction', render: (x) => x.dir },
            { h: 'Date', render: (x) => fd(x.date) },
            { h: 'Status', render: (x) => <Status s={x.status} /> },
          ]} />
        : <div className="mu">Link a case to see its communication here.</div>}
    </Card>
  </>;
}

export default ComplaintDetail;
