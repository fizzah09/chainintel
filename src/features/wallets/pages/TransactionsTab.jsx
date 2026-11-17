import { LiveTransactions } from '../../../components/domain/OnChain';
import { Addr, Card, Chip, DataTable, Hash, Status, Tier } from '../../../components/ui';
import { Risk } from './RiskTab';
import { W, useWallet } from '../shared';
import { fdt, num, sh } from '../../../lib/format';
import { TN, tierOf } from '../../../lib/risk';

export function Transactions() {
  const [p] = useWallet();
  return <W active="Transactions"><LiveTransactions address={p.address} /><Card title="Modelled transactions" sub="Risk-model view used for scoring and attribution"><DataTable exportName={`transactions-${sh(p.address)}`} search="Search hash or address" searchText={(t) => t.hash + t.cp} size={8} rows={p.txs}
    filters={[{ label: 'Direction', options: ['Inbound', 'Outbound'], test: (t, v) => (v === 'Inbound') === (t.dir === 'in') }, { label: 'Token', options: ['USDT', 'USDC', 'ETH'], test: (t, v) => t.sym === v }, { label: 'Risk', options: ['Low', 'Moderate', 'High', 'Critical'], test: (t, v) => TN[tierOf(t.risk)] === v }]}
    cols={[{ h: 'Hash', render: (t) => <Hash h={t.hash} />, val: (t) => t.hash }, { h: 'Time (UTC)', render: (t) => fdt(t.time), val: (t) => t.time }, { h: 'Counterparty', render: (t) => <Addr a={t.cp} label="" /> }, { h: 'Direction', render: (t) => <Chip k={t.dir === 'in' ? 'ok' : 'gray'}>{t.dir === 'in' ? 'Inbound' : 'Outbound'}</Chip>, val: (t) => t.dir }, { h: 'Amount', render: (t) => <b>{num(t.amt, t.sym === 'ETH' ? 2 : 0)} {t.sym}</b>, val: (t) => t.amt }, { h: 'Risk', render: (t) => <Tier score={t.risk} />, val: (t) => t.risk }, { h: 'Status', render: (t) => <Status s="Success" /> }]} /></Card></W>;
}

export default Transactions;
