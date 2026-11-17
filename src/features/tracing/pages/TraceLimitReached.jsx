import { Tracing } from './TransactionTracing';

export function TraceLimit() { return <><Tracing forceHops={5} /></>; }

export default TraceLimit;
