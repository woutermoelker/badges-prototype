import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useAppState } from '../AppState';
import { productById, products } from '../data/products';
import { BADGE_LABELS, BADGE_TYPES, type Variant } from '../experiment/config';
import { clearEvents, useTrackedEvents } from '../experiment/tracking';
import { formatInt, formatMillions, formatP, formatPct, formatSignedPct } from '../format';
import { BadgeChart } from '../results/Charts';
import { countOwnEvents } from '../results/ownSession';
import { navigate } from '../router';
import { DEFAULT_SIMULATION, runSimulation } from '../simulation/simulate';
import { compare, detectableUplift, sessionsNeeded, type Comparison } from '../simulation/stats';

const TARGET_UPLIFT = 0.02;

const shortName = (productId: string | null): string =>
  productId ? productById(productId)!.title.split(' - ').slice(0, 2).join(' · ') : 'Geen product';

export function ResultsPage(): ReactNode {
  const { badges } = useAppState();
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(DEFAULT_SIMULATION.sessionsPerDay);
  // Keeps the slider responsive while a big simulation runs.
  const settled = useDeferredValue(sessionsPerDay);

  const config = { ...DEFAULT_SIMULATION, sessionsPerDay: settled };
  const result = useMemo(() => runSimulation(config, products, badges.byProduct), [settled, badges.byProduct]);
  const { control, variant } = result.arms;

  const conversion = compare(control.purchases, control.sessions, variant.purchases, variant.sessions);
  const perGroup = (control.sessions + variant.sessions) / 2;
  const needed = sessionsNeeded(conversion.controlRate, TARGET_UPLIFT);

  const badgeRows = BADGE_TYPES.map((badge) => {
    const clicks = result.badgeClicks[badge];
    const comparison = compare(clicks.control, control.sessions, clicks.variant, variant.sessions);
    return {
      label: BADGE_LABELS[badge],
      productName: shortName(badges.winners[badge]),
      configured: config.badgeClickLift[badge],
      uplift: comparison.uplift,
      low: comparison.low,
      high: comparison.high,
    };
  });

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-viz-page text-viz-text">
      <div className="mx-auto max-w-[1240px] px-4 py-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold">Resultaten</h1>
            <p className="mt-1 text-[14px] text-viz-text-2">
              {formatInt(control.sessions + variant.sessions)} gesimuleerde sessies over {config.days} dagen. De badge-effecten zijn invoer, geen bevinding.
            </p>
          </div>
          <button onClick={() => navigate('/accu')} className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-[13px] hover:bg-black/5">
            Terug naar de shop
          </button>
        </header>

        <label className="mt-5 block max-w-md rounded-xl border border-black/10 bg-viz-surface p-4">
          <span className="flex justify-between text-[13px] text-viz-text-2">
            Sessies per dag in de categorie accu's
            <strong className="text-viz-text tabular-nums">{formatInt(sessionsPerDay)}</strong>
          </span>
          <input
            type="range"
            min={250}
            max={20000}
            step={250}
            value={sessionsPerDay}
            onChange={(event) => setSessionsPerDay(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tile title="Conversie">
            <p className="flex justify-between text-[13px] text-viz-text-2">
              <Key group="control" /> <strong className="text-[20px] text-viz-text">{formatPct(conversion.controlRate, 2)}</strong>
            </p>
            <p className="flex justify-between text-[13px] text-viz-text-2">
              <Key group="variant" /> <strong className="text-[20px] text-viz-text">{formatPct(conversion.variantRate, 2)}</strong>
            </p>
          </Tile>
          <Tile title="Uplift conversie">
            <p className="text-[26px] font-bold">{formatSignedPct(conversion.uplift)}</p>
            <p className="text-[12.5px] text-viz-text-2">
              95%: {formatSignedPct(conversion.low)} tot {formatSignedPct(conversion.high)}
            </p>
            <Verdict comparison={conversion} />
          </Tile>
          <Tile title="Genoeg verkeer voor +2%?">
            <p className="text-[26px] font-bold">{formatPct(Math.min(1, perGroup / needed), 0)}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-viz-grid">
              <div className="h-full bg-viz-text-2" style={{ width: `${Math.min(100, (perGroup / needed) * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[12.5px] text-viz-text-2">
              {formatMillions(perGroup)} van {formatMillions(needed)} sessies per groep. Nu zie je pas een effect van ongeveer{' '}
              {formatSignedPct(detectableUplift(conversion.controlRate, perGroup), 0)}.
            </p>
          </Tile>
        </section>

        <Card title="Welke badge werkt?" subtitle="Klikratio op het badge-product in de variant, tegenover hetzelfde product in control. Stip = gemeten, lijn = 95%-interval, ruit = ingesteld effect.">
          <BadgeChart rows={badgeRows} />
        </Card>

        <OwnClicks />
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }): ReactNode {
  return (
    <section className="mt-5 rounded-xl border border-black/10 bg-viz-surface px-5 py-4">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <p className="mt-0.5 text-[13px] text-viz-text-2">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Tile({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <div className="rounded-xl border border-black/10 bg-viz-surface p-4">
      <h3 className="mb-1 text-[12.5px] font-medium text-viz-text-2">{title}</h3>
      {children}
    </div>
  );
}

function Key({ group }: { group: Variant }): ReactNode {
  return (
    <span className="inline-flex items-center gap-1.5 capitalize">
      <span className={`inline-block size-2.5 rounded-full ${group === 'control' ? 'bg-control' : 'bg-variant'}`} />
      {group}
    </span>
  );
}

function Verdict({ comparison }: { comparison: Comparison }): ReactNode {
  if (!comparison.significant) {
    return <p className="mt-2 text-[12.5px] font-semibold text-viz-text-2">Niet significant, {formatP(comparison.pValue)}</p>;
  }
  const better = comparison.uplift > 0;
  return (
    <p className={`mt-2 text-[12.5px] font-semibold ${better ? 'text-viz-good-text' : 'text-viz-bad'}`}>
      {better ? 'Significant beter' : 'Significant slechter'}, {formatP(comparison.pValue)}
    </p>
  );
}

function OwnClicks(): ReactNode {
  const events = useTrackedEvents();
  const counts = useMemo(() => countOwnEvents(events), [events]);
  const groups: Variant[] = ['control', 'variant'];

  const rows: Array<[string, (group: Variant) => number]> = [
    ['Productkliks', (group) => counts[group].clicks],
    ...BADGE_TYPES.map((badge): [string, (group: Variant) => number] => [`waarvan ${BADGE_LABELS[badge]}`, (group) => counts[group].badgeClicks[badge]]),
    ['In winkelwagen', (group) => counts[group].addToCarts],
    ['Aankopen', (group) => counts[group].purchases],
  ];

  return (
    <Card title="Jouw kliks" subtitle="Wat je zelf in de shop doet, geteld uit dezelfde events. Staat los van de simulatie.">
      {events.length === 0 ? (
        <p className="text-[13.5px] text-viz-text-2">Nog geen kliks. Kies Control of Variant in de toolbar en klik door de shop.</p>
      ) : (
        <>
          <table className="w-full text-[13.5px] tabular-nums">
            <thead>
              <tr className="border-b border-viz-grid text-[12px] text-viz-text-2">
                <th />
                {groups.map((group) => (
                  <th key={group} className="py-2 text-right font-medium">
                    <Key group={group} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-viz-grid">
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td className={`py-2 ${label.startsWith('waarvan') ? 'pl-3 text-viz-text-2' : ''}`}>{label}</td>
                  {groups.map((group) => (
                    <td key={group} className="py-2 text-right">
                      {value(group)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={clearEvents} className="mt-3 text-[13px] text-viz-text-2 hover:underline">
            Mijn events wissen
          </button>
        </>
      )}
    </Card>
  );
}
