export const CURRENCY = "ETB";

export const fmt = (n: number) => `${CURRENCY} ${n.toLocaleString()}`;

export const fmtShort = (n: number) => {
  if (n >= 1000000) return `${CURRENCY} ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${CURRENCY} ${(n / 1000).toFixed(0)}K`;
  return `${CURRENCY} ${n}`;
};
