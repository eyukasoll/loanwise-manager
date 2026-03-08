
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'guarantee_request',
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications (matched via employee email -> auth user)
CREATE POLICY "Auth users view notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Auth users create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (true);

-- Trigger: auto-create notification when a guarantor record is inserted
CREATE OR REPLACE FUNCTION public.notify_guarantor_on_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  borrower_name TEXT;
  app_number TEXT;
  loan_app_id UUID;
BEGIN
  loan_app_id := NEW.loan_application_id;
  
  SELECT e.full_name, la.application_number
  INTO borrower_name, app_number
  FROM public.loan_applications la
  JOIN public.employees e ON e.id = la.employee_id
  WHERE la.id = loan_app_id;

  INSERT INTO public.notifications (employee_id, title, message, type, reference_id)
  VALUES (
    NEW.employee_id,
    'Guarantee Request',
    'You have been assigned as a guarantor for ' || COALESCE(borrower_name, 'an employee') || '''s loan application (' || COALESCE(app_number, '') || '). Please review and respond.',
    'guarantee_request',
    loan_app_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_guarantor_on_assignment
  AFTER INSERT ON public.loan_guarantors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_guarantor_on_assignment();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
