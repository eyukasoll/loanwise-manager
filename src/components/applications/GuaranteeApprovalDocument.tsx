import React, { useRef, useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { fmt } from "@/lib/currency";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onClose: () => void;
  loan: any;
}

export default function GuaranteeApprovalDocument({ open, onClose, loan }: Props) {
  const { canPrint } = usePermissions();
  const printRef = useRef<HTMLDivElement>(null);
  const { settings: company } = useCompanySettings();
  const [guarantors, setGuarantors] = useState<any[]>([]);

  useEffect(() => {
    if (!loan) return;
    supabase
      .from("loan_guarantors")
      .select("*, employees(full_name, employee_id, department, position, monthly_salary)")
      .eq("loan_application_id", loan.id)
      .then(({ data }) => setGuarantors(data || []));
  }, [loan]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Guarantee Approval - ${loan?.application_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 14px; margin-bottom: 20px; }
        .header img { height: 48px; margin: 0 auto 8px; display: block; object-fit: contain; }
        .header h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px; }
        .header h2 { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 2px; }
        .header .sub { font-size: 11px; color: #888; }
        .ref-bar { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 16px; padding: 6px 10px; background: #f5f5f5; border-radius: 4px; }
        .section { margin-bottom: 16px; }
        .section-title { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #333; border-bottom: 1.5px solid #ccc; padding-bottom: 3px; margin-bottom: 8px; }
        table.info { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        table.info td, table.info th { padding: 5px 8px; border: 1px solid #ddd; }
        table.info td.label, table.info th { background: #f9f9f9; font-weight: 600; color: #555; }
        .body-text { font-size: 12.5px; line-height: 1.7; margin: 12px 0; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
        .sig-block { text-align: center; }
        .sig-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 4px; font-size: 12px; }
        .sig-sub { font-size: 11px; color: #888; margin-top: 2px; }
        .stamp { text-align: center; margin-top: 30px; padding: 10px; border: 2px dashed #bbb; font-size: 11px; color: #999; }
        .stamp img { height: 80px; margin: 0 auto; display: block; object-fit: contain; }
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
        @media print { body { padding: 16px; } }
      </style>
      </head><body>${printRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!loan) return null;

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const companyName = company?.company_name || "Addis Microfinance";
  const companyAddr = [company?.company_address, company?.city, company?.country].filter(Boolean).join(", ");
  const refNo = `GA-${new Date().getFullYear()}-${loan.application_number?.split("-").pop() || "000"}`;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Guarantee Approval Document
            <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: "13px", color: "#1a1a1a", lineHeight: "1.5" }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "3px double #1a1a1a", paddingBottom: "14px", marginBottom: "20px" }}>
            {company?.logo_url && (
              <img src={company.logo_url} alt={companyName} style={{ height: "48px", margin: "0 auto 8px", objectFit: "contain" }} />
            )}
            <h1 style={{ fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2px" }}>{companyName}</h1>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>Guarantee Approval Form</h2>
            {companyAddr && <p style={{ fontSize: "11px", color: "#888" }}>{companyAddr}</p>}
            {company?.company_phone && <p style={{ fontSize: "11px", color: "#888" }}>Tel: {company.company_phone} | Email: {company.company_email || "—"}</p>}
          </div>

          {/* Reference bar */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "16px", padding: "6px 10px", background: "#f5f5f5", borderRadius: "4px" }}>
            <span><strong>Ref No:</strong> {refNo}</span>
            <span><strong>Application No:</strong> {loan.application_number}</span>
            <span><strong>Date:</strong> {today}</span>
          </div>

          {/* Section 1: Borrower Information */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Section 1: Borrower Information
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555", width: "30%" }}>Full Name</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", width: "20%" }}>{loan.employees?.full_name}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555", width: "30%" }}>Employee ID</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", width: "20%" }}>{loan.employees?.employee_id}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Department</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.employees?.department}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Monthly Salary</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.employees?.monthly_salary ? fmt(loan.employees.monthly_salary) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Loan Details */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Section 2: Loan Details
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555", width: "30%" }}>Loan Type</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", width: "20%" }}>{loan.loan_types?.name}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555", width: "30%" }}>Requested Amount</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", width: "20%" }}>{fmt(loan.requested_amount)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Interest Rate</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.interest_rate}%</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Repayment Period</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.repayment_period_months} months</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Monthly Installment</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.monthly_installment ? fmt(loan.monthly_installment) : "—"}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555" }}>Total Payable</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{loan.total_payable ? fmt(loan.total_payable) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Guarantor Details */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Section 3: Assigned Guarantors
            </div>
            {guarantors.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    {["#", "Full Name", "Employee ID", "Department", "Position", "Salary"].map(h => (
                      <th key={h} style={{ padding: "5px 8px", border: "1px solid #ddd", background: "#f9f9f9", fontWeight: 600, color: "#555", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guarantors.map((g, i) => (
                    <tr key={g.id}>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{i + 1}</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{g.employees?.full_name}</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{g.employees?.employee_id}</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{g.employees?.department || "—"}</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{g.employees?.position || "—"}</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #ddd" }}>{g.employees?.monthly_salary ? fmt(g.employees.monthly_salary) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: "12px", color: "#888" }}>No guarantors assigned.</p>
            )}
          </div>

          {/* Guarantee Declaration */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Guarantee Declaration
            </div>
            <p style={{ fontSize: "12.5px", lineHeight: 1.7 }}>
              We, the undersigned guarantors, hereby confirm that we have agreed to guarantee the loan application
              <strong> {loan.application_number}</strong> submitted by <strong>{loan.employees?.full_name}</strong> for an amount of <strong>{fmt(loan.requested_amount)}</strong>.
            </p>
            <p style={{ fontSize: "12.5px", lineHeight: 1.7, marginTop: "8px" }}>
              We understand and accept that in the event of default by the borrower, we shall be jointly and severally liable for the outstanding
              balance of the loan. We authorize <strong>{companyName}</strong> to deduct the outstanding amount from our salaries in case of default by the borrower.
            </p>
          </div>

          {/* Guarantor Signatures */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Guarantor Signatures
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "16px" }}>
              {guarantors.map((g, i) => (
                <div key={g.id} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>Guarantor {i + 1}</p>
                  <div style={{ borderTop: "1px solid #333", marginTop: "50px", paddingTop: "4px", fontSize: "12px" }}>
                    {g.employees?.full_name}
                  </div>
                  <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Signature & Date</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Section */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", borderBottom: "1.5px solid #ccc", paddingBottom: "3px", marginBottom: "8px" }}>
              Official Approval
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginTop: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #333", marginTop: "50px", paddingTop: "4px", fontSize: "12px" }}>Recommended By</div>
                <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Name & Signature</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #333", marginTop: "50px", paddingTop: "4px", fontSize: "12px" }}>Reviewed By</div>
                <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Name & Signature</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #333", marginTop: "50px", paddingTop: "4px", fontSize: "12px" }}>Approved By</div>
                <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Name & Signature</p>
              </div>
            </div>
          </div>

          {/* Stamp */}
          <div style={{ textAlign: "center", marginTop: "30px", padding: "10px", border: "2px dashed #bbb", fontSize: "11px", color: "#999" }}>
            {company?.stamp_url ? (
              <img src={company.stamp_url} alt="Company Stamp" style={{ height: "80px", margin: "0 auto", objectFit: "contain" }} />
            ) : (
              "Company Stamp / Seal"
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "20px", paddingTop: "8px", borderTop: "1px solid #ddd", fontSize: "10px", color: "#999", textAlign: "center" }}>
            {companyName} — Guarantee Approval Form | Generated on {today} | This document is system-generated
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
