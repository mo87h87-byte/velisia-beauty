import { CURRENCY } from "./constants";

const arabicNumberFormatter = new Intl.NumberFormat("ar-SA", {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${arabicNumberFormatter.format(Math.round(num))} ${CURRENCY}`;
}

export function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "string" ? parseFloat(value) : value;
}

export function discountPercent(
  price: number | string,
  oldPrice: number | string | null | undefined,
): number | null {
  const p = toNumber(price);
  const o = toNumber(oldPrice);
  if (!o || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}

export function formatArabicDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
