import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, useToast } from '../ui';
import { useStore, act } from '../../mocks/store';
import { isAddr, isTx, sh } from '../../lib/format';
import { pathOf } from '../../app/config/paths';

/** Global search in the top bar: wallets, transactions, cases, evidence and reports. */
export default function SearchBox() {
  const s = useStore(); const nav = useNavigate(); const toast = useToast();
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false);
  const res = useMemo(() => {
    const t = q.trim(); if (t.length < 2) return [];
    const out = [];
    if (isAddr(t)) out.push({ icon: 'wallet', t: sh(t, 10, 6), d: 'Analyse this wallet', go: () => { act.openWallet(t); nav(pathOf('WalletOverview')); } });
    else if (isTx(t)) out.push({ icon: 'tx', t: sh(t, 10, 6), d: 'Open transaction', go: () => { act.setCtx({ tx: t }); nav(pathOf('TransactionDetail')); } });
    s.recent.filter((a) => a.toLowerCase().includes(t.toLowerCase())).slice(0, 3).forEach((a) => out.push({ icon: 'wallet', t: sh(a, 10, 6), d: 'Recent wallet', go: () => { act.openWallet(a); nav(pathOf('WalletOverview')); } }));
    if (s.session.role !== 'pa' && s.session.role !== 'sa') {
      s.cases.filter((c) => (c.id + c.title).toLowerCase().includes(t.toLowerCase())).slice(0, 3).forEach((c) => out.push({ icon: 'case', t: c.id, d: c.title, go: () => { act.setCtx({ caseId: c.id }); nav(pathOf('CaseDetails')); } }));
      s.evidence.filter((e) => (e.id + e.title).toLowerCase().includes(t.toLowerCase())).slice(0, 2).forEach((e) => out.push({ icon: 'folder', t: e.id, d: e.title, go: () => { act.setCtx({ evidence: e.id }); nav(pathOf('EvidenceDetail')); } }));
    }
    s.reports.filter((r) => (r.id + r.title).toLowerCase().includes(t.toLowerCase())).slice(0, 2).forEach((r) => out.push({ icon: 'report', t: r.id, d: r.title, go: () => { act.setCtx({ report: r.id }); nav(pathOf('ReportPreview')); } }));
    return out;
  }, [q, s.cases, s.recent, s.reports, s.evidence]);
  return <label className="search" onBlur={() => setTimeout(() => setOpen(false), 150)}><Icon n="search" s={17} /><span style={{ position: 'absolute', left: -9999 }}>Global search</span>
    <input type="search" placeholder="Search wallet, transaction, case, evidence" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { setOpen(false); nav(pathOf('GlobalSearch') + '?q=' + encodeURIComponent(q.trim())); } if (e.key === 'Escape') setOpen(false); }} />
    {open && q.trim().length >= 2 && <div className="dd" role="listbox">{res.length ? res.map((r, i) => <a key={i} href="#" onMouseDown={(e) => { e.preventDefault(); r.go(); setOpen(false); setQ(''); }}><Icon n={r.icon} s={17} /><span><b className="mono" style={{ fontSize: 12.5 }}>{r.t}</b><div className="mu sm">{r.d}</div></span></a>) : <div className="mu" style={{ padding: 14 }}>No results. Paste a full wallet address (0x…) to analyse it.</div>}<a href="#" onMouseDown={(e) => { e.preventDefault(); setOpen(false); nav(pathOf('GlobalSearch') + '?q=' + encodeURIComponent(q.trim())); }}><Icon n="search" s={17} /><span>See all results for "{q.trim()}"</span></a></div>}</label>;
}
