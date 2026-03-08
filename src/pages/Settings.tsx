import React, { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Settings as SettingsIcon, Save, Loader2, Upload, X, Image, DatabaseBackup, Download, CheckCircle2, UploadCloud, AlertTriangle, FileSpreadsheet, Lock, BookOpen } from "lucide-react";
import UserManual from "@/components/UserManual";
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
  const { t } = useLanguage();
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
        <TopBar title={t.setTitle} subtitle={t.setSubtitle} />
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
      <TopBar title={t.setTitle} subtitle={t.setSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in max-w-4xl">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-card border border-border w-full overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="company" className="gap-2 text-xs sm:text-sm">
              <Building2 className="w-4 h-4" /> <span className="hidden sm:inline">Company Details</span><span className="sm:hidden">Company</span>
            </TabsTrigger>
            <TabsTrigger value="loan" className="gap-2 text-xs sm:text-sm">
              <SettingsIcon className="w-4 h-4" /> <span className="hidden sm:inline">Loan Configuration</span><span className="sm:hidden">Loan</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 text-xs sm:text-sm">
              <Mail className="w-4 h-4" /> <span className="hidden sm:inline">Email Settings</span><span className="sm:hidden">Email</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2 text-xs sm:text-sm">
              <DatabaseBackup className="w-4 h-4" /> <span className="hidden sm:inline">Backup & Export</span><span className="sm:hidden">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm">
              <Lock className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">User Manual</span><span className="sm:hidden">Manual</span>
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
          {/* Security - Change Password */}
          <TabsContent value="security">
            <ChangePasswordTab toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function getPasswordStrength(password: string): { label: string; color: string; value: number } {
  if (!password) return { label: "", color: "", value: 0 };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-destructive", value: 20 };
  if (score <= 2) return { label: "Fair", color: "bg-orange-500", value: 40 };
  if (score <= 3) return { label: "Medium", color: "bg-yellow-500", value: 60 };
  if (score <= 4) return { label: "Strong", color: "bg-emerald-500", value: 80 };
  return { label: "Very Strong", color: "bg-emerald-600", value: 100 };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{strength.label}</span>
      </p>
    </div>
  );
}

function ChangePasswordTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
        <p className="text-sm text-muted-foreground">Update your account password</p>
      </div>
      <div className="max-w-md space-y-4">
        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="mt-1"
          />
          <PasswordStrengthIndicator password={newPassword} />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={handleChangePassword} disabled={saving}>
          <Lock className="w-4 h-4 mr-2" /> {saving ? "Updating..." : "Update Password"}
        </Button>
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
  const [activeSubTab, setActiveSubTab] = useState<"export" | "import">("export");
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSheets, setImportSheets] = useState<{ sheetName: string; tableKey: TableKey | null; rowCount: number }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ table: string; inserted: number; errors: number }[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [parsedWorkbook, setParsedWorkbook] = useState<XLSX.WorkBook | null>(null);

  const sheetToTableMap: Record<string, TableKey> = {};
  backupTables.forEach((t) => {
    sheetToTableMap[t.label] = t.key;
    sheetToTableMap[t.key] = t.key;
    sheetToTableMap[t.label.toLowerCase()] = t.key;
  });

  const resolveTableKey = (sheetName: string): TableKey | null => {
    const lower = sheetName.toLowerCase().trim();
    for (const t of backupTables) {
      if (lower === t.label.toLowerCase() || lower === t.key.toLowerCase() || lower === t.key.replace(/_/g, " ")) {
        return t.key;
      }
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setImportFile(file);
    setImportResults([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        setParsedWorkbook(wb);
        const sheets = wb.SheetNames.map((name) => {
          const ws = wb.Sheets[name];
          const json = XLSX.utils.sheet_to_json(ws);
          return { sheetName: name, tableKey: resolveTableKey(name), rowCount: json.length };
        });
        setImportSheets(sheets);
      } catch {
        toast({ title: "Invalid file", description: "Could not read the Excel file.", variant: "destructive" });
        setImportFile(null);
        setImportSheets([]);
        setParsedWorkbook(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateSheetMapping = (idx: number, tableKey: TableKey | null) => {
    setImportSheets((prev) => prev.map((s, i) => (i === idx ? { ...s, tableKey } : s)));
  };

  const validSheets = importSheets.filter((s) => s.tableKey && s.rowCount > 0);

  const executeImport = async () => {
    setConfirmOpen(false);
    if (!parsedWorkbook || validSheets.length === 0) return;
    setImporting(true);
    setImportProgress(0);
    const results: typeof importResults = [];

    for (let i = 0; i < validSheets.length; i++) {
      const sheet = validSheets[i];
      const ws = parsedWorkbook.Sheets[sheet.sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const tableKey = sheet.tableKey!;
      const tableLabel = backupTables.find((t) => t.key === tableKey)?.label || tableKey;

      let inserted = 0;
      let errors = 0;
      const batchSize = 50;

      for (let j = 0; j < rows.length; j += batchSize) {
        const batch = rows.slice(j, j + batchSize).map((row) => {
          // Clean up: remove empty string values for uuid/numeric fields
          const cleaned: any = {};
          for (const [k, v] of Object.entries(row)) {
            if (v === "" || v === undefined) continue;
            cleaned[k] = v;
          }
          return cleaned;
        });

        const { error } = await supabase.from(tableKey).upsert(batch as any, { onConflict: "id", ignoreDuplicates: false });
        if (error) {
          errors += batch.length;
        } else {
          inserted += batch.length;
        }
      }

      results.push({ table: tableLabel, inserted, errors });
      setImportProgress(Math.round(((i + 1) / validSheets.length) * 100));
    }

    setImportResults(results);
    setImporting(false);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors, 0);
    toast({
      title: "Import complete",
      description: `${totalInserted} records restored${totalErrors > 0 ? `, ${totalErrors} errors` : ""}.`,
      variant: totalErrors > 0 ? "destructive" : "default",
    });
  };

  const exportTable = async (tableKey: TableKey, label: string) => {
    setExporting(tableKey);
    try {
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data, error } = await supabase.from(tableKey).select("*").range(from, from + batchSize - 1);
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
          const { data, error } = await supabase.from(table.key).select("*").range(from, from + batchSize - 1);
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
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeSubTab === "export" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSubTab("export")}
          className="gap-2"
        >
          <Download className="w-4 h-4" /> Export / Backup
        </Button>
        <Button
          variant={activeSubTab === "import" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSubTab("import")}
          className="gap-2"
        >
          <UploadCloud className="w-4 h-4" /> Import / Restore
        </Button>
      </div>

      {/* Export Tab */}
      {activeSubTab === "export" && (
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
              <div key={table.key} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-secondary/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {table.label}
                    {exported.has(table.key) && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{table.description}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 ml-3 h-8" disabled={exporting !== null} onClick={() => exportTable(table.key, table.label)}>
                  {exporting === table.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                </Button>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Regular backups help protect your data. We recommend exporting a full backup at least once a week.
            </p>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeSubTab === "import" && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Import / Restore Data</h3>
            <p className="text-sm text-muted-foreground">Upload a previously exported Excel backup to restore data into the system</p>
          </div>

          {/* Warning banner */}
          <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Caution: This will overwrite existing records</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Records with matching IDs will be updated. Make sure you have a current backup before restoring data.
              </p>
            </div>
          </div>

          {/* Upload area */}
          {!importFile ? (
            <label className="cursor-pointer flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-10 hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <div className="rounded-full bg-muted p-4">
                <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to select an Excel backup file</p>
                <p className="text-xs text-muted-foreground mt-1">.xlsx files exported from this system</p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{importFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {importSheets.length} sheet(s) · {importSheets.reduce((s, sh) => s + sh.rowCount, 0)} total rows
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setImportFile(null);
                    setImportSheets([]);
                    setParsedWorkbook(null);
                    setImportResults([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Sheet mapping */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sheet → Table Mapping</p>
                {importSheets.map((sheet, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 bg-secondary/10">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{sheet.sheetName}</p>
                      <p className="text-xs text-muted-foreground">{sheet.rowCount} rows</p>
                    </div>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Select
                      value={sheet.tableKey || "skip"}
                      onValueChange={(v) => updateSheetMapping(idx, v === "skip" ? null : (v as TableKey))}
                    >
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Skip (don't import)</SelectItem>
                        {backupTables.map((t) => (
                          <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {importing && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">Importing... {importProgress}%</p>
                </div>
              )}

              {/* Results */}
              {importResults.length > 0 && !importing && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/50 border-b border-border">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Import Results</p>
                  </div>
                  {importResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0">
                      <p className="text-sm">{r.table}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-success font-medium">{r.inserted} restored</span>
                        {r.errors > 0 && <span className="text-destructive font-medium">{r.errors} errors</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={importing || validSheets.length === 0}
                  className="gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Restore {validSheets.length} Table{validSheets.length !== 1 ? "s" : ""} ({validSheets.reduce((s, sh) => s + sh.rowCount, 0)} rows)
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Restore</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to restore <strong>{validSheets.reduce((s, sh) => s + sh.rowCount, 0)} records</strong> into{" "}
              <strong>{validSheets.length} table(s)</strong>. Existing records with matching IDs will be overwritten.
              <br /><br />
              This action cannot be undone. Make sure you have a current backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, Restore Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
