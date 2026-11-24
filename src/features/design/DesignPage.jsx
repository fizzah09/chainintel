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
  if (['check now', 'run health check', 'test connection'].includes(l)) return () => toast('No provider backend is connected, so this check cannot run.');
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
  if (l === 'export' || l.startsWith('export ')) return () => {
    // Export the table on this screen (first visible table) as a CSV file.
    const table = el?.closest('.card, .content, main')?.querySelector('table') || document.querySelector('table');
    if (!table) return toast('Nothing to export on this screen.');
    const rows = [...table.querySelectorAll('tr')].map((tr) => [...tr.children].map((c) => c.textContent.replace(/\s+/g, ' ').trim()));
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join(String.fromCharCode(10));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `${(document.title || 'export').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast(`Exported ${Math.max(0, rows.length - 1)} rows.`);
  };
  return null; // unknown: links say not wired yet; buttons keep their own handlers
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
          const a = e.target.closest?.('a[href="#"], button, .btn, .sel');
          if (!a) return;
          const label = a.textContent || '';
          // Buttons with their own handlers (e.g. Save changes) only get Export here; links get the full set.
          if (a.tagName !== 'A' && !label.trim().toLowerCase().startsWith('export')) return;
          const action = deadLinkAction(label, { nav, toast, el: a });
          if (action) { e.preventDefault(); action(); return; }
          if (a.tagName === 'A' && a.getAttribute('href') === '#') { e.preventDefault(); toast(`"${label.trim()}" is not wired yet.`); }
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
