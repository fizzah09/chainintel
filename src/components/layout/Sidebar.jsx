import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui';
import { useStore, act } from '../../mocks/store';
import { NAV } from '../../app/config/navigation';
import { ROLE_LABELS } from '../../app/config/roles';
import { pathOf, homeOf } from '../../app/config/paths';

// Menu items that stand for a family of screens.
const ALIAS = { INV_MyCases: 'CaseList', INV_Reports: 'ReportLibrary', CM_ReviewQueue: 'REV_Queue' };
const parent = (k) => (/^Wallet(?!Monitoring)|^RiskAssessment/.test(k) ? 'WalletMonitoring' : /^Case(?!List)|^Evidence/.test(k) ? 'CaseList' : /^Trace|^Transaction(?!Tracing)/.test(k) ? 'TransactionTracing' : /^Watchlist(?!List)/.test(k) ? 'WatchlistList' : /^Alert(?!sDash)/.test(k) ? 'AlertsDashboard' : /^Report(?!Library)/.test(k) ? 'ReportLibrary' : k);

function NavItem({ it, page }) {
  const k = ALIAS[it.key] || it.key;
  const to = it.to || pathOf(it.key);
  const on = page.path === to || it.key === page.key || k === parent(page.key) || it.label === page.nav;
  return (
    <Link to={to} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
      <span style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: it.icon }} />
      <span>{it.label}</span>
    </Link>
  );
}

export default function Sidebar({ page, open = false, onClose }) {
  const s = useStore(); const nav = useNavigate();
  const role = s.session.role; const R = NAV[role];
  return (
    <nav className={open ? 'side open' : 'side'} aria-label="Main" onClick={(e) => { if (onClose && e.target.closest('a')) onClose(); }}>
      <div className="brand"><svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#1769E0"/><circle cx="12" cy="20" r="3.2" fill="#fff"/><circle cx="27" cy="11.5" r="3.2" fill="#fff"/><circle cx="27" cy="28.5" r="3.2" fill="#fff"/><path d="M14.7 18.5l9.6-5.5M14.7 21.5l9.6 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg><b>Chain Intel</b></div>
      <div className="ws"><span>{R.plat ? 'Platform' : 'Workspace'}</span><b>{R.ws}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></b></div>
      <div className="sw">
        <label htmlFor="rolesw">Demo: switch role</label>
        <select id="rolesw" value={role} onChange={(e) => { act.switchRole(e.target.value); nav(homeOf(e.target.value)); }}>
          {Object.keys(NAV).map((k) => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
        </select>
      </div>
      {R.groups.map((g, i) => (
        <React.Fragment key={i}>
          {g.heading && <div className="nh">{g.heading}</div>}
          <div className="nav">{g.items.map((it) => <NavItem key={it.key + (it.to || '')} it={it} page={page} />)}</div>
        </React.Fragment>
      ))}
      <div className="sfoot">
        <div className="nav">
          {R.foot.map((it) => <NavItem key={it.key} it={it} page={page} />)}
          <a href="/login" onClick={(e) => { e.preventDefault(); act.logout(); nav('/login'); }}><Icon n="logout" /><span>Sign out</span></a>
        </div>
      </div>
    </nav>
  );
}
