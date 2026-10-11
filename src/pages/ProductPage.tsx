import { useEffect, useState, type ReactNode } from 'react';
import { useAppState } from '../AppState';
import { productById, products, type Product } from '../data/products';
import { useExperiment, usePageTracking } from '../experiment/ExperimentContext';
import { track } from '../experiment/tracking';
import { BatteryImage } from '../components/BatteryImage';
import { CheckIcon } from '../components/icons';
import { MiniProductCard } from '../components/ProductCard';
import { ProductBadges } from '../components/ProductBadges';
import { PlateBlock, PriceBlock } from '../components/SiteChrome';
import { Stars } from '../components/Stars';
import { navigate } from '../router';

function similarTo(product: Product): Product[] {
  return products
    .filter((candidate) => candidate.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.startStop === product.startStop) - Number(a.startStop === product.startStop) ||
        Math.abs(a.capacityAh - product.capacityAh) - Math.abs(b.capacityAh - product.capacityAh),
    )
    .slice(0, 4);
}

export function ProductPage({ productId }: { productId: string }): ReactNode {
  const product = productById(productId);
  if (!product) {
    return (
      <main className="mx-auto max-w-[1240px] px-4 py-10">
        <p>Product niet gevonden.</p>
        <button className="mt-2 text-wp-purple-dark underline" onClick={() => navigate('/accu')}>
          Terug naar accu's
        </button>
      </main>
    );
  }
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: Product }): ReactNode {
  const { shownBadges, eligibleBadges, eventParams, variant } = useExperiment();
  const { addToCart, showToast } = useAppState();
  const [quantity, setQuantity] = useState<number>(1);
  const shown = shownBadges(product.id);
  const eligible = eligibleBadges(product.id);

  usePageTracking('pdp', product.sku);

  const itemParams = {
    ...eventParams,
    page_type: 'pdp',
    item_id: product.sku,
    price: product.price,
    shown_badges: shown,
    eligible_badges: eligible,
  };

  useEffect(() => {
    track('view_item', itemParams);
  }, [product.id, eventParams.experiment_variant]);

  const onOrder = (): void => {
    track('add_to_cart', { ...itemParams, quantity, value: product.price * quantity, currency: 'EUR' });
    addToCart({ productId: product.id, quantity, variant, shownBadges: shown });
    showToast('Toegevoegd aan winkelwagen');
  };

  const usps = [
    product.inStock ? 'Direct leverbaar' : 'Levertijd 3-5 werkdagen',
    '30 dagen gratis ruilen',
    'Tevreden of geld terug',
    'Klanten geven ons een 8.6/10',
    'Op werkdagen voor 16:00 uur besteld is morgen in huis',
  ];

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-6">
      <button onClick={() => navigate('/accu')} className="py-3 text-[14px] text-[#333] hover:underline">
        « Terug naar overzicht
      </button>

      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:gap-10">
        <div className="@4xl:order-2">
          <h1 className="text-[21px] leading-snug font-bold text-[#1a1a2e] @3xl:text-[24px]">{product.title}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-[15px] text-wp-purple-dark">
            <Stars rating={product.rating} size={17} />
            {product.rating.toFixed(1)}/5 ({product.reviewCount} reviews)
          </div>
          {/* Badges sit right under the rating. */}
          <ProductBadges badges={shown} size="md" className="mt-3" />

          <div className="mt-4">
            <PlateBlock />
          </div>

          <p className="mt-4 text-[13px] text-[#666]">
            Productnummer: {product.sku} &nbsp;Fabrikantcode: {product.modelCode} &nbsp;EAN: {product.ean}
          </p>
          <ul className="mt-3 space-y-1.5 text-[15px]">
            {usps.map((usp, index) => (
              <li key={usp} className={`flex items-center gap-2 ${index === 0 && product.inStock ? 'text-wp-stock' : 'text-[#333]'}`}>
                <CheckIcon className="text-wp-stock" />
                {usp}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-end justify-between gap-4 rounded-md bg-wp-grey px-5 pt-1 pb-4">
            <PriceBlock price={product.price} listPrice={product.listPrice} size="lg" />
            <div className="flex items-center gap-2">
              <select
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="h-12 w-16 rounded-[3px] border border-[#bbb] bg-white px-2 text-[17px]"
                aria-label="Aantal"
              >
                {[1, 2, 3, 4].map((amount) => (
                  <option key={amount}>{amount}</option>
                ))}
              </select>
              <button
                onClick={onOrder}
                className="h-12 rounded-[3px] bg-wp-orange px-7 text-[18px] font-semibold text-white hover:bg-wp-orange-dark"
              >
                Bestellen
              </button>
            </div>
          </div>
        </div>

        <div className="@4xl:order-1">
          <div className="flex items-center justify-center rounded-md border border-wp-line bg-white p-6">
            <BatteryImage product={product} className="w-full max-w-[460px]" />
          </div>
          <div className="mt-2 flex gap-2">
            {[0, 1, 2, 3].map((thumb) => (
              <div key={thumb} className={`w-16 rounded border p-1 ${thumb === 0 ? 'border-wp-purple' : 'border-wp-line opacity-50'}`}>
                <BatteryImage product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-8 border-t border-wp-line pt-5">
        <h2 className="text-[18px] font-bold text-[#1a1a2e]">Specificaties</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-[14.5px] @3xl:grid-cols-2">
          {(
            [
              ['Prestatie', `${product.capacityAh}Ah - ${product.coldCrankingA}A - 12V`],
              ['Technologie', product.technology],
              ['Start-stop', product.startStop ? 'Geschikt' : 'Niet geschikt'],
              ['Afmetingen (l x b x h)', `${product.dimensionsMm} mm`],
              ['Polariteit', product.polarity],
              ['Merk', product.brand],
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-dashed border-wp-line py-1">
              <dt className="text-[#666]">{label}</dt>
              <dd className="font-medium text-[#222]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-[18px] font-bold text-[#1a1a2e]">Vergelijkbare accu's</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
          {similarTo(product).map((similar, index) => (
            <MiniProductCard key={similar.id} product={similar} position={index + 1} />
          ))}
        </div>
      </section>
    </main>
  );
}
