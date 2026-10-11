import type { Product } from '../data/products';
import type { BadgeRuleOptions, BadgeType } from './config';

export interface BadgeRow {
  productId: string;
  bayesRating: number;
  returnRate: number;
  badges: BadgeType[];
}

export interface BadgeComputation {
  byProduct: Record<string, BadgeType[]>;
  rows: BadgeRow[];
  winners: Record<BadgeType, string | null>;
  meanRating: number;
}

export function returnRate(product: Product, countFitmentReturns: boolean): number {
  const { wrong_fitment, changed_mind, defect, other } = product.returns90d;
  const returned = changed_mind + defect + other + (countFitmentReturns ? wrong_fitment : 0);
  return returned / product.unitsSold90d;
}

/** Decides which products get a badge, over the whole category. In production: a nightly job. */
export function computeBadges(products: Product[], rules: BadgeRuleOptions): BadgeComputation {
  const totalReviews = products.reduce((sum, product) => sum + product.reviewCount, 0);
  const meanRating = products.reduce((sum, product) => sum + product.rating * product.reviewCount, 0) / totalReviews;

  // Bayesian average: pulls products with few reviews towards the category mean.
  const bayesRating = (product: Product): number =>
    (rules.minReviews * meanRating + product.rating * product.reviewCount) / (rules.minReviews + product.reviewCount);

  const inStock = products.filter((product) => product.inStock);

  const bestRated = inStock
    .filter((product) => product.reviewCount >= rules.minReviews)
    .sort((a, b) => bayesRating(b) - bayesRating(a))[0];

  const lowestReturns = inStock
    .filter((product) => product.unitsSold90d >= rules.minUnitsSold)
    .sort((a, b) => returnRate(a, rules.countFitmentReturns) - returnRate(b, rules.countFitmentReturns))[0];

  // The curated pick never goes to a product that already has an objective badge.
  const choice = rules.curatedChoiceIds
    .map((id) => inStock.find((product) => product.id === id))
    .find(
      (product) =>
        product &&
        product.rating >= rules.choiceMinRating &&
        product.reviewCount >= rules.minReviews &&
        product !== bestRated &&
        product !== lowestReturns,
    );

  const winners: Record<BadgeType, string | null> = {
    best_rated: bestRated?.id ?? null,
    lowest_returns: lowestReturns?.id ?? null,
    winparts_choice: choice?.id ?? null,
  };

  const rows: BadgeRow[] = products.map((product) => {
    return {
      productId: product.id,
      bayesRating: bayesRating(product),
      returnRate: returnRate(product, rules.countFitmentReturns),
      badges: (Object.keys(winners) as BadgeType[]).filter((badge) => winners[badge] === product.id),
    };
  });

  const byProduct = Object.fromEntries(rows.filter((row) => row.badges.length > 0).map((row) => [row.productId, row.badges]));

  return { byProduct, rows, winners, meanRating };
}
