import { Btn, Card, DataTable, Head, Status, useToast } from '../../../components/ui';
import { act, useStore } from '../../../mocks/store';

export function PaJobs() {
  const s = useStore(); const toast = useToast();
  return <><Head title="Background jobs" /><Card><DataTable exportName="jobs" search="Search jobs" searchText={(j) => j.id + j.type + j.tenant} rows={s.jobs} filters={[{ label: 'Status', options: ['Queued', 'Running', 'Completed', 'Failed', 'Retrying'], test: (j, v) => j.status === v }]} cols={[{ h: 'Job', render: (j) => j.id }, { h: 'Type', render: (j) => j.type }, { h: 'Tenant', render: (j) => j.tenant }, { h: 'Started', render: (j) => j.started }, { h: 'Duration', render: (j) => j.dur }, { h: 'Status', render: (j) => <Status s={j.status} /> }, { h: '', render: (j) => ['Failed', 'Retrying'].includes(j.status) ? <Btn sm onClick={() => { act.jobPatch(j.id, 'Queued'); toast('Job re-queued'); }}>Retry</Btn> : ['Queued', 'Running'].includes(j.status) ? <Btn sm kind="danger" onClick={() => { act.jobPatch(j.id, 'Failed'); toast('Job cancelled'); }}>Cancel</Btn> : null }]} /></Card></>;
}

export default PaJobs;
