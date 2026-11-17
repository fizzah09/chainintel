import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Modal, Note, SelectIn, Status, useToast } from '../../../components/ui';
import { Risk } from './RiskTab';
import { W, useWallet } from '../shared';
import { fd, sh } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function WEvidence() {
  const nav = useNavigate();
  const [p, s] = useWallet(); const toast = useToast(); const [m, setM] = useState(false);
  const cases = s.cases.filter((c) => c.subjects.some((x) => x.ref.toLowerCase() === p.address.toLowerCase()));
  const ev = s.evidence.filter((e) => cases.some((c) => c.id === e.caseId));
  const [cid, setCid] = useState(cases[0]?.id);
  return <W active="Evidence"><Card title="Evidence linked to this wallet" act={<Btn kind="pri" sm icon="plus" disabled={!cases.length || !can(s, 'create_case')} onClick={() => setM(true)}>Save risk snapshot</Btn>}>
    <DataTable exportName="evidence" search="Search evidence" searchText={(e) => e.id + e.title} rows={ev} filters={[{ label: 'Status', options: ['Verified', 'Pending Verification', 'Unverified', 'Source Unavailable'], test: (e, v) => e.status === v }]} cols={[{ h: 'Evidence ID', render: (e) => <button className="link" onClick={() => { act.setCtx({ evidence: e.id }); nav(pathOf('EvidenceDetail')); }}>{e.id}</button>, val: (e) => e.id }, { h: 'Title', render: (e) => e.title }, { h: 'Type', render: (e) => e.type }, { h: 'Added by', render: (e) => e.by }, { h: 'Date', render: (e) => fd(e.date), val: (e) => e.date }, { h: 'Status', render: (e) => <Status s={e.status} /> }]} />
    {!cases.length && <Note k="gray" icon="help">This wallet is not part of any case yet. Create a case to attach evidence.</Note>}</Card>
    <Modal open={m} title="Save risk snapshot as evidence" onClose={() => setM(false)} footer={<><Btn onClick={() => setM(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { const id = act.addEvidence({ caseId: cid, title: `Risk snapshot ${sh(p.address)} score ${p.score}`, type: 'Risk snapshot', content: JSON.stringify(p.c) }); toast(`${id} added to ${cid}`); setM(false); }}>Save</Btn></>}><SelectIn label="Case" value={cid} onChange={setCid} options={cases.map((c) => [c.id, `${c.id} · ${c.title}`])} /></Modal></W>;
}

export default WEvidence;
