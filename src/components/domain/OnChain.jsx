import { useState } from 'react';
import { useAccount, useConnect, useBlockNumber, useSwitchChain, useWriteContract, useChainId } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { Btn, Card, Chip, Dl, Note, Addr, Hash, DataTable, Status, useToast } from '../ui';
import { useStore, act } from '../../mocks/store';
import { liveWallet, liveTx, txHistory, historyProvider } from '../../lib/web3/chain';
import { ANCHOR_ABI, ANCHOR_ADDRESS, ANCHOR_CHAIN_ID, tenantId, readLatest, compareAnchor, explorerTx } from '../../lib/web3/anchor';
import { useAsync } from '../../lib/web3/hooks';
import { quickScore, TN, tierOf } from '../../lib/risk';
import { sh, num, fdt, ago } from '../../lib/format';

const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');
const errText = (e) => e?.shortMessage || e?.message || 'Something went wrong.';

/** Live mainnet head in the top bar. */
export function NetworkPill() {
  const { data, isError } = useBlockNumber({ chainId: mainnet.id, watch: true, query: { refetchInterval: 12000 } });
  return <span className="pill" title={isError ? 'RPC not reachable' : 'Latest Ethereum block'}><i style={{ background: isError || !data ? '#94A3B8' : undefined }} />Ethereum Mainnet{data ? <span className="mono" style={{ color: 'var(--mu)' }}>#{num(Number(data))}</span> : isError ? <span className="mu">offline</span> : null}</span>;
}

const Src = ({ st, label }) => st === 'ok' ? <Chip k="ok">Live · {label}</Chip> : st === 'loading' ? <Chip k="gray">Loading…</Chip> : st === 'off' ? <Chip k="gray">Not configured</Chip> : <Chip k="warn">Offline · showing model data</Chip>;

/** Live account state for a wallet profile. */
export function LiveWalletCard({ address }) {
  const st = useAsync(() => liveWallet(address), address);
  const d = st.data;
  return <Card title="On-chain state" sub="Read directly from an Ethereum node" act={<Src st={st.status} label="RPC" />}>
    {st.status === 'ok' ? <Dl w={160} items={[['Address (EIP-55)', <span key="a" className="mono" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{d.address}</span>], ['ENS name', d.ens || '—'], ['Balance', `${num(d.balance, 4)} ETH`], ['Outgoing tx count (nonce)', num(d.nonce)], ['Account type', d.isContract ? 'Smart contract' : 'Externally owned'], ['As of block', `#${num(d.block)}`]]} />
      : st.status === 'loading' ? <div className="mu">Querying mainnet…</div>
      : <Note k="gray" icon="help">Could not reach the Ethereum RPC ({String(st.error).replace(/\.$/, '')}). Scores and figures below come from the risk model. Set VITE_MAINNET_RPC to your node or provider URL.</Note>}
  </Card>;
}

/** Live receipt for a transaction hash. */
export function LiveTxCard({ hash }) {
  const st = useAsync(() => liveTx(hash), hash);
  const d = st.data;
  return <Card title="On-chain receipt" act={st.status === 'ok' && !d ? <Chip k="gray">Not on mainnet</Chip> : <Src st={st.status} label="RPC" />}>
    {st.status === 'ok' && d ? <Dl w={150} items={[['Status', <Status key="s" s={d.status === 'success' ? 'Success' : 'Failed'} />], ['Block', `#${num(d.block)} · ${num(d.confirmations)} confirmations`], ['Time (UTC)', fdt(d.time)], ['From', <Addr key="f" a={d.from} />], ['To', d.to ? <Addr key="t" a={d.to} /> : 'Contract creation'], ['Value', `${num(d.value, 6)} ETH`], ['Gas used', num(d.gasUsed)], ['Fee', `${num(d.fee, 6)} ETH`], ['Event logs', d.logs]]} />
      : st.status === 'ok' ? <div className="mu">This hash is a modelled transaction and does not exist on Ethereum mainnet.</div>
      : st.status === 'loading' ? <div className="mu">Fetching receipt…</div>
      : <Note k="gray" icon="help">RPC not reachable ({String(st.error).replace(/\.$/, '')}). Showing modelled data.</Note>}
  </Card>;
}

/** Real transaction history via Etherscan or Alchemy, scored with the Chain Intel model. */
export function LiveTransactions({ address }) {
  const st = useAsync(() => txHistory(address), address, !!historyProvider);
  if (st.status === 'off') return <Note k="info" icon="help">Showing modelled history. Add VITE_ETHERSCAN_KEY or VITE_ALCHEMY_KEY to load this wallet's real transfers.</Note>;
  if (st.status !== 'ok') return <Card title="Live transfers" act={<Src st={st.status} label={historyProvider} />}><div className="mu">{st.status === 'loading' ? `Loading from ${historyProvider}…` : st.error}</div></Card>;
  const rows = st.data.map((t) => ({ ...t, risk: quickScore(t.cp) }));
  return <Card title="Live transfers" sub={`Latest ${rows.length} native and ERC-20 transfers`} act={<Src st="ok" label={historyProvider} />}>
    <DataTable exportName={`live-${sh(address)}`} search="Search hash or address" searchText={(t) => t.hash + t.cp} size={8} rows={rows}
      filters={[{ label: 'Direction', options: ['Inbound', 'Outbound'], test: (t, v) => (v === 'Inbound') === (t.dir === 'in') }]}
      cols={[{ h: 'Hash', render: (t) => <Hash h={t.hash} />, val: (t) => t.hash }, { h: 'Time (UTC)', render: (t) => fdt(t.time), val: (t) => t.time }, { h: 'Counterparty', render: (t) => <Addr a={t.cp} label="" /> }, { h: 'Direction', render: (t) => <Chip k={t.dir === 'in' ? 'ok' : 'gray'}>{t.dir === 'in' ? 'Inbound' : 'Outbound'}</Chip> }, { h: 'Amount', render: (t) => `${num(t.amt, 4)} ${t.sym}`, val: (t) => t.amt }, { h: 'Counterparty risk', render: (t) => <Status s={TN[tierOf(t.risk)]} />, val: (t) => t.risk }]} /></Card>;
}

/** Anchors the audit chain head on Sepolia and checks the local log against it. */
export function AnchorCard() {
  const s = useStore(); const toast = useToast(); const { isConnected } = useAccount(); const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain(); const { writeContractAsync } = useWriteContract(); const { connectors, connectAsync } = useConnect();
  const tenant = tenantId(s.settings.orgName || 'Example Bank'); const [busy, setBusy] = useState(false); const [n, setN] = useState(0);
  const st = useAsync(() => readLatest(tenant), `${tenant}-${n}`, !!ANCHOR_ADDRESS);
  const head = s.audit[s.audit.length - 1]; const cmp = compareAnchor(st.data, s.audit);
  const anchor = async () => {
    setBusy(true);
    try {
      if (!isConnected) { if (!connectors[0]) throw new Error('No browser wallet found.'); await connectAsync({ connector: connectors[0] }); }
      if (chainId !== ANCHOR_CHAIN_ID) await switchChainAsync({ chainId: ANCHOR_CHAIN_ID });
      const count = s.audit.length;
      const tx = await writeContractAsync({ address: ANCHOR_ADDRESS, abi: ANCHOR_ABI, functionName: 'anchor', args: [tenant, head.hash, BigInt(count)], chainId: ANCHOR_CHAIN_ID });
      act.recordAnchor({ tx, head: head.hash, count }); toast('Anchor submitted. It appears once the block is mined.'); setTimeout(() => setN((x) => x + 1), 15000);
    } catch (e) { const m = errText(e); toast(/NotWriter/.test(m) ? 'This wallet is not an authorised writer on the contract.' : /rejected|denied/i.test(m) ? 'Transaction rejected in the wallet.' : m, 'bad'); }
    setBusy(false);
  };
  return <Card title="On-chain anchoring" sub="Audit head hash published to the AuditAnchor contract on Sepolia. No case data leaves the bank." act={<><Btn sm icon="refresh" onClick={() => setN((x) => x + 1)} disabled={!ANCHOR_ADDRESS}>Re-check</Btn><Btn sm kind="pri" icon="shield" onClick={anchor} disabled={!ANCHOR_ADDRESS || busy}>{busy ? 'Waiting for wallet…' : 'Anchor current head'}</Btn></>}>
    {!ANCHOR_ADDRESS ? <Note k="info" icon="help">Deploy contracts/AuditAnchor.sol (see chainintel-contracts) and set VITE_ANCHOR_ADDRESS to enable anchoring.</Note> : <>
      <Dl w={170} items={[['Local head', <span key="h" className="mono" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{head?.hash}</span>], ['Local entries', s.audit.length], ['Contract', <Addr key="c" a={ANCHOR_ADDRESS} label="" />], ['Latest anchor', st.status === 'ok' ? (st.data ? `${st.data.count} entries · ${ago(st.data.at)} · by ${short(st.data.by)}` : 'None yet') : st.status === 'loading' ? 'Reading…' : `Unavailable (${st.error})`]]} />
      <div style={{ marginTop: 12 }}>{cmp.state === 'ok' ? <Note k="ok" icon="shield">{cmp.msg}{cmp.pending ? ` ${cmp.pending} newer entries are not anchored yet.` : ''}</Note> : cmp.state === 'bad' ? <Note k="bad" icon="shield">{cmp.msg}</Note> : null}</div>
      {(s.anchors || []).length > 0 && <div style={{ marginTop: 12 }} className="mu sm">Recent submissions: {(s.anchors || []).slice(-3).reverse().map((a) => <a key={a.tx} className="link mono" href={explorerTx(a.tx)} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>{short(a.tx)}</a>)}</div>}</>}
  </Card>;
}
