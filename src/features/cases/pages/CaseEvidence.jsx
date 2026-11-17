import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Status, useToast } from '../../../components/ui';
import { CW, useCase } from '../shared';
import { act, can } from '../../../mocks/store';

export function CEvidence() {
  const [c, s] = useCase(); const nav = useNavigate(); const toast = useToast(); const ev = s.evidence.filter((e) => e.caseId === c.id); const vf = can(s, 'verify_evidence');
  return <CW active="Evidence"><Card title="Evidence register" act={<><Btn sm icon="upload" to={pathOf('EvidenceUpload')} disabled={!can(s, 'create_case')}>Upload</Btn><Btn kind="pri" sm icon="plus" to={pathOf('EvidenceUpload')} disabled={!can(s, 'create_case')}>Add from system</Btn></>}>
    <DataTable exportName="evidence" search="Search evidence" searchText={(e) => e.id + e.title} rows={ev} filters={[{ label: 'Status', options: ['Verified', 'Pending Verification', 'Unverified', 'Source Unavailable', 'Rejected'], test: (e, v) => e.status === v }]}
      cols={[{ h: 'Evidence ID', render: (e) => <button className="link" onClick={() => { act.setCtx({ evidence: e.id }); nav(pathOf('EvidenceDetail')); }}>{e.id}</button>, val: (e) => e.id }, { h: 'Title', render: (e) => e.title }, { h: 'Type', render: (e) => e.type }, { h: 'Source', render: (e) => e.source }, { h: 'Added by', render: (e) => e.by }, { h: 'Status', render: (e) => <Status s={e.status} />, val: (e) => e.status }, { h: '', render: (e) => vf && e.status !== 'Verified' && !e.srcDown && <Btn sm onClick={() => { act.evidenceStatus(e.id, 'Verified'); toast(`${e.id} verified`); }}>Verify</Btn> }]} /></Card></CW>;
}

export default CEvidence;
