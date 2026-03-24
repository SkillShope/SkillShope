const ALLOWED_ORIGINS = [
  "https://skillshope.com",
  "https://www.skillshope.com",
  "http://localhost:3000",
];

export function getSafeOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://skillshope.com";
}
