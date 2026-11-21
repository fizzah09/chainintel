import { Card, DataTable, Head } from '../../../components/ui';
import { useStore } from '../../../mocks/store';

// AUD-03: read-only evidence register with hashes.
export function AudEvidence() {
  const s = useStore();
  return <>
    <Head title="Evidence records" desc="Evidence with hash and custody history." />
    <Card>
      <DataTable exportName="evidence" search="Search evidence" searchText={(e) => e.id + e.title} rows={s.evidence} cols={[
        { h: 'Evidence ID', render: (e) => e.id },
        { h: 'Title', render: (e) => e.title },
        { h: 'Type', render: (e) => e.type },
        { h: 'Source', render: (e) => e.source },
        { h: 'Added by', render: (e) => e.by },
        { h: 'Hash', render: (e) => <span className="mono">{(e.hash || '').slice(0, 10)}…</span> },
      ]} />
    </Card>
  </>;
}

export default AudEvidence;
