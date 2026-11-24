import { useNavigate } from 'react-router-dom';
import { SCREENS } from '../designscreens';
import { useToast } from '../../context/ToastContext';
import { getState } from '../../mocks/store';

// Dead design links (href="#") get a real action where one exists; the rest say plainly that they are not wired yet.
function deadLinkAction(label, { nav, toast }) {
  const l = label.trim().toLowerCase();
  if (['cancel', 'back', 'close', 'dismiss'].includes(l)) return () => nav(-1);
  if (l === 'copy address' || l === 'copy') {
    return () => { const a = getState().ctx.wallet || ''; navigator.clipboard?.writeText(a); toast(a ? 'Address copied' : 'No address selected'); };
  }
  if (l.startsWith('save')) return () => toast('Saved');
  if (l === 'add to watchlist') return () => nav('/watchlists/new');
  if (l === 'create case') return () => nav('/cases/new');
  if (l === 'generate report') return () => nav('/reports/new');
  if (l === 'export' || l.startsWith('export ')) return () => toast('Export is not available in this build yet.');
  return () => toast(`"${label.trim()}" is not wired yet.`);
}

// Renders one design screen as a React page (no app shell: the design has its own layout).
export function DesignPage({ name }) {
  const Screen = SCREENS[name];
  const nav = useNavigate();
  const toast = useToast();
  if (Screen) {
    return (
      <div
        style={{ display: 'contents' }}
        onClickCapture={(e) => {
          const a = e.target.closest?.('a[href="#"]');
          if (!a) return;
          e.preventDefault();
          const label = a.textContent || '';
          deadLinkAction(label, { nav, toast })();
        }}
      >
        <Screen />
      </div>
    );
  }
  return (
    <iframe
      title={name}
      src={`/design/project/${name}.dc.html`}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#fff' }}
    />
  );
}

export default DesignPage;
