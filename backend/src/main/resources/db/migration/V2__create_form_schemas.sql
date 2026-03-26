CREATE TABLE form_schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  loan_type VARCHAR(100) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  schema_json JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, loan_type, version)
);

-- Only one active schema per tenant+loanType
CREATE UNIQUE INDEX idx_one_active_schema
  ON form_schemas (tenant_id, loan_type)
  WHERE active = TRUE;

