import type { Product } from '../data/products';
import { bucketFor, variantForBucket } from '../experiment/assignment';
import { BADGE_TYPES, type BadgeType, type Variant } from '../experiment/config';

// Fake traffic for the results page. The badge effects are inputs, not findings.

export interface SimulationConfig {
  seed: number;
  sessionsPerDay: number;
  days: number;
  /** Relative click boost per badge when it is shown, 0.1 = +10%. */
  badgeClickLift: Record<BadgeType, number>;
  /** Relative add-to-cart boost when the product page shows a badge. */
  pdpAddToCartLift: number;
  /** Chance of add-to-cart after clicking a product. Drives the baseline conversion. */
  addToCartRate: number;
}

export const DEFAULT_SIMULATION: SimulationConfig = {
  seed: 7,
  sessionsPerDay: 1500,
  days: 28,
  badgeClickLift: { best_rated: 0.12, lowest_returns: 0.05, winparts_choice: 0 },
  pdpAddToCartLift: 0.04,
  addToCartRate: 0.26,
};

const BASE_CLICK_RATE = 0.075;
const KEEP_SCROLLING = 0.9;
const CHECKOUT_RATE = 0.33;

export interface Funnel {
  sessions: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
}

export interface SimulationResult {
  arms: Record<Variant, Funnel>;
  /** Clicks on the product that has (or would have) each badge. */
  badgeClicks: Record<BadgeType, Record<Variant, number>>;
}

// Small seeded random number generator (mulberry32), so a seed always gives the same run.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clickChance(product: Product): number {
  const ratingFactor = 0.55 + 0.45 * Math.min(1, Math.max(0, product.rating - 4));
  const reviewFactor = 0.9 + 0.1 * Math.min(1, product.reviewCount / 100);
  const priceFactor = Math.pow(90 / product.price, 0.35);
  const stockFactor = product.inStock ? 1 : 0.6;
  return BASE_CLICK_RATE * ratingFactor * reviewFactor * priceFactor * stockFactor;
}

const emptyFunnel = (): Funnel => ({ sessions: 0, clicks: 0, addToCarts: 0, purchases: 0 });

export function runSimulation(
  config: SimulationConfig,
  products: Product[],
  badgesByProduct: Record<string, BadgeType[]>,
): SimulationResult {
  const random = seededRandom(config.seed);
  const list = [...products].sort((a, b) => a.salesRank - b.salesRank);

  const arms: Record<Variant, Funnel> = { control: emptyFunnel(), variant: emptyFunnel() };
  const badgeClicks = Object.fromEntries(BADGE_TYPES.map((badge) => [badge, { control: 0, variant: 0 }])) as SimulationResult['badgeClicks'];

  const total = config.sessionsPerDay * config.days;
  for (let id = 0; id < total; id++) {
    const variant = variantForBucket(bucketFor(`sim${config.seed}_${id}`));
    const arm = arms[variant];
    arm.sessions++;

    // Scan the list until a click or until the visitor leaves.
    let clicked: Product | null = null;
    for (const product of list) {
      const badges = badgesByProduct[product.id] ?? [];
      const lift = variant === 'variant' ? badges.reduce((sum, badge) => sum + config.badgeClickLift[badge], 0) : 0;
      if (random() < clickChance(product) * (1 + lift)) {
        clicked = product;
        break;
      }
      if (random() > KEEP_SCROLLING) {
        break;
      }
    }
    if (!clicked) {
      continue;
    }

    const badges = badgesByProduct[clicked.id] ?? [];
    arm.clicks++;
    badges.forEach((badge) => badgeClicks[badge][variant]++);

    const pdpLift = variant === 'variant' && badges.length > 0 ? config.pdpAddToCartLift : 0;
    const stockFactor = clicked.inStock ? 1 : 0.5;
    if (random() >= config.addToCartRate * (1 + pdpLift) * stockFactor) {
      continue;
    }
    arm.addToCarts++;

    if (random() < CHECKOUT_RATE) {
      arm.purchases++;
    }
  }

  return { arms, badgeClicks };
}
