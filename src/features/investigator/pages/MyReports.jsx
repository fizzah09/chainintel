import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Btn, Card, DataTable, Head, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { act, useStore } from '../../../mocks/store';

export function InvReports() {
  const s = useStore(); const nav = useNavigate(); const me = s.session.name;
  const rows = s.reports.filter((r) => r.by === me);
  return <>
    <Head title="Reports" desc="Reports you created." acts={<Btn kind="pri" icon="plus" to={pathOf('ReportBuilder')}>Generate report</Btn>} />
    <Card>
      <DataTable rows={rows} cols={[
        { h: 'Report', render: (r) => <button className="link mono" onClick={() => { act.setCtx({ report: r.id }); nav(pathOf('ReportPreview')); }}>{r.id}</button> },
        { h: 'Title', render: (r) => r.title },
        { h: 'Type', render: (r) => r.type },
        { h: 'Created by', render: (r) => r.by },
        { h: 'Date', render: (r) => fd(r.date) },
        { h: 'Status', render: (r) => <Status s={r.status} /> },
      ]} />
    </Card>
  </>;
}

export default InvReports;
