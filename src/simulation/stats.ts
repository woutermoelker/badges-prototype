// Basic A/B statistics: a two-proportion z-test with a 95% interval on the relative uplift.

const Z_95 = 1.96; // two-sided, alpha 0.05
const Z_POWER_80 = 0.84;

/** Standard normal CDF (Abramowitz & Stegun approximation). */
function normalCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return x < 0 ? 0.5 * (1 - erf) : 0.5 * (1 + erf);
}

export interface Comparison {
  controlRate: number;
  variantRate: number;
  /** (variant - control) / control */
  uplift: number;
  low: number;
  high: number;
  pValue: number;
  significant: boolean;
}

export function compare(controlHits: number, controlTotal: number, variantHits: number, variantTotal: number): Comparison {
  const controlRate = controlHits / controlTotal;
  const variantRate = variantHits / variantTotal;
  if (controlHits === 0 || variantHits === 0) {
    return { controlRate, variantRate, uplift: 0, low: -1, high: 1, pValue: 1, significant: false };
  }

  // Interval on the ratio of the two rates (log scale).
  const logRatio = Math.log(variantRate / controlRate);
  const logError = Math.sqrt((1 - controlRate) / controlHits + (1 - variantRate) / variantHits);

  const pooled = (controlHits + variantHits) / (controlTotal + variantTotal);
  const error = Math.sqrt(pooled * (1 - pooled) * (1 / controlTotal + 1 / variantTotal));
  const pValue = 2 * (1 - normalCdf(Math.abs((variantRate - controlRate) / error)));

  return {
    controlRate,
    variantRate,
    uplift: variantRate / controlRate - 1,
    low: Math.exp(logRatio - Z_95 * logError) - 1,
    high: Math.exp(logRatio + Z_95 * logError) - 1,
    pValue,
    significant: pValue < 0.05,
  };
}

/** Sessions per group needed to detect a relative uplift (alpha 0.05, power 80%). */
export function sessionsNeeded(baseline: number, uplift: number): number {
  const target = baseline * (1 + uplift);
  const variance = baseline * (1 - baseline) + target * (1 - target);
  return Math.ceil(((Z_95 + Z_POWER_80) ** 2 * variance) / (target - baseline) ** 2);
}

/** Smallest relative uplift you can reliably detect with this many sessions per group. */
export function detectableUplift(baseline: number, sessionsPerGroup: number): number {
  return ((Z_95 + Z_POWER_80) * Math.sqrt((2 * baseline * (1 - baseline)) / sessionsPerGroup)) / baseline;
}
