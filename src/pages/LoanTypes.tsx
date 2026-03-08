import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import { loanTypes as initialLoanTypes } from "@/data/mockData";
import { Settings, Edit, Plus, Trash2, FileText, Upload, X, ChevronDown, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoanType, LoanTypeDocument } from "@/types/loan";
import { toast } from "sonner";

import { fmt, CURRENCY } from "@/lib/currency";

const emptyForm: Omit<LoanType, "id"> = {
  name: "",
  minAmount: 0,
  maxAmount: 0,
  maxPeriod: 12,
  interestRate: 0,
  interestFree: false,
  maxActiveLoans: 1,
  deductionMethod: "Payroll",
  description: "",
  eligibilityMinMonths: 6,
  salaryMultiplier: 3,
  approvalLevel: "Department Head",
  requiredDocuments: [],
};

export default function LoanTypes() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>(initialLoanTypes);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LoanType, "id">>(emptyForm);
  const [documents, setDocuments] = useState<LoanTypeDocument[]>([]);
  const [newDocName, setNewDocName] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDocuments([]);
    setOpen(true);
  };

  const openEdit = (lt: LoanType) => {
    setEditingId(lt.id);
    setForm({ ...lt });
    setDocuments(lt.requiredDocuments || []);
    setOpen(true);
  };

  const addDocument = () => {
    if (!newDocName.trim()) return;
    setDocuments(prev => [
      ...prev,
      { id: `DOC-${Date.now()}`, name: newDocName.trim(), file: null, required: true },
    ]);
    setNewDocName("");
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const toggleDocRequired = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, required: !d.required } : d));
  };

  const handleFileChange = (docId: string, file: File | null) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, file } : d));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Loan type name is required");
      return;
    }
    if (form.maxAmount <= 0) {
      toast.error("Maximum amount must be greater than 0");
      return;
    }
    if (form.minAmount > form.maxAmount) {
      toast.error("Minimum amount cannot exceed maximum amount");
      return;
    }

    const loanType: LoanType = {
      ...form,
      id: editingId || `LT${String(loanTypes.length + 1).padStart(3, "0")}`,
      requiredDocuments: documents,
    };

    if (editingId) {
      setLoanTypes(prev => prev.map(lt => lt.id === editingId ? loanType : lt));
      toast.success(`"${loanType.name}" updated successfully`);
    } else {
      setLoanTypes(prev => [...prev, loanType]);
      toast.success(`"${loanType.name}" created successfully`);
    }
    setOpen(false);
  };

  return (
    <div>
      <TopBar title="Loan Types" subtitle="Configure loan type settings" />
      <div className="p-6 animate-fade-in">
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add Loan Type
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loanTypes.map(lt => (
            <div key={lt.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold">{lt.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => openEdit(lt)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              {lt.description && (
                <p className="text-xs text-muted-foreground mb-3">{lt.description}</p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Range</span>
                  <span className="font-medium">{fmt(lt.minAmount)} – {fmt(lt.maxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Period</span>
                  <span className="font-medium">{lt.maxPeriod} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">{lt.interestFree ? "Interest Free" : `${lt.interestRate}%`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Active Loans</span>
                  <span className="font-medium">{lt.maxActiveLoans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deduction</span>
                  <span className="font-medium">{lt.deductionMethod}</span>
                </div>
                {lt.approvalLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approval</span>
                    <span className="font-medium">{lt.approvalLevel}</span>
                  </div>
                )}
              </div>

              {/* Required documents badge */}
              {lt.requiredDocuments && lt.requiredDocuments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> Required Documents ({lt.requiredDocuments.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {lt.requiredDocuments.map(doc => (
                      <span
                        key={doc.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground"
                      >
                        <FileText className="w-3 h-3" />
                        {doc.name}
                        {doc.required && <span className="text-destructive">*</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Loan Type" : "Create Loan Type"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label>Loan Type Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Personal Loan"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description || ""}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this loan type..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Amount & Terms */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Amount & Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Minimum Amount ({CURRENCY}) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={form.minAmount || ""}
                    onChange={e => setForm(f => ({ ...f, minAmount: Number(e.target.value) }))}
                    placeholder="10000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Maximum Amount ({CURRENCY}) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={form.maxAmount || ""}
                    onChange={e => setForm(f => ({ ...f, maxAmount: Number(e.target.value) }))}
                    placeholder="500000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Repayment Period (months)</Label>
                  <Input
                    type="number"
                    value={form.maxPeriod || ""}
                    onChange={e => setForm(f => ({ ...f, maxPeriod: Number(e.target.value) }))}
                    placeholder="12"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Active Loans</Label>
                  <Input
                    type="number"
                    value={form.maxActiveLoans || ""}
                    onChange={e => setForm(f => ({ ...f, maxActiveLoans: Number(e.target.value) }))}
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Interest */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Interest & Deduction</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <Label className="cursor-pointer">Interest Free</Label>
                  <Switch
                    checked={form.interestFree}
                    onCheckedChange={checked => setForm(f => ({ ...f, interestFree: checked, interestRate: checked ? 0 : f.interestRate }))}
                  />
                </div>
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.interestRate || ""}
                    onChange={e => setForm(f => ({ ...f, interestRate: Number(e.target.value) }))}
                    placeholder="8"
                    disabled={form.interestFree}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Deduction Method</Label>
                  <Select value={form.deductionMethod} onValueChange={v => setForm(f => ({ ...f, deductionMethod: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payroll">Payroll Deduction</SelectItem>
                      <SelectItem value="Manual">Manual Payment</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Approval Level</Label>
                  <Select value={form.approvalLevel || "Department Head"} onValueChange={v => setForm(f => ({ ...f, approvalLevel: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Department Head">Department Head</SelectItem>
                      <SelectItem value="HR + Finance">HR + Finance Manager</SelectItem>
                      <SelectItem value="General Manager">General Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Eligibility Rules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Min. Service Period (months)</Label>
                  <Input
                    type="number"
                    value={form.eligibilityMinMonths || ""}
                    onChange={e => setForm(f => ({ ...f, eligibilityMinMonths: Number(e.target.value) }))}
                    placeholder="6"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Salary Multiplier</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.salaryMultiplier || ""}
                    onChange={e => setForm(f => ({ ...f, salaryMultiplier: Number(e.target.value) }))}
                    placeholder="3"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Required Documents</h4>
              <p className="text-xs text-muted-foreground">
                Define documents applicants must provide when applying for this loan type.
              </p>

              {/* Add new document */}
              <div className="flex items-center gap-2">
                <Input
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  placeholder="Document name (e.g. Pay Slip, ID Copy)"
                  className="flex-1"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
                />
                <Button size="sm" variant="outline" onClick={addDocument} disabled={!newDocName.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* Document list */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        {doc.file && (
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.file.name} ({(doc.file.size / 1024).toFixed(1)} KB)
                          </p>
                        )}
                      </div>

                      {/* File upload */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={e => handleFileChange(doc.id, e.target.files?.[0] || null)}
                        />
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-card border border-border hover:bg-secondary transition-colors">
                          <Upload className="w-3 h-3" />
                          {doc.file ? "Replace" : "Upload Template"}
                        </span>
                      </label>

                      {/* Required toggle */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch
                          checked={doc.required}
                          onCheckedChange={() => toggleDocRequired(doc.id)}
                        />
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {documents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border bg-secondary/20">
                  <Paperclip className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No documents added yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add documents applicants must submit</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingId ? "Update Loan Type" : "Create Loan Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
