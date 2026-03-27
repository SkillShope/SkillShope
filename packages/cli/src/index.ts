#!/usr/bin/env node

import { install } from "./commands/install.js";
import { login } from "./commands/login.js";
import { whoami } from "./commands/whoami.js";
import { list } from "./commands/list.js";

const VERSION = "0.2.1";

function help(): void {
  console.log(`
  skillshope v${VERSION} — Install AI skills from Skill Shope

  Usage:
    skillshope install <slug>   Install a skill, MCP server, or agent
    skillshope login            Authenticate with your API key
    skillshope whoami           Show current logged-in user
    skillshope list             List installed skills in this directory
    skillshope help             Show this help message

  Examples:
    skillshope install code-reviewer-pro
    skillshope install codebase-memory-mcp
    skillshope login

  Docs: https://skillshope.com/docs/cli-reference
`);
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "install":
      case "add":
      case "i":
        await install(args[0]);
        break;
      case "login":
        await login();
        break;
      case "whoami":
        await whoami();
        break;
      case "list":
      case "ls":
        await list();
        break;
      case "help":
      case "--help":
      case "-h":
        help();
        break;
      case "--version":
      case "-v":
        console.log(`skillshope v${VERSION}`);
        break;
      default:
        if (!command) {
          help();
        } else {
          console.error(`  Unknown command: ${command}`);
          console.error("  Run: skillshope help");
          process.exit(1);
        }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n  Error: ${message}`);
    process.exit(1);
  }
}

main();
