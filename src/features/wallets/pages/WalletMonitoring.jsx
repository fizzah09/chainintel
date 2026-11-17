import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, DataTable, Head, Icon, Kpis, ScoreBar, Tier } from '../../../components/ui';
import { Risk } from './RiskTab';
import { Transactions } from './TransactionsTab';
import { ago, isAddr, isEns, num, sh, usd } from '../../../lib/format';
import { CFG, TN, walletProfile } from '../../../lib/risk';
import { resolveEns } from '../../../lib/web3/chain';
import { act, useStore } from '../../../mocks/store';

export function Monitoring() {
  const s = useStore(); const nav = useNavigate(); const [a, setA] = useState(''); const [err, setErr] = useState('');
  const go = async (input) => {
    let addr = input;
    if (isEns(input)) { setErr(''); try { addr = await resolveEns(input); } catch { return setErr('Could not resolve that ENS name. Check the RPC connection.'); } if (!addr) return setErr('That ENS name has no address record.'); }
    const r = act.openWallet(addr); if (!r.ok) { setErr(r.error); return; } nav(pathOf('WalletOverview'));
  };
  const rows = s.recent.map((x) => walletProfile(x));
  const tiers = ['low', 'mod', 'high', 'crit'].map((k) => [TN[k], k === 'low' ? 488 : k === 'mod' ? 372 : k === 'high' ? 270 : 154]);
  return <><Head title="Wallet monitoring" desc="Search any Ethereum address to view its risk profile, activity and relationships." acts={<><Btn icon="upload" onClick={() => { const t = window.prompt('Paste addresses, one per line'); if (t) { const ok = t.split(/\s+/).filter(isAddr); ok.forEach((x) => act.openWallet(x)); } }}>Import addresses</Btn></>} />
    <Card style={{ padding: 18 }}><form onSubmit={(e) => { e.preventDefault(); go(a); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}><div style={{ flex: '1 1 420px' }}><label className="search" style={{ maxWidth: 'none', margin: 0, minHeight: 46, background: '#fff', borderColor: err ? 'var(--crit)' : undefined }}><Icon n="search" s={18} /><input placeholder="Paste a wallet address (0x…) or ENS name (vitalik.eth)" value={a} onChange={(e) => { setA(e.target.value); setErr(''); }} aria-label="Wallet address" /></label>{err && <div className="hint err" role="alert" style={{ marginTop: 6 }}>{err}</div>}</div><Btn kind="pri" icon="activity" type="submit">Analyse wallet</Btn></form>
      <div className="mu sm" style={{ marginTop: 10 }}>Try: <button className="link" onClick={() => go(s.recent[0])}>{sh(s.recent[0], 10, 6)}</button> (critical example). Any valid 0x address works.</div></Card>
    <Kpis items={[['Monitored wallets', num(1284 + s.recent.length - 9), '+36 this week'], ['Critical risk', '154', 'Score ≥ ' + CFG.thr[2], 'crit'], ['High risk', '270', `Score ${CFG.thr[1]}–${CFG.thr[2] - 1}`, 'high'], ['Open alerts', s.alerts.filter((x) => x.status === 'Unacknowledged').length, 'Unacknowledged']]} />
    <Card title="Recently analysed wallets"><DataTable exportName="wallets" search="Filter wallets" searchText={(p) => p.address + p.label} size={8}
      filters={[{ label: 'Tier', options: ['Low', 'Moderate', 'High', 'Critical'], test: (p, v) => TN[p.tier] === v }]}
      cols={[{ h: 'Wallet', render: (p) => <Addr a={p.address} label="" />, val: (p) => p.address }, { h: 'Label', render: (p) => p.label, val: (p) => p.label }, { h: 'Risk score', render: (p) => <ScoreBar s={p.score} />, val: (p) => p.score }, { h: 'Tier', render: (p) => <Tier score={p.score} /> }, { h: 'Transactions', render: (p) => num(p.tx), val: (p) => p.tx }, { h: 'Volume', render: (p) => usd(p.vol), val: (p) => p.vol }, { h: 'Last activity', render: (p) => ago(p.last), val: (p) => p.last }]} rows={rows} /></Card></>;
}

export default Monitoring;
