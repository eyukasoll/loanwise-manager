
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS savings_multiplier NUMERIC DEFAULT 3;
ALTER TABLE public.loan_types ADD COLUMN IF NOT EXISTS is_savings_based BOOLEAN NOT NULL DEFAULT false;
