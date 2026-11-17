import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Empty, Prio, Status } from '../../../components/ui';
import { W, useWallet } from '../shared';
import { fd, sh } from '../../../lib/format';
import { act, can } from '../../../mocks/store';

export function WCases() {
  const [p, s] = useWallet(); const nav = useNavigate();
  const rows = s.cases.filter((c) => c.subjects.some((x) => x.ref.toLowerCase() === p.address.toLowerCase()));
  return <W active="Cases"><Card title="Cases involving this wallet" act={<Btn kind="pri" sm icon="plus" to={pathOf('CaseCreate')} disabled={!can(s, 'create_case')} onClick={() => act.setWizard({ title: `Review of wallet ${sh(p.address)}`, subjects: [{ kind: 'wallet', ref: p.address, role: 'Primary' }] })}>Create case</Btn>}>
    {rows.length ? <DataTable tools={false} rows={rows} cols={[{ h: 'Case ID', render: (c) => <button className="link mono" onClick={() => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseDetails')); }}>{c.id}</button> }, { h: 'Title', render: (c) => c.title }, { h: 'Status', render: (c) => <Status s={c.status} /> }, { h: 'Priority', render: (c) => <Prio p={c.priority} /> }, { h: 'Assignee', render: (c) => c.assignee || '—' }, { h: 'Opened', render: (c) => fd(c.opened) }]} /> : <Empty icon="case" title="No cases yet" desc="This wallet has not been part of an investigation." />}</Card></W>;
}

export default WCases;
