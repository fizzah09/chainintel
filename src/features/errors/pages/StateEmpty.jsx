import { pathOf } from '../../../app/config/paths';
import { Btn, Card, Empty, Head } from '../../../components/ui';

// states
export function StateEmpty() { return <><Head title="Cases" desc="No cases match your filters." /><Card><Empty icon="case" title="No cases yet" desc="Create a case from a wallet, alert or transaction to start tracking an investigation." action={<Btn kind="pri" icon="plus" to={pathOf('CaseCreate')}>Create case</Btn>} /></Card></>; }

export default StateEmpty;
