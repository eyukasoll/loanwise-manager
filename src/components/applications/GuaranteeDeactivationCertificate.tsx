import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { fmt } from "@/lib/currency";

interface GuaranteeDeactivationProps {
  open: boolean;
  onClose: () => void;
  loan: any;
  guarantor: any;
  companyName?: string;
}

export default function GuaranteeDeactivationCertificate({ open, onClose, loan, guarantor, companyName = "Addis Microfinance" }: GuaranteeDeactivationProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Guarantee Deactivation Certificate</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { font-size: 16px; margin: 0; color: #555; font-weight: normal; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #888; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
        .grid .label { color: #666; }
        .grid .value { font-weight: 600; }
        .body-text { font-size: 13px; line-height: 1.7; margin: 16px 0; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; font-size: 13px; }
        .sig-line { border-top: 1px solid #333; padding-top: 6px; margin-top: 50px; }
        .stamp { text-align: center; margin-top: 40px; padding: 12px; border: 2px dashed #aaa; font-size: 12px; color: #888; }
        .ref { font-size: 11px; color: #888; margin-top: 24px; text-align: right; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>${printRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const refNo = `GDC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  if (!loan || !guarantor) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Guarantee Deactivation Certificate
            <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          <div className="header">
            <h1>{companyName}</h1>
            <h2>Guarantee Deactivation Certificate</h2>
            <p>Date: {today} | Ref: {refNo}</p>
          </div>

          <div className="section">
            <div className="section-title">Loan Details</div>
            <div className="grid">
              <span className="label">Application No:</span><span className="value">{loan.application_number}</span>
              <span className="label">Borrower:</span><span className="value">{loan.employees?.full_name}</span>
              <span className="label">Employee ID:</span><span className="value">{loan.employees?.employee_id}</span>
              <span className="label">Loan Type:</span><span className="value">{loan.loan_types?.name}</span>
              <span className="label">Loan Amount:</span><span className="value">{fmt(loan.requested_amount)}</span>
              <span className="label">Status:</span><span className="value">{loan.status}</span>
              <span className="label">Total Paid:</span><span className="value">{fmt(loan.total_paid)}</span>
              <span className="label">Outstanding:</span><span className="value">{loan.outstanding_balance != null ? fmt(loan.outstanding_balance) : "—"}</span>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Guarantor Details</div>
            <div className="grid">
              <span className="label">Full Name:</span><span className="value">{guarantor.employees?.full_name}</span>
              <span className="label">Employee ID:</span><span className="value">{guarantor.employees?.employee_id}</span>
            </div>
          </div>

          <div className="body-text">
            This is to certify that <strong>{guarantor.employees?.full_name}</strong> (Employee ID: {guarantor.employees?.employee_id}),
            who served as a guarantor for the loan application <strong>{loan.application_number}</strong>
            taken by <strong>{loan.employees?.full_name}</strong>, is hereby <strong>released from all guarantee obligations</strong> associated with this loan.
            <br /><br />
            The loan has been {loan.status === "Closed" ? "fully repaid and closed" : "processed for guarantor release"}.
            The guarantor is no longer liable for any outstanding amounts related to this loan and is now free to serve as a guarantor for other loan applications.
          </div>

          <div className="signatures">
            <div>
              <div className="sig-line">Authorized Officer</div>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Name & Signature</p>
            </div>
            <div>
              <div className="sig-line">Guarantor Acknowledgment</div>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{guarantor.employees?.full_name}</p>
            </div>
          </div>

          <div className="stamp">Company Stamp / Seal</div>
          <div className="ref">Reference: {refNo}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
