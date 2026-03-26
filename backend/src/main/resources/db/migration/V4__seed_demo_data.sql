-- Two demo tenants
INSERT INTO tenants (id, name, domain_key, config_json) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alpha Bank', 'alpha-bank',
   '{"primaryColor":"#1B3F7A","logo":"alpha-logo.png"}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Beta Finance', 'beta-finance',
   '{"primaryColor":"#7A1B1B","logo":"beta-logo.png"}'::jsonb);

-- Ensure we can generate bcrypt hashes for the demo password.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed users (password = "password123" bcrypt hash)
INSERT INTO users (id, tenant_id, email, full_name, password_hash) VALUES
  ('11111111-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'admin@alphabank.com', 'Alpha Admin',
   crypt('password123', gen_salt('bf', 12))),
  ('22222222-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'officer@alphabank.com', 'Alpha Officer',
   crypt('password123', gen_salt('bf', 12))),
  ('33333333-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'applicant@alphabank.com', 'Alice Applicant',
   crypt('password123', gen_salt('bf', 12)));

INSERT INTO user_roles VALUES
  ('11111111-0000-0000-0000-000000000001', 'TENANT_ADMIN'),
  ('22222222-0000-0000-0000-000000000002', 'LOAN_OFFICER'),
  ('33333333-0000-0000-0000-000000000003', 'APPLICANT');

-- Demo form schema for Alpha Bank — Personal Loan
INSERT INTO form_schemas (tenant_id, loan_type, version, schema_json) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PERSONAL_LOAN', 1,
   $$
   {
     "steps": [
       {
         "id": "personal",
         "title": "Personal Information",
         "fields": [
           { "key": "firstName", "label": "First Name", "type": "text", "required": true, "gridCols": 1 },
           { "key": "lastName", "label": "Last Name", "type": "text", "required": true, "gridCols": 1 },
           { "key": "dateOfBirth", "label": "Date of Birth", "type": "date", "required": true, "gridCols": 1 },
           {
             "key": "email",
             "label": "Email Address",
             "type": "email",
             "required": true,
             "gridCols": 1,
             "validators": [{ "type": "email", "message": "Enter a valid email." }]
           },
           { "key": "phone", "label": "Phone Number", "type": "text", "required": true, "gridCols": 1 },
           { "key": "address", "label": "Residential Address", "type": "textarea", "required": true, "gridCols": 1 }
         ]
       },
       {
         "id": "loan",
         "title": "Loan Details",
         "fields": [
           {
             "key": "loanAmount",
             "label": "Loan Amount ($)",
             "type": "currency",
             "required": true,
             "gridCols": 1,
             "validators": [
               { "type": "min", "value": 1000, "message": "Minimum loan is $1,000." },
               { "type": "max", "value": 500000, "message": "Maximum loan is $500,000." }
             ]
           },
           {
             "key": "loanTerm",
             "label": "Loan Term (months)",
             "type": "dropdown",
             "required": true,
             "gridCols": 1,
             "options": [
               { "label": "12 months", "value": 12 },
               { "label": "24 months", "value": 24 },
               { "label": "36 months", "value": 36 },
               { "label": "60 months", "value": 60 }
             ]
           },
           {
             "key": "purpose",
             "label": "Loan Purpose",
             "type": "dropdown",
             "required": true,
             "gridCols": 1,
             "options": [
               { "label": "Home Improvement", "value": "HOME" },
               { "label": "Education", "value": "EDUCATION" },
               { "label": "Medical", "value": "MEDICAL" },
               { "label": "Other", "value": "OTHER" }
             ]
           },
           {
             "key": "purposeDetail",
             "label": "Purpose Details",
             "type": "textarea",
             "required": false,
             "gridCols": 1,
             "conditionalLogic": [
               { "dependsOn": "purpose", "operator": "eq", "value": "OTHER", "action": "show" }
             ]
           }
         ]
       },
       {
         "id": "employment",
         "title": "Employment & Income",
         "fields": [
           {
             "key": "employmentStatus",
             "label": "Employment Status",
             "type": "radio",
             "required": true,
             "gridCols": 2,
             "options": [
               { "label": "Employed", "value": "EMPLOYED" },
               { "label": "Self-Employed", "value": "SELF_EMPLOYED" },
               { "label": "Unemployed", "value": "UNEMPLOYED" }
             ]
           },
           {
             "key": "employerName",
             "label": "Employer Name",
             "type": "text",
             "required": false,
             "gridCols": 1,
             "conditionalLogic": [
               { "dependsOn": "employmentStatus", "operator": "eq", "value": "EMPLOYED", "action": "show" }
             ]
           },
           {
             "key": "monthlyIncome",
             "label": "Monthly Income ($)",
             "type": "currency",
             "required": true,
             "gridCols": 1,
             "validators": [
               { "type": "min", "value": 0, "message": "Monthly income must be >= 0." }
             ]
           },
           {
             "key": "hasExistingLoans",
             "label": "Do you have existing loans?",
             "type": "checkbox",
             "required": false,
             "gridCols": 1
           },
           {
             "key": "existingLoanAmount",
             "label": "Total Existing Loan Balance ($)",
             "type": "currency",
             "required": false,
             "gridCols": 1,
             "conditionalLogic": [
               { "dependsOn": "hasExistingLoans", "operator": "eq", "value": true, "action": "show" }
             ]
           }
         ]
       }
     ]
   }
   $$::jsonb);

