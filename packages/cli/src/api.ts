import { loadConfig, getToken } from "./config.js";

type SkillMeta = {
  id: string;
  slug: string;
  name: string;
  type: string;
  isFree: boolean;
  price: number;
  installCmd: string | null;
  description: string;
};

type DeliverResponse = {
  files: { filename: string; content: string }[];
};

export async function fetchSkillMeta(slug: string): Promise<SkillMeta> {
  const { registryUrl } = loadConfig();
  const res = await fetch(`${registryUrl}/api/registry/${slug}`, {
    headers: { "User-Agent": "skillshope-cli/0.1.0" },
  });

  if (res.status === 404) {
    throw new Error(`Skill "${slug}" not found in the registry.`);
  }
  if (!res.ok) {
    throw new Error(`Registry error: ${res.status}`);
  }

  return res.json();
}

export async function fetchDownloadToken(skillId: string): Promise<string> {
  const { registryUrl } = loadConfig();
  const token = getToken();
  if (!token) {
    throw new Error("Not logged in. Run: skillshope login");
  }

  const res = await fetch(
    `${registryUrl}/api/deliver/token?skillId=${skillId}`,
    {
      headers: {
        "User-Agent": "skillshope-cli/0.1.0",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401) {
    throw new Error("Not logged in or session expired. Run: skillshope login");
  }
  if (res.status === 403) {
    throw new Error("You haven't purchased this skill. Visit the skill page to buy it.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Token error: ${res.status}`);
  }

  const data = await res.json();
  return (data as { token: string }).token;
}

export async function fetchFiles(
  skillId: string,
  downloadToken?: string
): Promise<DeliverResponse> {
  const { registryUrl } = loadConfig();
  const params = new URLSearchParams({ source: "cli" });
  if (downloadToken) params.set("token", downloadToken);

  const headers: Record<string, string> = {
    "User-Agent": "skillshope-cli/0.1.0",
  };

  // For free skills, try without auth. For paid, use the download token.
  const token = getToken();
  if (token && !downloadToken) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${registryUrl}/api/deliver/${skillId}?${params}`,
    { headers }
  );

  if (res.status === 403) {
    throw new Error("Access denied. This is a paid skill — purchase it first.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Delivery error: ${res.status}`);
  }

  return res.json();
}
