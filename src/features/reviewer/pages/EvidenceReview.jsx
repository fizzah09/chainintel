import { Btn, Card, DataTable, Head, Status, useToast } from '../../../components/ui';
import { act, can, useStore } from '../../../mocks/store';

export function RevEvidence() {
  const s = useStore(); const toast = useToast(); const rows = s.evidence.filter((e) => e.status !== 'Verified' && !e.srcDown);
  return <><Head title="Evidence verification" desc="Evidence waiting to be verified." /><Card><DataTable exportName="evidence" search="Search" searchText={(e) => e.id + e.title} rows={rows} cols={[{ h: 'Evidence', render: (e) => e.id }, { h: 'Case', render: (e) => e.caseId }, { h: 'Title', render: (e) => e.title }, { h: 'Type', render: (e) => e.type }, { h: 'Status', render: (e) => <Status s={e.status} /> }, { h: '', render: (e) => <><Btn sm kind="pri" disabled={!can(s, 'verify_evidence')} onClick={() => { act.evidenceStatus(e.id, 'Verified'); toast('Verified'); }}>Verify</Btn> <Btn sm kind="danger" disabled={!can(s, 'verify_evidence')} onClick={() => { act.evidenceStatus(e.id, 'Rejected'); toast('Rejected'); }}>Reject</Btn></> }]} /></Card></>;
}

export default RevEvidence;
