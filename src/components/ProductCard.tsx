import type { ReactNode } from 'react';
import { useAppState } from '../AppState';
import type { Product } from '../data/products';
import { useExperiment } from '../experiment/ExperimentContext';
import { track } from '../experiment/tracking';
import { useBadgeImpression } from '../experiment/useBadgeImpression';
import { navigate, productPath } from '../router';
import { BatteryImage } from './BatteryImage';
import { CartIcon } from './icons';
import { ProductBadges } from './ProductBadges';
import { PriceBlock, StockLine } from './SiteChrome';
import { Stars } from './Stars';

/** Listing card, based on the list view on winparts.nl. */
export function ProductCard({ product, position, listId }: { product: Product; position: number; listId: string }): ReactNode {
  const { shownBadges, eligibleBadges, eventParams, variant } = useExperiment();
  const { addToCart, showToast } = useAppState();
  const shown = shownBadges(product.id);
  const eligible = eligibleBadges(product.id);

  const itemParams = {
    ...eventParams,
    page_type: 'plp',
    item_list_id: listId,
    item_id: product.sku,
    price: product.price,
    index: position,
    shown_badges: shown,
    eligible_badges: eligible,
  };

  const impressionRef = useBadgeImpression<HTMLElement>(shown, itemParams);

  const openProduct = (): void => {
    track('select_item', itemParams);
    navigate(productPath(product.id));
  };

  const onAddToCart = (): void => {
    track('add_to_cart', { ...itemParams, quantity: 1, value: product.price, currency: 'EUR' });
    addToCart({ productId: product.id, quantity: 1, variant, shownBadges: shown });
    showToast('Toegevoegd aan winkelwagen');
  };

  const specs: Array<[string, string]> = [
    ['Uitvoering', product.startStop ? 'Voor voertuigen met start/stop' : 'Voor voertuigen zonder start/stop'],
    ['Capaciteit Ah', String(product.capacityAh)],
    ['Koudstartstroom (A)', String(product.coldCrankingA)],
    ['Technologie', product.technology],
    ['Spanning [V]', '12'],
  ];

  return (
    <article
      ref={impressionRef}
      data-product-id={product.id}
      className="overflow-hidden rounded-md border border-wp-line bg-white"
    >
      <div className="px-4 pt-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-16 shrink-0 text-[11px] font-extrabold tracking-wide text-[#5a5f6a]">
            {product.brand.toUpperCase()}
          </span>
          <div className="min-w-0">
            <button onClick={openProduct} className="text-left text-[16px] leading-snug text-[#1a1a2e] hover:underline @3xl:text-[17px]">
              {product.title}
            </button>
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={product.rating} size={17} />
              <span className="text-[14px] text-wp-muted">{product.reviewCount} reviews</span>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-[minmax(0,42%)_1fr] items-center gap-4 pb-3 @3xl:grid-cols-[minmax(0,240px)_1fr] @3xl:gap-8">
          <button onClick={openProduct} className="relative block" aria-label={`Bekijk ${product.title}`}>
            <BatteryImage product={product} className="w-full" />
            {shown.length > 0 && (
              <ProductBadges badges={shown} className="absolute top-0 left-0 flex-col items-start !gap-1" />
            )}
          </button>
          <dl className="space-y-0.5 text-[14px] text-[#333] @3xl:text-[15px]">
            {specs.map(([label, value]) => (
              <div key={label} className="flex gap-1">
                <dt>{label}:</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 bg-wp-grey px-4 pb-3">
        <div className="space-y-2">
          <PriceBlock price={product.price} listPrice={product.listPrice} />
          <StockLine inStock={product.inStock} />
          <label className="flex items-center gap-2 text-[14px] text-[#555]">
            <input type="checkbox" className="size-4" /> Vergelijk dit product
          </label>
        </div>
        <button
          onClick={onAddToCart}
          className="mb-auto mt-4 flex h-11 w-[72px] items-center justify-center rounded-[3px] bg-wp-orange text-white hover:bg-wp-orange-dark"
          aria-label={`${product.title} in winkelwagen`}
        >
          <CartIcon size={26} />
        </button>
      </div>
    </article>
  );
}

/** Small card for "Vergelijkbare accu's" on the product page. Same badges as everywhere else. */
export function MiniProductCard({ product, position }: { product: Product; position: number }): ReactNode {
  const { shownBadges, eligibleBadges, eventParams } = useExperiment();
  const shown = shownBadges(product.id);
  const params = {
    ...eventParams,
    page_type: 'pdp',
    item_list_id: 'pdp_similar',
    item_id: product.sku,
    index: position,
    shown_badges: shown,
    eligible_badges: eligibleBadges(product.id),
  };

  return (
    <button
      onClick={() => {
        track('select_item', params);
        navigate(productPath(product.id));
      }}
      className="flex flex-col rounded-md border border-wp-line bg-white p-3 text-left hover:border-wp-purple/40"
    >
      <div className="relative">
        <BatteryImage product={product} className="w-full" />
        <ProductBadges badges={shown} className="absolute top-0 left-0 flex-col items-start !gap-1" />
      </div>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-[#1a1a2e]">{product.title}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <Stars rating={product.rating} size={13} />
        <span className="text-[12px] text-wp-muted">{product.reviewCount}</span>
      </div>
      <p className="mt-auto pt-2 text-[18px] font-bold text-wp-pink">€ {product.price.toFixed(2).replace('.', ',')}</p>
    </button>
  );
}
