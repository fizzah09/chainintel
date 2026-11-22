import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import { NetworkPill } from '../domain/OnChain';
import { useStore } from '../../mocks/store';
import { sh } from '../../lib/format';
import { NAV } from '../../app/config/navigation';
import { pathOf } from '../../app/config/paths';
import SearchBox from './SearchBox';

export default function TopBar({ page, onMenu }) {
  const s = useStore();
  const R = NAV[s.session.role];
  const unread = s.notifications.filter((n) => !n.read).length;
  const crumbs = (page.crumbs?.length ? page.crumbs : [page.title]).map((c) => (c === '{wallet}' ? (s.ctx.wallet ? sh(s.ctx.wallet) : 'Wallet') : c));
  return (
    <header className="top">
      <button type="button" className="ib menu-btn" onClick={onMenu} aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: '#A3B0C2' }}>/</span>}
            {i === crumbs.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <SearchBox />
      <span className="pill"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4"/></svg>{s.settings.orgName}</span>
      <NetworkPill />
      <Link className="ib" to={pathOf('NotificationCenter')} aria-label={`Notifications, ${unread} unread`}><Icon n="bell" />{unread > 0 && <em />}</Link>
      <Link className="user" to={pathOf('ProfileMenu')}><div className="av">{R.initials}</div><div><b>{s.session.name}</b><span>{R.name}</span></div></Link>
    </header>
  );
}
