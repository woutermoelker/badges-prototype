import type { ReactNode } from 'react';

export function Stars({ rating, size = 16 }: { rating: number; size?: number }): ReactNode {
  return (
    <span className="relative inline-flex" aria-label={`${rating.toFixed(1)} van 5 sterren`}>
      <span className="flex text-[#d9d9d9]" style={{ fontSize: size, lineHeight: 1 }}>
        {'★★★★★'}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-wp-star"
        style={{ fontSize: size, lineHeight: 1, width: `${(rating / 5) * 100}%` }}
      >
        {'★★★★★'}
      </span>
    </span>
  );
}
