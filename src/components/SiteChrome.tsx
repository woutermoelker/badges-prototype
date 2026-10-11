import type { ReactNode } from 'react';
import { useAppState } from '../AppState';
import { productById } from '../data/products';
import { formatPrice, splitPrice } from '../format';
import { navigate } from '../router';
import { CartIcon, CheckIcon, MenuIcon, SearchIcon, UserIcon, WordmarkIcon } from './icons';

export function SiteHeader(): ReactNode {
  const { cart, setCartOpen } = useAppState();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <header className="sticky top-[var(--sticky-top,0px)] z-20">
      <div className="bg-wp-purple text-white">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center px-0 @3xl:h-16">
          <button className="flex h-full items-center gap-2 border-r border-white/20 px-4 text-[15px] font-semibold tracking-wide">
            <MenuIcon />
            MENU
          </button>
          <button onClick={() => navigate('/accu')} className="mx-auto flex items-center gap-2" aria-label="Naar accu-overzicht">
            <WordmarkIcon size={20} />
            <span className="text-[22px] font-bold tracking-tight">winparts</span>
          </button>
          <div className="flex items-center gap-5 px-4">
            <UserIcon />
            <button onClick={() => setCartOpen(true)} className="relative" aria-label={`Winkelwagen (${count})`}>
              <CartIcon size={28} />
              <span className="absolute -top-2 -right-2 min-w-5 rounded-[3px] bg-wp-orange px-1 text-center text-[11px] font-semibold leading-5 text-white">
                {count}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-black py-1.5 text-center text-[13px] text-white underline underline-offset-2">
        Winterklaar? Check nu of uw accu nog fit is
      </div>
      <div className="bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-[1240px] items-center px-4 py-2.5">
          <span className="flex-1 text-[15px] text-[#777]">Zoekterm, OEM, EAN of artikelnummer</span>
          <SearchIcon />
        </div>
      </div>
    </header>
  );
}

export function UspBar(): ReactNode {
  const usps = ['30 dagen gratis ruilen', 'Veilig bestellen en betalen', 'Snelle levering', 'Deskundige helpdesk'];
  return (
    <div className="hidden border-b border-wp-line bg-white @4xl:block">
      <ul className="mx-auto flex max-w-[1240px] justify-between px-4 py-2 text-[13px] text-wp-purple-dark">
        {usps.map((usp) => (
          <li key={usp} className="flex items-center gap-1.5">
            <CheckIcon size={14} className="text-wp-stock" />
            {usp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlateBlock(): ReactNode {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-wp-green p-4 text-white @2xl:flex-row @2xl:items-center @2xl:justify-between">
      <div>
        <p className="text-[17px] leading-snug">Selecteer uw auto om onderdelen met pasgarantie te tonen.</p>
        <p className="mt-1 text-[14px]">
          <span className="underline">Vul uw kenteken in</span> of <span className="underline">selecteer handmatig</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-11 overflow-hidden rounded-[4px] border-2 border-[#1d2b78]">
          <span className="flex w-8 flex-col items-center justify-end bg-[#1d3fa6] pb-1 text-[10px] font-bold">NL</span>
          <span className="flex items-center bg-wp-plate px-3 font-mono whitespace-nowrap text-[19px] font-bold tracking-wider text-black">01-WNP-1</span>
        </div>
        <button className="h-11 rounded-[3px] bg-wp-green-dark px-4 text-[16px]">Zoek</button>
      </div>
    </div>
  );
}

export function PriceBlock({ price, listPrice, size = 'md' }: { price: number; listPrice: number; size?: 'md' | 'lg' }): ReactNode {
  const { euros, cents } = splitPrice(price);
  return (
    <div className="relative pt-5">
      <span
        className="absolute top-0 -left-4 bg-wp-pink py-0.5 pr-4 pl-4 text-[10px] font-bold tracking-wider text-white"
        style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }}
      >
        WINPRIJS
      </span>
      <p className="text-[12.5px] font-semibold text-wp-text">Adviesprijs {formatPrice(listPrice)}</p>
      <p className={`font-bold leading-none text-wp-pink ${size === 'lg' ? 'text-[34px]' : 'text-[28px]'}`}>
        {euros},<span className="price-cents">{cents}</span>
      </p>
    </div>
  );
}

export function StockLine({ inStock }: { inStock: boolean }): ReactNode {
  return inStock ? (
    <p className="flex items-center gap-1.5 text-[14px] text-wp-stock">
      <span className="size-2 rounded-full bg-wp-stock" /> Direct leverbaar
    </p>
  ) : (
    <p className="flex items-center gap-1.5 text-[14px] text-[#c77700]">
      <span className="size-2 rounded-full bg-[#e08a00]" /> Levertijd 3-5 werkdagen
    </p>
  );
}

export function SiteFooter(): ReactNode {
  return (
    <footer className="mt-12 bg-wp-purple-ink px-4 py-6 text-center text-[12px] text-white/70">
      Prototype voor een A/B-test. Prijzen, reviews en retourcijfers zijn fictieve mockdata.
    </footer>
  );
}

export function CartDrawer({ onCheckout }: { onCheckout: () => void }): ReactNode {
  const { cart, cartOpen, setCartOpen } = useAppState();
  if (!cartOpen) {
    return null;
  }
  const lines = cart.map((line) => ({ ...line, product: productById(line.productId)! }));
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setCartOpen(false)}>
      <aside className="flex h-full w-full max-w-sm flex-col bg-white" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between bg-wp-purple px-4 py-3 text-white">
          <h2 className="font-bold">Winkelwagen</h2>
          <button onClick={() => setCartOpen(false)} className="text-sm underline">
            Verder winkelen
          </button>
        </div>
        <ul className="flex-1 divide-y divide-wp-line overflow-auto">
          {lines.length === 0 && <li className="p-4 text-sm text-wp-muted">Uw winkelwagen is leeg.</li>}
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3 p-4 text-sm">
              <span>
                {line.quantity}× {line.product.title.split(' - ').slice(0, 2).join(' - ')}
              </span>
              <span className="font-semibold whitespace-nowrap">€ {formatPrice(line.product.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-wp-line p-4">
          <p className="mb-3 flex justify-between font-bold">
            <span>Totaal</span>
            <span>€ {formatPrice(total)}</span>
          </p>
          <button
            disabled={lines.length === 0}
            onClick={onCheckout}
            className="w-full rounded-[3px] bg-wp-orange py-3 font-semibold text-white disabled:opacity-40"
          >
            Verder naar bestellen (demo)
          </button>
          <p className="mt-2 text-center text-[11px] text-wp-muted">Rondt direct af en vuurt een purchase-event.</p>
        </div>
      </aside>
    </div>
  );
}
