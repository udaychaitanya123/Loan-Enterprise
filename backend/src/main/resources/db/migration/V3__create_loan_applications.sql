CREATE TABLE loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(30) NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  applicant_id UUID NOT NULL REFERENCES users(id),
  loan_type VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  form_schema_version INTEGER NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  step_name VARCHAR(100) NOT NULL,
  assigned_role VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  actor_id UUID REFERENCES users(id),
  comments TEXT,
  completed_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  actor_id UUID,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  delta_json JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_apps_tenant_status ON loan_applications (tenant_id, status);
CREATE INDEX idx_apps_applicant ON loan_applications (applicant_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);

