
export const Chip = ({ k = '', children }) => <span className={`chip ${k}`}>{children}</span>;

export const SM = { Open: 'blue', New: 'gray', Assigned: 'blue', 'Evidence Collection': 'blue', Analysis: 'blue', 'In Progress': 'blue', 'Under Review': 'pur', Review: 'pur', Escalated: 'bad', Closed: 'gray', 'On Hold': 'warn', Reopened: 'pur', Decision: 'pur', Verified: 'ok', 'Pending Verification': 'warn', Rejected: 'bad', Unverified: 'gray', 'Source Unavailable': 'bad', Success: 'ok', Failed: 'bad', Active: 'ok', Suspended: 'bad', Invited: 'warn', Disabled: 'gray', Completed: 'ok', Overdue: 'bad', Waiting: 'warn', Cancelled: 'gray', Draft: 'gray', Sent: 'blue', 'Awaiting Response': 'warn', 'Response Received': 'ok', Healthy: 'ok', Degraded: 'warn', Down: 'bad', Queued: 'gray', Running: 'blue', Retrying: 'warn', Approved: 'ok', Returned: 'warn', Pending: 'warn', Acknowledged: 'blue', Resolved: 'ok', Unacknowledged: 'bad', Enabled: 'ok', Final: 'ok' };

export const Status = ({ s }) => <span className={`chip ${SM[s] || ''}`}>{s}</span>;

export const Prio = ({ p }) => <Chip k={{ Low: 'gray', Medium: 'blue', High: 'warn', Critical: 'bad' }[p]}>{p}</Chip>;
