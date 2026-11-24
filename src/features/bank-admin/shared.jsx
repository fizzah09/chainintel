import { ROLE_NAMES } from '../../mocks/seed';

export const ROLE_OPTS = Object.entries(ROLE_NAMES).filter(([k]) => ['inv', 'rev', 'cm', 'ba', 'aud'].includes(k));
