import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Addr, Btn, Card, Chip, DataTable, Head, Icon, Kpis, ScoreBar, Tier } from '../../../components/ui';
import { ago, isAddr, isEns, num, sh, usd } from '../../../lib/format';
import { CFG, TN, walletProfile } from '../../../lib/risk';
import { resolveEns } from '../../../lib/web3/chain';
import { useAlerts } from '../../../lib/apiHooks';
import { mapAlerts } from '../../../lib/apiAdapters';
import { act, useStore } from '../../../mocks/store';

export function Monitoring() {
  const s = useStore(); const nav = useNavigate(); const [a, setA] = useState(''); const [err, setErr] = useState('');
  const { data: apiAlerts } = useAlerts({}, s.session);
  const alerts = apiAlerts ? mapAlerts(apiAlerts) : s.alerts;
  const go = async (input) => {
    let addr = input;
    if (isEns(input)) { setErr(''); try { addr = await resolveEns(input); } catch { return setErr('Could not resolve that ENS name. Check the RPC connection.'); } if (!addr) return setErr('That ENS name has no address record.'); }
    const r = act.openWallet(addr); if (!r.ok) { setErr(r.error); return; } nav(pathOf('WalletOverview'));
  };
  const onWatchlist = (address) => s.watchlists.some((w) => w.wallets.some((x) => x.a.toLowerCase() === address.toLowerCase()));
  const rows = s.recent.map((x) => walletProfile(x)).map((p) => ({ ...p, watched: onWatchlist(p.address) }));
  const unacked = alerts.filter((x) => x.status === 'Unacknowledged').length;

  return <>
    <Head title="Wallet monitoring" desc="Search any Ethereum address to view its risk profile, activity and relationships."
      acts={<Btn icon="upload" onClick={() => { const t = window.prompt('Paste addresses, one per line'); if (t) { const ok = t.split(/\s+/).filter(isAddr); ok.forEach((x) => act.openWallet(x)); } }}>Import addresses</Btn>} />
    <Card style={{ padding: 18 }}>
      <form onSubmit={(e) => { e.preventDefault(); go(a); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 420px' }}>
          <label className="search" style={{ maxWidth: 'none', margin: 0, minHeight: 46, background: '#fff', borderColor: err ? 'var(--crit)' : undefined }}>
            <Icon n="search" s={18} />
            <input placeholder="Paste a wallet address (0x…) or ENS name (vitalik.eth)" value={a} onChange={(e) => { setA(e.target.value); setErr(''); }} aria-label="Wallet address" />
          </label>
          {err && <div className="hint err" role="alert" style={{ marginTop: 6 }}>{err}</div>}
        </div>
        <Btn kind="pri" icon="activity" type="submit">Analyse wallet</Btn>
      </form>
      <div className="mu sm" style={{ marginTop: 10 }}>Try: <button className="link" onClick={() => go(s.recent[0])}>{sh(s.recent[0], 10, 6)}</button> (critical example). Any valid 0x address works.</div>
    </Card>
    <Kpis items={[
      ['Monitored wallets', num(s.recent.length), 'In your recent list'],
      ['Critical risk', num(rows.filter((p) => p.tier === 'crit').length), 'Score ≥ ' + CFG.thr[2], 'crit'],
      ['High risk', num(rows.filter((p) => p.tier === 'high').length), `Score ${CFG.thr[1]}–${CFG.thr[2] - 1}`, 'high'],
      ['Alerts today', alerts.length, `${unacked} unacknowledged`],
    ]} />
    <Card title="Recently analysed wallets">
      <DataTable exportName="wallets" search="Filter wallets" searchText={(p) => p.address + p.label} size={8}
        filters={[{ label: 'Tier', options: ['Low', 'Moderate', 'High', 'Critical'], test: (p, v) => TN[p.tier] === v }]}
        rows={rows}
        cols={[
          { h: 'Wallet', render: (p) => <Addr a={p.address} label="" />, val: (p) => p.address },
          { h: 'Label', render: (p) => p.label, val: (p) => p.label },
          { h: 'Risk score', render: (p) => <ScoreBar s={p.score} />, val: (p) => p.score },
          { h: 'Tier', render: (p) => <Tier score={p.score} /> },
          { h: 'Transactions', render: (p) => num(p.tx), val: (p) => p.tx },
          { h: 'Volume', render: (p) => usd(p.vol), val: (p) => p.vol },
          { h: 'Last activity', render: (p) => ago(p.last), val: (p) => p.last },
          { h: 'Watchlist', render: (p) => (p.watched ? <Chip k="warn">Watched</Chip> : '—') },
        ]} />
    </Card>
  </>;
}

export default Monitoring;
