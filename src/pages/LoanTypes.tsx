import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import { useLoanTypes, useCreateLoanType, useUpdateLoanType, useDeleteLoanType } from "@/hooks/useLoans";
import { uploadLoanDocument } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { useLanguage } from "@/i18n/LanguageContext";
import { Plus, Edit, Trash2, FileText, Upload, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fmt, CURRENCY } from "@/lib/currency";
import { toast } from "sonner";

interface DocItem { tempId: string; document_name: string; is_required: boolean; file?: File; template_url?: string; }

const emptyForm = {
  name: "", description: "", min_amount: 0, max_amount: 0, max_period_months: 12,
  interest_rate: 0, interest_free: false, max_active_loans: 1, deduction_method: "Payroll",
  eligibility_min_months: 6, salary_multiplier: 3, approval_level: "Department Head",
  is_savings_based: false,
};

export default function LoanTypes() {
  const { data: loanTypes = [], isLoading } = useLoanTypes();
  const createMut = useCreateLoanType();
  const updateMut = useUpdateLoanType();
  const deleteMut = useDeleteLoanType();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [newDocName, setNewDocName] = useState("");

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDocuments([]); setOpen(true); };
  const openEdit = (lt: any) => {
    setEditingId(lt.id);
    setForm({
      name: lt.name, description: lt.description || "", min_amount: lt.min_amount,
      max_amount: lt.max_amount, max_period_months: lt.max_period_months,
      interest_rate: lt.interest_rate, interest_free: lt.interest_free,
      max_active_loans: lt.max_active_loans, deduction_method: lt.deduction_method,
      eligibility_min_months: lt.eligibility_min_months || 6,
      salary_multiplier: lt.salary_multiplier || 3, approval_level: lt.approval_level || "Department Head",
      is_savings_based: lt.is_savings_based || false,
    });
    setDocuments((lt.loan_type_documents || []).map((d: any) => ({
      tempId: d.id, document_name: d.document_name, is_required: d.is_required, template_url: d.template_url,
    })));
    setOpen(true);
  };

  const addDocument = () => {
    if (!newDocName.trim()) return;
    setDocuments(prev => [...prev, { tempId: `temp-${Date.now()}`, document_name: newDocName.trim(), is_required: true }]);
    setNewDocName("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.is_savings_based && form.max_amount <= 0) { toast.error("Max amount must be > 0"); return; }

    // Upload any new files
    const processedDocs = await Promise.all(
      documents.map(async (d) => {
        let url = d.template_url;
        if (d.file) {
          try {
            url = await uploadLoanDocument(d.file, `templates/${Date.now()}-${d.file.name}`);
          } catch { /* ignore upload errors for templates */ }
        }
        return { document_name: d.document_name, is_required: d.is_required, template_url: url };
      })
    );

    if (editingId) {
      updateMut.mutate({ id: editingId, ...form, documents: processedDocs }, { onSuccess: () => setOpen(false) });
    } else {
      createMut.mutate({ ...form, documents: processedDocs }, { onSuccess: () => setOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this loan type?")) deleteMut.mutate(id);
  };

  return (
    <div>
      <TopBar title={t.ltTitle} subtitle={t.ltSubtitle} />
      <div className="p-6 animate-fade-in">
        {canCreate("Loan Types") && (
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Loan Type</Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loanTypes.map((lt: any) => (
              <div key={lt.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">{lt.name}</h3>
                  <div className="flex gap-1">
                    {canEdit("Loan Types") && <Button variant="ghost" size="icon" onClick={() => openEdit(lt)}><Edit className="w-4 h-4" /></Button>}
                    {canDelete("Loan Types") && <Button variant="ghost" size="icon" onClick={() => handleDelete(lt.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                  </div>
                </div>
                {lt.description && <p className="text-xs text-muted-foreground mb-3">{lt.description}</p>}
                <div className="space-y-2 text-sm">
                  {!lt.is_savings_based && <div className="flex justify-between"><span className="text-muted-foreground">Amount Range</span><span className="font-medium">{fmt(lt.min_amount)} – {fmt(lt.max_amount)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Max Period</span><span className="font-medium">{lt.max_period_months} months</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate</span><span className="font-medium">{lt.interest_free ? "Interest Free" : `${lt.interest_rate}%`}</span></div>
                  {lt.is_savings_based && <div className="flex justify-between"><span className="text-muted-foreground">Basis</span><span className="font-medium text-primary">Savings-Based</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Max Active Loans</span><span className="font-medium">{lt.max_active_loans}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Deduction</span><span className="font-medium">{lt.deduction_method}</span></div>
                </div>
                {lt.loan_type_documents && lt.loan_type_documents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Paperclip className="w-3 h-3" /> Required Documents ({lt.loan_type_documents.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lt.loan_type_documents.map((doc: any) => (
                        <span key={doc.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                          <FileText className="w-3 h-3" />{doc.document_name}{doc.is_required && <span className="text-destructive">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loanTypes.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No loan types configured. Click "Add Loan Type" to get started.</div>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Loan Type" : "Create Loan Type"}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2"><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1" /></div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Amount & Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!form.is_savings_based && (
                  <>
                    <div><Label>Min Amount ({CURRENCY})</Label><Input type="number" value={form.min_amount || ""} onChange={e => setForm(f => ({ ...f, min_amount: Number(e.target.value) }))} className="mt-1" /></div>
                    <div><Label>Max Amount ({CURRENCY}) <span className="text-destructive">*</span></Label><Input type="number" value={form.max_amount || ""} onChange={e => setForm(f => ({ ...f, max_amount: Number(e.target.value) }))} className="mt-1" /></div>
                  </>
                )}
                {form.is_savings_based && (
                  <div className="sm:col-span-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
                    Max amount is calculated as: <strong>Employee Savings × Savings Multiplier</strong> (set in Settings)
                  </div>
                )}
                <div><Label>Max Period (months)</Label><Input type="number" value={form.max_period_months || ""} onChange={e => setForm(f => ({ ...f, max_period_months: Number(e.target.value) }))} className="mt-1" /></div>
                <div><Label>Max Active Loans</Label><Input type="number" value={form.max_active_loans || ""} onChange={e => setForm(f => ({ ...f, max_active_loans: Number(e.target.value) }))} className="mt-1" /></div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Interest & Deduction</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3"><Label>Interest Free</Label><Switch checked={form.interest_free} onCheckedChange={c => setForm(f => ({ ...f, interest_free: c, interest_rate: c ? 0 : f.interest_rate }))} /></div>
                <div><Label>Interest Rate (%)</Label><Input type="number" step="0.1" value={form.interest_rate || ""} onChange={e => setForm(f => ({ ...f, interest_rate: Number(e.target.value) }))} disabled={form.interest_free} className="mt-1" /></div>
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <Label>Savings-Based Loan</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Max amount = employee savings × multiplier</p>
                  </div>
                  <Switch checked={form.is_savings_based} onCheckedChange={c => setForm(f => ({ ...f, is_savings_based: c }))} />
                </div>
                <div><Label>Deduction Method</Label><Select value={form.deduction_method} onValueChange={v => setForm(f => ({ ...f, deduction_method: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Payroll">Payroll</SelectItem><SelectItem value="Manual">Manual</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent></Select></div>
                <div><Label>Approval Level</Label><Select value={form.approval_level} onValueChange={v => setForm(f => ({ ...f, approval_level: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Department Head">Department Head</SelectItem><SelectItem value="HR + Finance">HR + Finance</SelectItem><SelectItem value="General Manager">General Manager</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Required Documents</h4>
              <div className="flex items-center gap-2">
                <Input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Document name..." className="flex-1" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }} />
                <Button size="sm" variant="outline" onClick={addDocument} disabled={!newDocName.trim()}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              {documents.map(doc => (
                <div key={doc.tempId} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium truncate">{doc.document_name}</span>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setDocuments(prev => prev.map(d => d.tempId === doc.tempId ? { ...d, file } : d));
                    }} />
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-card border border-border hover:bg-secondary transition-colors"><Upload className="w-3 h-3" />{doc.file ? doc.file.name : "Template"}</span>
                  </label>
                  <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground">Req.</span><Switch checked={doc.is_required} onCheckedChange={() => setDocuments(prev => prev.map(d => d.tempId === doc.tempId ? { ...d, is_required: !d.is_required } : d))} /></div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDocuments(prev => prev.filter(d => d.tempId !== doc.tempId))}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
