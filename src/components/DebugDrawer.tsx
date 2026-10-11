import { useState, type ReactNode } from 'react';
import { useAppState } from '../AppState';
import { productById } from '../data/products';
import { BADGE_LABELS, BADGE_TYPES } from '../experiment/config';
import { clearEvents, useTrackedEvents, type TrackedEvent } from '../experiment/tracking';
import { formatTime } from '../format';
import { CloseIcon } from './icons';
import { ProductBadges } from './ProductBadges';

type Tab = 'badges' | 'events';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'badges', label: 'Badgelogica' },
  { id: 'events', label: 'Events' },
];

const shortName = (productId: string): string => productById(productId)!.title.split(' - ').slice(0, 2).join(' · ');
const nl = (value: number, digits: number): string => value.toFixed(digits).replace('.', ',');

export function DebugDrawer(): ReactNode {
  const { debugOpen, setDebugOpen } = useAppState();
  const [tab, setTab] = useState<Tab>('events');

  if (!debugOpen) {
    return null;
  }

  return (
    <aside className="fixed top-12 right-0 bottom-0 z-30 flex w-full flex-col border-l border-proto-line bg-proto-bg text-proto-text shadow-2xl sm:w-[480px]">
      <div className="flex items-center border-b border-proto-line px-2">
        {TABS.map((option) => (
          <button
            key={option.id}
            onClick={() => setTab(option.id)}
            className={`border-b-2 px-3 py-3 text-[13px] font-medium ${
              tab === option.id ? 'border-proto-accent text-proto-text' : 'border-transparent text-proto-muted hover:text-proto-text'
            }`}
          >
            {option.label}
          </button>
        ))}
        <button onClick={() => setDebugOpen(false)} className="ml-auto p-2 text-proto-muted hover:text-proto-text" aria-label="Sluiten">
          <CloseIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-[13px]">
        {tab === 'badges' && <BadgesTab />}
        {tab === 'events' && <EventsTab />}
      </div>
    </aside>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <section className="mb-4 rounded-lg border border-proto-line bg-proto-panel p-4">
      <h3 className="mb-3 text-[11px] font-bold tracking-wider text-proto-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description: string }): ReactNode {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 accent-proto-accent" />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-[12px] text-proto-muted">{description}</span>
      </span>
    </label>
  );
}

function BadgesTab(): ReactNode {
  const { badges, rules, setRules } = useAppState();

  return (
    <>
      <Panel title="Winnaars">
        <div className="space-y-3">
          {BADGE_TYPES.map((badge) => {
            const winner = badges.winners[badge];
            const row = badges.rows.find((candidate) => candidate.productId === winner);
            const product = winner ? productById(winner) : undefined;
            return (
              <div key={badge} className="rounded-md bg-white p-3 text-wp-text">
                <ProductBadges badges={[badge]} />
                <p className="mt-1.5 font-semibold">{winner ? shortName(winner) : 'Geen product'}</p>
                {product && row && (
                  <p className="mt-0.5 text-[12px] text-[#555]">
                    {badge === 'best_rated' && `${nl(product.rating, 1)} sterren uit ${product.reviewCount} reviews, gewogen ${nl(row.bayesRating, 2)} (gemiddelde ${nl(badges.meanRating, 2)})`}
                    {badge === 'lowest_returns' && `${nl(row.returnRate * 100, 2)}% retour over ${product.unitsSold90d} verkocht`}
                    {badge === 'winparts_choice' && `Keuze van de categoriemanager, minimaal ${nl(rules.choiceMinRating, 1)} sterren`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Regels">
        <ul className="list-disc space-y-1 pl-4 text-[12.5px]">
          <li>{BADGE_LABELS.best_rated}: hoogste gewogen rating, minimaal {rules.minReviews} reviews.</li>
          <li>{BADGE_LABELS.lowest_returns}: laagste retour % over 90 dagen, minimaal {rules.minUnitsSold} verkocht.</li>
          <li>{BADGE_LABELS.winparts_choice}: gekozen door de categoriemanager, niet op een product dat al een badge heeft.</li>
          <li>Alleen producten op voorraad.</li>
        </ul>
        <Toggle
          checked={rules.countFitmentReturns}
          onChange={(value) => setRules({ ...rules, countFitmentReturns: value })}
          label="Retouren door verkeerde pasvorm meetellen"
          description="Zet dit aan en de winnaar van Minst geretourneerd wisselt. Dat is een keuze voor de categoriemanager."
        />
      </Panel>
    </>
  );
}

function EventsTab(): ReactNode {
  const events = useTrackedEvents();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] text-proto-muted">Nieuwste boven. Ook in window.dataLayer.</p>
        <button onClick={clearEvents} className="rounded px-2 py-1 text-[12px] ring-1 ring-proto-line hover:bg-proto-panel">
          Wissen
        </button>
      </div>
      {events.length === 0 && <p className="text-proto-muted">Nog geen events. Klik door de shop.</p>}
      <ul className="space-y-1.5">
        {events.slice(0, 200).map((event) => (
          <EventRow key={event.id} event={event} open={openId === event.id} onToggle={() => setOpenId(openId === event.id ? null : event.id)} />
        ))}
      </ul>
    </>
  );
}

function EventRow({ event, open, onToggle }: { event: TrackedEvent; open: boolean; onToggle: () => void }): ReactNode {
  const variant = String(event.params.experiment_variant);
  const shown = (event.params.shown_badges as string[] | undefined) ?? [];
  const eligible = (event.params.eligible_badges as string[] | undefined) ?? [];

  return (
    <li className="rounded-md border border-proto-line">
      <button onClick={onToggle} className="w-full px-3 py-2 text-left">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12.5px] font-medium">{event.name}</span>
          <span className={`rounded px-1.5 text-[10.5px] font-semibold ${variant === 'variant' ? 'bg-variant/20 text-variant' : 'bg-control/20 text-control'}`}>{variant}</span>
          <span className="ml-auto font-mono text-[11px] text-proto-muted">{formatTime(event.at)}</span>
        </div>
        {eligible.length > 0 && (
          <p className="mt-0.5 truncate font-mono text-[11px] text-proto-muted">
            item {String(event.params.item_id)} eligible [{eligible.join(', ')}] shown [{shown.join(', ')}]
          </p>
        )}
      </button>
      {open && (
        <pre className="overflow-x-auto border-t border-proto-line bg-black/30 p-3 font-mono text-[11px]">
          {JSON.stringify({ event: event.name, ...event.params }, null, 2)}
        </pre>
      )}
    </li>
  );
}
