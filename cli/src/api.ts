import { getRegistryUrl, getToken } from "./config.js";

type SkillInfo = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  isFree: boolean;
  price: number;
  verified: boolean;
  installCmd: string | null;
  files: string[];
  downloadUrl: string;
  author: { name: string; publisherVerified: boolean };
};

type SkillFiles = {
  files: { filename: string; content: string }[];
};

export async function lookupSkill(slug: string): Promise<SkillInfo> {
  const url = `${getRegistryUrl()}/api/registry/${encodeURIComponent(slug)}`;
  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error(`Skill "${slug}" not found on Skill Shope`);
  }

  if (!res.ok) {
    throw new Error(`Registry error: ${res.status}`);
  }

  return res.json();
}

export async function downloadSkill(
  skillId: string,
  token?: string
): Promise<SkillFiles> {
  const baseUrl = getRegistryUrl();
  const downloadToken = token || getToken();

  const url = downloadToken
    ? `${baseUrl}/api/deliver/${skillId}?token=${downloadToken}`
    : `${baseUrl}/api/deliver/${skillId}`;

  const res = await fetch(url);

  if (res.status === 403) {
    throw new Error(
      "Purchase required. Buy this skill at roughinhub.com, then run:\n" +
        "  skillshope login\n" +
        "  skillshope install <slug>"
    );
  }

  if (res.redirected) {
    // Free skill — redirected to source URL
    return { files: [] };
  }

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  return res.json();
}
