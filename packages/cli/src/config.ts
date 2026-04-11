import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

export type Config = {
  registryUrl: string;
  token?: string;
};

const CONFIG_DIR = join(homedir(), ".skillshope");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const DEFAULT_REGISTRY = "https://roughinhub.com";

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    return { registryUrl: DEFAULT_REGISTRY };
  }
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw);
    return {
      registryUrl: data.registryUrl || DEFAULT_REGISTRY,
      token: data.token,
    };
  } catch {
    return { registryUrl: DEFAULT_REGISTRY };
  }
}

export function saveConfig(updates: Partial<Config>): void {
  const current = loadConfig();
  const merged = { ...current, ...updates };
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n");
}

export function getToken(): string | undefined {
  return loadConfig().token;
}
