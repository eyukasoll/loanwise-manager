
ALTER TABLE public.role_permissions
  ADD COLUMN IF NOT EXISTS can_import boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_export boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_print boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_share boolean NOT NULL DEFAULT false;

-- Set import/export/print/share to true for Admin role
UPDATE public.role_permissions
SET can_import = true, can_export = true, can_print = true, can_share = true
WHERE role = 'Admin';
