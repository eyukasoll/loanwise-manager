import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmt } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  selected: any;
  onClose: () => void;
}

export default function ApplicationDetailDialog({ selected, onClose }: Props) {
  const [guarantors, setGuarantors] = useState<any[]>([]);

  useEffect(() => {
    if (!selected) { setGuarantors([]); return; }
    supabase
      .from("loan_guarantors")
      .select("*, employees(full_name, employee_id)")
      .eq("loan_application_id", selected.id)
      .then(({ data }) => setGuarantors(data || []));
  }, [selected]);

  return (
    <Dialog open={!!selected} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Loan Application Details</DialogTitle></DialogHeader>
        {selected && (
          <div className="space-y-4">
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

            {/* Guarantors */}
            {guarantors.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="font-medium text-sm text-amber-700 dark:text-amber-400 mb-2">Guarantors</p>
                <div className="space-y-1 text-sm">
                  {guarantors.map((g: any, i: number) => (
                    <p key={g.id}>
                      <span className="text-muted-foreground">{i + 1}.</span>{" "}
                      <span className="font-medium">{g.employees?.full_name}</span>{" "}
                      <span className="text-muted-foreground text-xs">({g.employees?.employee_id})</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
