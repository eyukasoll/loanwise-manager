
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can update permissions" ON public.role_permissions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can insert permissions" ON public.role_permissions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can delete permissions" ON public.role_permissions
  FOR DELETE TO authenticated USING (true);

-- Seed default permissions for all roles and modules
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
  -- Admin: full access
  ('Admin', 'Dashboard', true, true, true, true),
  ('Admin', 'Employees', true, true, true, true),
  ('Admin', 'Loan Types', true, true, true, true),
  ('Admin', 'Applications', true, true, true, true),
  ('Admin', 'Approvals', true, true, true, true),
  ('Admin', 'Disbursements', true, true, true, true),
  ('Admin', 'Repayment Schedule', true, true, true, true),
  ('Admin', 'Payroll Deductions', true, true, true, true),
  ('Admin', 'Manual Payments', true, true, true, true),
  ('Admin', 'Overdue Tracking', true, true, true, true),
  ('Admin', 'Reports', true, true, true, true),
  ('Admin', 'Settings', true, true, true, true),
  ('Admin', 'Permissions', true, true, true, true),
  -- Manager: view/create/edit most, no delete on critical
  ('Manager', 'Dashboard', true, false, false, false),
  ('Manager', 'Employees', true, true, true, false),
  ('Manager', 'Loan Types', true, true, true, false),
  ('Manager', 'Applications', true, true, true, false),
  ('Manager', 'Approvals', true, true, true, false),
  ('Manager', 'Disbursements', true, true, true, false),
  ('Manager', 'Repayment Schedule', true, false, false, false),
  ('Manager', 'Payroll Deductions', true, false, false, false),
  ('Manager', 'Manual Payments', true, true, true, false),
  ('Manager', 'Overdue Tracking', true, false, false, false),
  ('Manager', 'Reports', true, false, false, false),
  ('Manager', 'Settings', true, false, true, false),
  ('Manager', 'Permissions', false, false, false, false),
  -- Finance User: focus on financial modules
  ('Finance User', 'Dashboard', true, false, false, false),
  ('Finance User', 'Employees', true, false, false, false),
  ('Finance User', 'Loan Types', true, false, false, false),
  ('Finance User', 'Applications', true, false, false, false),
  ('Finance User', 'Approvals', false, false, false, false),
  ('Finance User', 'Disbursements', true, true, true, false),
  ('Finance User', 'Repayment Schedule', true, true, true, false),
  ('Finance User', 'Payroll Deductions', true, true, true, false),
  ('Finance User', 'Manual Payments', true, true, true, false),
  ('Finance User', 'Overdue Tracking', true, false, false, false),
  ('Finance User', 'Reports', true, true, false, false),
  ('Finance User', 'Settings', false, false, false, false),
  ('Finance User', 'Permissions', false, false, false, false),
  -- Employee User: minimal access
  ('Employee User', 'Dashboard', true, false, false, false),
  ('Employee User', 'Employees', false, false, false, false),
  ('Employee User', 'Loan Types', true, false, false, false),
  ('Employee User', 'Applications', true, true, false, false),
  ('Employee User', 'Approvals', false, false, false, false),
  ('Employee User', 'Disbursements', false, false, false, false),
  ('Employee User', 'Repayment Schedule', true, false, false, false),
  ('Employee User', 'Payroll Deductions', false, false, false, false),
  ('Employee User', 'Manual Payments', false, false, false, false),
  ('Employee User', 'Overdue Tracking', false, false, false, false),
  ('Employee User', 'Reports', false, false, false, false),
  ('Employee User', 'Settings', false, false, false, false),
  ('Employee User', 'Permissions', false, false, false, false);
