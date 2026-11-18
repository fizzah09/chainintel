import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../app/config/paths';
import { Btn, Card, Chip, Icon, Modal, SelectIn, Tabs, Tier, WalletGraph, useToast } from '../../components/ui';
import { Counterparties } from './pages/CounterpartiesTab';
import { Graph } from './pages/GraphTab';
import { Overview } from './pages/OverviewTab';
import { Risk } from './pages/RiskTab';
import { Transactions } from './pages/TransactionsTab';
import { fd, sh } from '../../lib/format';
import { TN, walletProfile } from '../../lib/risk';
import { mapAssessment, mapTimeline, mapTransfers, deriveCps } from '../../lib/apiAdapters';
import { useLatestAssessment, useTransfers, useRiskTimeline, useWalletStats } from '../../lib/apiHooks';
import { act, can, useStore } from '../../mocks/store';

export const DEFAULT_CHAIN = 1;

/**
 * Returns [profile, store].
 * `profile` is the mock wallet profile enriched with any real data the backend has.
 * When the backend is unreachable the mock profile is returned unchanged.
 */
export const useWallet = () => {
  const s = useStore();
  const address = s.ctx.wallet;
  const session = s.session;

  // Backend hooks — all silent-fail (error means backend unavailable)
  const { data: assessment } = useLatestAssessment(address, DEFAULT_CHAIN, session);
  const { data: transfersResp } = useTransfers(address, DEFAULT_CHAIN, { limit: 200 }, session);
  const { data: stats } = useWalletStats(address, DEFAULT_CHAIN, session);
  const { data: timeline } = useRiskTimeline(address, DEFAULT_CHAIN, 30, session);

  const p = useMemo(() => {
    const base = walletProfile(address);

    // Overlay risk score from latest backend assessment
    if (assessment) {
      const mapped = mapAssessment(assessment);
      if (mapped) {
        base.score = mapped.score;
        base.tier = mapped.tier;
        base.report = mapped;
      }
    }

    // Overlay real transfers when available
    const realTxs = transfersResp ? mapTransfers(transfersResp, address) : null;
    if (realTxs?.length) {
      base.txs = realTxs;
      base.tx = transfersResp.total ?? realTxs.length;
      const inTxs = realTxs.filter((t) => t.dir === 'in');
      const outTxs = realTxs.filter((t) => t.dir === 'out');
      base.counts = { in: inTxs.length, out: outTxs.length };
      base.cps = deriveCps(realTxs);
    }

    // Overlay balance / volume from stats
    if (stats && !stats.not_applicable) {
      if (stats.balance_eth != null) base.bal = stats.balance_eth;
      if (stats.volume_usd_30d != null) base.vol = stats.volume_usd_30d;
      if (stats.unique_counterparties != null) base.cp = stats.unique_counterparties;
    }

    // Overlay risk timeline
    const realHistory = timeline ? mapTimeline(timeline) : null;
    if (realHistory?.length) {
      base.history = realHistory;
    }

    return base;
  }, [address, assessment, transfersResp, stats, timeline]);

  return [p, s];
};

export const TABS = [['Overview', 'WalletOverview'], ['Transactions', 'WalletTransactions'], ['Counterparties', 'WalletCounterparties'], ['Risk Assessment', 'RiskAssessment'], ['Graph', 'WalletGraph'], ['Evidence', 'WalletEvidence'], ['Cases', 'WalletCases'], ['Watchlists', 'WalletWatchlists'], ['History', 'WalletHistory']];

export function WalletHead({ active }) {
  const [p, s] = useWallet(); const nav = useNavigate(); const toast = useToast(); const [wl, setWl] = useState(false); const [sel, setSel] = useState(s.watchlists[0]?.id);
  const on = s.watchlists.some((w) => w.wallets.some((x) => x.a.toLowerCase() === p.address.toLowerCase()));
  const mk = () => { act.setWizard({ title: `Review of wallet ${sh(p.address)}`, subjects: [{ kind: 'wallet', ref: p.address, role: 'Primary' }], source: 'Wallet profile', desc: `Wallet scores ${p.score} (${TN[p.tier]}).`, priority: p.tier === 'crit' ? 'Critical' : p.tier === 'high' ? 'High' : 'Medium' }); nav(pathOf('CaseCreate')); };
  return <>
    <Card style={{ padding: 22 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}><div style={{ width: 56, height: 56, borderRadius: 4, background: p.tier === 'crit' ? '#FEE2E2' : '#E8F0FD', color: p.tier === 'crit' ? '#991B1B' : '#124FB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="wallet" s={28} /></div>
        <div><div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><h1 className="mono" style={{ fontSize: 18 }}>{p.address}</h1><Tier score={p.score} /><Chip k="blue">Ethereum</Chip>{on && <Chip k="warn">On watchlist</Chip>}{p.label !== 'Unknown' && <Chip k="gray">{p.label}</Chip>}</div><div className="mu" style={{ marginTop: 6 }}>Type: Externally owned · First seen {fd(p.first)} · Last active {fd(p.last)}</div></div></div>
      <div className="acts"><Btn icon="copy" onClick={() => { navigator.clipboard?.writeText(p.address); toast('Address copied'); }}>Copy address</Btn><Btn icon="tag" onClick={() => setWl(true)}>Add to watchlist</Btn><Btn icon="case" onClick={mk} disabled={!can(s, 'create_case')}>Create case</Btn><Btn kind="pri" icon="graph" disabled={!can(s, 'run_trace')} onClick={() => { act.setCtx({ trace: { start: p.address } }); nav(pathOf('TransactionTracing')); }}>Trace transactions</Btn></div></div></Card>
    <Tabs items={TABS.map(([l, k]) => [l, pathOf(k)])} active={active} />
    <Modal open={wl} title="Add to watchlist" onClose={() => setWl(false)} footer={<><Btn onClick={() => setWl(false)}>Cancel</Btn><Btn kind="pri" onClick={() => { const r = act.addToWatchlist(sel, p.address); if (r.ok) { toast(`Added to watchlist (score ${r.score})`); setWl(false); } else toast(r.error, 'bad'); }}>Add</Btn></>}>
      <SelectIn label="Watchlist" value={sel} onChange={setSel} options={s.watchlists.map((w) => [w.id, `${w.name} (${w.scope})`])} hint="An alert is raised if the wallet meets the list rule." /></Modal></>;
}

export const W = ({ active, children }) => <><WalletHead active={active} />{children}</>;
