import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing/site-chrome";
import { SoftwarePromoPopup } from "@/components/marketing/software-promo-popup";
import { SiteSettingsProvider } from "@/components/marketing/site-settings-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <SoftwarePromoPopup />
    </SiteSettingsProvider>
  );
}
