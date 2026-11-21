import { CaseLink } from '../../../components/domain/workspace';
import { Card, DataTable, Head, Prio } from '../../../components/ui';
import { fd } from '../../../lib/format';
import { useStore } from '../../../mocks/store';

// AUD-02: read-only case list for auditors.
export const AudCases = () => {
  const s = useStore();
  return <>
    <Head title="Case records" desc="Read-only access to closed and active cases." />
    <Card>
      <DataTable exportName="cases" search="Search cases" searchText={(c) => c.id + c.title} rows={s.cases} cols={[
        { h: 'Case ID', render: (c) => <CaseLink c={c} /> },
        { h: 'Title', render: (c) => c.title },
        { h: 'Priority', render: (c) => <Prio p={c.priority} /> },
        { h: 'Assigned by', render: (c) => c.createdBy ?? '—' },
        { h: 'Opened', render: (c) => fd(c.opened) },
        { h: 'Due', render: (c) => fd(c.due) },
      ]} />
    </Card>
  </>;
};

export default AudCases;
