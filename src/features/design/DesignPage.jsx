import { useNavigate } from 'react-router-dom';
import { SCREENS } from '../designscreens';
import { useToast } from '../../context/ToastContext';
import { act, getState } from '../../mocks/store';

// Dead design links (href="#") get a real action where one exists; the rest say plainly that they are not wired yet.
function deadLinkAction(label, { nav, toast, el }) {
  const l = label.trim().toLowerCase();
  const ctx = getState().ctx;
  // Actions that act on the current case or alert (ids come from the store selection).
  if (l === 'post note') {
    return () => {
      const box = el?.closest('.card, section, div')?.querySelector('textarea') || el?.closest('div')?.parentElement?.querySelector('textarea');
      const text = (box?.value || '').trim();
      if (!ctx.caseId) return toast('Open a case first.');
      if (!text) return toast('Write a note first.');
      act.addNote(ctx.caseId, text); box.value = ''; toast('Note posted.');
    };
  }
  if (l === 'close case') return () => { if (!ctx.caseId) return toast('Open a case first.'); act.close(ctx.caseId, 'Suspicious activity confirmed', 'Closed from the case page'); toast('Case closed.'); nav(`/cases/${ctx.caseId}`); };
  if (l === 'escalate') return () => { if (!ctx.caseId) return toast('Open a case first.'); act.escalate(ctx.caseId, 'Compliance Manager', 'Escalated from the case page'); toast('Case escalated to the Compliance Manager.'); nav(`/cases/${ctx.caseId}`); };
  if (l === 'put on hold' || l === 'hold case') return () => { if (!ctx.caseId) return toast('Open a case first.'); act.hold(ctx.caseId); toast('Case hold changed.'); };
  if (l === 'reopen case') return () => ctx.caseId ? (act.reopen(ctx.caseId, 'Reopened from the case page'), toast('Case reopened.')) : toast('Open a case first.');
  if (l === 'resolve escalation') return () => ctx.caseId ? (act.resolveEscalation(ctx.caseId), toast('Escalation resolved.')) : toast('Open a case first.');
  if (l === 'resolve' && ctx.alert) return () => { act.alertStatus(ctx.alert, 'Resolved'); toast('Alert resolved.'); };
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
          deadLinkAction(label, { nav, toast, el: a })();
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
