CREATE TABLE public.loan_guarantors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id uuid NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (loan_application_id, employee_id)
);

ALTER TABLE public.loan_guarantors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view loan_guarantors" ON public.loan_guarantors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create loan_guarantors" ON public.loan_guarantors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users delete loan_guarantors" ON public.loan_guarantors FOR DELETE TO authenticated USING (true);