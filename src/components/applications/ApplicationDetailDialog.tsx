import React, { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmt } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { Printer, Pencil, Trash2 } from "lucide-react";
import ApplicationTimeline from "./ApplicationTimeline";
import { toast } from "sonner";
import LoanApplicationDocument from "./LoanApplicationDocument";
import { useUpdateLoanApplication, useDeleteLoanApplication } from "@/hooks/useLoans";

interface Props {
  selected: any;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function ApplicationDetailDialog({ selected, onClose, canEdit = false, canDelete = false }: Props) {
  const { canPrint } = usePermissions();
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [docOpen, setDocOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const updateMut = useUpdateLoanApplication();
  const deleteMut = useDeleteLoanApplication();

  const [editForm, setEditForm] = useState({
    requested_amount: 0,
    repayment_period_months: 12,
    purpose: "",
    remarks: "",
    proposed_start_date: "",
  });

  useEffect(() => {
    if (!selected) { setGuarantors([]); setEditMode(false); return; }
    supabase
      .from("loan_guarantors")
      .select("*, employees(full_name, employee_id)")
      .eq("loan_application_id", selected.id)
      .then(({ data }) => setGuarantors(data || []));

    setEditForm({
      requested_amount: selected.requested_amount || 0,
      repayment_period_months: selected.repayment_period_months || 12,
      purpose: selected.purpose || "",
      remarks: selected.remarks || "",
      proposed_start_date: selected.proposed_start_date || "",
    });
  }, [selected]);

  const isEditable = selected && ["Draft", "Submitted"].includes(selected.status);
  const isDeletable = selected && ["Draft", "Submitted", "Rejected", "Cancelled"].includes(selected.status);

  const handleSaveEdit = () => {
    if (!selected) return;
    updateMut.mutate({
      id: selected.id,
      ...editForm,
    }, {
      onSuccess: () => {
        toast.success("Application updated");
        setEditMode(false);
        onClose();
      },
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteMut.mutate(selected.id, {
      onSuccess: () => {
        setDeleteConfirm(false);
        onClose();
      },
    });
  };

  return (
    <>
      <Dialog open={!!selected} onOpenChange={() => { setEditMode(false); onClose(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              {editMode ? "Edit Application" : "Loan Application Details"}
              <div className="flex items-center gap-1">
                {!editMode && canPrint("Applications") && (
                  <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}>
                    <Printer className="w-4 h-4 mr-1" /> Print
                  </Button>
                )}
                {canEdit && isEditable && !editMode && (
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                )}
                {canDelete && isDeletable && !editMode && (
                  <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(true)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          {selected && !editMode && (
            <div className="space-y-4">
              {/* Status Timeline */}
              <ApplicationTimeline loan={selected} />

              <div className="grid grid-cols-2 gap-3 text-sm">
                {([
                  ["Application ID", selected.application_number], ["Date", selected.application_date],
                  ["Employee", selected.employees?.full_name], ["Department", selected.employees?.department],
                  ["Loan Type", selected.loan_types?.name], ["Status", selected.status],
                  ["Requested", fmt(selected.requested_amount)],
                  ["Approved", selected.approved_amount ? fmt(selected.approved_amount) : "—"],
                  ["Interest Rate", `${selected.interest_rate}%`], ["Period", `${selected.repayment_period_months} months`],
                  ["Installment", selected.monthly_installment ? fmt(selected.monthly_installment) : "—"],
                  ["Purpose", selected.purpose || "—"],
                  ["Total Payable", selected.total_payable ? fmt(selected.total_payable) : "—"],
                  ["Total Paid", fmt(selected.total_paid)],
                  ["Outstanding", selected.outstanding_balance != null ? fmt(selected.outstanding_balance) : "—"],
                  ["Disbursed On", selected.disbursement_date || "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium">{value}</p></div>
                ))}
              </div>

              {guarantors.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="font-medium text-sm text-amber-700 dark:text-amber-400 mb-2">Guarantors</p>
                  <div className="space-y-2">
                    {guarantors.map((g: any, i: number) => (
                      <div key={g.id} className="text-sm">
                        <span className="text-muted-foreground">{i + 1}.</span>{" "}
                        <span className="font-medium">{g.employees?.full_name}</span>{" "}
                        <span className="text-muted-foreground text-xs">({g.employees?.employee_id})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Mode */}
          {selected && editMode && (
            <div className="space-y-3">
              <div>
                <Label>Requested Amount</Label>
                <Input
                  type="number"
                  value={editForm.requested_amount || ""}
                  onChange={e => setEditForm(f => ({ ...f, requested_amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Repayment Period (months)</Label>
                <Input
                  type="number"
                  value={editForm.repayment_period_months}
                  onChange={e => setEditForm(f => ({ ...f, repayment_period_months: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Proposed Start Date</Label>
                <Input
                  type="date"
                  value={editForm.proposed_start_date}
                  onChange={e => setEditForm(f => ({ ...f, proposed_start_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Textarea
                  value={editForm.purpose}
                  onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Remarks</Label>
                <Input
                  value={editForm.remarks}
                  onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete application <strong>{selected?.application_number}</strong>? This will also remove all associated guarantors, documents, and repayment schedules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loan Application Document */}
      <LoanApplicationDocument
        open={docOpen}
        onClose={() => setDocOpen(false)}
        loan={selected}
      />
    </>
  );
}
