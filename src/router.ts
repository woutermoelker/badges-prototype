import { useEffect, useState } from 'react';

export type Route = { name: 'plp' } | { name: 'pdp'; productId: string } | { name: 'results' };

function parse(hash: string): Route {
  if (hash.startsWith('#/resultaten')) {
    return { name: 'results' };
  }
  const match = hash.match(/^#\/accu\/([\w-]+)/);
  if (match) {
    return { name: 'pdp', productId: match[1] };
  }
  return { name: 'plp' };
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = (): void => {
      setRoute(parse(window.location.hash));
      document.querySelectorAll('[data-scroll-pane]').forEach((pane) => pane.scrollTo({ top: 0 }));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export const productPath = (productId: string): string => `/accu/${productId}`;
