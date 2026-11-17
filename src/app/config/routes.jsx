import Login from '../../features/auth/pages/Login';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import Mfa from '../../features/auth/pages/Mfa';
import { AlertDetail } from '../../features/alerts/pages/AlertDetail';
import { Alerts } from '../../features/alerts/pages/AlertsDashboard';
import { AudDash } from '../../features/audit/pages/AuditDashboard';
import { AuditTrail } from '../../features/audit/pages/AuditTrail';
import { AudCases } from '../../features/audit/pages/CaseRecords';
import { AudActivity } from '../../features/audit/pages/ComplianceActivity';
import { AudEvidence } from '../../features/audit/pages/EvidenceRecords';
import { AudReview } from '../../features/audit/pages/ReviewHistory';
import { BaAudit } from '../../features/bank-admin/pages/BankAuditLogs';
import { BaDash } from '../../features/bank-admin/pages/BankDashboard';
import { BaInvite } from '../../features/bank-admin/pages/InviteUser';
import { BaPerms } from '../../features/bank-admin/pages/PermissionMatrix';
import { BaTeams } from '../../features/bank-admin/pages/Teams';
import { BaUsers } from '../../features/bank-admin/pages/UsersRoles';
import { CComms } from '../../features/cases/pages/CaseCommunication';
import { Wizard } from '../../features/cases/pages/CaseCreateWizard';
import { CaseDialog } from '../../features/cases/pages/CaseDialog';
import { CEvidence } from '../../features/cases/pages/CaseEvidence';
import { CFindings } from '../../features/cases/pages/CaseFindings';
import { CGraph } from '../../features/cases/pages/CaseGraph';
import { CaseList } from '../../features/cases/pages/CaseList';
import { CNotes } from '../../features/cases/pages/CaseNotes';
import { COverview } from '../../features/cases/pages/CaseOverview';
import { CReview } from '../../features/cases/pages/CaseReview';
import { CSubjects } from '../../features/cases/pages/CaseSubjects';
import { CTasks } from '../../features/cases/pages/CaseTasks';
import { CTimeline } from '../../features/cases/pages/CaseTimeline';
import { CmAssign } from '../../features/compliance/pages/CaseAssignment';
import { CmOversight } from '../../features/compliance/pages/CaseOversight';
import { CmConfig } from '../../features/compliance/pages/ComplianceConfig';
import { CmDash } from '../../features/compliance/pages/ComplianceDashboard';
import { CmReviewQueue } from '../../features/compliance/pages/ReviewQueue';
import { CmTeam } from '../../features/compliance/pages/TeamPerformance';
import { StateDenied } from '../../features/errors/pages/AccessDenied';
import { StateConfirm } from '../../features/errors/pages/StateConfirm';
import { StateEmpty } from '../../features/errors/pages/StateEmpty';
import { StateError } from '../../features/errors/pages/StateError';
import { StateLoading } from '../../features/errors/pages/StateLoading';
import { StateStale } from '../../features/errors/pages/StateStale';
import { StateToast } from '../../features/errors/pages/StateToast';
import { EvDetail } from '../../features/evidence/pages/EvidenceDetail';
import { EvUpload } from '../../features/evidence/pages/EvidenceUpload';
import { ErSources } from '../../features/examiner/pages/DataSources';
import { ErDash } from '../../features/examiner/pages/EvaluationDashboard';
import { ErValidation } from '../../features/examiner/pages/EvidenceValidation';
import { ErMethod } from '../../features/examiner/pages/RiskMethodology';
import { ErSystem } from '../../features/examiner/pages/SystemInformation';
import { InvDash } from '../../features/investigator/pages/InvestigatorDashboard';
import { InvCases } from '../../features/investigator/pages/MyCases';
import { InvReports } from '../../features/investigator/pages/MyReports';
import { InvTasks } from '../../features/investigator/pages/MyTasks';
import { Notifications } from '../../features/notifications/pages/NotificationCenter';
import { PaJobs } from '../../features/platform-ops/pages/JobQueue';
import { ReportBuilder } from '../../features/reports/pages/ReportBuilder';
import { ReportLibrary } from '../../features/reports/pages/ReportLibrary';
import { ReportPreview } from '../../features/reports/pages/ReportPreview';
import { RevEvidence } from '../../features/reviewer/pages/EvidenceReview';
import { RevDash } from '../../features/reviewer/pages/ReviewDashboard';
import { RevHistory } from '../../features/reviewer/pages/ReviewHistory';
import { RevQueue } from '../../features/reviewer/pages/ReviewQueue';
import { Search } from '../../features/search/pages/GlobalSearch';
import { Prefs } from '../../features/settings/pages/PersonalPrefs';
import { Profile } from '../../features/settings/pages/ProfilePage';
import { Settings } from '../../features/settings/pages/SettingsPage';
import { SaNetworks } from '../../features/super-admin/pages/BlockchainNetworks';
import { SaTenantCreate } from '../../features/super-admin/pages/CreateTenant';
import { SaProviders } from '../../features/super-admin/pages/DataProviders';
import { SaAudit } from '../../features/super-admin/pages/PlatformAuditLogs';
import { SaDash } from '../../features/super-admin/pages/PlatformOverview';
import { SaUsers } from '../../features/super-admin/pages/PlatformUsers';
import { SaRisk } from '../../features/super-admin/pages/RiskEngine';
import { SaHealth } from '../../features/super-admin/pages/SystemHealth';
import { SaTenants } from '../../features/super-admin/pages/TenantManagement';
import { TraceFilters } from '../../features/tracing/pages/TraceFilters';
import { TraceLimit } from '../../features/tracing/pages/TraceLimitReached';
import { TxDetail } from '../../features/tracing/pages/TransactionDetail';
import { TxRisk } from '../../features/tracing/pages/TransactionRisk';
import { Tracing } from '../../features/tracing/pages/TransactionTracing';
import { WCases } from '../../features/wallets/pages/CasesTab';
import { Counterparties } from '../../features/wallets/pages/CounterpartiesTab';
import { WEvidence } from '../../features/wallets/pages/EvidenceTab';
import { Graph } from '../../features/wallets/pages/GraphTab';
import { WHistory } from '../../features/wallets/pages/HistoryTab';
import { Overview } from '../../features/wallets/pages/OverviewTab';
import { Risk } from '../../features/wallets/pages/RiskTab';
import { Transactions } from '../../features/wallets/pages/TransactionsTab';
import { Monitoring } from '../../features/wallets/pages/WalletMonitoring';
import { WWatch } from '../../features/wallets/pages/WatchlistsTab';
import { WatchCreate } from '../../features/watchlists/pages/WatchlistCreate';
import { WatchDetail } from '../../features/watchlists/pages/WatchlistDetail';
import { WatchList } from '../../features/watchlists/pages/WatchlistList';
import { PAGES, ALIASES } from './paths';

// The element rendered for each screen key.
const SCREENS = {
  NotificationCenter: <Notifications />,
  ProfileMenu: <Profile />,
  GlobalSearch: <Search />,
  PersonalPrefs: <Prefs />,
  WalletMonitoring: <Monitoring />,
  WalletOverview: <Overview />,
  WalletTransactions: <Transactions />,
  WalletCounterparties: <Counterparties />,
  RiskAssessment: <Risk />,
  WalletGraph: <Graph />,
  WalletEvidence: <WEvidence />,
  WalletCases: <WCases />,
  WalletWatchlists: <WWatch />,
  WalletHistory: <WHistory />,
  TransactionTracing: <Tracing />,
  TraceFilters: <TraceFilters />,
  TraceLimitReached: <TraceLimit />,
  TransactionDetail: <TxDetail />,
  TransactionRisk: <TxRisk />,
  CaseList: <CaseList />,
  CaseCreate: <Wizard step={1} />,
  CaseCreate2: <Wizard step={2} />,
  CaseCreate3: <Wizard step={3} />,
  CaseCreate4: <Wizard step={4} />,
  CaseDetails: <COverview />,
  CaseSubjects: <CSubjects />,
  CaseEvidence: <CEvidence />,
  EvidenceUpload: <EvUpload />,
  EvidenceDetail: <EvDetail />,
  CaseFindings: <CFindings />,
  CaseRelGraph: <CGraph />,
  CaseTasks: <CTasks />,
  CaseNotes: <CNotes />,
  CaseComms: <CComms />,
  CaseReview: <CReview />,
  CaseTimeline: <CTimeline />,
  CaseCloseDialog: <CaseDialog dialog="close" forceStatus="Decision" />,
  CaseEscalateDialog: <CaseDialog dialog="escalate" />,
  CaseReassignDialog: <CaseDialog dialog="reassign" />,
  CaseReopen: <CaseDialog dialog="reopen" forceStatus="Closed" />,
  CaseAuditTrail: <AuditTrail scope="case" />,
  WatchlistList: <WatchList />,
  WatchlistCreate: <WatchCreate />,
  WatchlistDetail: <WatchDetail />,
  AlertsDashboard: <Alerts />,
  AlertDetail: <AlertDetail />,
  ReportBuilder: <ReportBuilder />,
  ReportPreview: <ReportPreview />,
  ReportLibrary: <ReportLibrary />,
  INV_Dashboard: <InvDash />,
  INV_MyCases: <InvCases />,
  INV_MyTasks: <InvTasks />,
  INV_Reports: <InvReports />,
  REV_Dashboard: <RevDash />,
  REV_Queue: <RevQueue />,
  REV_Evidence: <RevEvidence />,
  REV_History: <RevHistory />,
  CM_Dashboard: <CmDash />,
  CM_Assignment: <CmAssign />,
  CM_ReviewQueue: <CmReviewQueue />,
  CM_Oversight: <CmOversight />,
  CM_Team: <CmTeam />,
  CM_Config: <CmConfig />,
  BA_Dashboard: <BaDash />,
  BA_Users: <BaUsers />,
  BA_Invite: <BaInvite />,
  BA_Permissions: <BaPerms />,
  BA_Teams: <BaTeams />,
  BA_Audit: <BaAudit />,
  BA_Settings: <Settings />,
  BA_SettingsSecurity: <Settings scope="security" />,
  AUD_Dashboard: <AudDash />,
  AUD_Cases: <AudCases />,
  AUD_Evidence: <AudEvidence />,
  AUD_Review: <AudReview />,
  AUD_Activity: <AudActivity />,
  ER_Dashboard: <ErDash />,
  ER_Method: <ErMethod />,
  ER_Sources: <ErSources />,
  ER_Validation: <ErValidation />,
  ER_System: <ErSystem />,
  SA_Dashboard: <SaDash />,
  SA_Tenants: <SaTenants />,
  SA_TenantCreate: <SaTenantCreate />,
  SA_Users: <SaUsers />,
  SA_Networks: <SaNetworks />,
  SA_Providers: <SaProviders />,
  SA_Risk: <SaRisk />,
  SA_Health: <SaHealth />,
  PA_Jobs: <PaJobs />,
  SA_Audit: <SaAudit />,
  SA_Settings: <Settings scope="platform" />,
  PA_Dashboard: <SaDash />,
  PA_Tenants: <SaTenants />,
  PA_Network: <SaNetworks />,
  PA_Provider: <SaProviders />,
  PA_Settings: <Settings scope="platform" />,
  StateEmpty: <StateEmpty />,
  StateLoading: <StateLoading />,
  StateError: <StateError />,
  StateDenied: <StateDenied />,
  StateStale: <StateStale />,
  StateConfirm: <StateConfirm />,
  StateToast: <StateToast />,
};

// ---------- Public (no shell): sign-in, email OTP, password reset ----------
export const PUBLIC_ROUTES = [
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/mfa', element: <Mfa /> },
];

// ---------- Signed in (inside the app shell) ----------
export const SCREEN_ROUTES = [
  ...Object.entries(PAGES).filter(([, p]) => p.layout !== 'auth').map(([key, p]) => ({ key, path: p.path, element: SCREENS[key] })),
  ...ALIASES.map((a) => ({ key: a.key, path: a.path, roles: a.roles, element: SCREENS[a.key] })),
];
