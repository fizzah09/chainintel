// Role codes used across the app and the mock store.
export const ROLES = {
  INVESTIGATOR: 'inv',
  REVIEWER: 'rev',
  COMPLIANCE: 'cm',
  BANK_ADMIN: 'ba',
  AUDITOR: 'aud',
  ACADEMIC_EXAMINER: 'ex',
  PLATFORM_ADMIN: 'pa',
  SUPER_ADMIN: 'sa',
};

export const ROLE_LIST = Object.values(ROLES);

export const ROLE_LABELS = {"inv": "Investigator", "rev": "Reviewer", "cm": "Compliance Manager", "ba": "Bank Admin", "aud": "Auditor", "ex": "Academic Examiner", "pa": "Platform Admin", "sa": "Super Admin"};

export const ROLE_SCOPES = { inv: 'tenant', rev: 'tenant', cm: 'tenant', ba: 'tenant', aud: 'tenant', ex: 'tenant', pa: 'platform', sa: 'platform' };

// Screen key each role lands on after sign-in (see app/config/paths.js).
export const ROLE_LANDING = {"inv": "INV_Dashboard", "rev": "REV_Dashboard", "cm": "CM_Dashboard", "ba": "BA_Dashboard", "aud": "AUD_Dashboard", "ex": "ER_Dashboard", "pa": "PA_Dashboard", "sa": "SA_Dashboard"};
