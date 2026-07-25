import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "إتمام الطلب | velisiabeauty",
  description: "أكملي بيانات التوصيل والدفع لإتمام طلبك في velisiabeauty.",
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
