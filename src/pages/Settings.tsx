import React, { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

const fiscalMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Settings() {
  const { toast } = useToast();
  const { canEdit } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [company, setCompany] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    city: "",
    country: "Ethiopia",
    tin_number: "",
    license_number: "",
    website: "",
  });

  const [loanConfig, setLoanConfig] = useState({
    currency: "ETB",
    fiscal_year_start: "July",
    default_interest_rate: 0,
    max_loan_to_salary_ratio: 3,
    payroll_cutoff_day: 25,
    late_payment_penalty_rate: 2,
    savings_multiplier: 3,
  });

  const [email, setEmail] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_email: "",
    smtp_password: "",
    email_sender_name: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setSettingsId(data.id);
      setCompany({
        company_name: data.company_name || "",
        company_email: data.company_email || "",
        company_phone: data.company_phone || "",
        company_address: data.company_address || "",
        city: data.city || "",
        country: data.country || "Ethiopia",
        tin_number: data.tin_number || "",
        license_number: data.license_number || "",
        website: data.website || "",
      });
      setLoanConfig({
        currency: data.currency || "ETB",
        fiscal_year_start: data.fiscal_year_start || "July",
        default_interest_rate: data.default_interest_rate || 0,
        max_loan_to_salary_ratio: data.max_loan_to_salary_ratio || 3,
        payroll_cutoff_day: data.payroll_cutoff_day || 25,
        late_payment_penalty_rate: data.late_payment_penalty_rate || 2,
        savings_multiplier: (data as any).savings_multiplier || 3,
      });
      setEmail({
        smtp_host: data.smtp_host || "",
        smtp_port: data.smtp_port || 587,
        smtp_email: data.smtp_email || "",
        smtp_password: data.smtp_password || "",
        email_sender_name: data.email_sender_name || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    let updateData: any = {};

    if (section === "company") updateData = { ...company };
    else if (section === "loan") updateData = { ...loanConfig };
    else if (section === "email") updateData = { ...email };

    const { error } = await supabase
      .from("company_settings")
      .update(updateData)
      .eq("id", settingsId!);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved", description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully.` });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <TopBar title="Settings" subtitle="Manage company configuration" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Settings" subtitle="Manage company configuration" />
      <div className="p-6 animate-fade-in max-w-4xl">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="w-4 h-4" /> Company Details
            </TabsTrigger>
            <TabsTrigger value="loan" className="gap-2">
              <SettingsIcon className="w-4 h-4" /> Loan Configuration
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" /> Email Settings
            </TabsTrigger>
          </TabsList>

          {/* Company Details */}
          <TabsContent value="company">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
                <p className="text-sm text-muted-foreground">Basic details about your organization</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Company Name</Label>
                  <Input value={company.company_name} onChange={e => setCompany(s => ({ ...s, company_name: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={company.company_email} onChange={e => setCompany(s => ({ ...s, company_email: e.target.value }))} placeholder="info@company.com" className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={company.company_phone} onChange={e => setCompany(s => ({ ...s, company_phone: e.target.value }))} placeholder="+251 11 123 4567" className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea value={company.company_address} onChange={e => setCompany(s => ({ ...s, company_address: e.target.value }))} placeholder="Street address, building, floor..." className="mt-1" rows={2} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={company.city} onChange={e => setCompany(s => ({ ...s, city: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={company.country} onChange={e => setCompany(s => ({ ...s, country: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>TIN Number</Label>
                  <Input value={company.tin_number} onChange={e => setCompany(s => ({ ...s, tin_number: e.target.value }))} placeholder="Tax Identification Number" className="mt-1" />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input value={company.license_number} onChange={e => setCompany(s => ({ ...s, license_number: e.target.value }))} placeholder="Business license number" className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Website</Label>
                  <Input value={company.website} onChange={e => setCompany(s => ({ ...s, website: e.target.value }))} placeholder="https://www.company.com" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave("company")} disabled={saving || !canEdit("Settings")}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Company Details"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Loan Configuration */}
          <TabsContent value="loan">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Loan & Financial Settings</h3>
                <p className="text-sm text-muted-foreground">Configure default loan parameters and financial rules</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={loanConfig.currency} onValueChange={v => setLoanConfig(s => ({ ...s, currency: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fiscal Year Starts</Label>
                  <Select value={loanConfig.fiscal_year_start} onValueChange={v => setLoanConfig(s => ({ ...s, fiscal_year_start: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {fiscalMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Interest Rate (%)</Label>
                  <Input type="number" step="0.1" value={loanConfig.default_interest_rate || ""} onChange={e => setLoanConfig(s => ({ ...s, default_interest_rate: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Max Loan-to-Salary Ratio</Label>
                  <Input type="number" step="0.5" value={loanConfig.max_loan_to_salary_ratio || ""} onChange={e => setLoanConfig(s => ({ ...s, max_loan_to_salary_ratio: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Payroll Cutoff Day</Label>
                  <Input type="number" min={1} max={31} value={loanConfig.payroll_cutoff_day || ""} onChange={e => setLoanConfig(s => ({ ...s, payroll_cutoff_day: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Late Payment Penalty Rate (%)</Label>
                  <Input type="number" step="0.1" value={loanConfig.late_payment_penalty_rate || ""} onChange={e => setLoanConfig(s => ({ ...s, late_payment_penalty_rate: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Savings Multiplier</Label>
                  <Input type="number" step="0.5" min={1} value={loanConfig.savings_multiplier || ""} onChange={e => setLoanConfig(s => ({ ...s, savings_multiplier: Number(e.target.value) }))} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">For savings-based loans: max amount = savings × this number</p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave("loan")} disabled={saving || !canEdit("Settings")}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Loan Settings"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Email Configuration</h3>
                <p className="text-sm text-muted-foreground">SMTP settings for sending notifications and reports</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input value={email.smtp_host} onChange={e => setEmail(s => ({ ...s, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" className="mt-1" />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input type="number" value={email.smtp_port || ""} onChange={e => setEmail(s => ({ ...s, smtp_port: Number(e.target.value) }))} placeholder="587" className="mt-1" />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" value={email.smtp_email} onChange={e => setEmail(s => ({ ...s, smtp_email: e.target.value }))} placeholder="noreply@company.com" className="mt-1" />
                </div>
                <div>
                  <Label>Email Password / App Key</Label>
                  <Input type="password" value={email.smtp_password} onChange={e => setEmail(s => ({ ...s, smtp_password: e.target.value }))} placeholder="••••••••" className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Sender Display Name</Label>
                  <Input value={email.email_sender_name} onChange={e => setEmail(s => ({ ...s, email_sender_name: e.target.value }))} placeholder="Addis Microfinance" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave("email")} disabled={saving || !canEdit("Settings")}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Email Settings"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
