// Simple server-side validation helpers.
// No external dependencies — keeps the bundle small.

type Rule = {
  field: string;
  value: unknown;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  message?: string;
};

type ValidationError = { field: string; message: string };

export function validate(rules: Rule[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const val = rule.value;
    const str = typeof val === "string" ? val.trim() : "";

    if (rule.required && (!val || str === "")) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} is required`,
      });
      continue;
    }

    if (val && rule.minLength && str.length < rule.minLength) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be at least ${rule.minLength} characters`,
      });
    }

    if (val && rule.maxLength && str.length > rule.maxLength) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be at most ${rule.maxLength} characters`,
      });
    }

    if (val && rule.pattern && !rule.pattern.test(str)) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} is invalid`,
      });
    }
  }

  return errors;
}

// Strip HTML tags to prevent XSS in user-generated text fields
export function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

// Validate URL format
const URL_PATTERN = /^https?:\/\/.+\..+/;
export function isValidUrl(str: string): boolean {
  return URL_PATTERN.test(str);
}

// Validate slug format
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function isValidSlug(str: string): boolean {
  return SLUG_PATTERN.test(str);
}
