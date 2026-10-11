import { BADGE_TYPES, type BadgeType, type Variant } from '../experiment/config';
import type { TrackedEvent } from '../experiment/tracking';

export interface OwnCounts {
  clicks: number;
  badgeClicks: Record<BadgeType, number>;
  addToCarts: number;
  purchases: number;
}

const empty = (): OwnCounts => ({
  clicks: 0,
  badgeClicks: Object.fromEntries(BADGE_TYPES.map((badge) => [badge, 0])) as Record<BadgeType, number>,
  addToCarts: 0,
  purchases: 0,
});

/** Counts your own clicks in the prototype per group. */
export function countOwnEvents(events: TrackedEvent[]): Record<Variant, OwnCounts> {
  const counts: Record<Variant, OwnCounts> = { control: empty(), variant: empty() };

  for (const event of events) {
    const variant = event.params.experiment_variant;
    if (variant !== 'control' && variant !== 'variant') {
      continue;
    }
    const count = counts[variant];

    if (event.name === 'select_item') {
      count.clicks++;
      // eligible_badges is logged in both groups, so control shows what the same products would have had.
      ((event.params.eligible_badges as BadgeType[] | undefined) ?? []).forEach((badge) => count.badgeClicks[badge]++);
    }
    if (event.name === 'add_to_cart') {
      count.addToCarts++;
    }
    if (event.name === 'purchase') {
      count.purchases++;
    }
  }

  return counts;
}
