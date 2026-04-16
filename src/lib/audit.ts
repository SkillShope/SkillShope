import { prisma } from "./prisma";

type Severity = "info" | "warn" | "critical";

type AuditEvent = {
  type: string;
  severity?: Severity;
  userId?: string | null;
  blueprintId?: string | null;
  metadata?: Record<string, unknown>;
};

// Non-blocking audit log — never throws, never blocks the request
export function audit(event: AuditEvent) {
  prisma.auditLog
    .create({
      data: {
        type: event.type,
        severity: event.severity || "info",
        userId: event.userId || null,
        blueprintId: event.blueprintId || null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      },
    })
    .catch(() => {
      // Silent fail — audit logging should never break the app
    });
}

// Convenience methods
export const auditInfo = (type: string, opts?: Omit<AuditEvent, "type" | "severity">) =>
  audit({ type, severity: "info", ...opts });

export const auditWarn = (type: string, opts?: Omit<AuditEvent, "type" | "severity">) =>
  audit({ type, severity: "warn", ...opts });

export const auditCritical = (type: string, opts?: Omit<AuditEvent, "type" | "severity">) =>
  audit({ type, severity: "critical", ...opts });
