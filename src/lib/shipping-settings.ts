import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/constants";

export interface ShippingSettings {
  fee: number;
  freeThreshold: number;
}

export const defaultShippingSettings: ShippingSettings = {
  fee: SHIPPING_FEE,
  freeThreshold: FREE_SHIPPING_THRESHOLD,
};

function isValidNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "shipping_settings"))
    .limit(1);

  const value = row?.value as Partial<ShippingSettings> | undefined;
  return {
    fee: isValidNumber(value?.fee) ? value.fee : defaultShippingSettings.fee,
    freeThreshold: isValidNumber(value?.freeThreshold)
      ? value.freeThreshold
      : defaultShippingSettings.freeThreshold,
  };
}
