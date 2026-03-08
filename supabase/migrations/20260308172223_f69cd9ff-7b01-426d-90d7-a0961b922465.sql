
-- Savings transactions table
CREATE TABLE public.savings_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  savings_type TEXT NOT NULL DEFAULT 'Voluntary',
  transaction_type TEXT NOT NULL DEFAULT 'Deposit',
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_number TEXT,
  remarks TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Auth users view savings_transactions" ON public.savings_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create savings_transactions" ON public.savings_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update savings_transactions" ON public.savings_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete savings_transactions" ON public.savings_transactions FOR DELETE TO authenticated USING (true);
