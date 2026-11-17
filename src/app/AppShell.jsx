import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { useStore } from '../mocks/store';
import { pageAt } from './config/paths';

export default function AppShell() {
  const s = useStore();
  const { pathname } = useLocation();
  const page = pageAt(pathname) || { key: '', title: 'Not found', crumbs: [] };
  return (
    <div className="app">
      <Sidebar page={page} />
      <div className="main">
        {s.settings.maintenance && <div className="banner" role="alert">Maintenance mode is on. Changes may be blocked while the platform is updated.</div>}
        <TopBar page={page} />
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
