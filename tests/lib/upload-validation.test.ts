import { describe, it, expect } from "vitest";
import {
  validateFileType,
  validateFileSize,
  validateFileExtension,
  getExtensionFromFilename,
} from "@/lib/upload-validation";

describe("validateFileType", () => {
  it("accepts PDF files", () => {
    expect(validateFileType("application/pdf")).toBe(true);
  });
  it("accepts Excel files", () => {
    expect(validateFileType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe(true);
    expect(validateFileType("application/vnd.ms-excel")).toBe(true);
  });
  it("accepts Word documents", () => {
    expect(validateFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(true);
    expect(validateFileType("application/msword")).toBe(true);
  });
  it("accepts ZIP files", () => {
    expect(validateFileType("application/zip")).toBe(true);
    expect(validateFileType("application/x-zip-compressed")).toBe(true);
  });
  it("rejects video files (removed from MVP)", () => {
    expect(validateFileType("video/mp4")).toBe(false);
    expect(validateFileType("video/quicktime")).toBe(false);
  });
  it("rejects executable files", () => {
    expect(validateFileType("application/x-executable")).toBe(false);
    expect(validateFileType("application/x-msdownload")).toBe(false);
  });
  it("rejects HTML files", () => {
    expect(validateFileType("text/html")).toBe(false);
  });
  it("rejects JavaScript files", () => {
    expect(validateFileType("application/javascript")).toBe(false);
    expect(validateFileType("text/javascript")).toBe(false);
  });
  it("rejects empty string", () => {
    expect(validateFileType("")).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under 25MB", () => {
    expect(validateFileSize(1024)).toBe(true);
    expect(validateFileSize(10 * 1024 * 1024)).toBe(true);
    expect(validateFileSize(25 * 1024 * 1024)).toBe(true);
  });
  it("rejects files over 25MB", () => {
    expect(validateFileSize(25 * 1024 * 1024 + 1)).toBe(false);
    expect(validateFileSize(100 * 1024 * 1024)).toBe(false);
  });
  it("rejects zero-byte files", () => {
    expect(validateFileSize(0)).toBe(false);
  });
  it("rejects negative sizes", () => {
    expect(validateFileSize(-1)).toBe(false);
  });
});

describe("validateFileExtension", () => {
  it("accepts allowed extensions", () => {
    expect(validateFileExtension(".pdf")).toBe(true);
    expect(validateFileExtension(".xlsx")).toBe(true);
    expect(validateFileExtension(".docx")).toBe(true);
    expect(validateFileExtension(".zip")).toBe(true);
  });
  it("rejects dangerous extensions", () => {
    expect(validateFileExtension(".exe")).toBe(false);
    expect(validateFileExtension(".sh")).toBe(false);
    expect(validateFileExtension(".js")).toBe(false);
    expect(validateFileExtension(".html")).toBe(false);
  });
  it("is case-insensitive", () => {
    expect(validateFileExtension(".PDF")).toBe(true);
    expect(validateFileExtension(".Xlsx")).toBe(true);
  });
});

describe("getExtensionFromFilename", () => {
  it("extracts extension from filename", () => {
    expect(getExtensionFromFilename("report.pdf")).toBe(".pdf");
    expect(getExtensionFromFilename("bid-calculator.xlsx")).toBe(".xlsx");
  });
  it("handles multiple dots", () => {
    expect(getExtensionFromFilename("my.report.v2.pdf")).toBe(".pdf");
  });
  it("returns empty string for no extension", () => {
    expect(getExtensionFromFilename("README")).toBe("");
  });
});
