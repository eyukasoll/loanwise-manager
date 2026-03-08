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
import { Building2, Mail, Settings as SettingsIcon, Save, Loader2, Upload, X, Image, DatabaseBackup, Download, CheckCircle2, UploadCloud, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const fiscalMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Settings() {
  const { toast } = useToast();
  const { canEdit } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);

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
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setSettingsId(data.id);
      setLogoUrl(data.logo_url || null);
      setStampUrl((data as any).stamp_url || null);
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

  const handleImageUpload = async (file: File, type: "logo" | "stamp") => {
    if (!settingsId) return;
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingStamp;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `company/${type}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("loan-documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("loan-documents").getPublicUrl(path);
    const url = urlData.publicUrl;

    const column = type === "logo" ? "logo_url" : "stamp_url";
    const { error: updateError } = await supabase
      .from("company_settings")
      .update({ [column]: url } as any)
      .eq("id", settingsId);

    if (updateError) {
      toast({ title: "Error saving URL", description: updateError.message, variant: "destructive" });
    } else {
      if (type === "logo") setLogoUrl(url); else setStampUrl(url);
      toast({ title: `${type === "logo" ? "Logo" : "Stamp"} uploaded successfully` });
    }
    setUploading(false);
  };

  const handleRemoveImage = async (type: "logo" | "stamp") => {
    if (!settingsId) return;
    const column = type === "logo" ? "logo_url" : "stamp_url";
    await supabase.from("company_settings").update({ [column]: null } as any).eq("id", settingsId);
    if (type === "logo") setLogoUrl(null); else setStampUrl(null);
    toast({ title: `${type === "logo" ? "Logo" : "Stamp"} removed` });
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

  const ImageUploadCard = ({ type, url, uploading }: { type: "logo" | "stamp"; url: string | null; uploading: boolean }) => (
    <div className="space-y-2">
      <Label>{type === "logo" ? "Company Logo" : "Company Stamp / Seal"}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] relative bg-secondary/20">
        {url ? (
          <>
            <img src={url} alt={type} className="max-h-32 max-w-full object-contain rounded" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveImage(type)}>
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : `Click to upload ${type}`}
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f, type);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );

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
            <TabsTrigger value="backup" className="gap-2">
              <DatabaseBackup className="w-4 h-4" /> Backup & Export
            </TabsTrigger>
          </TabsList>

          {/* Company Details */}
          <TabsContent value="company">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
                <p className="text-sm text-muted-foreground">Basic details about your organization</p>
              </div>

              {/* Logo & Stamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadCard type="logo" url={logoUrl} uploading={uploadingLogo} />
                <ImageUploadCard type="stamp" url={stampUrl} uploading={uploadingStamp} />
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
                    <SelectContent>{fiscalMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
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
          {/* Backup & Export */}
          <TabsContent value="backup">
            <BackupExportTab toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const backupTables = [
  { key: "employees", label: "Employees", description: "All employee records" },
  { key: "loan_applications", label: "Loan Applications", description: "All loan application data" },
  { key: "loan_types", label: "Loan Types", description: "Loan type configurations" },
  { key: "loan_guarantors", label: "Loan Guarantors", description: "Guarantor assignments" },
  { key: "repayment_schedule", label: "Repayment Schedules", description: "Loan repayment entries" },
  { key: "payroll_deductions", label: "Payroll Deductions", description: "Payroll deduction records" },
  { key: "manual_payments", label: "Manual Payments", description: "Manual payment records" },
  { key: "savings_transactions", label: "Savings Transactions", description: "All savings records" },
  { key: "company_settings", label: "Company Settings", description: "Company configuration" },
  { key: "role_permissions", label: "Role Permissions", description: "Permission matrix" },
  { key: "audit_log", label: "Audit Log", description: "System audit trail" },
] as const;

type TableKey = (typeof backupTables)[number]["key"];

function BackupExportTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());

  const exportTable = async (tableKey: TableKey, label: string) => {
    setExporting(tableKey);
    try {
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from(tableKey)
          .select("*")
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < batchSize) break;
        from += batchSize;
      }

      if (allData.length === 0) {
        toast({ title: "No data", description: `${label} table is empty.` });
        setExporting(null);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(allData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, label);
      XLSX.writeFile(wb, `${tableKey}_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);

      setExported((prev) => new Set(prev).add(tableKey));
      toast({ title: "Export complete", description: `${label} exported (${allData.length} records).` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
    setExporting(null);
  };

  const exportAll = async () => {
    setExporting("all");
    try {
      const wb = XLSX.utils.book_new();
      let totalRecords = 0;

      for (const table of backupTables) {
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        while (true) {
          const { data, error } = await supabase
            .from(table.key)
            .select("*")
            .range(from, from + batchSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allData = allData.concat(data);
          if (data.length < batchSize) break;
          from += batchSize;
        }
        if (allData.length > 0) {
          const ws = XLSX.utils.json_to_sheet(allData);
          XLSX.utils.book_append_sheet(wb, ws, table.label.slice(0, 31));
          totalRecords += allData.length;
        }
      }

      XLSX.writeFile(wb, `full_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setExported(new Set(backupTables.map((t) => t.key)));
      toast({ title: "Full backup complete", description: `All tables exported (${totalRecords} total records).` });
    } catch (err: any) {
      toast({ title: "Backup failed", description: err.message, variant: "destructive" });
    }
    setExporting(null);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Backup & Export</h3>
          <p className="text-sm text-muted-foreground">Download your data as Excel files for safekeeping</p>
        </div>
        <Button onClick={exportAll} disabled={exporting !== null} className="gap-2">
          {exporting === "all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting === "all" ? "Exporting..." : "Export All Tables"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {backupTables.map((table) => (
          <div
            key={table.key}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-secondary/20"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium flex items-center gap-2">
                {table.label}
                {exported.has(table.key) && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              </p>
              <p className="text-xs text-muted-foreground">{table.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 ml-3 h-8"
              disabled={exporting !== null}
              onClick={() => exportTable(table.key, table.label)}
            >
              {exporting === table.key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 border border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Regular backups help protect your data. We recommend exporting a full backup at least once a week. Files are downloaded in Excel (.xlsx) format for easy viewing and archiving.
        </p>
      </div>
    </div>
  );
}
