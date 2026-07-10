export type CategoryKey =
  | "makeup"
  | "skincare"
  | "haircare"
  | "styling"
  | "perfume"
  | "nails"
  | "devices"
  | "offers";

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string;
  blurb: string;
}

// Ordered as they appear in the nav (right-to-left).
export const CATEGORIES: CategoryDef[] = [
  { key: "makeup", label: "المكياج", icon: "💄", blurb: "لمسات جمال لا تُقاوم" },
  { key: "skincare", label: "العناية بالبشرة", icon: "🧴", blurb: "بشرة نضرة ومشرقة" },
  { key: "haircare", label: "العناية بالشعر", icon: "🌸", blurb: "شعر صحي وحيوي" },
  { key: "styling", label: "تسريحات الشعر", icon: "💇‍♀️", blurb: "إطلالة مثالية" },
  { key: "perfume", label: "العطور", icon: "🌷", blurb: "عبير يبقى معكِ" },
  { key: "nails", label: "الأظافر", icon: "💅", blurb: "أناقة حتى الأطراف" },
  { key: "devices", label: "الأجهزة والإكسسوارات", icon: "✨", blurb: "أدوات احترافية" },
  { key: "offers", label: "العروض", icon: "🏷️", blurb: "خصومات لا تفوّت" },
];

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export const FREE_SHIPPING_THRESHOLD = 300;
export const SHIPPING_FEE = 25;
export const CURRENCY = "ر.س";

export const SORT_OPTIONS = [
  { key: "featured", label: "المميزة" },
  { key: "newest", label: "الأحدث" },
  { key: "price-asc", label: "السعر: من الأقل" },
  { key: "price-desc", label: "السعر: من الأعلى" },
  { key: "rating", label: "الأعلى تقييماً" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];
