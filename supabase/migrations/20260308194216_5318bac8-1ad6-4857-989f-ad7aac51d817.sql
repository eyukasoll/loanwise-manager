
-- Add status column to loan_guarantors
ALTER TABLE public.loan_guarantors 
ADD COLUMN status text NOT NULL DEFAULT 'Pending';

-- Add approved_at and approved_by columns
ALTER TABLE public.loan_guarantors 
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by text;

-- Allow UPDATE on loan_guarantors
CREATE POLICY "Auth users update loan_guarantors"
ON public.loan_guarantors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
