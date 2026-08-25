export function normalizeIndonesianPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^08\d{8,12}$/.test(digits)) return `+62${digits.slice(1)}`;
  if (/^\+628\d{8,12}$/.test(digits)) return digits;
  if (/^628\d{8,12}$/.test(digits)) return `+${digits}`;
  return null;
}
