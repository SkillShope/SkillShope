import { Severity } from "./types";

export type Pattern = {
  name: string;
  regex: RegExp;
  severity: Severity;
  description: string;
};

// Code execution patterns
const CODE_EXECUTION: Pattern[] = [
  {
    name: "eval",
    regex: /\beval\s*\(/gi,
    severity: "critical",
    description: "eval() allows arbitrary code execution",
  },
  {
    name: "new-function",
    regex: /new\s+Function\s*\(/gi,
    severity: "critical",
    description: "new Function() allows arbitrary code execution",
  },
  {
    name: "child-process-require",
    regex: /require\s*\(\s*['"]child_process['"]\s*\)/gi,
    severity: "critical",
    description: "child_process module enables shell command execution",
  },
  {
    name: "child-process-import",
    regex: /import\s*\(\s*['"]child_process['"]\s*\)/gi,
    severity: "critical",
    description: "Dynamic import of child_process enables shell execution",
  },
  {
    name: "exec-call",
    regex: /\b(exec|execSync|spawn|spawnSync|execFile)\s*\(/gi,
    severity: "high",
    description: "Shell execution function detected",
  },
];

// Data exfiltration patterns
const DATA_EXFIL: Pattern[] = [
  {
    name: "external-fetch",
    regex: /fetch\s*\(\s*['"`]https?:\/\/(?!localhost|127\.0\.0\.1)/gi,
    severity: "high",
    description: "HTTP request to external URL — potential data exfiltration",
  },
  {
    name: "xmlhttprequest",
    regex: /new\s+XMLHttpRequest/gi,
    severity: "high",
    description: "XMLHttpRequest detected — potential data exfiltration",
  },
  {
    name: "send-beacon",
    regex: /navigator\.sendBeacon/gi,
    severity: "high",
    description: "sendBeacon detected — potential data exfiltration",
  },
  {
    name: "websocket-external",
    regex: /new\s+WebSocket\s*\(\s*['"`]wss?:\/\/(?!localhost|127\.0\.0\.1)/gi,
    severity: "high",
    description: "WebSocket connection to external server",
  },
];

// Obfuscation patterns
const OBFUSCATION: Pattern[] = [
  {
    name: "long-base64",
    regex: /[A-Za-z0-9+/=]{200,}/g,
    severity: "high",
    description: "Long base64-encoded string detected — potential hidden payload",
  },
  {
    name: "hex-escapes",
    regex: /(\\x[0-9a-fA-F]{2}){10,}/g,
    severity: "medium",
    description: "Bulk hex escape sequences — potential obfuscation",
  },
  {
    name: "fromcharcode-chain",
    regex: /String\.fromCharCode\s*\([^)]{20,}\)/gi,
    severity: "medium",
    description: "String.fromCharCode chain — potential obfuscation",
  },
  {
    name: "atob-decode",
    regex: /\batob\s*\(/gi,
    severity: "medium",
    description: "Base64 decoding in browser — check for hidden payloads",
  },
];

// File system abuse
const FS_ABUSE: Pattern[] = [
  {
    name: "write-system-paths",
    regex: /(?:writeFile|appendFile|writeFileSync)\s*\(\s*['"`](?:\/etc\/|\/usr\/|~\/\.ssh|~\/\.aws|~\/\.config)/gi,
    severity: "critical",
    description: "Writing to sensitive system paths",
  },
  {
    name: "delete-files",
    regex: /(?:fs\.)?(?:unlink|rm|rmdir|rmSync|unlinkSync)\s*\(/gi,
    severity: "medium",
    description: "File deletion operation detected",
  },
];

// Credential access
const CREDENTIAL_ACCESS: Pattern[] = [
  {
    name: "env-var-access",
    regex: /process\.env\.\w+/gi,
    severity: "medium",
    description: "Environment variable access — check what's being read",
  },
  {
    name: "ssh-key-path",
    regex: /['"](~\/)?\.ssh\/(id_rsa|id_ed25519|authorized_keys|known_hosts)['"]/gi,
    severity: "critical",
    description: "SSH key file path referenced",
  },
  {
    name: "aws-credentials",
    regex: /['"](~\/)?\.aws\/(credentials|config)['"]/gi,
    severity: "critical",
    description: "AWS credential file path referenced",
  },
];

// Crypto mining
const CRYPTO_MINING: Pattern[] = [
  {
    name: "coinhive",
    regex: /coinhive|coin-hive|CoinHive/gi,
    severity: "critical",
    description: "Crypto mining library detected",
  },
  {
    name: "mining-pool",
    regex: /(?:stratum|pool)\+tcp:\/\//gi,
    severity: "critical",
    description: "Mining pool connection detected",
  },
  {
    name: "miner-start",
    regex: /miner\.start\s*\(/gi,
    severity: "critical",
    description: "Crypto miner start command detected",
  },
];

export const ALL_PATTERNS: Pattern[] = [
  ...CODE_EXECUTION,
  ...DATA_EXFIL,
  ...OBFUSCATION,
  ...FS_ABUSE,
  ...CREDENTIAL_ACCESS,
  ...CRYPTO_MINING,
];

export const CRITICAL_PATTERNS = ALL_PATTERNS.filter((p) => p.severity === "critical");
export const HIGH_PATTERNS = ALL_PATTERNS.filter((p) => p.severity === "high");
