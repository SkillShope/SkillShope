import { createInterface } from "readline";
import { saveConfig, loadConfig } from "../config.js";

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function login(): Promise<void> {
  const { registryUrl } = loadConfig();

  console.log("  Log in to Skill Shope\n");
  console.log(`  1. Go to ${registryUrl}/profile`);
  console.log("  2. Generate an API key");
  console.log("  3. Paste it below\n");

  const key = await prompt("  API Key: ");

  if (!key) {
    console.error("  No key provided. Aborting.");
    process.exit(1);
  }

  // Validate the key against the registry
  process.stdout.write("  Verifying...");

  const res = await fetch(`${registryUrl}/api/auth/verify-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "skillshope-cli/0.1.0",
    },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    console.log(" invalid key.");
    console.error("  Check your key and try again.");
    process.exit(1);
  }

  const data = await res.json() as { name?: string };

  saveConfig({ token: key });
  console.log(` logged in as ${data.name || "user"}.`);
}
