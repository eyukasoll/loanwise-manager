import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ======================== EMPLOYEES ========================

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useNextEmployeeId() {
  return useQuery({
    queryKey: ["next-employee-id"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("employee_id")
        .like("employee_id", "EMP%")
        .order("employee_id", { ascending: false })
        .limit(1);
      if (error) throw error;
      const last = data?.[0]?.employee_id;
      const num = last ? parseInt(last.replace("EMP", ""), 10) + 1 : 1;
      return `EMP${String(num).padStart(3, "0")}`;
    },
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: {
      employee_id: string; full_name: string; department: string; position: string;
      branch?: string; date_of_employment: string; employment_status?: string;
      monthly_salary?: number; allowances?: number; bank_account?: string;
      phone?: string; email?: string;
    }) => {
      const { data, error } = await supabase.from("employees").insert(emp).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); qc.invalidateQueries({ queryKey: ["next-employee-id"] }); toast.success("Employee created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkCreateEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employees: {
      employee_id: string; full_name: string; department: string; position: string;
      branch?: string; date_of_employment: string; employment_status?: string;
      monthly_salary?: number; allowances?: number; bank_account?: string;
      phone?: string; email?: string;
    }[]) => {
      const { data, error } = await supabase.from("employees").insert(employees).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["next-employee-id"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("employees").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== LOAN TYPES ========================

export function useLoanTypes() {
  return useQuery({
    queryKey: ["loan_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_types")
        .select("*, loan_type_documents(*)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLoanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ documents, ...lt }: {
      name: string; description?: string; min_amount: number; max_amount: number;
      max_period_months?: number; interest_rate?: number; interest_free?: boolean;
      max_active_loans?: number; deduction_method?: string; eligibility_min_months?: number;
      salary_multiplier?: number; approval_level?: string;
      documents?: { document_name: string; is_required: boolean; template_url?: string }[];
    }) => {
      const { data, error } = await supabase.from("loan_types").insert(lt).select().single();
      if (error) throw error;
      if (documents && documents.length > 0) {
        const docs = documents.map(d => ({ ...d, loan_type_id: data.id }));
        const { error: docErr } = await supabase.from("loan_type_documents").insert(docs);
        if (docErr) throw docErr;
      }
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loan_types"] }); toast.success("Loan type created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLoanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, documents, ...updates }: { id: string; documents?: { document_name: string; is_required: boolean; template_url?: string }[]; [key: string]: any }) => {
      const { error } = await supabase.from("loan_types").update(updates).eq("id", id);
      if (error) throw error;
      // Replace documents
      if (documents !== undefined) {
        await supabase.from("loan_type_documents").delete().eq("loan_type_id", id);
        if (documents.length > 0) {
          const docs = documents.map(d => ({ ...d, loan_type_id: id }));
          const { error: docErr } = await supabase.from("loan_type_documents").insert(docs);
          if (docErr) throw docErr;
        }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loan_types"] }); toast.success("Loan type updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLoanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loan_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loan_types"] }); toast.success("Loan type deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== LOAN APPLICATIONS ========================

export function useLoanApplications(statusFilter?: string) {
  return useQuery({
    queryKey: ["loan_applications", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("loan_applications")
        .select("*, employees(full_name, department, employee_id, monthly_salary), loan_types(name)")
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLoanApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (app: {
      employee_id: string; loan_type_id: string; requested_amount: number;
      repayment_period_months: number; interest_rate?: number; purpose?: string;
      proposed_start_date?: string; remarks?: string; status?: string;
      total_payable?: number; monthly_installment?: number; outstanding_balance?: number;
      guarantor_ids?: string[];
    }) => {
      const { guarantor_ids, ...appData } = app;
      const { data, error } = await supabase
        .from("loan_applications")
        .insert({ ...appData, application_number: "" }) // trigger will generate
        .select("*, employees(full_name, department, employee_id), loan_types(name)")
        .single();
      if (error) throw error;

      // Insert guarantors
      if (guarantor_ids && guarantor_ids.length > 0) {
        const guarantors = guarantor_ids.map(eid => ({
          loan_application_id: data.id,
          employee_id: eid,
        }));
        const { error: gErr } = await supabase.from("loan_guarantors").insert(guarantors);
        if (gErr) throw gErr;
      }

      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loan_applications"] }); toast.success("Application submitted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLoanApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("loan_applications").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loan_applications"] });
      qc.invalidateQueries({ queryKey: ["repayment_schedule"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLoanApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete guarantors first
      await supabase.from("loan_guarantors").delete().eq("loan_application_id", id);
      // Delete documents
      await supabase.from("loan_application_documents").delete().eq("loan_application_id", id);
      // Delete repayment schedule
      await supabase.from("repayment_schedule").delete().eq("loan_application_id", id);
      // Delete the application
      const { error } = await supabase.from("loan_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loan_applications"] });
      qc.invalidateQueries({ queryKey: ["guaranteed_employee_ids"] });
      toast.success("Application deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkDeleteLoanApplications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await supabase.from("loan_guarantors").delete().eq("loan_application_id", id);
        await supabase.from("loan_application_documents").delete().eq("loan_application_id", id);
        await supabase.from("repayment_schedule").delete().eq("loan_application_id", id);
        await supabase.from("payroll_deductions").delete().eq("loan_application_id", id);
        await supabase.from("manual_payments").delete().eq("loan_application_id", id);
      }
      const { error } = await supabase.from("loan_applications").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loan_applications"] });
      qc.invalidateQueries({ queryKey: ["guaranteed_employee_ids"] });
      toast.success("Applications deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== REPAYMENT SCHEDULE ========================

export function useRepaymentSchedule(loanAppId?: string) {
  return useQuery({
    queryKey: ["repayment_schedule", loanAppId],
    queryFn: async () => {
      if (!loanAppId) return [];
      const { data, error } = await supabase
        .from("repayment_schedule")
        .select("*")
        .eq("loan_application_id", loanAppId)
        .order("installment_no");
      if (error) throw error;
      return data;
    },
    enabled: !!loanAppId,
  });
}

export function useGenerateRepaymentSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loan: {
      id: string; approved_amount: number; total_payable: number;
      repayment_period_months: number; monthly_installment: number;
      interest_rate: number; disbursement_date: string;
    }) => {
      // Delete existing schedule
      await supabase.from("repayment_schedule").delete().eq("loan_application_id", loan.id);
      
      const items = [];
      const principal = loan.approved_amount;
      const totalPayable = loan.total_payable;
      const months = loan.repayment_period_months;
      const installment = loan.monthly_installment;
      let balance = totalPayable;
      const startDate = new Date(loan.disbursement_date);

      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        const principalPortion = Math.round((principal / months) * 100) / 100;
        const interestPortion = Math.round((installment - principalPortion) * 100) / 100;
        const beginBal = balance;
        balance = Math.round((balance - installment) * 100) / 100;
        if (balance < 0) balance = 0;

        items.push({
          loan_application_id: loan.id,
          installment_no: i,
          due_date: dueDate.toISOString().split("T")[0],
          beginning_balance: beginBal,
          installment_amount: installment,
          principal_portion: principalPortion,
          interest_portion: Math.max(0, interestPortion),
          total_due: installment,
          remaining_balance: balance,
          status: "Pending",
        });
      }

      const { error } = await supabase.from("repayment_schedule").insert(items);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repayment_schedule"] });
      toast.success("Repayment schedule generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateRepaymentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("repayment_schedule").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["repayment_schedule"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== MANUAL PAYMENTS ========================

export function useManualPayments() {
  return useQuery({
    queryKey: ["manual_payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_payments")
        .select("*, loan_applications(application_number, employees(full_name))")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateManualPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: {
      loan_application_id: string; amount: number; payment_date?: string;
      payment_method?: string; receipt_number?: string; received_by?: string; remarks?: string;
    }) => {
      const { data, error } = await supabase.from("manual_payments").insert(payment).select().single();
      if (error) throw error;

      // Update loan total_paid and outstanding_balance
      const { data: loan } = await supabase.from("loan_applications").select("total_paid, total_payable").eq("id", payment.loan_application_id).single();
      if (loan) {
        const newPaid = (loan.total_paid || 0) + payment.amount;
        const newBalance = (loan.total_payable || 0) - newPaid;
        await supabase.from("loan_applications").update({
          total_paid: newPaid,
          outstanding_balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? "Closed" : undefined,
        }).eq("id", payment.loan_application_id);
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manual_payments"] });
      qc.invalidateQueries({ queryKey: ["loan_applications"] });
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== PAYROLL DEDUCTIONS ========================

export function usePayrollDeductions(period?: string) {
  return useQuery({
    queryKey: ["payroll_deductions", period],
    queryFn: async () => {
      let query = supabase
        .from("payroll_deductions")
        .select("*, loan_applications(application_number, employees(full_name, employee_id, department), loan_types(name))")
        .order("created_at", { ascending: false });
      if (period) query = query.eq("payroll_period", period);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useGeneratePayrollDeductions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (period: string) => {
      // Get all active loans
      const { data: loans, error } = await supabase
        .from("loan_applications")
        .select("id, monthly_installment")
        .in("status", ["Active", "Disbursed"])
        .not("monthly_installment", "is", null);
      if (error) throw error;

      // Check for existing deductions in this period
      const { data: existing } = await supabase
        .from("payroll_deductions")
        .select("loan_application_id")
        .eq("payroll_period", period);
      const existingIds = new Set((existing || []).map(e => e.loan_application_id));

      const newDeductions = (loans || [])
        .filter(l => !existingIds.has(l.id))
        .map(l => ({
          loan_application_id: l.id,
          payroll_period: period,
          deduction_amount: l.monthly_installment!,
          status: "Scheduled",
        }));

      if (newDeductions.length === 0) {
        toast.info("No new deductions to generate");
        return;
      }

      const { error: insertErr } = await supabase.from("payroll_deductions").insert(newDeductions);
      if (insertErr) throw insertErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll_deductions"] });
      toast.success("Payroll deductions generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProcessDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, loan_application_id, amount }: { id: string; loan_application_id: string; amount: number }) => {
      // Mark deduction as processed
      await supabase.from("payroll_deductions").update({ status: "Processed", processed_date: new Date().toISOString().split("T")[0] }).eq("id", id);

      // Update loan balance
      const { data: loan } = await supabase.from("loan_applications").select("total_paid, total_payable").eq("id", loan_application_id).single();
      if (loan) {
        const newPaid = (loan.total_paid || 0) + amount;
        const newBalance = (loan.total_payable || 0) - newPaid;
        await supabase.from("loan_applications").update({
          total_paid: newPaid,
          outstanding_balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? "Closed" : undefined,
        }).eq("id", loan_application_id);
      }

      // Update repayment schedule item
      const { data: schedItems } = await supabase
        .from("repayment_schedule")
        .select("id")
        .eq("loan_application_id", loan_application_id)
        .eq("status", "Pending")
        .order("installment_no")
        .limit(1);
      if (schedItems && schedItems.length > 0) {
        await supabase.from("repayment_schedule").update({
          paid_amount: amount,
          status: "Paid",
          paid_date: new Date().toISOString().split("T")[0],
        }).eq("id", schedItems[0].id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll_deductions"] });
      qc.invalidateQueries({ queryKey: ["loan_applications"] });
      qc.invalidateQueries({ queryKey: ["repayment_schedule"] });
      toast.success("Deduction processed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ======================== AUDIT LOG ========================

export function useAuditLog(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ["audit_log", entityType, entityId],
    queryFn: async () => {
      let query = supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAuditEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      entity_type: string; entity_id: string; action: string;
      performed_by?: string; old_values?: any; new_values?: any;
    }) => {
      const { error } = await supabase.from("audit_log").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["audit_log"] }); },
  });
}

// ======================== SAVINGS ========================

export function useSavingsTransactions() {
  return useQuery({
    queryKey: ["savings_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_transactions")
        .select("*, employees(full_name, employee_id, department, branch)")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSavingsTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: {
      employee_id: string;
      savings_type: string;
      transaction_type: string;
      amount: number;
      payment_method: string;
      receipt_number?: string;
      remarks?: string;
      recorded_by?: string;
    }) => {
      const { data, error } = await supabase
        .from("savings_transactions")
        .insert(tx)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_transactions"] });
      toast.success("Savings transaction recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useBulkCreateSavingsTransactions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txs: Array<{
      employee_id: string;
      savings_type: string;
      transaction_type: string;
      amount: number;
      payment_method: string;
      receipt_number?: string;
      remarks?: string;
    }>) => {
      const { data, error } = await supabase
        .from("savings_transactions")
        .insert(txs)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_transactions"] });
      toast.success("Bulk savings imported successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteSavingsTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ======================== GUARANTORS ========================

export function useGuaranteedEmployeeIds() {
  return useQuery({
    queryKey: ["guaranteed_employee_ids"],
    queryFn: async () => {
      // Get guarantor employee_ids for loans in active statuses
      const { data: activeLoans, error: lErr } = await supabase
        .from("loan_applications")
        .select("id")
        .in("status", ["Submitted", "Under Review", "Pending Approval", "Approved", "Disbursed", "Active"]);
      if (lErr) throw lErr;
      if (!activeLoans || activeLoans.length === 0) return new Set<string>();

      const loanIds = activeLoans.map(l => l.id);
      const { data: guarantors, error: gErr } = await supabase
        .from("loan_guarantors")
        .select("employee_id")
        .in("loan_application_id", loanIds);
      if (gErr) throw gErr;

      return new Set((guarantors || []).map(g => g.employee_id));
    },
  });
}

// ======================== FILE UPLOAD ========================

export async function uploadLoanDocument(file: File, path: string) {
  const { data, error } = await supabase.storage.from("loan-documents").upload(path, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("loan-documents").getPublicUrl(data.path);
  return urlData.publicUrl;
}
