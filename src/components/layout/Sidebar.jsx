import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Logo } from '../ui';
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

export default function Sidebar({ page }) {
  const s = useStore(); const nav = useNavigate();
  const role = s.session.role; const R = NAV[role];
  return (
    <nav className="side" aria-label="Main">
      <div className="brand"><Logo inv /><b>Chain Intel</b></div>
      <div className="ws"><span>{R.plat ? 'Platform' : 'Workspace'}</span><b>{R.ws}</b></div>
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
