export function splitPrice(value: number): { euros: string; cents: string } {
  const [euros, cents] = value.toFixed(2).split('.');
  return { euros, cents };
}

export const formatPrice = (value: number): string => value.toFixed(2).replace('.', ',');

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const numbers = new Intl.NumberFormat('nl-NL');

export const formatInt = (value: number): string => numbers.format(Math.round(value));

export const formatPct = (rate: number, digits = 1): string => `${(rate * 100).toFixed(digits).replace('.', ',')}%`;

export const formatSignedPct = (rate: number, digits = 1): string => `${rate >= 0 ? '+' : '-'}${formatPct(Math.abs(rate), digits)}`;

export const formatP = (pValue: number): string => (pValue < 0.001 ? 'p < 0,001' : `p = ${pValue.toFixed(3).replace('.', ',')}`);

export const formatMillions = (value: number): string =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1).replace('.', ',')} mln` : formatInt(value);
