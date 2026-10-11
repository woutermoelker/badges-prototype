import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { products, type Brand, type Product, type Technology } from '../data/products';
import { useExperiment, usePageTracking } from '../experiment/ExperimentContext';
import { track } from '../experiment/tracking';
import { FilterIcon } from '../components/icons';
import { ProductCard } from '../components/ProductCard';
import { PlateBlock } from '../components/SiteChrome';

type SortKey = 'sales' | 'price_asc' | 'price_desc' | 'rating';

const SORTS: Record<SortKey, { label: string; compare: (a: Product, b: Product) => number }> = {
  sales: { label: 'Meest verkocht', compare: (a, b) => a.salesRank - b.salesRank },
  price_asc: { label: 'Prijs laag > hoog', compare: (a, b) => a.price - b.price },
  price_desc: { label: 'Prijs hoog > laag', compare: (a, b) => b.price - a.price },
  rating: { label: 'Beoordeling', compare: (a, b) => b.rating - a.rating },
};

const BRANDS: Brand[] = ['Bosch', 'Varta', 'Exide', 'Winparts GO!', 'VMF'];
const TECHNOLOGIES: Technology[] = ['Standaard', 'EFB', 'AGM'];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ListingPage(): ReactNode {
  const { eventParams, shownBadges, eligibleBadges } = useExperiment();
  const [sort, setSort] = useState<SortKey>('sales');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  usePageTracking('plp');

  const visible = useMemo<Product[]>(
    () =>
      products
        .filter((product) => brands.length === 0 || brands.includes(product.brand))
        .filter((product) => technologies.length === 0 || technologies.includes(product.technology))
        .sort(SORTS[sort].compare),
    [brands, technologies, sort],
  );

  const listKey = visible.map((product) => product.id).join(',');
  useEffect(() => {
    track('view_item_list', {
      ...eventParams,
      page_type: 'plp',
      item_list_id: 'category_accu',
      items: visible.map((product, index) => ({
        item_id: product.sku,
        index: index + 1,
        shown_badges: shownBadges(product.id),
        eligible_badges: eligibleBadges(product.id),
      })),
    });
    // Only when the list itself or the variant changes.
  }, [listKey, eventParams.experiment_variant]);

  const filters = (
    <div className="space-y-5">
      <FilterGroup title="Merk" options={BRANDS} selected={brands} onToggle={(value) => setBrands((list) => toggle(list, value))} />
      <FilterGroup
        title="Technologie"
        options={TECHNOLOGIES}
        selected={technologies}
        onToggle={(value) => setTechnologies((list) => toggle(list, value))}
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-6">
      <nav className="py-3 text-[15px] text-wp-purple-dark" aria-label="Kruimelpad">
        Home <span className="text-[#555]">|</span> Motordelen &amp; toebehoren <span className="text-[#555]">|</span>{' '}
        <span className="text-[#333]">Accu</span>
      </nav>
      <PlateBlock />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-wp-purple-dark">ACCU</h1>
      <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-[#555] @3xl:line-clamp-none">
        De <strong className="text-[#333]">accu</strong> levert stroom voor het starten en alle elektrische apparaten van de auto, zoals de
        lampen, radio en verwarming. Tijdens het rijden laadt de accu zichzelf op. Is uw accu tussen de 3 en 5 jaar oud, dan houdt
        die minder goed energie vast.
      </p>

      <div className="mt-5 grid gap-6 @4xl:grid-cols-[230px_1fr]">
        <aside className="hidden @4xl:block">
          <h2 className="mb-3 text-[17px] font-bold text-wp-purple-dark">Filteren</h2>
          {filters}
        </aside>

        <section>
          <button
            onClick={() => setFiltersOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md bg-wp-purple-dark px-5 py-3.5 text-[17px] text-white @4xl:hidden"
          >
            <span className="text-2xl leading-none">{filtersOpen ? '−' : '+'}</span>
            Filteren
            <FilterIcon />
          </button>
          {filtersOpen && <div className="mt-3 rounded-md border border-wp-line p-4 @4xl:hidden">{filters}</div>}

          <div className="mt-4 mb-3 flex items-end justify-between gap-3">
            <p className="text-[22px] font-semibold text-[#9a9a9a]">
              1 - {visible.length} van {visible.length}
            </p>
            <label className="text-[13px] font-semibold text-[#333]">
              Sorteer:
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="mt-1 block rounded-[2px] border border-[#bbb] bg-white px-2 py-1.5 text-[15px] font-normal"
              >
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            {visible.map((product, index) => (
              <ProductCard key={product.id} product={product} position={index + 1} listId="category_accu" />
            ))}
            {visible.length === 0 && <p className="py-10 text-center text-wp-muted">Geen accu's gevonden voor deze filters.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
}): ReactNode {
  return (
    <fieldset>
      <legend className="mb-2 text-[14px] font-bold text-[#333]">{title}</legend>
      <div className="space-y-1.5">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-[14px] text-[#333]">
            <input type="checkbox" className="size-4 accent-wp-purple" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            {option}
            <span className="text-wp-muted">({products.filter((product) => product.brand === option || product.technology === option).length})</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
