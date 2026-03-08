import React from "react";
import { Search, User, Globe } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      <div className="min-w-0 flex-1">
        <h1 className="page-header text-base sm:text-lg truncate">{title}</h1>
        {subtitle && <p className="page-subtitle text-xs sm:text-sm truncate hidden sm:block">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.search}
            className="h-9 pl-9 pr-4 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1 h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === "en" ? "አማ" : "EN"}</span>
        </Button>
        <ThemeToggle />
        <NotificationBell />
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
