import { Card, DataTable, Head, Status } from '../../../components/ui';

export function ErValidation() {
  const rows = [['Sanctioned address recall', '100%', '≥ 99%', 'Pass'], ['Score reproducibility', '100%', '100%', 'Pass'], ['Component sum = score', '100%', '100%', 'Pass'], ['Label precision (sample 200)', '94.5%', '≥ 90%', 'Pass'], ['Trace cap enforcement', '100%', '100%', 'Pass'], ['Provider freshness', '96.8%', '≥ 95%', 'Pass']];
  return <><Head title="Validation results" desc="Latest automated and sampled checks." /><Card><DataTable tools={false} rows={rows} cols={[{ h: 'Check', render: (r) => r[0] }, { h: 'Result', render: (r) => r[1] }, { h: 'Target', render: (r) => r[2] }, { h: 'Outcome', render: (r) => <Status s={r[3]} /> }]} /></Card></>;
}

export default ErValidation;
