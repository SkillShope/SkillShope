import { join, resolve, relative } from "path";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { fetchSkillMeta, fetchDownloadToken, fetchFiles } from "../api.js";

const TYPE_DIRS: Record<string, string> = {
  skill: ".claude/skills",
  "mcp-server": ".claude/mcp-servers",
  agent: ".claude/agents",
};

export async function install(slug: string | undefined): Promise<void> {
  if (!slug) {
    console.error("Usage: skillshope install <slug>");
    process.exit(1);
  }

  // 1. Fetch skill metadata
  process.stdout.write(`  Fetching ${slug}...`);
  const skill = await fetchSkillMeta(slug);
  console.log(` found (${skill.type})`);

  // 2. Handle paid skills — get download token
  let downloadToken: string | undefined;
  if (!skill.isFree) {
    process.stdout.write("  Verifying purchase...");
    downloadToken = await fetchDownloadToken(skill.id);
    console.log(" verified");
  }

  // 3. Download files
  process.stdout.write("  Downloading files...");
  const { files } = await fetchFiles(skill.id, downloadToken);

  if (!files || files.length === 0) {
    console.log("\n  No files available for this skill.");
    console.log(`  Visit: https://skillshope.com/skills/${slug}`);
    return;
  }
  console.log(` ${files.length} file${files.length !== 1 ? "s" : ""}`);

  // 4. Write files to disk
  const baseDir = TYPE_DIRS[skill.type] || ".claude/skills";
  const targetDir = join(process.cwd(), baseDir, slug);

  if (existsSync(targetDir)) {
    console.log(`  Updating existing install at ${baseDir}/${slug}/`);
  }

  mkdirSync(targetDir, { recursive: true });

  for (const file of files) {
    // Prevent path traversal — ensure file stays within target directory
    const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = resolve(targetDir, safeName);
    const rel = relative(targetDir, filePath);
    if (rel.startsWith("..") || resolve(filePath) !== filePath) {
      console.error(`  Skipping unsafe filename: ${file.filename}`);
      continue;
    }
    writeFileSync(filePath, file.content, "utf-8");
  }

  // 5. Success
  console.log(`  Installed to ${baseDir}/${slug}/`);
  console.log("  Done.");
}
