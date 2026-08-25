export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatIdr(value: unknown) {
  return `Rp${toNumber(value).toLocaleString("id-ID")}`;
}
