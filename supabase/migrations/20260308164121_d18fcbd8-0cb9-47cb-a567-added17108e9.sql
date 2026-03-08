
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_type text NOT NULL DEFAULT 'Employee User';
