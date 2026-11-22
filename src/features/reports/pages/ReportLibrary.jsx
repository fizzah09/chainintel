import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Confirm, DataTable, Donut, Head, HBars, Kpis, Row, Status, useToast } from '../../../components/ui';
import { Alerts } from '../../alerts/pages/AlertsDashboard';
import { ReportBuilder } from './ReportBuilder';
import { ReportPreview } from './ReportPreview';
import { fd, isAddr, sh } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function ReportLibrary() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast(); const [del, setDel] = useState(null);
  return <><Head title="Report library" desc="Generated reports across your workspace." acts={<Btn kind="pri" icon="plus" to={pathOf('ReportBuilder')}>Generate report</Btn>} />
    <Kpis items={[
      ['Total reports', s.reports.length, 'In this workspace'],
      ['Final', s.reports.filter((r) => r.status === 'Final').length, 'Locked content'],
      ['Draft', s.reports.filter((r) => r.status === 'Draft').length, 'Not yet finalised', 'mod'],
      ['This month', s.reports.filter((r) => new Date(r.date).getUTCMonth() === new Date().getUTCMonth() && new Date(r.date).getUTCFullYear() === new Date().getUTCFullYear()).length, 'Generated this month'],
    ]} />
    <Row>
      <Card title="Reports by type" style={{ flex: '2 1 400px' }}>
        <HBars items={['Wallet', 'Case', 'Compliance', 'Alerts'].map((t) => [t, s.reports.filter((r) => r.type === t).length, '#1769E0'])} />
      </Card>
      <Card title="Reports by status" style={{ flex: '1 1 260px' }}>
        <Donut items={[['Final', s.reports.filter((r) => r.status === 'Final').length, '#16A34A'], ['Draft', s.reports.filter((r) => r.status === 'Draft').length, '#F59E0B']]} center={String(s.reports.length)} sub="reports" />
      </Card>
    </Row>
    <Card><DataTable exportName="reports" search="Search reports" searchText={(r) => r.id + r.title + r.subject} rows={s.reports} filters={[{ label: 'Type', options: ['Wallet', 'Case', 'Compliance', 'Alerts'], test: (r, v) => r.type === v }, { label: 'Status', options: ['Draft', 'Final'], test: (r, v) => r.status === v }]}
      cols={[{ h: 'Report', render: (r) => <button className="link" onClick={() => { act.setCtx({ report: r.id }); nav(pathOf('ReportPreview')); }}>{r.title}</button>, val: (r) => r.title }, { h: 'ID', render: (r) => <span className="mono">{r.id}</span>, val: (r) => r.id }, { h: 'Type', render: (r) => r.type, val: (r) => r.type }, { h: 'Subject', render: (r) => (isAddr(r.subject) ? sh(r.subject) : r.subject) }, { h: 'Created by', render: (r) => r.by }, { h: 'Date', render: (r) => fd(r.date), val: (r) => r.date }, { h: '', render: (r) => <Btn sm kind="danger" onClick={() => setDel(r)}>Delete</Btn> }]} defaultSort={{ i: 5, d: -1 }} /></Card>
    <Confirm open={!!del} danger title="Delete report?" text={`${del?.id} will be permanently removed.`} ok="Delete" onOk={() => { act.deleteReport(del.id); toast('Report deleted'); }} onClose={() => setDel(null)} /></>;
}

export default ReportLibrary;
