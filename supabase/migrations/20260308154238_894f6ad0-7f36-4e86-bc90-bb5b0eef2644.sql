
-- ============================================
-- LOAN MANAGEMENT SYSTEM - FULL DATABASE SCHEMA
-- ============================================

-- 1. EMPLOYEES TABLE
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'Main Office',
  date_of_employment DATE NOT NULL,
  employment_status TEXT NOT NULL DEFAULT 'Active',
  monthly_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  bank_account TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are viewable by authenticated users" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees can be created by authenticated users" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Employees can be updated by authenticated users" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Employees can be deleted by authenticated users" ON public.employees FOR DELETE TO authenticated USING (true);

-- 2. LOAN TYPES TABLE
CREATE TABLE public.loan_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_period_months INT NOT NULL DEFAULT 12,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  interest_free BOOLEAN NOT NULL DEFAULT false,
  max_active_loans INT NOT NULL DEFAULT 1,
  deduction_method TEXT NOT NULL DEFAULT 'Payroll',
  eligibility_min_months INT DEFAULT 6,
  salary_multiplier NUMERIC(4,2) DEFAULT 3,
  approval_level TEXT DEFAULT 'Department Head',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loan types viewable by authenticated" ON public.loan_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Loan types can be created" ON public.loan_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Loan types can be updated" ON public.loan_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Loan types can be deleted" ON public.loan_types FOR DELETE TO authenticated USING (true);

-- 3. LOAN TYPE REQUIRED DOCUMENTS
CREATE TABLE public.loan_type_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_type_id UUID NOT NULL REFERENCES public.loan_types(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  template_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_type_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loan type docs viewable" ON public.loan_type_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Loan type docs can be created" ON public.loan_type_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Loan type docs can be updated" ON public.loan_type_documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Loan type docs can be deleted" ON public.loan_type_documents FOR DELETE TO authenticated USING (true);

-- 4. LOAN APPLICATIONS TABLE
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  loan_type_id UUID NOT NULL REFERENCES public.loan_types(id) ON DELETE RESTRICT,
  requested_amount NUMERIC(12,2) NOT NULL,
  approved_amount NUMERIC(12,2),
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  repayment_period_months INT NOT NULL,
  monthly_installment NUMERIC(12,2),
  purpose TEXT,
  proposed_start_date DATE,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  total_payable NUMERIC(12,2),
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC(12,2),
  next_due_date DATE,
  disbursement_date DATE,
  disbursement_method TEXT,
  disbursement_voucher TEXT,
  disbursed_by TEXT,
  recommended_by TEXT,
  reviewed_by TEXT,
  approved_by TEXT,
  approval_date DATE,
  approval_remarks TEXT,
  closure_date DATE,
  closure_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loan apps viewable" ON public.loan_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Loan apps can be created" ON public.loan_applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Loan apps can be updated" ON public.loan_applications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Loan apps can be deleted" ON public.loan_applications FOR DELETE TO authenticated USING (true);

-- 5. LOAN APPLICATION DOCUMENTS (uploaded by applicants)
CREATE TABLE public.loan_application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App docs viewable" ON public.loan_application_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "App docs can be created" ON public.loan_application_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "App docs can be deleted" ON public.loan_application_documents FOR DELETE TO authenticated USING (true);

-- 6. REPAYMENT SCHEDULE
CREATE TABLE public.repayment_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  installment_no INT NOT NULL,
  due_date DATE NOT NULL,
  beginning_balance NUMERIC(12,2) NOT NULL,
  installment_amount NUMERIC(12,2) NOT NULL,
  principal_portion NUMERIC(12,2) NOT NULL,
  interest_portion NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_due NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_balance NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.repayment_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repayments viewable" ON public.repayment_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "Repayments can be created" ON public.repayment_schedule FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Repayments can be updated" ON public.repayment_schedule FOR UPDATE TO authenticated USING (true);

-- 7. MANUAL PAYMENTS
CREATE TABLE public.manual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  receipt_number TEXT,
  received_by TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manual payments viewable" ON public.manual_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manual payments can be created" ON public.manual_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Manual payments can be updated" ON public.manual_payments FOR UPDATE TO authenticated USING (true);

-- 8. PAYROLL DEDUCTIONS
CREATE TABLE public.payroll_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE RESTRICT,
  repayment_schedule_id UUID REFERENCES public.repayment_schedule(id),
  payroll_period TEXT NOT NULL,
  deduction_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  processed_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deductions viewable" ON public.payroll_deductions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deductions can be created" ON public.payroll_deductions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Deductions can be updated" ON public.payroll_deductions FOR UPDATE TO authenticated USING (true);

-- 9. AUDIT LOG
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit log viewable" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit log can be created" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- 10. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loan_types_updated_at BEFORE UPDATE ON public.loan_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON public.loan_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repayment_schedule_updated_at BEFORE UPDATE ON public.repayment_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. APPLICATION NUMBER SEQUENCE FUNCTION
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 'LA-\d{4}-(\d+)') AS INT)), 0) + 1
  INTO seq_num
  FROM public.loan_applications
  WHERE application_number LIKE 'LA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%';
  
  NEW.application_number = 'LA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER auto_application_number
  BEFORE INSERT ON public.loan_applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL OR NEW.application_number = '')
  EXECUTE FUNCTION public.generate_application_number();

-- 12. INDEXES
CREATE INDEX idx_loan_apps_employee ON public.loan_applications(employee_id);
CREATE INDEX idx_loan_apps_status ON public.loan_applications(status);
CREATE INDEX idx_loan_apps_loan_type ON public.loan_applications(loan_type_id);
CREATE INDEX idx_repayment_loan_app ON public.repayment_schedule(loan_application_id);
CREATE INDEX idx_manual_payments_loan_app ON public.manual_payments(loan_application_id);
CREATE INDEX idx_payroll_deductions_loan_app ON public.payroll_deductions(loan_application_id);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);

-- 13. STORAGE BUCKET FOR DOCUMENTS
INSERT INTO storage.buckets (id, name, public) VALUES ('loan-documents', 'loan-documents', true);
CREATE POLICY "Loan docs are accessible" ON storage.objects FOR SELECT USING (bucket_id = 'loan-documents');
CREATE POLICY "Authenticated users can upload loan docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'loan-documents');
CREATE POLICY "Authenticated users can delete loan docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'loan-documents');
