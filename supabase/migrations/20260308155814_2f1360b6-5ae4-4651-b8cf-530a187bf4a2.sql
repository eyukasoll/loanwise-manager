
-- Drop all existing restrictive policies and recreate as permissive for anon + authenticated

-- EMPLOYEES
DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be created by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be updated by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be deleted by authenticated users" ON public.employees;

CREATE POLICY "Employees are viewable" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Employees can be created" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees can be updated" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Employees can be deleted" ON public.employees FOR DELETE USING (true);

-- LOAN_TYPES
DROP POLICY IF EXISTS "Loan types viewable by authenticated" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be created" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be updated" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be deleted" ON public.loan_types;

CREATE POLICY "Loan types viewable" ON public.loan_types FOR SELECT USING (true);
CREATE POLICY "Loan types can be created" ON public.loan_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Loan types can be updated" ON public.loan_types FOR UPDATE USING (true);
CREATE POLICY "Loan types can be deleted" ON public.loan_types FOR DELETE USING (true);

-- LOAN_TYPE_DOCUMENTS
DROP POLICY IF EXISTS "Loan type docs viewable" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be created" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be updated" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be deleted" ON public.loan_type_documents;

CREATE POLICY "Loan type docs viewable" ON public.loan_type_documents FOR SELECT USING (true);
CREATE POLICY "Loan type docs can be created" ON public.loan_type_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Loan type docs can be updated" ON public.loan_type_documents FOR UPDATE USING (true);
CREATE POLICY "Loan type docs can be deleted" ON public.loan_type_documents FOR DELETE USING (true);

-- LOAN_APPLICATIONS
DROP POLICY IF EXISTS "Loan apps viewable" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be created" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be updated" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be deleted" ON public.loan_applications;

CREATE POLICY "Loan apps viewable" ON public.loan_applications FOR SELECT USING (true);
CREATE POLICY "Loan apps can be created" ON public.loan_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Loan apps can be updated" ON public.loan_applications FOR UPDATE USING (true);
CREATE POLICY "Loan apps can be deleted" ON public.loan_applications FOR DELETE USING (true);

-- LOAN_APPLICATION_DOCUMENTS
DROP POLICY IF EXISTS "App docs viewable" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be created" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be deleted" ON public.loan_application_documents;

CREATE POLICY "App docs viewable" ON public.loan_application_documents FOR SELECT USING (true);
CREATE POLICY "App docs can be created" ON public.loan_application_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "App docs can be updated" ON public.loan_application_documents FOR UPDATE USING (true);
CREATE POLICY "App docs can be deleted" ON public.loan_application_documents FOR DELETE USING (true);

-- REPAYMENT_SCHEDULE
DROP POLICY IF EXISTS "Repayments viewable" ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be created" ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be updated" ON public.repayment_schedule;

CREATE POLICY "Repayments viewable" ON public.repayment_schedule FOR SELECT USING (true);
CREATE POLICY "Repayments can be created" ON public.repayment_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Repayments can be updated" ON public.repayment_schedule FOR UPDATE USING (true);

-- MANUAL_PAYMENTS
DROP POLICY IF EXISTS "Manual payments viewable" ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be created" ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be updated" ON public.manual_payments;

CREATE POLICY "Manual payments viewable" ON public.manual_payments FOR SELECT USING (true);
CREATE POLICY "Manual payments can be created" ON public.manual_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Manual payments can be updated" ON public.manual_payments FOR UPDATE USING (true);

-- PAYROLL_DEDUCTIONS
DROP POLICY IF EXISTS "Deductions viewable" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be created" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be updated" ON public.payroll_deductions;

CREATE POLICY "Deductions viewable" ON public.payroll_deductions FOR SELECT USING (true);
CREATE POLICY "Deductions can be created" ON public.payroll_deductions FOR INSERT WITH CHECK (true);
CREATE POLICY "Deductions can be updated" ON public.payroll_deductions FOR UPDATE USING (true);

-- AUDIT_LOG
DROP POLICY IF EXISTS "Audit log viewable" ON public.audit_log;
DROP POLICY IF EXISTS "Audit log can be created" ON public.audit_log;

CREATE POLICY "Audit log viewable" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "Audit log can be created" ON public.audit_log FOR INSERT WITH CHECK (true);
