import { ENGINE, TIER_NAME } from './config';
import { computeFeatures, profileFacts } from './features';
import { computeExposure, counterpartyMix } from './exposure';
import { analyseBehaviour } from './anomaly';
import { scoreRules } from './rules';
import { predictIllicit } from './classifier';
import { forecastScores } from './forecast';
import { assessConfidence } from './confidence';
import { labelFor } from './labels';
import { simulateWallet, BASE_AS_OF } from './sim';
import { fetchLiveData, liveAvailable } from './data';

export { ENGINE, setEngine, tierFor, TIER_NAME, CAT_NAME } from './config';
export { registerLabels, labelFor, LABEL_SOURCES } from './labels';
export { MODEL_INFO } from './classifier';
export { BASE_AS_OF, clearSimCache } from './sim';
export { liveAvailable } from './data';

const WEEK = 7 * 864e5;

/** Logical score only, at a point in time. Used for the weekly history behind the forecast. */
function rulesAt(address, txs, edges, asOf) {
  const cut = Date.parse(asOf);
  const t = txs.filter((x) => Date.parse(x.time) <= cut);
  const facts = profileFacts(t, address);
  return scoreRules({ exposure: computeExposure(address, edges, asOf), behaviour: analyseBehaviour(t, asOf), counterparties: counterpartyMix(address, t), facts, txs: t, asOf });
}

/** Full assessment from transaction data: logical score, predictive signals, confidence. */
export function assessFromData({ address, txs, edges, asOf, mode, withForecast = true }) {
  const facts = profileFacts(txs, address);
  const exposure = computeExposure(address, edges, asOf);
  const behaviour = analyseBehaviour(txs, asOf);
  const counterparties = counterpartyMix(address, txs);
  const rules = scoreRules({ exposure, behaviour, counterparties, facts, txs, asOf });
  const features = computeFeatures(txs);
  const ml = predictIllicit(features);
  let forecast = null;
  if (withForecast) {
    const history = [];
    for (let k = 11; k >= 1; k--) { const at = new Date(Date.parse(asOf) - k * WEEK).toISOString(); history.push({ date: at.slice(0, 10), score: rulesAt(address, txs, edges, at).score }); }
    history.push({ date: asOf.slice(0, 10), score: rules.score });
    forecast = forecastScores(history);
  }
  const confidence = assessConfidence({ mode, facts, exposure, rules, ml });
  const own = labelFor(address);
  const entity = own ? { type: own.cat, label: own.name, confidence: own.confidence ?? 0.9, source: own.source } : { type: 'unknown', label: 'Unknown wallet', confidence: null, source: 'No public label' };
  return {
    address, asOf, mode, engineVersion: ENGINE.version,
    score: rules.score, tier: rules.tier, tierName: TIER_NAME[rules.tier], floor: rules.floor,
    factors: rules.factors, exposure, behaviour, counterparties, facts, features, ml, forecast, confidence, entity,
    recentTxs: txs.slice(-60).reverse(),
  };
}

/** Synchronous assessment on simulated history (no network). */
export function assessSimulated(address, hints, asOf = BASE_AS_OF, opts = {}) {
  const d = simulateWallet(address, hints, asOf);
  return assessFromData({ address, txs: d.txs, edges: d.edges, asOf, mode: 'simulated', ...opts });
}

/** Live assessment when a history provider is configured, otherwise simulated. */
export async function assessWallet(address, { hints, asOf } = {}) {
  if (liveAvailable()) {
    const d = await fetchLiveData(address);
    const at = asOf || new Date().toISOString();
    return assessFromData({ address, txs: d.txs, edges: d.edges, asOf: at, mode: 'live' });
  }
  return assessSimulated(address, hints, asOf || BASE_AS_OF);
}
