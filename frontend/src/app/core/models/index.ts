export type Role = 'TENANT_ADMIN' | 'LOAN_OFFICER' | 'FINANCE_OFFICER' | 'APPLICANT' | string;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'email'
  | 'currency'
  | 'dropdown'
  | 'radio'
  | 'checkbox';

export type ConditionalOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
export type ConditionalAction = 'show' | 'hide' | 'require' | 'disable';

export type ValidatorType = 'email' | 'min' | 'max';

export interface ValidatorDef {
  type: ValidatorType;
  value?: number;
  message?: string;
}

export interface Option {
  label: string;
  value: string | number | boolean;
}

export interface ConditionalLogic {
  dependsOn: string;
  operator: ConditionalOperator;
  value: unknown;
  action: ConditionalAction;
}

export interface DynamicFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  gridCols?: number;
  validators?: ValidatorDef[];
  options?: Option[];
  conditionalLogic?: ConditionalLogic[];
  defaultValue?: unknown;
}

export interface FormStep {
  id: string;
  title: string;
  fields: DynamicFieldDefinition[];
}

export interface FormSchema {
  steps: FormStep[];
}

export interface FormSchemaResponse {
  loanType: string;
  version: number;
  active: boolean;
  schemaJson: FormSchema;
}

export interface StatusUpdateRequest {
  status: string;
  comments: string;
}

export interface LoanWorkflowStep {
  stepName: string;
  assignedRole: string;
  status: string;
  actorId?: string | null;
  comments?: string | null;
  completedAt?: string | null;
}

export interface LoanApplication {
  id: string;
  referenceNumber: string;
  loanType: string;
  applicantId?: string;
  amount?: number | null;
  status: string;
  formSchemaVersion: number;
  formData?: unknown;
  createdAt?: string;
  updatedAt?: string;
  workflowSteps?: LoanWorkflowStep[] | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

