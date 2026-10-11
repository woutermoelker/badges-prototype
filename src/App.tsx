import type { CSSProperties, ReactNode } from 'react';
import { AppStateProvider, useAppState } from './AppState';
import { DebugDrawer } from './components/DebugDrawer';
import { PrototypeToolbar } from './components/PrototypeToolbar';
import { CartDrawer, SiteFooter, SiteHeader, UspBar } from './components/SiteChrome';
import { productById } from './data/products';
import type { Variant } from './experiment/config';
import { ExperimentProvider, useExperiment } from './experiment/ExperimentContext';
import { track } from './experiment/tracking';
import { ListingPage } from './pages/ListingPage';
import { ProductPage } from './pages/ProductPage';
import { ResultsPage } from './pages/ResultsPage';
import { useRoute } from './router';

export default function App(): ReactNode {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}

function Shell(): ReactNode {
  const { mode, toast } = useAppState();
  const route = useRoute();

  return (
    <>
      <PrototypeToolbar />
      <div className="pt-12">
        {route.name === 'results' ? (
          <ResultsPage />
        ) : mode === 'compare' ? (
          <div className="grid lg:h-[calc(100vh-3rem)] lg:grid-cols-2">
            <ComparePane variant="control" />
            <ComparePane variant="variant" />
          </div>
        ) : (
          <ExperimentProvider>
            <Site stickyTop="3rem" />
          </ExperimentProvider>
        )}
      </div>
      <DebugDrawer />
      <ExperimentProvider>
        <Checkout />
      </ExperimentProvider>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[#1a1a2e] px-4 py-2.5 text-[14px] text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

const PANE_META: Record<Variant, { title: string; subtitle: string; className: string }> = {
  control: { title: 'CONTROL', subtitle: 'Huidige situatie, geen badges', className: 'bg-[#e3eefb] text-[#1d4f91]' },
  variant: { title: 'VARIANT', subtitle: 'Badges op PLP en PDP, geen tooltips', className: 'bg-[#fde9e0] text-[#9a3a12]' },
};

function ComparePane({ variant }: { variant: Variant }): ReactNode {
  const meta = PANE_META[variant];
  return (
    <section className="flex min-h-0 flex-col border-proto-line lg:border-r" aria-label={meta.title}>
      <div className={`flex items-baseline gap-2 px-4 py-1.5 text-[12px] ${meta.className}`}>
        <span className="font-bold tracking-wider">{meta.title}</span>
        <span>{meta.subtitle}</span>
      </div>
      <div data-scroll-pane className="min-h-0 flex-1 lg:overflow-y-auto">
        <ExperimentProvider forcedVariant={variant}>
          <Site stickyTop="0px" />
        </ExperimentProvider>
      </div>
    </section>
  );
}

function Site({ stickyTop }: { stickyTop: string }): ReactNode {
  const route = useRoute();
  return (
    <div className="@container bg-white" style={{ '--sticky-top': stickyTop } as CSSProperties}>
      <SiteHeader />
      <UspBar />
      {route.name === 'pdp' ? <ProductPage productId={route.productId} /> : <ListingPage />}
      <SiteFooter />
    </div>
  );
}

function Checkout(): ReactNode {
  const { cart, clearCart, setCartOpen, showToast } = useAppState();
  const { eventParams } = useExperiment();

  const onCheckout = (): void => {
    const items = cart.map((line) => ({
      item_id: productById(line.productId)!.sku,
      price: productById(line.productId)!.price,
      quantity: line.quantity,
      variant: line.variant,
      shown_badges: line.shownBadges,
    }));
    const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    track('purchase', { ...eventParams, transaction_id: `T${Date.now()}`, currency: 'EUR', value: Number(value.toFixed(2)), items });
    clearCart();
    setCartOpen(false);
    showToast('Bestelling geplaatst (demo)');
  };

  return <CartDrawer onCheckout={onCheckout} />;
}
