import { Routes, Route, Navigate } from 'react-router-dom';
import { SCREEN_ROUTES, PUBLIC_ROUTES } from '../config/routes';
import { useSession } from '../../context';
import { homeOf } from '../config/paths';
import AuthGuard from './AuthGuard';
import RoleRoute from './RoleRoute';
import AppShell from '../AppShell';
import NotFound from '../../features/errors/pages/NotFound';
import ServerError from '../../features/errors/pages/ServerError';
import Maintenance from '../../features/errors/pages/Maintenance';

export default function AppRouter() {
  const { user } = useSession();
  const home = user ? homeOf(user.role) : '/login';

  return (
    <Routes>
      {/* Error pages: reachable signed in or not */}
      <Route path="/error/500" element={<ServerError />} />
      <Route path="/maintenance" element={<Maintenance />} />

      {/* Public: sign-in, OTP, password reset. A signed-in user is sent home. */}
      {PUBLIC_ROUTES.map((r) => (
        <Route key={r.path} path={r.path} element={user ? <Navigate to={home} replace /> : r.element} />
      ))}

      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to={home} replace />} />
          {SCREEN_ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={<RoleRoute pageKey={r.key} roles={r.roles}>{r.element}</RoleRoute>} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
