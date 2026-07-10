import type { Metadata } from "next";
import AccountView from "@/components/AccountView";

export const metadata: Metadata = {
  title: "حسابي | velisiabeauty",
  description: "إدارة حسابك وطلباتك في متجر velisiabeauty.",
};

export default function AccountPage() {
  return <AccountView />;
}
