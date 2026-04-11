import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".skillshope");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

type Config = {
  token?: string;
  registryUrl: string;
};

const DEFAULT_CONFIG: Config = {
  registryUrl: "https://roughinhub.com",
};

export function getConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return DEFAULT_CONFIG;
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(updates: Partial<Config>): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const current = getConfig();
  writeFileSync(CONFIG_FILE, JSON.stringify({ ...current, ...updates }, null, 2));
}

export function getToken(): string | undefined {
  return getConfig().token;
}

export function getRegistryUrl(): string {
  return getConfig().registryUrl;
}
