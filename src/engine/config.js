/**
 * Risk engine settings. Points are the rule weights from the product spec (illustrative until
 * back-tested on reviewed cases); the Super Admin "Risk engine" screen edits them at runtime.
 */
export const ENGINE = {
  version: 1,
  // Maximum points a factor can add.
  points: { sanctions: 35, mixer: 20, ransomware: 15, scam: 15, behaviour: 10, counterparties: 5, crossChain: 5, newWallet: 5 },
  // Multiplier by distance: 1 hop = direct counterparty.
  hopDecay: [1, 0.5, 0.25],
  maxHops: 3,
  // Exposure in USD at which a factor reaches its full points (smaller amounts scale down, never below 40%).
  fullAmountUsd: 10000,
  // Tier lower bounds: Moderate, High, Critical.
  tiers: [25, 50, 75],
  // Direct sanctions exposure always lands in Critical.
  sanctionsFloor: true,
  // Behaviour windows (days).
  baselineDays: 90,
  recentDays: 7,
};

export const setEngine = (patch) => Object.assign(ENGINE, patch, { version: ENGINE.version + 1 });

export const tierFor = (score, t = ENGINE.tiers) => (score < t[0] ? 'low' : score < t[1] ? 'mod' : score < t[2] ? 'high' : 'crit');
export const TIER_NAME = { low: 'Low', mod: 'Moderate', high: 'High', crit: 'Critical' };

// Categories that carry risk, with the factor they feed.
export const RISK_CATS = { sanctions: 'sanctions', mixer: 'mixer', ransomware: 'ransomware', scam: 'scam', darknet: 'scam' };
export const CAT_NAME = { sanctions: 'Sanctions exposure', mixer: 'Mixer exposure', ransomware: 'Ransomware exposure', scam: 'Scam / fraud exposure', behaviour: 'Behavioural anomaly', counterparties: 'Suspicious counterparties', crossChain: 'Cross-chain movement', newWallet: 'New wallet, high value' };

export const ETH_USD = 3000; // reference price used when a provider gives no USD value
