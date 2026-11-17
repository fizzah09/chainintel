import { matchPath } from 'react-router-dom';
import { getState } from '../../mocks/store';
import { ROLE_LANDING } from './roles';

/**
 * Every screen (107) with its URL. `param` names the store selection a path parameter binds to:
 * /cases/:id -> ctx.caseId, /wallets/:address -> ctx.wallet, and so on (see app/router/RoleRoute.jsx).
 */
export const PAGES = {
  Main: {"path": "/login", "param": null, "title": "Login", "group": "Authentication & global", "nav": null, "crumbs": [], "layout": "auth"},
  ForgotPassword: {"path": "/forgot-password", "param": null, "title": "Forgot password", "group": "Authentication & global", "nav": null, "crumbs": [], "layout": "auth"},
  MFAVerify: {"path": "/mfa", "param": null, "title": "MFA verification", "group": "Authentication & global", "nav": null, "crumbs": [], "layout": "auth"},
  NotificationCenter: {"path": "/notifications", "param": null, "title": "Notification center", "group": "Authentication & global", "nav": "Notifications", "crumbs": ["Notifications"], "layout": "app"},
  ProfileMenu: {"path": "/settings/profile", "param": null, "title": "Profile menu", "group": "Authentication & global", "nav": "Notifications", "crumbs": ["Profile"], "layout": "app"},
  GlobalSearch: {"path": "/search", "param": null, "title": "Global search", "group": "Authentication & global", "nav": "Wallet Monitoring", "crumbs": ["Search"], "layout": "app"},
  PersonalPrefs: {"path": "/settings/preferences", "param": null, "title": "Personal preferences", "group": "Authentication & global", "nav": "Personal Preferences", "crumbs": ["Personal preferences"], "layout": "app"},
  WalletMonitoring: {"path": "/wallets", "param": null, "title": "Wallet monitoring", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring"], "layout": "app"},
  WalletOverview: {"path": "/wallets/:address", "param": "wallet", "title": "Wallet · Overview", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Overview"], "layout": "app"},
  WalletTransactions: {"path": "/wallets/:address/transactions", "param": "wallet", "title": "Wallet · Transactions", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Transactions"], "layout": "app"},
  WalletCounterparties: {"path": "/wallets/:address/counterparties", "param": "wallet", "title": "Wallet · Counterparties", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Counterparties"], "layout": "app"},
  RiskAssessment: {"path": "/wallets/:address/risk", "param": "wallet", "title": "Wallet · Risk Assessment", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Risk Assessment"], "layout": "app"},
  WalletGraph: {"path": "/wallets/:address/graph", "param": "wallet", "title": "Wallet · Graph", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Graph"], "layout": "app"},
  WalletEvidence: {"path": "/wallets/:address/evidence", "param": "wallet", "title": "Wallet · Evidence", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Evidence"], "layout": "app"},
  WalletCases: {"path": "/wallets/:address/cases", "param": "wallet", "title": "Wallet · Cases", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Cases"], "layout": "app"},
  WalletWatchlists: {"path": "/wallets/:address/watchlists", "param": "wallet", "title": "Wallet · Watchlists", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "Watchlists"], "layout": "app"},
  WalletHistory: {"path": "/wallets/:address/history", "param": "wallet", "title": "Wallet · History", "group": "Wallet intelligence", "nav": "Wallet Monitoring", "crumbs": ["Wallet Monitoring", "0x7a3f…9B21", "History"], "layout": "app"},
  TransactionTracing: {"path": "/trace", "param": null, "title": "Transaction tracing", "group": "Transaction tracing", "nav": "Transaction Tracing", "crumbs": ["Transaction Tracing"], "layout": "app"},
  TraceFilters: {"path": "/trace/filters", "param": null, "title": "Trace filters and limits", "group": "Transaction tracing", "nav": "Transaction Tracing", "crumbs": ["Transaction Tracing", "Filters"], "layout": "app"},
  TraceLimitReached: {"path": "/trace/limit-reached", "param": null, "title": "Graph limit reached", "group": "Transaction tracing", "nav": "Transaction Tracing", "crumbs": ["Transaction Tracing", "Limit reached"], "layout": "app"},
  TransactionDetail: {"path": "/transactions/:hash", "param": "tx", "title": "Transaction detail", "group": "Transaction tracing", "nav": "Transaction Tracing", "crumbs": ["Transaction Tracing", "Transaction detail"], "layout": "app"},
  TransactionRisk: {"path": "/transactions/:hash/risk", "param": "tx", "title": "Transaction risk drilldown", "group": "Transaction tracing", "nav": "Transaction Tracing", "crumbs": ["Transaction Tracing", "Risk drilldown"], "layout": "app"},
  CaseList: {"path": "/cases", "param": null, "title": "Case list", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases"], "layout": "app"},
  CaseCreate: {"path": "/cases/new", "param": null, "title": "Create case", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "Create case"], "layout": "app"},
  CaseCreate2: {"path": "/cases/new/subjects", "param": null, "title": "Create case · Subjects", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "Create case", "Subjects"], "layout": "app"},
  CaseCreate3: {"path": "/cases/new/assignment", "param": null, "title": "Create case · Priority and assignment", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "Create case", "Priority"], "layout": "app"},
  CaseCreate4: {"path": "/cases/new/review", "param": null, "title": "Create case · Evidence and review", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "Create case", "Review"], "layout": "app"},
  CaseDetails: {"path": "/cases/:id", "param": "caseId", "title": "Case · Overview", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Overview"], "layout": "app"},
  CaseSubjects: {"path": "/cases/:id/subjects", "param": "caseId", "title": "Case · Subjects", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Subjects"], "layout": "app"},
  CaseEvidence: {"path": "/cases/:id/evidence", "param": "caseId", "title": "Case · Evidence", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Evidence"], "layout": "app"},
  CaseFindings: {"path": "/cases/:id/findings", "param": "caseId", "title": "Case · Findings", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Findings"], "layout": "app"},
  CaseRelGraph: {"path": "/cases/:id/graph", "param": "caseId", "title": "Case investigation graph", "group": "Case lifecycle", "nav": "Investigation Graph", "crumbs": ["Cases", "CASE-2026-00128", "Graph"], "layout": "app"},
  CaseTasks: {"path": "/cases/:id/tasks", "param": "caseId", "title": "Case · Tasks", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Tasks"], "layout": "app"},
  CaseNotes: {"path": "/cases/:id/notes", "param": "caseId", "title": "Case · Notes", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Notes"], "layout": "app"},
  CaseComms: {"path": "/cases/:id/communication", "param": "caseId", "title": "Case · Communication", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Communication"], "layout": "app"},
  CaseReview: {"path": "/cases/:id/review", "param": "caseId", "title": "Case review", "group": "Case lifecycle", "nav": "Case Review", "crumbs": ["Review Queue", "CASE-2026-00128"], "layout": "app"},
  CaseTimeline: {"path": "/cases/:id/timeline", "param": "caseId", "title": "Case · Timeline", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Timeline"], "layout": "app"},
  CaseCloseDialog: {"path": "/cases/:id/close", "param": "caseId", "title": "Close case dialog", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128"], "layout": "app"},
  CaseEscalateDialog: {"path": "/cases/:id/escalate", "param": "caseId", "title": "Escalate case dialog", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128"], "layout": "app"},
  CaseReassignDialog: {"path": "/cases/:id/reassign", "param": "caseId", "title": "Reassign case dialog", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128"], "layout": "app"},
  CaseReopen: {"path": "/cases/:id/reopen", "param": "caseId", "title": "Reopen case", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00102"], "layout": "app"},
  CaseAuditTrail: {"path": "/cases/:id/audit", "param": "caseId", "title": "Case audit trail", "group": "Case lifecycle", "nav": "Audit Logs", "crumbs": ["Audit Logs", "CASE-2026-00128"], "layout": "app"},
  EvidenceUpload: {"path": "/evidence/new", "param": null, "title": "Add evidence", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "Add evidence"], "layout": "app"},
  EvidenceDetail: {"path": "/evidence/:id", "param": "evidence", "title": "Evidence detail", "group": "Case lifecycle", "nav": "My Cases", "crumbs": ["Cases", "CASE-2026-00128", "EVD-000184"], "layout": "app"},
  WatchlistList: {"path": "/watchlists", "param": null, "title": "Watchlists", "group": "Watchlists, alerts & reports", "nav": "My Watchlists", "crumbs": ["Watchlists"], "layout": "app"},
  WatchlistCreate: {"path": "/watchlists/new", "param": null, "title": "Create watchlist", "group": "Watchlists, alerts & reports", "nav": "My Watchlists", "crumbs": ["Watchlists", "Create"], "layout": "app"},
  WatchlistDetail: {"path": "/watchlists/:id", "param": "watchlist", "title": "Watchlist detail", "group": "Watchlists, alerts & reports", "nav": "My Watchlists", "crumbs": ["Watchlists", "High-risk counterparties"], "layout": "app"},
  AlertsDashboard: {"path": "/alerts", "param": null, "title": "Alerts dashboard", "group": "Watchlists, alerts & reports", "nav": "Alerts", "crumbs": ["Alerts"], "layout": "app"},
  AlertDetail: {"path": "/alerts/:id", "param": "alert", "title": "Alert detail", "group": "Watchlists, alerts & reports", "nav": "Alerts", "crumbs": ["Alerts", "ALR-2026-0912"], "layout": "app"},
  ReportBuilder: {"path": "/reports/new", "param": null, "title": "Report builder", "group": "Reports", "nav": "Reports", "crumbs": ["Reports", "New report"], "layout": "app"},
  ReportPreview: {"path": "/reports/:id", "param": "report", "title": "Report preview", "group": "Reports", "nav": "Reports", "crumbs": ["Reports", "RPT-2026-0214"], "layout": "app"},
  ReportLibrary: {"path": "/reports", "param": null, "title": "Report library", "group": "Reports", "nav": "Reports", "crumbs": ["Reports"], "layout": "app"},
  INV_Dashboard: {"path": "/dashboard", "param": null, "title": "Investigator dashboard", "group": "Investigator", "nav": "Investigator Dashboard", "crumbs": ["Investigator Dashboard"], "layout": "app"},
  INV_MyCases: {"path": "/my/cases", "param": null, "title": "My cases", "group": "Investigator", "nav": "My Cases", "crumbs": ["My Cases"], "layout": "app"},
  INV_MyTasks: {"path": "/my/tasks", "param": null, "title": "My tasks", "group": "Investigator", "nav": "My Tasks", "crumbs": ["My Tasks"], "layout": "app"},
  INV_Reports: {"path": "/my/reports", "param": null, "title": "Reports", "group": "Investigator", "nav": "Reports", "crumbs": ["Reports"], "layout": "app"},
  REV_Dashboard: {"path": "/review", "param": null, "title": "Review dashboard", "group": "Reviewer", "nav": "Review Dashboard", "crumbs": ["Review Dashboard"], "layout": "app"},
  REV_Queue: {"path": "/review/queue", "param": null, "title": "Review queue", "group": "Reviewer", "nav": "Review Queue", "crumbs": ["Review Queue"], "layout": "app"},
  REV_Evidence: {"path": "/review/evidence", "param": null, "title": "Evidence review", "group": "Reviewer", "nav": "Evidence Review", "crumbs": ["Evidence Review"], "layout": "app"},
  REV_History: {"path": "/review/history", "param": null, "title": "Review history", "group": "Reviewer", "nav": "Review History", "crumbs": ["Review History"], "layout": "app"},
  CM_Dashboard: {"path": "/compliance", "param": null, "title": "Compliance dashboard", "group": "Compliance Manager", "nav": "Compliance Dashboard", "crumbs": ["Compliance Dashboard"], "layout": "app"},
  CM_Assignment: {"path": "/compliance/assignment", "param": null, "title": "Case assignment", "group": "Compliance Manager", "nav": "Case Assignment", "crumbs": ["Case Assignment"], "layout": "app"},
  CM_ReviewQueue: {"path": "/compliance/review-queue", "param": null, "title": "Review queue", "group": "Compliance Manager", "nav": "Review Queue", "crumbs": ["Review Queue"], "layout": "app"},
  CM_Oversight: {"path": "/compliance/oversight", "param": null, "title": "Case oversight", "group": "Compliance Manager", "nav": "Case Oversight", "crumbs": ["Case Oversight"], "layout": "app"},
  CM_Team: {"path": "/compliance/team", "param": null, "title": "Team performance", "group": "Compliance Manager", "nav": "Team Performance", "crumbs": ["Team Performance"], "layout": "app"},
  CM_Config: {"path": "/compliance/config", "param": null, "title": "Compliance configuration", "group": "Compliance Manager", "nav": "Compliance Configuration", "crumbs": ["Compliance Configuration"], "layout": "app"},
  BA_Dashboard: {"path": "/admin", "param": null, "title": "Bank dashboard", "group": "Bank Admin", "nav": "Bank Dashboard", "crumbs": ["Bank Dashboard"], "layout": "app"},
  BA_Users: {"path": "/admin/users", "param": null, "title": "Users and roles", "group": "Bank Admin", "nav": "Users & Roles", "crumbs": ["Users & Roles"], "layout": "app"},
  BA_Invite: {"path": "/admin/users/invite", "param": null, "title": "Invite user", "group": "Bank Admin", "nav": "Users & Roles", "crumbs": ["Users & Roles", "Invite user"], "layout": "app"},
  BA_Permissions: {"path": "/admin/users/permissions", "param": null, "title": "Permission matrix", "group": "Bank Admin", "nav": "Users & Roles", "crumbs": ["Users & Roles", "Permissions"], "layout": "app"},
  BA_Teams: {"path": "/admin/teams", "param": null, "title": "Teams", "group": "Bank Admin", "nav": "Teams", "crumbs": ["Teams"], "layout": "app"},
  BA_Audit: {"path": "/admin/audit", "param": null, "title": "Audit logs", "group": "Bank Admin", "nav": "Audit Logs", "crumbs": ["Audit Logs"], "layout": "app"},
  BA_Settings: {"path": "/admin/settings", "param": null, "title": "Bank settings", "group": "Bank Admin", "nav": "Bank Settings", "crumbs": ["Bank Settings"], "layout": "app"},
  BA_SettingsSecurity: {"path": "/admin/settings/security", "param": null, "title": "Bank settings · Security", "group": "Bank Admin", "nav": "Bank Settings", "crumbs": ["Bank Settings"], "layout": "app"},
  AUD_Dashboard: {"path": "/audit", "param": null, "title": "Audit dashboard", "group": "Auditor", "nav": "Audit Dashboard", "crumbs": ["Audit Dashboard"], "layout": "app"},
  AUD_Cases: {"path": "/audit/cases", "param": null, "title": "Case records", "group": "Auditor", "nav": "Case Records", "crumbs": ["Case Records"], "layout": "app"},
  AUD_Evidence: {"path": "/audit/evidence", "param": null, "title": "Evidence records", "group": "Auditor", "nav": "Evidence Records", "crumbs": ["Evidence Records"], "layout": "app"},
  AUD_Review: {"path": "/audit/review-history", "param": null, "title": "Review history", "group": "Auditor", "nav": "Review History", "crumbs": ["Review History"], "layout": "app"},
  AUD_Activity: {"path": "/audit/compliance-activity", "param": null, "title": "Compliance activity", "group": "Auditor", "nav": "Compliance Activity", "crumbs": ["Compliance Activity"], "layout": "app"},
  ER_Dashboard: {"path": "/examiner", "param": null, "title": "Evaluation dashboard", "group": "Academic Examiner", "nav": "Evaluation Dashboard", "crumbs": ["Evaluation Dashboard"], "layout": "app"},
  ER_Method: {"path": "/examiner/methodology", "param": null, "title": "Risk methodology", "group": "Academic Examiner", "nav": "Risk Methodology", "crumbs": ["Risk Methodology"], "layout": "app"},
  ER_Sources: {"path": "/examiner/sources", "param": null, "title": "Data sources", "group": "Academic Examiner", "nav": "Data Sources", "crumbs": ["Data Sources"], "layout": "app"},
  ER_Validation: {"path": "/examiner/validation", "param": null, "title": "Evidence validation", "group": "Academic Examiner", "nav": "Evidence Validation", "crumbs": ["Evidence Validation"], "layout": "app"},
  ER_System: {"path": "/examiner/system", "param": null, "title": "System information", "group": "Academic Examiner", "nav": "System Information", "crumbs": ["System Information"], "layout": "app"},
  SA_Dashboard: {"path": "/platform", "param": null, "title": "Platform overview", "group": "Super Admin", "nav": "Platform Overview", "crumbs": ["Platform Overview"], "layout": "app"},
  SA_Tenants: {"path": "/platform/tenants", "param": null, "title": "Tenant management", "group": "Super Admin", "nav": "Tenant Management", "crumbs": ["Tenant Management"], "layout": "app"},
  SA_TenantCreate: {"path": "/platform/tenants/new", "param": null, "title": "Create tenant", "group": "Super Admin", "nav": "Tenant Management", "crumbs": ["Tenant Management", "Create"], "layout": "app"},
  SA_Users: {"path": "/platform/users", "param": null, "title": "Platform users", "group": "Super Admin", "nav": "Platform Users", "crumbs": ["Platform Users"], "layout": "app"},
  SA_Networks: {"path": "/platform/networks", "param": null, "title": "Blockchain networks", "group": "Super Admin", "nav": "Blockchain Networks", "crumbs": ["Blockchain Networks"], "layout": "app"},
  SA_Providers: {"path": "/platform/providers", "param": null, "title": "Data providers", "group": "Super Admin", "nav": "Data Providers", "crumbs": ["Data Providers"], "layout": "app"},
  SA_Risk: {"path": "/platform/risk-engine", "param": null, "title": "Risk engine", "group": "Super Admin", "nav": "Risk Engine", "crumbs": ["Risk Engine"], "layout": "app"},
  SA_Health: {"path": "/platform/health", "param": null, "title": "System health", "group": "Super Admin", "nav": "System Health", "crumbs": ["System Health"], "layout": "app"},
  PA_Jobs: {"path": "/platform/jobs", "param": null, "title": "Job queue", "group": "Super Admin", "nav": "Job Queue", "crumbs": ["Job Queue"], "layout": "app"},
  SA_Audit: {"path": "/platform/audit", "param": null, "title": "Platform audit logs", "group": "Super Admin", "nav": "Audit Logs", "crumbs": ["Audit Logs"], "layout": "app"},
  SA_Settings: {"path": "/platform/settings", "param": null, "title": "Platform settings", "group": "Super Admin", "nav": "Platform Settings", "crumbs": ["Platform Settings"], "layout": "app"},
  PA_Dashboard: {"path": "/ops", "param": null, "title": "Operations dashboard", "group": "Platform Admin", "nav": "Operations Dashboard", "crumbs": ["Operations Dashboard"], "layout": "app"},
  PA_Tenants: {"path": "/ops/tenants", "param": null, "title": "Tenants", "group": "Platform Admin", "nav": "Tenants", "crumbs": ["Tenants"], "layout": "app"},
  PA_Network: {"path": "/ops/network", "param": null, "title": "Network monitoring", "group": "Platform Admin", "nav": "Network Monitoring", "crumbs": ["Network Monitoring"], "layout": "app"},
  PA_Provider: {"path": "/ops/providers", "param": null, "title": "Provider monitoring", "group": "Platform Admin", "nav": "Provider Monitoring", "crumbs": ["Provider Monitoring"], "layout": "app"},
  PA_Settings: {"path": "/ops/settings", "param": null, "title": "Operations settings", "group": "Platform Admin", "nav": "Operations Settings", "crumbs": ["Operations Settings"], "layout": "app"},
  StateEmpty: {"path": "/states/empty", "param": null, "title": "Empty state", "group": "States & dialogs", "nav": "My Cases", "crumbs": ["Cases"], "layout": "app"},
  StateLoading: {"path": "/states/loading", "param": null, "title": "Loading skeleton", "group": "States & dialogs", "nav": "Wallet Monitoring", "crumbs": ["Wallet"], "layout": "app"},
  StateError: {"path": "/states/error", "param": null, "title": "Error state", "group": "States & dialogs", "nav": "Wallet Monitoring", "crumbs": ["Wallet"], "layout": "app"},
  StateDenied: {"path": "/states/denied", "param": null, "title": "Access denied", "group": "States & dialogs", "nav": "Audit Dashboard", "crumbs": ["Access"], "layout": "app"},
  StateStale: {"path": "/states/stale", "param": null, "title": "Stale data and provider outage", "group": "States & dialogs", "nav": "Wallet Monitoring", "crumbs": ["Wallet"], "layout": "app"},
  StateConfirm: {"path": "/states/confirm", "param": null, "title": "Destructive confirmation", "group": "States & dialogs", "nav": "Users & Roles", "crumbs": ["Users & Roles"], "layout": "app"},
  StateToast: {"path": "/states/toast", "param": null, "title": "Feedback patterns", "group": "States & dialogs", "nav": "My Cases", "crumbs": ["Feedback"], "layout": "app"},
};

/** Extra URLs that reuse a screen (kept from the reference router). `roles` overrides the screen's own guard. */
export const ALIASES = [{"path": "/graph", "key": "CaseRelGraph", "roles": null}, {"path": "/review/case", "key": "CaseReview", "roles": null}, {"path": "/audit/reports", "key": "ReportLibrary", "roles": ["aud"]}, {"path": "/audit/logs", "key": "BA_Audit", "roles": ["aud"]}, {"path": "/ops/users", "key": "SA_Users", "roles": ["pa", "sa"]}, {"path": "/ops/jobs", "key": "PA_Jobs", "roles": ["pa", "sa"]}, {"path": "/ops/health", "key": "SA_Health", "roles": ["pa", "sa"]}, {"path": "/ops/audit", "key": "SA_Audit", "roles": ["pa", "sa"]}, {"path": "/platform/watchlists", "key": "WatchlistList", "roles": ["sa"]}];

/** URL of a screen. Path parameters are filled from `params` or from the current selection in the store. */
export function pathOf(key, value) {
  const p = PAGES[key];
  if (!p) return '/';
  if (!p.param) return p.path;
  const v = value ?? getState().ctx[p.param];
  return p.path.replace(/:[a-zA-Z]+/, encodeURIComponent(v));
}

export const homeOf = (role) => pathOf(ROLE_LANDING[role] || 'INV_Dashboard');

// Static patterns first so /cases/new wins over /cases/:id.
const ORDER = [...Object.entries(PAGES).map(([key, p]) => ({ key, pattern: p.path })), ...ALIASES.map((a) => ({ key: a.key, pattern: a.path, alias: true }))]
  .sort((a, b) => a.pattern.includes(':') - b.pattern.includes(':'));

/** Screen metadata for a URL (title, breadcrumbs, menu label), or null. */
export function pageAt(pathname) {
  for (const r of ORDER) {
    if (matchPath({ path: r.pattern, end: true }, pathname)) return { key: r.key, ...PAGES[r.key], path: pathname };
  }
  return null;
}
