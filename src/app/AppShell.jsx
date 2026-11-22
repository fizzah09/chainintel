import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { useStore } from '../mocks/store';
import { pageAt } from './config/paths';

export default function AppShell() {
  const s = useStore();
  const { pathname } = useLocation();
  const page = pageAt(pathname) || { key: '', title: 'Not found', crumbs: [] };
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  return (
    <div className="app">
      <Sidebar page={page} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="side-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="main">
        {s.settings.maintenance && <div className="banner" role="alert">Maintenance mode is on. Changes may be blocked while the platform is updated.</div>}
        <TopBar page={page} onMenu={() => setMenuOpen((v) => !v)} />
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
