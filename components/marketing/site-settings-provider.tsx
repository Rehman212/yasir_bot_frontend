"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { brand } from "@/lib/brand";
import { siteSettingsApi, type SiteSettings } from "@/lib/api";

const defaults: SiteSettings = {
  companyName: brand.company.name,
  companyUrl: brand.company.url,
  companyDisplay: brand.company.displayUrl,
  whatsappNumber: brand.company.whatsapp,
  whatsappLink: brand.company.whatsappLink,
  promoPopupEnabled: true,
};

const SiteSettingsContext = createContext<{
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}>({
  settings: defaults,
  loading: true,
  refresh: async () => undefined,
});

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await siteSettingsApi.get();
      setSettings(res.data);
    } catch {
      // keep defaults if API unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, loading, refresh }),
    [settings, loading, refresh],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
