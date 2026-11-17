import { Head, Kpis, Note } from '../../../components/ui';

export function StateStale() { return <><Head title="Wallet analysis" /><Note icon="clock"><b>Showing cached data from 02 Nov 06:12 UTC.</b> Etherscan is slow to respond. Scores may not include the latest transactions.</Note><Note k="gray"><b>Some labels are unavailable.</b> Forta labels could not be loaded. Counterparty labels may be missing.</Note><Kpis items={[['Risk score', '78', 'Cached', 'crit'], ['Transactions', '1,284', 'As of 06:12'], ['Counterparties', '137', 'Labels partial']]} /></>; }

export default StateStale;
