import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, act } from '../../mocks/store';
import { allowed } from '../../lib/permissions';
import { PAGES } from '../config/paths';
import { isAddr, isTx } from '../../lib/format';
import AccessDenied from '../../features/errors/pages/AccessDenied';
import RecordMissing from '../../features/errors/pages/RecordMissing';
import { DESIGN_NAMES } from '../../features/design/designNames';

// Which collection a path id must exist in.
const COLLECTION = { caseId: 'cases', evidence: 'evidence', watchlist: 'watchlists', alert: 'alerts', report: 'reports', complaint: 'complaints' };

function valid(s, field, v) {
  if (field === 'wallet') return isAddr(v);
  if (field === 'tx') return isTx(v);
  return s[COLLECTION[field]].some((x) => x.id === v);
}

/**
 * Guards a screen by role/permission and binds its path parameter (/cases/:id, /wallets/:address ...)
 * to the store's current selection, so screens read the selected case, wallet or report from one place.
 */
export default function RoleRoute({ pageKey, roles, children }) {
  const s = useStore();
  const params = useParams();
  // Alias URLs without a parameter (e.g. /graph) keep the current selection.
  const value = Object.values(params)[0];
  const field = value !== undefined ? PAGES[pageKey]?.param : null;
  const ok = roles ? roles.includes(s.session.role) : allowed(s, pageKey);
  const isValid = !field || valid(s, field, value);
  const synced = !field || !isValid || s.ctx[field] === value;

  useEffect(() => {
    if (ok && field && isValid && s.ctx[field] !== value) act.setCtx({ [field]: value });
  }, [ok, field, isValid, value, s.ctx]);

  if (!ok) return <AccessDenied />;
  // Design screens show their own static content; only app pages need the record to exist.
  if (!isValid && !DESIGN_NAMES.has(pageKey)) return <RecordMissing field={field} value={value} />;
  if (!synced) return null;
  return children;
}
