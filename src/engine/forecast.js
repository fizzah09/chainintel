import { ENGINE } from './config';

/**
 * Risk trend forecast. Takes the wallet's logical score re-computed at weekly cut-offs and fits
 * Holt's trend with damping (trends fade instead of running away). The interval widens with the horizon using
 * the spread of one-step-ahead errors. Output: next 4 weeks (about 30 days).
 */
export function forecastScores(history, { alpha = 0.5, beta = 0.3, phi = 0.85, horizon = 4 } = {}) {
  const ys = history.map((h) => h.score);
  if (ys.length < 3) return { history, forecast: [], trend: 'insufficient data', projected30: null, chanceHigh: null };
  let level = ys[0], trend = ys[1] - ys[0];
  const errs = [];
  for (let i = 1; i < ys.length; i++) {
    const pred = level + phi * trend;
    errs.push(ys[i] - pred);
    const prevLevel = level;
    level = alpha * ys[i] + (1 - alpha) * (level + phi * trend);
    trend = beta * (level - prevLevel) + (1 - beta) * phi * trend;
  }
  const sigma = Math.max(4, Math.sqrt(errs.reduce((a, e) => a + e * e, 0) / errs.length));
  const last = Date.parse(history[history.length - 1].date);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const forecast = [];
  const damp = (h) => { let s = 0; for (let k = 1; k <= h; k++) s += phi ** k; return s; };
  for (let h = 1; h <= horizon; h++) {
    const mid = level + damp(h) * trend;
    const w = 1.645 * sigma * Math.sqrt(h); // ~90% interval
    forecast.push({ date: new Date(last + h * 7 * 864e5).toISOString().slice(0, 10), score: Math.round(clamp(mid)), lo: Math.round(clamp(mid - w)), hi: Math.round(clamp(mid + w)) });
  }
  const end = forecast[forecast.length - 1];
  const now = ys[ys.length - 1];
  const delta = end.score - now;
  // chance the score is High or above in ~30 days (normal approximation)
  const z = (ENGINE.tiers[1] - (level + damp(horizon) * trend)) / (sigma * Math.sqrt(horizon));
  const chanceHigh = 1 - normCdf(z);
  return { history, forecast, trend: delta >= 5 ? 'Rising' : delta <= -5 ? 'Falling' : 'Stable', projected30: end.score, delta, chanceHigh, sigma: Math.round(sigma * 10) / 10, method: `Damped Holt trend (alpha ${alpha}, beta ${beta}, damping ${phi}) on ${ys.length} weekly scores` };
}

function normCdf(z) {
  // Abramowitz-Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
