export type Variant = 'control' | 'variant';

export type BadgeType = 'best_rated' | 'lowest_returns' | 'winparts_choice';

export const EXPERIMENT = {
  id: 'acc_badges_v1',
  name: "Productbadges op PLP + PDP (accu's)",
};

export const BADGE_TYPES: BadgeType[] = ['best_rated', 'lowest_returns', 'winparts_choice'];

export const BADGE_LABELS: Record<BadgeType, string> = {
  best_rated: 'Best beoordeeld',
  lowest_returns: 'Minst geretourneerd',
  winparts_choice: 'Winparts keuze',
};

export interface BadgeRuleOptions {
  /** Minimum reviews to compete for "Best beoordeeld". Also used as the weight of the Bayesian prior. */
  minReviews: number;
  /** Minimum units sold in 90 days to compete for "Minst geretourneerd". */
  minUnitsSold: number;
  /** Count returns with reason "wrong fitment"? Those say more about the fitment check than the battery. */
  countFitmentReturns: boolean;
  /** Picked by the category manager, in order of preference. */
  curatedChoiceIds: string[];
  /** Quality floor for "Winparts keuze". */
  choiceMinRating: number;
}

export const DEFAULT_BADGE_RULES: BadgeRuleOptions = {
  minReviews: 25,
  minUnitsSold: 100,
  countFitmentReturns: false,
  curatedChoiceIds: ['wpgo-efb70', 'varta-e11'],
  choiceMinRating: 4.3,
};
