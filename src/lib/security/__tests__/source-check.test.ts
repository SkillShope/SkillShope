import { describe, it, expect, vi } from "vitest";
import { checkSource } from "../checks/source-check";

// Mock fetch for testing
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("source-check", () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it("passes for a valid public GitHub repo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        private: false,
        archived: false,
        full_name: "owner/repo",
        stargazers_count: 100,
        license: { spdx_id: "MIT" },
        created_at: "2020-01-01T00:00:00Z",
        owner: { created_at: "2019-01-01T00:00:00Z" },
      }),
    });

    const results = await checkSource("https://github.com/owner/repo", "github");
    const failures = results.filter((r) => r.status === "fail");
    expect(failures.length).toBe(0);
  });

  it("fails for a private repo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        private: true,
        archived: false,
        full_name: "owner/repo",
        stargazers_count: 0,
        license: null,
        created_at: "2024-01-01T00:00:00Z",
        owner: { created_at: "2024-01-01T00:00:00Z" },
      }),
    });

    const results = await checkSource("https://github.com/owner/repo", "github");
    expect(results.some((r) => r.status === "fail" && r.name === "repo-private")).toBe(true);
  });

  it("fails for a 404 repo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const results = await checkSource("https://github.com/owner/repo", "github");
    expect(results.some((r) => r.status === "fail" && r.name === "repo-not-found")).toBe(true);
  });

  it("warns for missing license", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        private: false,
        archived: false,
        full_name: "owner/repo",
        stargazers_count: 5,
        license: null,
        created_at: "2023-01-01T00:00:00Z",
        owner: { created_at: "2022-01-01T00:00:00Z" },
      }),
    });

    const results = await checkSource("https://github.com/owner/repo", "github");
    expect(results.some((r) => r.status === "warn" && r.name === "no-license")).toBe(true);
  });

  it("warns for new owner account (<30 days)", async () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        private: false,
        archived: false,
        full_name: "owner/repo",
        stargazers_count: 0,
        license: { spdx_id: "MIT" },
        created_at: recentDate.toISOString(),
        owner: { created_at: recentDate.toISOString() },
      }),
    });

    const results = await checkSource("https://github.com/owner/repo", "github");
    expect(results.some((r) => r.status === "warn" && r.name === "new-account")).toBe(true);
  });

  it("passes for npm package that exists", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        "dist-tags": { latest: "1.0.0" },
        name: "my-package",
      }),
    });

    const results = await checkSource("https://www.npmjs.com/package/my-package", "npm");
    const failures = results.filter((r) => r.status === "fail");
    expect(failures.length).toBe(0);
  });

  it("fails for npm package that does not exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const results = await checkSource("https://www.npmjs.com/package/nonexistent", "npm");
    expect(results.some((r) => r.status === "fail")).toBe(true);
  });

  it("handles unparseable GitHub URLs gracefully", async () => {
    const results = await checkSource("https://not-github.com/something", "github");
    expect(results.some((r) => r.status === "fail")).toBe(true);
  });
});
