import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pathOf } from '../../../app/config/paths';
import { Card, Empty, Head, Icon, Status, Tier } from '../../../components/ui';
import { isAddr, sh } from '../../../lib/format';
import { quickScore } from '../../../lib/risk';
import { act, useStore } from '../../../mocks/store';

export function Search() {
  const s = useStore(); const nav = useNavigate(); const [sp] = useSearchParams(); const [tab, setTab] = useState('All'); const q = (sp.get('q') || '').trim(); const [local, setLocal] = useState(q);
  const t = (local || '').toLowerCase();
  const items = [];
  if (isAddr(local.trim())) items.push({ k: 'Wallets', icon: 'wallet', t: local.trim(), d: 'Wallet · Ethereum · ' + quickScore(local.trim()) + ' risk score', badge: <Tier score={quickScore(local.trim())} />, go: () => { act.openWallet(local.trim()); nav(pathOf('WalletOverview')); } });
  s.recent.filter((a) => t && a.toLowerCase().includes(t)).forEach((a) => items.push({ k: 'Wallets', icon: 'wallet', t: a, d: `Wallet · Ethereum · score ${quickScore(a)}`, badge: <Tier score={quickScore(a)} />, go: () => { act.openWallet(a); nav(pathOf('WalletOverview')); } }));
  if (!['pa', 'sa'].includes(s.session.role)) {
    s.cases.filter((c) => t && (c.id + c.title).toLowerCase().includes(t)).forEach((c) => items.push({ k: 'Cases', icon: 'case', t: c.id, d: `Case · ${c.title}`, badge: <Status s={c.status} />, go: () => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseDetails')); } }));
    s.evidence.filter((e) => t && (e.id + e.title).toLowerCase().includes(t)).forEach((e) => items.push({ k: 'Evidence', icon: 'folder', t: e.id, d: `Evidence · ${e.title}`, badge: <Status s={e.status} />, go: () => { act.setCtx({ evidence: e.id }); nav(pathOf('EvidenceDetail')); } }));
  }
  s.reports.filter((r) => t && (r.id + r.title).toLowerCase().includes(t)).forEach((r) => items.push({ k: 'Reports', icon: 'report', t: r.id, d: `Report · ${r.title}`, badge: <Status s={r.status} />, go: () => { act.setCtx({ report: r.id }); nav(pathOf('ReportPreview')); } }));
  const cats = ['All', 'Wallets', 'Cases', 'Evidence', 'Reports'];
  const shown = items.filter((i) => tab === 'All' || i.k === tab);
  return <><Head title="Global search" desc="Search wallets, transactions, cases, evidence and reports in one place." />
    <Card><label className="search" style={{ maxWidth: 'none', margin: '0 0 18px', minHeight: 48, borderColor: 'var(--pri)', background: '#fff' }}><Icon n="search" s={18} /><input autoFocus value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Wallet address, case ID, evidence ID or report" /></label>
      <div className="tabs">{cats.map((c) => <a key={c} href="#" className={tab === c ? 'on' : ''} onClick={(e) => { e.preventDefault(); setTab(c); }}>{c}{c !== 'All' ? ` ${items.filter((i) => i.k === c).length}` : ` ${items.length}`}</a>)}</div>
      {!shown.length && <Empty icon="search" title={t ? 'No matches' : 'Start typing to search'} desc={t ? 'Try a full wallet address, a case ID such as CASE-2026-00128, or part of a title.' : ''} />}
      {shown.map((i, n) => <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 4px', borderBottom: '1px solid #EDF1F6', cursor: 'pointer' }} onClick={i.go}><span className="ib" style={{ flex: 'none' }}><Icon n={i.icon} s={17} /></span><div style={{ flex: 1 }}><div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><b className="mono">{i.t.length > 30 ? sh(i.t, 10, 6) : i.t}</b>{i.badge}</div><div className="mu sm">{i.d}</div></div><Icon n="right" s={16} /></div>)}</Card></>;
}

export default Search;
