import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
});

export const MenuIcon = ({ size = 24, ...props }: IconProps): ReactNode => (
  <svg {...base(size, props)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const UserIcon = ({ size = 24, ...props }: IconProps): ReactNode => (
  <svg {...base(size, props)}>
    <circle cx="12" cy="8" r="4.5" />
    <path d="M3.5 21c1.2-4.2 4.6-6.5 8.5-6.5s7.3 2.3 8.5 6.5" />
  </svg>
);

export const CartIcon = ({ size = 24, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM1 2v2h2l3.6 7.6-1.4 2.4A2 2 0 0 0 7 17h12v-2H7.4l1.1-2h7.5a2 2 0 0 0 1.7-1l3.6-6.5A1 1 0 0 0 20.4 4H5.2l-.9-2H1Z" />
  </svg>
);

export const SearchIcon = ({ size = 22, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, strokeWidth: 3 })}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.5-4.5" />
  </svg>
);

export const CheckIcon = ({ size = 16, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, strokeWidth: 3 })}>
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export const ChevronIcon = ({ size = 16, ...props }: IconProps): ReactNode => (
  <svg {...base(size, props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CloseIcon = ({ size = 18, ...props }: IconProps): ReactNode => (
  <svg {...base(size, props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const FilterIcon = ({ size = 20, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4Z" />
  </svg>
);

export const BeakerIcon = ({ size = 16, ...props }: IconProps): ReactNode => (
  <svg {...base(size, props)}>
    <path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" />
    <path d="M7 15h10" />
  </svg>
);

// Filled icons, so they still read at 12px.
export const StarBadgeIcon = ({ size = 13, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
  </svg>
);

export const ShieldBadgeIcon = ({ size = 13, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M12 2 4 5v6.2c0 5 3.4 9.4 8 10.8 4.6-1.4 8-5.8 8-10.8V5l-8-3Zm-1.3 14.2-3.9-3.9 1.4-1.4 2.5 2.5 5.4-5.4 1.4 1.4-6.8 6.8Z" />
  </svg>
);

export const ThumbBadgeIcon = ({ size = 13, ...props }: IconProps): ReactNode => (
  <svg {...base(size, { ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M2 10h4v11H2V10Zm6 11V10l5.2-7.4c.6-.8 1.9-.6 2.2.4.2.5.2 1 .1 1.5L14.6 9H20a2 2 0 0 1 2 2.3l-1.3 7.6A2.5 2.5 0 0 1 18.2 21H8Z" />
  </svg>
);

/** Generic mark for the header, not the real Winparts logo. */
export const WordmarkIcon = ({ size = 28, ...props }: IconProps): ReactNode => (
  <svg width={size * 1.6} height={size} viewBox="0 0 48 30" aria-hidden {...props}>
    <path d="M2 10 8 4l6 6-6 6-6-6Z" fill="currentColor" />
    <path d="m14 22 10-14 10 14-5 5-5-7-5 7-5-5Z" fill="currentColor" />
    <path d="M34 10 40 4l6 6-6 6-6-6Z" fill="currentColor" />
  </svg>
);
