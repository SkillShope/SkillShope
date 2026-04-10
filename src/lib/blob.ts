// Resolve the correct Vercel Blob token based on environment.
// Dev uses BLOB_DEV_READ_WRITE_TOKEN (.env.local)
// Prod uses BLOB_PROD_READ_WRITE_TOKEN (.env / Vercel env vars)
// Falls back to BLOB_READ_WRITE_TOKEN for backwards compatibility.

export function getBlobToken(): string {
  const token =
    process.env.BLOB_DEV_READ_WRITE_TOKEN ||
    process.env.BLOB_PROD_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error("No Vercel Blob token configured. Set BLOB_DEV_READ_WRITE_TOKEN or BLOB_PROD_READ_WRITE_TOKEN.");
  }

  return token;
}
