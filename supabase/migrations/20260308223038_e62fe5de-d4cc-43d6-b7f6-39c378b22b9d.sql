
-- Insert missing permission rows for Savings, Guarantee Approvals, Guarantee Deactivation for all roles
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete, can_import, can_export, can_print, can_share)
VALUES
  ('Admin', 'Savings', true, true, true, true, true, true, true, true),
  ('Admin', 'Guarantee Approvals', true, true, true, true, true, true, true, true),
  ('Admin', 'Guarantee Deactivation', true, true, true, true, true, true, true, true),
  ('Manager', 'Savings', true, true, true, false, false, false, false, false),
  ('Manager', 'Guarantee Approvals', true, true, true, false, false, false, false, false),
  ('Manager', 'Guarantee Deactivation', true, true, true, false, false, false, false, false),
  ('Finance User', 'Savings', true, true, true, false, false, false, false, false),
  ('Finance User', 'Guarantee Approvals', true, false, false, false, false, false, false, false),
  ('Finance User', 'Guarantee Deactivation', true, false, false, false, false, false, false, false),
  ('Employee User', 'Savings', true, false, false, false, false, false, false, false),
  ('Employee User', 'Guarantee Approvals', true, false, false, false, false, false, false, false),
  ('Employee User', 'Guarantee Deactivation', true, false, false, false, false, false, false, false)
ON CONFLICT DO NOTHING;
