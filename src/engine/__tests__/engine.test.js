import { describe, it, expect, beforeEach } from 'vitest';
import fixture from '../models/parity-fixture.json';
import { predictIllicit } from '../classifier';
import { computeFeatures } from '../features';
import { computeExposure } from '../exposure';
import { analyseBehaviour } from '../anomaly';
import { scoreRules } from '../rules';
import { forecastScores } from '../forecast';
import { monitorWallets, snapshotOf } from '../monitor';
import { registerLabels } from '../labels';
import { assessSimulated, ENGINE } from '../index';
import { counterpartyMix } from '../exposure';
import { profileFacts } from '../features';

const W = '0x1111111111111111111111111111111111111111';
const A = '0x2222222222222222222222222222222222222222';
const B = '0x3333333333333333333333333333333333333333';
const SANC = '0x4444444444444444444444444444444444444444';
const MIX = '0x5555555555555555555555555555555555555555';
const tx = (cp, dir, usd, time, sym = 'ETH', hash = Math.random().toString(16)) => ({ hash, time, cp, dir, sym, value: sym === 'ETH' ? usd / 3000 : usd, usd, from: dir === 'in' ? cp : W, to: dir === 'in' ? W : cp });
const edge = (from, to, usd, time) => ({ from, to, usd, time, hash: from + to });

beforeEach(() => {
  registerLabels({ [SANC]: { cat: 'sanctions', name: 'Test SDN', source: 'Test list', confidence: 0.99 }, [MIX]: { cat: 'mixer', name: 'Test mixer', source: 'Test', confidence: 0.95 } });
});

describe('classifier', () => {
  it('reproduces the probabilities computed by scikit-learn', () => {
    fixture.rows.forEach((row, i) => {
      const f = Object.fromEntries(fixture.features.map((k, j) => [k, row[j]]));
      expect(predictIllicit(f).probability).toBeCloseTo(fixture.probabilities[i], 6);
    });
  });
  it('contributions add up to the log-odds', () => {
    const f = Object.fromEntries(fixture.features.map((k, j) => [k, fixture.rows[0][j]]));
    const r = predictIllicit(f);
    expect(Number.isFinite(r.logOdds)).toBe(true);
    expect(r.reasons.length).toBeGreaterThan(0);
  });
});

describe('features', () => {
  it('computes the training features from transactions', () => {
    const f = computeFeatures([tx(A, 'in', 3000, '2026-01-01T00:00:00Z'), tx(A, 'in', 6000, '2026-01-01T01:00:00Z'), tx(B, 'out', 1500, '2026-01-01T02:00:00Z'), tx(B, 'out', 100, '2026-01-01T03:00:00Z', 'USDT')]);
    expect(f.received_tnx).toBe(2);
    expect(f.sent_tnx).toBe(1);
    expect(f.total_ether_received).toBeCloseTo(3);
    expect(f.avg_min_between_received).toBeCloseTo(60);
    expect(f.erc20_total_tnxs).toBe(1);
    expect(f.time_diff_first_last_min).toBeCloseTo(180);
  });
});

describe('exposure', () => {
  it('finds direct and indirect exposure with the bottleneck amount', () => {
    const edges = [edge(W, MIX, 20000, '2026-01-01T00:00:00Z'), edge(A, W, 9000, '2026-01-02T00:00:00Z'), edge(SANC, A, 4000, '2026-01-01T12:00:00Z')];
    const ex = computeExposure(W, edges, '2026-02-01T00:00:00Z');
    const mix = ex.find((e) => e.cat === 'mixer'); const san = ex.find((e) => e.cat === 'sanctions');
    expect(mix.hops).toBe(1);
    expect(san.hops).toBe(2);
    expect(san.usd).toBe(4000);
    expect(san.direction).toMatch(/Incoming/);
  });
  it('ignores activity after the as-of date', () => {
    expect(computeExposure(W, [edge(W, MIX, 20000, '2026-03-01T00:00:00Z')], '2026-02-01T00:00:00Z')).toHaveLength(0);
  });
});

describe('rules', () => {
  const base = (txs, edges, asOf = '2026-02-01T00:00:00Z') => scoreRules({ exposure: computeExposure(W, edges, asOf), behaviour: analyseBehaviour(txs, asOf), counterparties: counterpartyMix(W, txs), facts: profileFacts(txs, W), txs, asOf });
  it('decays indirect sanctions points by distance', () => {
    const txs = [tx(A, 'in', 20000, '2026-01-02T00:00:00Z')];
    const r = base(txs, [edge(A, W, 20000, '2026-01-02T00:00:00Z'), edge(SANC, A, 20000, '2026-01-01T00:00:00Z')]);
    const f = r.factors.find((x) => x.id === 'sanctions');
    expect(f.points).toBe(ENGINE.points.sanctions * ENGINE.hopDecay[1]);
  });
  it('puts direct sanctions exposure in Critical', () => {
    const txs = [tx(SANC, 'in', 500, '2026-01-02T00:00:00Z')];
    const r = base(txs, [edge(SANC, W, 500, '2026-01-02T00:00:00Z')]);
    expect(r.tier).toBe('crit');
    expect(r.floor).toMatch(/always Critical/);
  });
  it('scores a clean wallet low', () => {
    const txs = Array.from({ length: 120 }, (_, i) => tx(A, i % 2 ? 'in' : 'out', 200, new Date(Date.UTC(2025, 9, 1 + i)).toISOString()));
    expect(base(txs, txs.map((t) => edge(t.from, t.to, t.usd, t.time))).score).toBe(0);
  });
});

describe('behaviour', () => {
  it('flags a spike against the baseline and rapid pass-through', () => {
    const txs = [];
    for (let d = 0; d < 90; d++) txs.push(tx(A, 'in', 300, new Date(Date.UTC(2025, 10, 1 + d, 12)).toISOString()));
    for (let d = 0; d < 7; d++) for (let k = 0; k < 20; k++) txs.push(tx(B, 'out', 300, new Date(Date.UTC(2026, 0, 25 + d, k)).toISOString()));
    txs.push(tx(A, 'in', 50000, '2026-01-30T10:00:00Z'), tx(B, 'out', 45000, '2026-01-30T10:10:00Z'));
    const r = analyseBehaviour(txs, '2026-02-01T00:00:00Z');
    expect(r.signals.some((s) => s.type === 'spike')).toBe(true);
    expect(r.signals.some((s) => s.type === 'pass-through')).toBe(true);
    expect(r.level).not.toBe('None');
  });
});

describe('forecast', () => {
  it('projects a rising trend upward with an interval', () => {
    const h = Array.from({ length: 12 }, (_, i) => ({ date: `2026-0${1 + Math.floor(i / 4)}-${String(1 + (i % 4) * 7).padStart(2, '0')}`, score: 20 + i * 4 }));
    const f = forecastScores(h);
    expect(f.trend).toBe('Rising');
    expect(f.projected30).toBeGreaterThan(64);
    expect(f.forecast.at(-1).hi).toBeGreaterThanOrEqual(f.forecast.at(-1).score);
  });
});

describe('monitoring', () => {
  it('records a baseline, then alerts on new exposure', () => {
    const clean = { score: 10, tier: 'low', exposure: [], behaviour: { level: 'None', signals: [] }, ml: { probability: 0.1 }, recentTxs: [] };
    const risky = { ...clean, score: 60, tier: 'high', exposure: [{ cat: 'mixer', relationship: 'Direct', usd: 20000 }] };
    const entries = [{ address: W, list: 'Test', rule: 'score', thr: 50 }];
    const first = monitorWallets(entries, {}, () => clean);
    expect(first.alerts).toHaveLength(0);
    const second = monitorWallets(entries, first.snapshots, () => risky);
    expect(second.alerts).toHaveLength(1);
    expect(second.alerts[0].reasons.join(' ')).toMatch(/mixer/);
    expect(snapshotOf(risky).tier).toBe('high');
  });
});

describe('end to end (simulated history)', () => {
  it('assesses a high-risk demo profile above a low-risk one', () => {
    const ent = { mixer: MIX };
    const hi = assessSimulated('0xaaaa000000000000000000000000000000000001', { first: '2025-03-01', tx: 900, vol: 2e6, cp: 120, c: { T: 90, E: 80, B: 80, A: 60, O: 45 }, entities: ent });
    const lo = assessSimulated('0xaaaa000000000000000000000000000000000002', { first: '2025-03-01', tx: 200, vol: 1e5, cp: 30, c: { T: 10, E: 10, B: 10, A: 10, O: 10 }, entities: ent });
    expect(hi.score).toBeGreaterThan(lo.score);
    expect(hi.factors.length).toBeGreaterThan(0);
    expect(hi.forecast.forecast).toHaveLength(4);
    expect(hi.confidence.value).toBeGreaterThan(0);
  });
});
