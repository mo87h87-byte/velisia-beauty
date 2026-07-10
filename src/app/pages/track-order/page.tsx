import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import TrackOrder from "@/components/TrackOrder";

export const metadata: Metadata = {
  title: "تتبع الطلب | velisiabeauty",
  description: "تتبّعي حالة طلبك في متجر velisiabeauty برقم الطلب.",
};

export default function TrackOrderPage() {
  return (
    <InfoPage
      title="تتبع الطلب"
      icon="🚚"
      subtitle="أدخلي رقم طلبك لمعرفة حالته ومكانه"
    >
      <TrackOrder />
    </InfoPage>
  );
}
