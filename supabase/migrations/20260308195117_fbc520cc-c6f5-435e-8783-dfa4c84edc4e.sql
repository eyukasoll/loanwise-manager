
-- Trigger: after guarantor status update, check if all guarantors for that loan are Approved
-- If so, auto-update the loan application status to 'Approved'
CREATE OR REPLACE FUNCTION public.auto_approve_loan_on_all_guarantors_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_count INT;
  approved_count INT;
BEGIN
  -- Only act when status changed to 'Approved'
  IF NEW.status = 'Approved' THEN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'Approved')
    INTO total_count, approved_count
    FROM public.loan_guarantors
    WHERE loan_application_id = NEW.loan_application_id;

    -- If all guarantors are approved (and there are at least 2)
    IF total_count >= 2 AND total_count = approved_count THEN
      UPDATE public.loan_applications
      SET status = 'Approved',
          approval_date = CURRENT_DATE,
          updated_at = now()
      WHERE id = NEW.loan_application_id
        AND status IN ('Draft', 'Pending', 'Under Review');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_approve_loan_on_guarantors
AFTER UPDATE OF status ON public.loan_guarantors
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_loan_on_all_guarantors_approved();
