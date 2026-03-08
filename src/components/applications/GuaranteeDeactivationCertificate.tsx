import React, { useRef } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { fmt } from "@/lib/currency";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface GuaranteeDeactivationProps {
  open: boolean;
  onClose: () => void;
  loan: any;
  guarantor: any;
}

export default function GuaranteeDeactivationCertificate({ open, onClose, loan, guarantor }: GuaranteeDeactivationProps) {
  const { canPrint } = usePermissions();
  const printRef = useRef<HTMLDivElement>(null);
  const { settings: company } = useCompanySettings();

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Guarantee Deactivation Certificate</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
        .header img { height: 48px; margin: 0 auto 8px; display: block; object-fit: contain; }
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
        .stamp img { height: 80px; margin: 0 auto; display: block; object-fit: contain; }
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
  const companyName = company?.company_name || "Addis Microfinance";

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
          <div className="header" style={{ textAlign: "center", borderBottom: "3px solid #1a1a1a", paddingBottom: 16, marginBottom: 24 }}>
            {company?.logo_url && (
              <img src={company.logo_url} alt={companyName} style={{ height: 48, margin: "0 auto 8px", objectFit: "contain" }} />
            )}
            <h1 style={{ fontSize: 22, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>{companyName}</h1>
            <h2 style={{ fontSize: 16, margin: 0, color: "#555", fontWeight: "normal" }}>Guarantee Deactivation Certificate</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>Date: {today} | Ref: {refNo}</p>
          </div>

          <div className="section" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Loan Details</div>
            <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
              <span style={{ color: "#666" }}>Application No:</span><span style={{ fontWeight: 600 }}>{loan.application_number}</span>
              <span style={{ color: "#666" }}>Borrower:</span><span style={{ fontWeight: 600 }}>{loan.employees?.full_name}</span>
              <span style={{ color: "#666" }}>Employee ID:</span><span style={{ fontWeight: 600 }}>{loan.employees?.employee_id}</span>
              <span style={{ color: "#666" }}>Loan Type:</span><span style={{ fontWeight: 600 }}>{loan.loan_types?.name}</span>
              <span style={{ color: "#666" }}>Loan Amount:</span><span style={{ fontWeight: 600 }}>{fmt(loan.requested_amount)}</span>
              <span style={{ color: "#666" }}>Status:</span><span style={{ fontWeight: 600 }}>{loan.status}</span>
              <span style={{ color: "#666" }}>Total Paid:</span><span style={{ fontWeight: 600 }}>{fmt(loan.total_paid)}</span>
              <span style={{ color: "#666" }}>Outstanding:</span><span style={{ fontWeight: 600 }}>{loan.outstanding_balance != null ? fmt(loan.outstanding_balance) : "—"}</span>
            </div>
          </div>

          <div className="section" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Guarantor Details</div>
            <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
              <span style={{ color: "#666" }}>Full Name:</span><span style={{ fontWeight: 600 }}>{guarantor.employees?.full_name}</span>
              <span style={{ color: "#666" }}>Employee ID:</span><span style={{ fontWeight: 600 }}>{guarantor.employees?.employee_id}</span>
            </div>
          </div>

          <div className="body-text" style={{ fontSize: 13, lineHeight: 1.7, margin: "16px 0" }}>
            This is to certify that <strong>{guarantor.employees?.full_name}</strong> (Employee ID: {guarantor.employees?.employee_id}),
            who served as a guarantor for the loan application <strong>{loan.application_number}</strong>
            taken by <strong>{loan.employees?.full_name}</strong>, is hereby <strong>released from all guarantee obligations</strong> associated with this loan.
            <br /><br />
            The loan has been {loan.status === "Closed" ? "fully repaid and closed" : "processed for guarantor release"}.
            The guarantor is no longer liable for any outstanding amounts related to this loan and is now free to serve as a guarantor for other loan applications.
          </div>

          <div className="signatures" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 60, fontSize: 13 }}>
            <div>
              <div style={{ borderTop: "1px solid #333", paddingTop: 6, marginTop: 50 }}>Authorized Officer</div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Name & Signature</p>
            </div>
            <div>
              <div style={{ borderTop: "1px solid #333", paddingTop: 6, marginTop: 50 }}>Guarantor Acknowledgment</div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{guarantor.employees?.full_name}</p>
            </div>
          </div>

          <div className="stamp" style={{ textAlign: "center", marginTop: 40, padding: 12, border: "2px dashed #aaa", fontSize: 12, color: "#888" }}>
            {company?.stamp_url ? (
              <img src={company.stamp_url} alt="Company Stamp" style={{ height: 80, margin: "0 auto", objectFit: "contain" }} />
            ) : (
              "Company Stamp / Seal"
            )}
          </div>
          <div className="ref" style={{ fontSize: 11, color: "#888", marginTop: 24, textAlign: "right" }}>Reference: {refNo}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
