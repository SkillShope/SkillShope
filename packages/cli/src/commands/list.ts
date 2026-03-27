import { readdirSync, existsSync } from "fs";
import { join } from "path";

const SKILL_DIRS = [
  { type: "skill", dir: ".claude/skills" },
  { type: "mcp-server", dir: ".claude/mcp-servers" },
  { type: "agent", dir: ".claude/agents" },
];

export async function list(): Promise<void> {
  let found = 0;

  for (const { type, dir } of SKILL_DIRS) {
    const fullPath = join(process.cwd(), dir);
    if (!existsSync(fullPath)) continue;

    const entries = readdirSync(fullPath, { withFileTypes: true })
      .filter((e) => e.isDirectory());

    for (const entry of entries) {
      if (found === 0) {
        console.log("  Installed skills:\n");
      }
      console.log(`  ${entry.name} (${type}) — ${dir}/${entry.name}/`);
      found++;
    }
  }

  if (found === 0) {
    console.log("  No skills installed in this directory.");
    console.log("  Run: skillshope install <slug>");
  }
}
