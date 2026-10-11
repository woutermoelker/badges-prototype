import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAppState } from '../AppState';
import { EXPERIMENT, type BadgeType, type Variant } from './config';
import { track, trackExposureOnce } from './tracking';

interface Experiment {
  variant: Variant;
  /** Badges the visitor actually sees: empty in control. */
  shownBadges: (productId: string) => BadgeType[];
  /** Badges the product qualifies for, in both groups. Lets us compare clicks on the same products. */
  eligibleBadges: (productId: string) => BadgeType[];
  /** Added to every tracking event. */
  eventParams: Record<string, unknown>;
}

const ExperimentContext = createContext<Experiment | null>(null);

/** Decides which variant a page shows. In the side-by-side view each pane forces its own variant. */
export function ExperimentProvider({ forcedVariant, children }: { forcedVariant?: Variant; children: ReactNode }): ReactNode {
  const { mode, assignedVariant, badges, visitorId, bucket } = useAppState();

  let variant: Variant = assignedVariant;
  let source = 'hash';
  if (forcedVariant) {
    variant = forcedVariant;
    source = 'preview';
  } else if (mode === 'control' || mode === 'variant') {
    variant = mode;
    source = 'qa_override';
  }

  const showBadges = variant === 'variant';
  const eligibleBadges = (productId: string): BadgeType[] => badges.byProduct[productId] ?? [];

  const value: Experiment = {
    variant,
    eligibleBadges,
    shownBadges: (productId) => (showBadges ? eligibleBadges(productId) : []),
    eventParams: {
      experiment_id: EXPERIMENT.id,
      experiment_variant: variant,
      assignment_source: source,
      visitor_id: visitorId,
      bucket,
    },
  };

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

export function useExperiment(): Experiment {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context;
}

/** page_view on every view, experiment_exposure once per visitor and variant. */
export function usePageTracking(pageType: 'plp' | 'pdp', itemId?: string): void {
  const { eventParams, variant } = useExperiment();
  const visitorId = String(eventParams.visitor_id);
  const source = String(eventParams.assignment_source);

  useEffect(() => {
    const params = { ...eventParams, page_type: pageType, item_id: itemId };
    track('page_view', params);
    trackExposureOnce(`${visitorId}:${variant}:${source}`, params);
    // Only re-run when the page or the experiment state changes, not on every render.
  }, [pageType, itemId, variant, source, visitorId]);
}
