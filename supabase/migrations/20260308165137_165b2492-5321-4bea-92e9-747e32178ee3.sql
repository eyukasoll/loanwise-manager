
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Addis Microfinance',
  company_email text,
  company_phone text,
  company_address text,
  city text,
  country text DEFAULT 'Ethiopia',
  tin_number text,
  license_number text,
  website text,
  logo_url text,
  currency text NOT NULL DEFAULT 'ETB',
  fiscal_year_start text DEFAULT 'July',
  default_interest_rate numeric DEFAULT 0,
  max_loan_to_salary_ratio numeric DEFAULT 3,
  payroll_cutoff_day integer DEFAULT 25,
  late_payment_penalty_rate numeric DEFAULT 2,
  smtp_host text,
  smtp_port integer,
  smtp_email text,
  smtp_password text,
  email_sender_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view settings" ON public.company_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can update settings" ON public.company_settings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can insert settings" ON public.company_settings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Insert default row
INSERT INTO public.company_settings (company_name, company_email, city, country)
VALUES ('Addis Microfinance', 'info@addismicrofinance.com', 'Addis Ababa', 'Ethiopia');
