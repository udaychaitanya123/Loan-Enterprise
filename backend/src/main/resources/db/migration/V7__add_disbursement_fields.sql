ALTER TABLE loan_applications
  ADD COLUMN disbursed_at TIMESTAMPTZ,
  ADD COLUMN disbursement_amount NUMERIC(15,2);
