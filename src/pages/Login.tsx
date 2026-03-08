import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import logo from "@/assets/logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang, setLang, t } = useLanguage();
  const { settings } = useCompanySettings();

  const displayLogo = settings?.logo_url || logo;
  const displayName = settings?.company_name || "Addis Microfinance";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = username.includes("@") ? username : `${username}@loanmanager.app`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: t.loginFailed,
        description: t.invalidCredentials,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "en" ? "አማ" : "EN"}
        </Button>
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={displayLogo} alt={displayName} className="w-20 h-20 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-foreground font-display">{displayName}</h1>
          <p className="text-muted-foreground mt-1">{t.loginTitle}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t.username}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.signingIn : t.signIn}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
