import { useEffect, useRef, type RefObject } from 'react';
import type { BadgeType } from './config';
import { track } from './tracking';

/** Fires badge_impression once, when at least half of the element with badges is on screen. */
export function useBadgeImpression<T extends HTMLElement>(shownBadges: BadgeType[], params: Record<string, unknown>): RefObject<T> {
  const ref = useRef<T>(null);
  const latestParams = useRef(params);
  latestParams.current = params;
  const hasBadges = shownBadges.length > 0;

  useEffect(() => {
    if (!ref.current || !hasBadges) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track('badge_impression', latestParams.current);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasBadges]);

  return ref;
}
