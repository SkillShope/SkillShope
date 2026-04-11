import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { lookupSkill, downloadSkill } from "../api.js";
import { getToken } from "../config.js";

function findProjectRoot(): string {
  // Install relative to cwd — typically the project root
  return process.cwd();
}

function getInstallDir(skillName: string): string {
  const root = findProjectRoot();
  return join(root, ".agents", "skills", skillName);
}

export async function install(slug: string): Promise<void> {
  console.log(`\n  Looking up "${slug}" on Skill Shope...\n`);

  const skill = await lookupSkill(slug);

  console.log(`  ${skill.name}`);
  console.log(`  ${skill.description}`);
  console.log(`  Type: ${skill.type} | Verified: ${skill.verified ? "yes" : "no"}`);
  console.log(`  Author: ${skill.author.name}${skill.author.publisherVerified ? " (verified)" : ""}`);
  console.log(`  Price: ${skill.isFree ? "Free" : `$${skill.price.toFixed(2)}`}`);
  console.log();

  // Handle paid skills
  if (!skill.isFree) {
    const token = getToken();
    if (!token) {
      console.log("  This is a paid skill. To install:");
      console.log(`  1. Purchase at https://roughinhub.com/blueprints/${slug}`);
      console.log("  2. Run: skillshope login");
      console.log(`  3. Run: skillshope install ${slug}`);
      console.log();
      process.exit(1);
    }

    console.log("  Downloading purchased content...\n");
    const { files } = await downloadSkill(skill.id, token);

    if (files.length === 0) {
      console.log("  No content available. Contact the publisher.");
      process.exit(1);
    }

    const installDir = getInstallDir(slug);
    mkdirSync(installDir, { recursive: true });

    for (const file of files) {
      const filePath = join(installDir, file.filename);
      // Create subdirectories if needed (e.g., references/guide.md)
      mkdirSync(join(filePath, ".."), { recursive: true });
      writeFileSync(filePath, file.content, "utf-8");
      console.log(`  ✓ ${file.filename}`);
    }

    console.log(`\n  Installed to ${installDir}`);
    console.log("  Done!\n");
    return;
  }

  // Free skills — download from source or delivery API
  console.log("  Downloading...\n");

  const { files } = await downloadSkill(skill.id);
  const installDir = getInstallDir(slug);
  mkdirSync(installDir, { recursive: true });

  if (files.length > 0) {
    // Content served from delivery API
    for (const file of files) {
      const filePath = join(installDir, file.filename);
      mkdirSync(join(filePath, ".."), { recursive: true });
      writeFileSync(filePath, file.content, "utf-8");
      console.log(`  ✓ ${file.filename}`);
    }
  } else if (skill.downloadUrl) {
    // Redirected to source — write a pointer file
    const pointerContent = [
      `---`,
      `name: ${skill.name}`,
      `source: ${slug}`,
      `registry: skillshope`,
      `---`,
      ``,
      `# ${skill.name}`,
      ``,
      `${skill.description}`,
      ``,
      `Source: ${skill.downloadUrl}`,
      `Install: ${skill.installCmd || `skillshope install ${slug}`}`,
    ].join("\n");

    writeFileSync(join(installDir, "SKILL.md"), pointerContent, "utf-8");
    console.log("  ✓ SKILL.md");
  }

  console.log(`\n  Installed to ${installDir}`);
  console.log("  Done!\n");
}
