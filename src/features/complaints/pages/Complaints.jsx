import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Modal, Note, Prio, SelectIn, Stack, Status, TextArea, useToast } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

// Platform side of the bank complaints: Platform Admin and Super Admin reply and mark them.
export function Complaints() {
  const s = useStore(); const toast = useToast(); const nav = useNavigate();
  const [target, setTarget] = useState(null);
  const [status, setStatus] = useState('Resolved');
  const [reply, setReply] = useState('');
  const [err, setErr] = useState('');

  if (!['pa', 'sa'].includes(s.session.role)) {
    return <>
      <Head title="Complaints" />
      <Note k="bad" icon="alert">Only Platform Admins can view bank complaints.</Note>
    </>;
  }

  const open = (c) => { setTarget(c); setStatus(c.status === 'Resolved' ? 'Resolved' : 'In progress'); setReply(c.reply || ''); setErr(''); };
  const save = () => {
    if (!reply.trim()) return setErr('Write a reply before saving.');
    act.answerComplaint(target.id, status, reply.trim());
    toast(`${target.id} ${status.toLowerCase()}`);
    setTarget(null);
  };

  return <>
    <Head title="Complaints" desc="Complaints raised by bank admins. Reply here; the bank admin is notified." />
    <Card>
      <DataTable exportName="complaints" search="Search complaints" searchText={(c) => c.id + c.subject + c.by} rows={s.complaints} size={10} defaultSort={{ i: 6, d: -1 }} cols={[
        { h: 'ID', render: (c) => <button className="link mono" onClick={() => { act.setCtx({ complaint: c.id }); nav(pathOf('ComplaintDetail')); }}>{c.id}</button>, val: (c) => c.id },
        { h: 'Raised by', render: (c) => c.by, val: (c) => c.by },
        { h: 'Subject', render: (c) => c.subject, val: (c) => c.subject },
        { h: 'Priority', render: (c) => <Prio p={c.priority} />, val: (c) => c.priority },
        { h: 'Status', render: (c) => <Status s={c.status} />, val: (c) => c.status },
        { h: 'Handled by', render: (c) => c.handledBy || '—', val: (c) => c.handledBy },
        { h: 'Updated', render: (c) => fd(c.updated), val: (c) => c.updated },
        { h: '', render: (c) => <Btn sm kind="pri" onClick={() => open(c)}>Resolve</Btn> },
      ]} />
    </Card>
    <Modal open={!!target} title={`Reply to ${target?.id || ''}`} onClose={() => setTarget(null)} footer={<>
      <Btn onClick={() => setTarget(null)}>Cancel</Btn>
      <Btn kind="pri" onClick={save}>Save reply</Btn>
    </>}>
      {target && <>
        <p className="mu" style={{ marginTop: 0 }}>{target.subject} · raised by {target.by} on {fd(target.raisedAt)}</p>
        <Stack gap={14}>
          <SelectIn label="Status" value={status} onChange={setStatus} options={['In progress', 'Resolved']} />
          <TextArea label="Reply" req value={reply} onChange={(x) => { setReply(x); setErr(''); }} err={err} />
        </Stack>
      </>}
    </Modal>
  </>;
}

export default Complaints;
