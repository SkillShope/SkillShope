import { loadConfig, getToken } from "../config.js";

export async function whoami(): Promise<void> {
  const token = getToken();

  if (!token) {
    console.log("  Not logged in. Run: skillshope login");
    return;
  }

  const { registryUrl } = loadConfig();

  const res = await fetch(`${registryUrl}/api/auth/verify-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "skillshope-cli/0.1.0",
    },
    body: JSON.stringify({ key: token }),
  });

  if (!res.ok) {
    console.log("  Session expired or invalid. Run: skillshope login");
    return;
  }

  const data = await res.json() as { name?: string; email?: string };
  console.log(`  Logged in as: ${data.name || "user"}`);
  if (data.email) console.log(`  Email: ${data.email}`);
}
