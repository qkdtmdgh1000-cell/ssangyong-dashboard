export function formatTrillion(v) {
  return (v / 1_000_000).toFixed(1) + '조';
}

export function formatBillion(v) {
  return Math.round(v / 1_000).toLocaleString() + '억';
}

export function formatPercent(v) {
  if (v == null) return '-';
  return (v > 0 ? '+' : '') + v.toFixed(1) + '%';
}

export function formatNumber(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString();
}

export function formatPeriod(prdDe) {
  if (!prdDe) return '';
  const y = prdDe.substring(0, 4);
  const m = prdDe.substring(4, 6);
  if (m) return `${y}.${m}`;
  return y;
}
