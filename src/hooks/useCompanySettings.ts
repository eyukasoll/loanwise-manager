import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanySettings {
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  city: string | null;
  country: string | null;
  logo_url: string | null;
  stamp_url: string | null;
  tin_number: string | null;
  license_number: string | null;
  website: string | null;
  currency: string;
}

let cachedSettings: CompanySettings | null = null;
let listeners: Array<(s: CompanySettings | null) => void> = [];

function notify(s: CompanySettings | null) {
  cachedSettings = s;
  listeners.forEach((fn) => fn(s));
}

let fetching = false;

async function fetchOnce() {
  if (fetching) return;
  fetching = true;
  const { data } = await supabase
    .from("company_settings")
    .select("company_name, company_email, company_phone, company_address, city, country, logo_url, stamp_url, tin_number, license_number, website, currency")
    .limit(1)
    .single();
  notify(data as CompanySettings | null);
  fetching = false;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(cachedSettings);

  useEffect(() => {
    listeners.push(setSettings);
    if (!cachedSettings) fetchOnce();
    return () => {
      listeners = listeners.filter((fn) => fn !== setSettings);
    };
  }, []);

  const refetch = () => {
    cachedSettings = null;
    fetchOnce();
  };

  return { settings, refetch };
}
