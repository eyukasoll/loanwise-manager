import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, ArrowRight, ArrowLeft, Rocket, CheckCircle2, Settings, Sparkles, Loader2, Image, X
} from "lucide-react";

const fiscalMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface Props {
  settingsId: string;
  onComplete: () => void;
}

export default function StartupWizard({ settingsId, onComplete }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
    default_interest_rate: 15,
    max_loan_to_salary_ratio: 3,
    payroll_cutoff_day: 25,
    late_payment_penalty_rate: 2,
    savings_multiplier: 3,
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const path = `company/logo_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("loan-documents").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingLogo(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("loan-documents").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploadingLogo(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("company_settings")
      .update({
        ...company,
        ...loanConfig,
        logo_url: logoUrl,
      })
      .eq("id", settingsId);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    toast({ title: "Setup complete!", description: "Your system is ready to use." });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {totalSteps}</span>
            <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="p-6">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome to Your Loan Management System</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Let's get your organization set up in just a few steps. This will only take a couple of minutes.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
                {[
                  { icon: Building2, label: "Company Profile", desc: "Name, address & logo" },
                  { icon: Settings, label: "Loan Settings", desc: "Rates & parameters" },
                  { icon: Rocket, label: "Ready to Go", desc: "Start managing loans" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-3 rounded-lg bg-secondary/10 border border-border/50">
                    <item.icon className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Company Information</h2>
                  <p className="text-sm text-muted-foreground">Tell us about your organization</p>
                </div>
              </div>

              {/* Logo upload */}
              <div className="space-y-2">
                <Label>Company Logo (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center gap-4 bg-secondary/10">
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded" />
                      <Button variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {uploadingLogo ? "Uploading..." : "Click to upload logo"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Company Name *</Label>
                  <Input value={company.company_name} onChange={e => setCompany(s => ({ ...s, company_name: e.target.value }))} placeholder="e.g. Addis Savings & Credit" className="mt-1" />
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
                  <Textarea value={company.company_address} onChange={e => setCompany(s => ({ ...s, company_address: e.target.value }))} placeholder="Street address..." className="mt-1" rows={2} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={company.city} onChange={e => setCompany(s => ({ ...s, city: e.target.value }))} placeholder="Addis Ababa" className="mt-1" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={company.country} onChange={e => setCompany(s => ({ ...s, country: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>TIN Number</Label>
                  <Input value={company.tin_number} onChange={e => setCompany(s => ({ ...s, tin_number: e.target.value }))} placeholder="Tax ID" className="mt-1" />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input value={company.license_number} onChange={e => setCompany(s => ({ ...s, license_number: e.target.value }))} placeholder="Business license" className="mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loan Configuration */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Loan & Financial Settings</h2>
                  <p className="text-sm text-muted-foreground">Configure your default loan parameters</p>
                </div>
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
                    <SelectContent>{fiscalMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Interest Rate (%)</Label>
                  <Input type="number" step="0.1" value={loanConfig.default_interest_rate} onChange={e => setLoanConfig(s => ({ ...s, default_interest_rate: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Max Loan-to-Salary Ratio</Label>
                  <Input type="number" step="0.5" value={loanConfig.max_loan_to_salary_ratio} onChange={e => setLoanConfig(s => ({ ...s, max_loan_to_salary_ratio: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Payroll Cutoff Day</Label>
                  <Input type="number" min={1} max={31} value={loanConfig.payroll_cutoff_day} onChange={e => setLoanConfig(s => ({ ...s, payroll_cutoff_day: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Late Payment Penalty (%)</Label>
                  <Input type="number" step="0.1" value={loanConfig.late_payment_penalty_rate} onChange={e => setLoanConfig(s => ({ ...s, late_payment_penalty_rate: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <Label>Savings Multiplier</Label>
                  <Input type="number" step="0.5" min={1} value={loanConfig.savings_multiplier} onChange={e => setLoanConfig(s => ({ ...s, savings_multiplier: Number(e.target.value) }))} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Max loan = savings × multiplier</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">You're All Set!</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Your system is configured and ready to go. You can always update these settings later from the Settings page.
                </p>
              </div>
              {company.company_name && (
                <div className="bg-secondary/10 border border-border/50 rounded-lg p-4 max-w-sm mx-auto text-left space-y-1">
                  <p className="font-semibold text-foreground">{company.company_name}</p>
                  {company.city && <p className="text-sm text-muted-foreground">{company.city}, {company.country}</p>}
                  {company.company_email && <p className="text-sm text-muted-foreground">{company.company_email}</p>}
                  <p className="text-sm text-muted-foreground">Currency: {loanConfig.currency} · Interest: {loanConfig.default_interest_rate}%</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                {step === 0 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving || !company.company_name.trim()}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Launch System"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
