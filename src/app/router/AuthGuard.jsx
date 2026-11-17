import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../context';

export default function AuthGuard() {
  const { user } = useSession();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
