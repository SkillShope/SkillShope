import { describe, it, expect } from "vitest";
import { isPrivateUrl } from "@/lib/source-verify";

describe("isPrivateUrl (SSRF blocklist)", () => {
  // Should block
  it("blocks localhost", () => {
    expect(isPrivateUrl("http://localhost:3000")).toBe(true);
    expect(isPrivateUrl("http://localhost/admin")).toBe(true);
  });

  it("blocks IPv6 localhost", () => {
    expect(isPrivateUrl("http://[::1]:8080")).toBe(true);
  });

  it("blocks AWS metadata endpoint", () => {
    expect(isPrivateUrl("http://169.254.169.254/latest/meta-data/")).toBe(true);
  });

  it("blocks Google metadata endpoint", () => {
    expect(isPrivateUrl("http://metadata.google.internal/computeMetadata")).toBe(true);
  });

  it("blocks 10.x.x.x private range", () => {
    expect(isPrivateUrl("http://10.0.0.1")).toBe(true);
    expect(isPrivateUrl("http://10.255.255.255")).toBe(true);
  });

  it("blocks 172.16-31.x.x private range", () => {
    expect(isPrivateUrl("http://172.16.0.1")).toBe(true);
    expect(isPrivateUrl("http://172.31.255.255")).toBe(true);
  });

  it("blocks 192.168.x.x private range", () => {
    expect(isPrivateUrl("http://192.168.1.1")).toBe(true);
    expect(isPrivateUrl("http://192.168.0.100")).toBe(true);
  });

  it("blocks 127.x.x.x loopback range", () => {
    expect(isPrivateUrl("http://127.0.0.1")).toBe(true);
    expect(isPrivateUrl("http://127.0.0.2")).toBe(true);
  });

  it("blocks 0.x.x.x range", () => {
    expect(isPrivateUrl("http://0.0.0.0")).toBe(true);
  });

  it("blocks malformed URLs", () => {
    expect(isPrivateUrl("not-a-url")).toBe(true);
    expect(isPrivateUrl("")).toBe(true);
  });

  // Should allow
  it("allows public URLs", () => {
    expect(isPrivateUrl("https://github.com/user/repo")).toBe(false);
    expect(isPrivateUrl("https://example.com")).toBe(false);
    expect(isPrivateUrl("https://api.github.com/repos/foo/bar")).toBe(false);
  });

  it("allows public IPs", () => {
    expect(isPrivateUrl("http://8.8.8.8")).toBe(false);
    expect(isPrivateUrl("http://1.1.1.1")).toBe(false);
  });

  it("allows 172.x outside private range", () => {
    expect(isPrivateUrl("http://172.15.0.1")).toBe(false);
    expect(isPrivateUrl("http://172.32.0.1")).toBe(false);
  });
});
