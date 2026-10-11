import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { products } from './data/products';
import { bucketFor, loadVisitorId, variantForBucket } from './experiment/assignment';
import { computeBadges, type BadgeComputation } from './experiment/badges';
import { DEFAULT_BADGE_RULES, type BadgeRuleOptions, type BadgeType, type Variant } from './experiment/config';

// assigned = what a real visitor gets, control/variant = forced for QA, compare = both side by side.
export type ViewMode = 'assigned' | 'control' | 'variant' | 'compare';

export interface CartLine {
  productId: string;
  quantity: number;
  variant: Variant;
  shownBadges: BadgeType[];
}

interface AppState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  visitorId: string;
  bucket: number;
  assignedVariant: Variant;
  rules: BadgeRuleOptions;
  setRules: (rules: BadgeRuleOptions) => void;
  badges: BadgeComputation;
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  debugOpen: boolean;
  setDebugOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

function modeFromUrl(): ViewMode {
  const mode = new URLSearchParams(window.location.search).get('exp');
  return mode === 'assigned' || mode === 'control' || mode === 'variant' ? mode : 'compare';
}

export function AppStateProvider({ children }: { children: ReactNode }): ReactNode {
  const [mode, setMode] = useState<ViewMode>(modeFromUrl);
  const [visitorId] = useState<string>(loadVisitorId);
  const [rules, setRules] = useState<BadgeRuleOptions>(DEFAULT_BADGE_RULES);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const bucket = bucketFor(visitorId);
  const badges = useMemo<BadgeComputation>(() => computeBadges(products, rules), [rules]);

  const addToCart = (line: CartLine): void => {
    setCart((lines) => {
      const existing = lines.find((item) => item.productId === line.productId);
      if (!existing) {
        return [...lines, line];
      }
      return lines.map((item) => (item === existing ? { ...item, quantity: item.quantity + line.quantity } : item));
    });
  };

  const showToast = (message: string): void => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const value: AppState = {
    mode,
    setMode,
    visitorId,
    bucket,
    assignedVariant: variantForBucket(bucket),
    rules,
    setRules,
    badges,
    cart,
    addToCart,
    clearCart: () => setCart([]),
    cartOpen,
    setCartOpen,
    debugOpen,
    setDebugOpen,
    toast,
    showToast,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
