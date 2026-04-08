import {
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

export function validateFileType(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_FILE_SIZE_BYTES;
}

export function validateFileExtension(ext: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function getExtensionFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}
