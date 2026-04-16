// Estimate types shared between API and UI

export type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export const MAX_ESTIMATE_TITLE_LENGTH = 35;
export const MAX_ESTIMATE_NUMBER_LENGTH = 30;

export type EstimateData = {
  estimateTitle: string;
  scopeOfWork: string;
  lineItems: LineItem[];
  laborHours: number;
  laborRate: number;
  laborSubtotal: number;
  materialSubtotal: number;
  markupPercent: number;
  markupAmount: number;
  taxPercent: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  notes: string;
  customerName: string;
  customerAddress: string;
};

export type ContractData = {
  content: string;
};

export const JOB_TYPES = [
  { value: "service", label: "Service Call" },
  { value: "repair", label: "Repair" },
  { value: "remodel", label: "Remodel" },
  { value: "new-construction", label: "New Construction" },
  { value: "emergency", label: "Emergency" },
  { value: "inspection", label: "Inspection" },
] as const;

export const FREE_ESTIMATE_LIMIT = 3;
export const PRO_ESTIMATE_LIMIT = 30;
