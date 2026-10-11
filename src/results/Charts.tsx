import type { ReactNode } from 'react';
import { formatSignedPct } from '../format';

const VARIANT = 'var(--color-variant)';
const TEXT = 'var(--color-viz-text)';
const MUTED = 'var(--color-viz-text-2)';
const GRID = 'var(--color-viz-grid)';
const AXIS = 'var(--color-viz-axis)';

/** Gridlines every 10%, between min and max. */
function ticks(min: number, max: number): number[] {
  const result: number[] = [];
  for (let value = Math.ceil(min * 10) / 10; value <= max; value += 0.1) {
    result.push(Math.round(value * 10) / 10);
  }
  return result;
}

const tickLabel = (value: number): string => (value === 0 ? '0%' : formatSignedPct(value, 0));

export interface BadgeEffect {
  label: string;
  productName: string;
  configured: number;
  uplift: number;
  low: number;
  high: number;
}

/** Measured click uplift per badge (dot + 95% interval) next to the effect that was put in (diamond). */
export function BadgeChart({ rows }: { rows: BadgeEffect[] }): ReactNode {
  const width = 760;
  const rowHeight = 56;
  const labelWidth = 230;
  const height = 8 + rows.length * rowHeight + 30;

  const values = rows.flatMap((row) => [row.low, row.high, row.configured]);
  const min = Math.min(-0.1, ...values) - 0.02;
  const max = Math.max(0.2, ...values) + 0.02;
  const x = (value: number): number => labelWidth + ((value - min) / (max - min)) * (width - labelWidth - 24);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Uplift in klikratio per badge met 95%-interval">
      {ticks(min, max).map((value) => (
        <g key={value}>
          <line x1={x(value)} x2={x(value)} y1={8} y2={height - 30} stroke={value === 0 ? AXIS : GRID} />
          <text x={x(value)} y={height - 10} textAnchor="middle" fontSize="11" fill={MUTED}>
            {tickLabel(value)}
          </text>
        </g>
      ))}
      {rows.map((row, index) => {
        const center = 8 + index * rowHeight + rowHeight / 2;
        const labelOnLeft = x(row.high) + 52 > width;
        return (
          <g key={row.label}>
            <text x={0} y={center - 3} fontSize="13" fontWeight="600" fill={TEXT}>
              {row.label}
            </text>
            <text x={0} y={center + 14} fontSize="11.5" fill={MUTED}>
              {row.productName}
            </text>
            <line x1={x(row.low)} x2={x(row.high)} y1={center} y2={center} stroke={VARIANT} strokeWidth={2} strokeLinecap="round" />
            <path d={`M${x(row.configured)},${center - 7} l6,7 l-6,7 l-6,-7 Z`} fill="white" stroke={MUTED} strokeWidth={1.5} />
            <circle cx={x(row.uplift)} cy={center} r={5} fill={VARIANT} />
            <text
              x={labelOnLeft ? x(row.low) - 8 : x(row.high) + 8}
              y={center + 4}
              textAnchor={labelOnLeft ? 'end' : 'start'}
              fontSize="12"
              fontWeight="600"
              fill={TEXT}
            >
              {formatSignedPct(row.uplift)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
