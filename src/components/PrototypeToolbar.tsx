import type { ReactNode } from 'react';
import { useAppState, type ViewMode } from '../AppState';
import { EXPERIMENT } from '../experiment/config';
import { useTrackedEvents } from '../experiment/tracking';
import { navigate, useRoute } from '../router';
import { BeakerIcon } from './icons';

const MODES: Array<{ mode: ViewMode; label: string; hint: string }> = [
  { mode: 'compare', label: 'Naast elkaar', hint: 'Control en variant tegelijk (stakeholder-weergave)' },
  { mode: 'control', label: 'Control', hint: 'QA-override: forceer control' },
  { mode: 'variant', label: 'Variant', hint: 'QA-override: forceer variant' },
  { mode: 'assigned', label: 'Als bezoeker', hint: 'Echte toewijzing via hash-bucketing' },
];

export function PrototypeToolbar(): ReactNode {
  const { mode, setMode, bucket, assignedVariant, debugOpen, setDebugOpen } = useAppState();
  const events = useTrackedEvents();
  const route = useRoute();
  const onResults = route.name === 'results';

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 border-b border-proto-line bg-proto-bg px-3 text-proto-text">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex items-center gap-1.5 rounded bg-proto-accent/15 px-2 py-1 text-[11px] font-bold tracking-wider text-proto-accent">
          <BeakerIcon size={14} />
          <span className="hidden sm:inline">PROTOTYPE</span>
        </span>
        <span className="hidden truncate text-[13px] text-proto-muted xl:inline">
          <span className="font-mono text-proto-text">{EXPERIMENT.id}</span> · {EXPERIMENT.name}
        </span>
      </div>

      <div className="mx-auto flex min-w-0 overflow-x-auto rounded-md bg-proto-panel p-0.5 ring-1 ring-proto-line" role="tablist" aria-label="Weergave">
        {MODES.map((option) => (
          <button
            key={option.mode}
            role="tab"
            aria-selected={!onResults && mode === option.mode}
            title={option.hint}
            onClick={() => {
              setMode(option.mode);
              if (onResults) {
                navigate('/accu');
              }
            }}
            className={`rounded px-2.5 py-1 text-[12.5px] font-medium whitespace-nowrap transition sm:px-3.5 ${
              !onResults && mode === option.mode ? 'bg-proto-text text-proto-bg' : 'text-proto-muted hover:text-proto-text'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {mode === 'assigned' && (
          <span className="hidden font-mono text-[12px] text-proto-muted lg:inline">
            bucket {bucket} →{' '}
            <span className={assignedVariant === 'variant' ? 'text-variant' : 'text-control'}>{assignedVariant}</span>
          </span>
        )}
        <button
          onClick={() => navigate(onResults ? '/accu' : '/resultaten')}
          className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap ring-1 ${
            onResults ? 'bg-proto-text text-proto-bg ring-proto-text' : 'ring-proto-line hover:bg-proto-panel'
          }`}
        >
          Resultaten
        </button>
        <button
          onClick={() => setDebugOpen(!debugOpen)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-medium ring-1 ${
            debugOpen ? 'bg-proto-accent text-proto-bg ring-proto-accent' : 'ring-proto-line hover:bg-proto-panel'
          }`}
        >
          <span className="hidden sm:inline">Debug</span>
          <span className={`rounded px-1.5 font-mono text-[11px] ${debugOpen ? 'bg-proto-bg/20' : 'bg-proto-panel'}`}>{events.length}</span>
        </button>
      </div>
    </div>
  );
}
