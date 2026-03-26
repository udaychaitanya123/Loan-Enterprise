ALTER TABLE users
  ADD COLUMN mobile_number VARCHAR(20),
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN profile_updated_at TIMESTAMPTZ;
