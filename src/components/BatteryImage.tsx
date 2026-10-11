import type { ReactNode } from 'react';
import type { Product } from '../data/products';

interface Palette {
  body: string;
  bodyShade: string;
  lid: string;
  label: string;
  labelText: string;
  accent: string;
}

function paletteFor(product: Product): Palette {
  switch (product.brand) {
    case 'Bosch':
      return product.technology === 'AGM'
        ? { body: '#d5d8de', bodyShade: '#b9bdc6', lid: '#3b3f48', label: '#eef0f3', labelText: '#d0021b', accent: '#3b3f48' }
        : { body: '#d9dce2', bodyShade: '#bfc4cd', lid: '#2c55a8', label: '#f4f5f7', labelText: '#d0021b', accent: '#2c55a8' };
    case 'Varta':
      return product.technology === 'AGM'
        ? { body: '#c9ccd2', bodyShade: '#aeb2ba', lid: '#2b2e35', label: '#1b3f94', labelText: '#ffffff', accent: '#f2c200' }
        : { body: '#1b3f94', bodyShade: '#14306f', lid: '#14306f', label: '#2a56c2', labelText: '#ffffff', accent: '#f2c200' };
    case 'Exide':
      return { body: '#26272b', bodyShade: '#18191c', lid: '#18191c', label: '#c8102e', labelText: '#ffffff', accent: '#c8102e' };
    case 'Winparts GO!':
      return { body: '#24124f', bodyShade: '#170a36', lid: '#170a36', label: '#4b16d1', labelText: '#ffffff', accent: '#ff9900' };
    case 'VMF':
      return { body: '#1d1e20', bodyShade: '#111214', lid: '#111214', label: '#f27a1a', labelText: '#111214', accent: '#f27a1a' };
  }
}

/** Simple drawn battery instead of product photos. */
export function BatteryImage({ product, className = '' }: { product: Product; className?: string }): ReactNode {
  const palette = paletteFor(product);
  const brandText = product.brand === 'Winparts GO!' ? 'GO!' : product.brand.toUpperCase();

  return (
    <svg viewBox="0 0 260 190" className={className} role="img" aria-label={`Afbeelding ${product.title}`}>
      <ellipse cx="130" cy="178" rx="108" ry="8" fill="#000" opacity="0.08" />
      <rect x="44" y="18" width="26" height="14" rx="3" fill="#9aa0a8" />
      <rect x="190" y="18" width="26" height="14" rx="3" fill="#9aa0a8" />
      <text x="57" y="16" textAnchor="middle" fontSize="14" fontWeight="700" fill="#c8102e">+</text>
      <text x="203" y="16" textAnchor="middle" fontSize="16" fontWeight="700" fill="#333">−</text>
      <rect x="22" y="28" width="216" height="34" rx="6" fill={palette.lid} />
      <rect x="22" y="56" width="216" height="118" rx="6" fill={palette.body} />
      <rect x="22" y="150" width="216" height="24" rx="6" fill={palette.bodyShade} />
      <rect x="40" y="76" width="180" height="62" rx="4" fill={palette.label} />
      <rect x="40" y="76" width="8" height="62" rx="2" fill={palette.accent} />
      <text
        x="136"
        y="104"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="1"
        fill={palette.labelText}
      >
        {brandText}
      </text>
      <text
        x="136"
        y="126"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="12"
        fontWeight="600"
        fill={palette.labelText}
        opacity="0.85"
      >
        {product.modelCode} · {product.capacityAh}Ah · {product.coldCrankingA}A
      </text>
      {product.technology !== 'Standaard' && (
        <g>
          <rect x="176" y="36" width="50" height="18" rx="3" fill={palette.accent} />
          <text x="201" y="49" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="800" fill="#fff">
            {product.technology}
          </text>
        </g>
      )}
    </svg>
  );
}
