import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function InvReports() { const s = useStore(); const nav = useNavigate(); const rows = s.reports.filter((r) => r.by === s.session.name); return <><Head title="My reports" acts={<Btn kind="pri" icon="plus" to={pathOf('ReportBuilder')}>New report</Btn>} /><Card><DataTable rows={rows} cols={[{ h: 'Report', render: (r) => <button className="link" onClick={() => { act.setCtx({ report: r.id }); nav(pathOf('ReportPreview')); }}>{r.title}</button> }, { h: 'ID', render: (r) => r.id }, { h: 'Date', render: (r) => fd(r.date) }, { h: 'Status', render: (r) => <Status s={r.status} /> }]} /></Card></>; }

export default InvReports;
