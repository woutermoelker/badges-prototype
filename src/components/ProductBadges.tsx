import type { ReactNode } from 'react';
import { BADGE_LABELS, type BadgeType } from '../experiment/config';
import { ShieldBadgeIcon, StarBadgeIcon, ThumbBadgeIcon } from './icons';

const STYLES: Record<BadgeType, { className: string; icon: ReactNode }> = {
  best_rated: {
    className: 'bg-badge-rated-bg text-badge-rated ring-badge-rated/25',
    icon: <StarBadgeIcon />,
  },
  lowest_returns: {
    className: 'bg-badge-returns-bg text-badge-returns ring-badge-returns/25',
    icon: <ShieldBadgeIcon />,
  },
  winparts_choice: {
    className: 'bg-badge-choice-bg text-badge-choice ring-badge-choice/25',
    icon: <ThumbBadgeIcon />,
  },
};

/** Used on the listing, product page and similar products, so badges always look the same. No tooltips. */
export function ProductBadges({
  badges,
  size = 'sm',
  className = '',
}: {
  badges: BadgeType[];
  size?: 'sm' | 'md';
  className?: string;
}): ReactNode {
  if (badges.length === 0) {
    return null;
  }

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Productlabels">
      {badges.map((badge) => (
        <li
          key={badge}
          data-badge={badge}
          className={`inline-flex items-center gap-1 rounded-[3px] font-semibold ring-1 ring-inset ${STYLES[badge].className} ${
            size === 'md' ? 'px-2.5 py-1 text-[13px]' : 'px-2 py-[3px] text-[11.5px]'
          }`}
        >
          {STYLES[badge].icon}
          {BADGE_LABELS[badge]}
        </li>
      ))}
    </ul>
  );
}
