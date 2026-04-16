// Revenue split
export const PLATFORM_FEE_PERCENT = 15;
export const CREATOR_PAYOUT_PERCENT = 100 - PLATFORM_FEE_PERCENT;
export const MIN_PRICE = 0.99;
export const DOWNLOAD_TOKEN_EXPIRY_DAYS = 365;

// File upload limits
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_FILES_PER_BLUEPRINT = 10;
export const MAX_STORAGE_PER_CREATOR_BYTES = 500 * 1024 * 1024; // 500MB
export const UPLOAD_RATE_LIMIT = 5; // per minute per user
export const UPLOAD_RATE_WINDOW_MS = 60_000;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf", ".xlsx", ".xls", ".docx", ".doc", ".zip",
] as const;

// Blueprint categories
export const BLUEPRINT_CATEGORIES = [
  { value: "estimating-bidding", label: "Estimating & Bidding" },
  { value: "service-repair", label: "Service & Repair Checklists" },
  { value: "proposals-contracts", label: "Proposals & Contracts" },
  { value: "training", label: "Training & Apprentice Materials" },
  { value: "marketing", label: "Marketing & Client Acquisition" },
  { value: "safety-compliance", label: "Safety & Compliance" },
  { value: "residential", label: "Residential Plumbing" },
  { value: "commercial", label: "Commercial Plumbing" },
] as const;

// Blueprint file types
export const BLUEPRINT_TYPES = [
  { value: "pdf", label: "PDF", icon: "FileText" },
  { value: "excel", label: "Excel Spreadsheet", icon: "Sheet" },
  { value: "zip-pack", label: "ZIP Bundle", icon: "Archive" },
  { value: "doc", label: "Word Document", icon: "FileText" },
] as const;
