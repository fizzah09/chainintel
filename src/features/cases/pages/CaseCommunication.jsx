import { useState } from 'react';
import { Btn, Card, DataTable, Modal, SelectIn, Stack, Status, TextArea, TextIn, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { fd } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function CComms() {
  const [c, s] = useCase(); const toast = useToast(); const [m, setM] = useState(false); const [v, setV] = useState({}); const [err, setErr] = useState('');
  const rows = s.comms.filter((x) => x.caseId === c.id);
  return <CW active="Communication"><Card title="External communication" act={<Btn kind="pri" sm icon="mail" disabled={!can(s, 'create_case')} onClick={() => { setV({ to: 'Customer relations' }); setErr(''); setM(true); }}>New message</Btn>}>
    <DataTable tools={false} rows={rows} cols={[{ h: 'Recipient', render: (x) => x.to }, { h: 'Subject', render: (x) => x.subject }, { h: 'Direction', render: (x) => x.dir }, { h: 'Date', render: (x) => fd(x.date) }, { h: 'Status', render: (x) => <Status s={x.status} /> }, { h: '', render: (x) => x.status === 'Awaiting Response' && <Btn sm onClick={() => act.commStatus(x.id, 'Response Received')}>Mark replied</Btn> }]} /></Card>
    <Modal open={m} title="New message" onClose={() => setM(false)} footer={<><Btn onClick={() => setM(false)}>Cancel</Btn><Btn kind="pri" icon="send" onClick={() => { if (!(v.subject || '').trim()) return setErr('Subject is required.'); act.addComm({ caseId: c.id, to: v.to, subject: v.subject.trim(), body: v.body || '', status: 'Awaiting Response' }); toast('Message sent'); setM(false); }}>Send</Btn></>}><Stack gap={14}><SelectIn label="Recipient" value={v.to} onChange={(x) => setV({ ...v, to: x })} options={['Customer relations', 'Exchange compliance', 'Law enforcement liaison', 'Legal']} /><TextIn label="Subject" req value={v.subject} onChange={(x) => setV({ ...v, subject: x })} err={err} /><TextArea label="Message" value={v.body} onChange={(x) => setV({ ...v, body: x })} /></Stack></Modal></CW>;
}

export default CComms;
