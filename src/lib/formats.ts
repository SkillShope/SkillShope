// Recognized skill file formats
export const RECOGNIZED_FORMATS: Record<string, string[]> = {
  skill: ["SKILL.md", "skill.md"],
  "mcp-server": ["mcp.json", "mcp-config.json"],
  agent: ["agent.yaml", "agent.yml", "agent.json"],
};

export const ALL_RECOGNIZED_FILES = Object.values(RECOGNIZED_FORMATS).flat();

// Detect formats present in a list of filenames
export function detectFormats(filenames: string[]): string[] {
  const formats: string[] = [];
  for (const [format, patterns] of Object.entries(RECOGNIZED_FORMATS)) {
    if (filenames.some((f) => patterns.includes(f.toLowerCase()))) {
      formats.push(format);
    }
  }
  return formats;
}
