import { pathOf } from '../../../app/config/paths';
import { CaseLink } from '../../../components/domain/workspace';
import { Btn, Card, DataTable, Head, Prio, Status } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useCases } from '../../../lib/apiHooks';
import { mapCases } from '../../../lib/apiAdapters';
import { useStore } from '../../../mocks/store';

export const InvCases = () => {
  const s = useStore(); const me = s.session.name;
  const { data: apiCases } = useCases({}, s.session);
  const cases = apiCases ? mapCases(apiCases) : s.cases;
  const rows = cases.filter((c) => c.assignee === me);
  return <>
    <Head title="My cases" desc="Cases assigned to you." acts={<Btn kind="pri" icon="plus" to={pathOf('CaseCreate')}>Create case</Btn>} />
    <Card>
      <DataTable rows={rows} cols={[
        { h: 'Case ID', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Status', render: (c) => <Status s={c.status} /> },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Assignee', render: (c) => c.assignee },
        { h: 'Opened', render: (c) => fd(c.opened) },
        { h: 'Due', render: (c) => fd(c.due) },
      ]} />
    </Card>
  </>;
};

export default InvCases;
