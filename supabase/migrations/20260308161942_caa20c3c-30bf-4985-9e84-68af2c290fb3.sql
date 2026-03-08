
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Trigger to auto-create profile and assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now update all existing table policies to require authentication
-- Drop old restrictive policies and recreate as permissive for authenticated users

-- employees
DROP POLICY IF EXISTS "Employees are viewable" ON public.employees;
DROP POLICY IF EXISTS "Employees can be created" ON public.employees;
DROP POLICY IF EXISTS "Employees can be updated" ON public.employees;
DROP POLICY IF EXISTS "Employees can be deleted" ON public.employees;
DROP POLICY IF EXISTS "Employees are viewable " ON public.employees;
DROP POLICY IF EXISTS "Employees can be created " ON public.employees;
DROP POLICY IF EXISTS "Employees can be updated " ON public.employees;
DROP POLICY IF EXISTS "Employees can be deleted " ON public.employees;

CREATE POLICY "Authenticated users can view employees" ON public.employees
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create employees" ON public.employees
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON public.employees
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON public.employees
  FOR DELETE TO authenticated USING (true);

-- loan_types
DROP POLICY IF EXISTS "Loan types viewable" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be created" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be updated" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be deleted" ON public.loan_types;
DROP POLICY IF EXISTS "Loan types viewable " ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be created " ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be updated " ON public.loan_types;
DROP POLICY IF EXISTS "Loan types can be deleted " ON public.loan_types;

CREATE POLICY "Auth users view loan_types" ON public.loan_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create loan_types" ON public.loan_types
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update loan_types" ON public.loan_types
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete loan_types" ON public.loan_types
  FOR DELETE TO authenticated USING (true);

-- loan_type_documents
DROP POLICY IF EXISTS "Loan type docs viewable" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be created" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be updated" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be deleted" ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs viewable " ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be created " ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be updated " ON public.loan_type_documents;
DROP POLICY IF EXISTS "Loan type docs can be deleted " ON public.loan_type_documents;

CREATE POLICY "Auth users view loan_type_documents" ON public.loan_type_documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create loan_type_documents" ON public.loan_type_documents
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update loan_type_documents" ON public.loan_type_documents
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete loan_type_documents" ON public.loan_type_documents
  FOR DELETE TO authenticated USING (true);

-- loan_applications
DROP POLICY IF EXISTS "Loan apps viewable" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be created" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be updated" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be deleted" ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps viewable " ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be created " ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be updated " ON public.loan_applications;
DROP POLICY IF EXISTS "Loan apps can be deleted " ON public.loan_applications;

CREATE POLICY "Auth users view loan_applications" ON public.loan_applications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create loan_applications" ON public.loan_applications
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update loan_applications" ON public.loan_applications
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete loan_applications" ON public.loan_applications
  FOR DELETE TO authenticated USING (true);

-- loan_application_documents
DROP POLICY IF EXISTS "App docs viewable" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be created" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be updated" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be deleted" ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs viewable " ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be created " ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be updated " ON public.loan_application_documents;
DROP POLICY IF EXISTS "App docs can be deleted " ON public.loan_application_documents;

CREATE POLICY "Auth users view loan_application_documents" ON public.loan_application_documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create loan_application_documents" ON public.loan_application_documents
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update loan_application_documents" ON public.loan_application_documents
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete loan_application_documents" ON public.loan_application_documents
  FOR DELETE TO authenticated USING (true);

-- repayment_schedule
DROP POLICY IF EXISTS "Repayments viewable" ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be created" ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be updated" ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments viewable " ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be created " ON public.repayment_schedule;
DROP POLICY IF EXISTS "Repayments can be updated " ON public.repayment_schedule;

CREATE POLICY "Auth users view repayment_schedule" ON public.repayment_schedule
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create repayment_schedule" ON public.repayment_schedule
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update repayment_schedule" ON public.repayment_schedule
  FOR UPDATE TO authenticated USING (true);

-- manual_payments
DROP POLICY IF EXISTS "Manual payments viewable" ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be created" ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be updated" ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments viewable " ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be created " ON public.manual_payments;
DROP POLICY IF EXISTS "Manual payments can be updated " ON public.manual_payments;

CREATE POLICY "Auth users view manual_payments" ON public.manual_payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create manual_payments" ON public.manual_payments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update manual_payments" ON public.manual_payments
  FOR UPDATE TO authenticated USING (true);

-- payroll_deductions
DROP POLICY IF EXISTS "Deductions viewable" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be created" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be updated" ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions viewable " ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be created " ON public.payroll_deductions;
DROP POLICY IF EXISTS "Deductions can be updated " ON public.payroll_deductions;

CREATE POLICY "Auth users view payroll_deductions" ON public.payroll_deductions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create payroll_deductions" ON public.payroll_deductions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update payroll_deductions" ON public.payroll_deductions
  FOR UPDATE TO authenticated USING (true);

-- audit_log
DROP POLICY IF EXISTS "Audit log viewable" ON public.audit_log;
DROP POLICY IF EXISTS "Audit log can be created" ON public.audit_log;
DROP POLICY IF EXISTS "Audit log viewable " ON public.audit_log;
DROP POLICY IF EXISTS "Audit log can be created " ON public.audit_log;

CREATE POLICY "Auth users view audit_log" ON public.audit_log
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create audit_log" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (true);
