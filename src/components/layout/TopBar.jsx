import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import { NetworkPill } from '../domain/OnChain';
import { useStore } from '../../mocks/store';
import { NAV } from '../../app/config/navigation';
import { pathOf } from '../../app/config/paths';
import SearchBox from './SearchBox';

export default function TopBar({ page }) {
  const s = useStore();
  const R = NAV[s.session.role];
  const unread = s.notifications.filter((n) => !n.read).length;
  const crumbs = page.crumbs?.length ? page.crumbs : [page.title];
  return (
    <header className="top">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: '#A3B0C2' }}>/</span>}
            {i === crumbs.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <SearchBox />
      <NetworkPill />
      <Link className="ib" to={pathOf('NotificationCenter')} aria-label={`Notifications, ${unread} unread`}><Icon n="bell" />{unread > 0 && <em />}</Link>
      <Link className="ib" to={pathOf('GlobalSearch')} aria-label="Help"><Icon n="help" /></Link>
      <Link className="user" to={pathOf('ProfileMenu')}><div className="av">{R.initials}</div><div><b>{s.session.name}</b><span>{R.name}</span></div></Link>
    </header>
  );
}
