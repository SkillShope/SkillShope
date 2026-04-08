import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const typeLabels: Record<string, string> = {
  skill: "Skill",
  "mcp-server": "MCP Server",
  agent: "Agent",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Truncate inputs to prevent abuse
  const name = (searchParams.get("name") || "Untitled").slice(0, 100);
  const description = (searchParams.get("description") || "").slice(0, 300);
  const type = searchParams.get("type") || "skill";
  const category = (searchParams.get("category") || "").slice(0, 50);
  const rating = searchParams.get("rating") || "0";
  const downloads = searchParams.get("downloads") || "0";
  const isFree = searchParams.get("isFree") !== "false";
  const price = searchParams.get("price") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#0a0a0a",
          color: "#D1D2BD",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: type + category */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              background: "rgba(74, 93, 79, 0.3)",
              color: "#4a5d4f",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            {typeLabels[type] || type}
          </div>
          {category && (
            <div
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "#888888",
                fontSize: "20px",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Middle: name + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#D1D2BD",
              maxWidth: "900px",
            }}
          >
            {name.length > 40 ? name.slice(0, 40) + "..." : name}
          </div>
          {description && (
            <div
              style={{
                fontSize: "28px",
                color: "#888888",
                lineHeight: 1.4,
                maxWidth: "900px",
              }}
            >
              {description.length > 120
                ? description.slice(0, 120) + "..."
                : description}
            </div>
          )}
        </div>

        {/* Bottom: stats + branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: "32px", fontSize: "22px", color: "#888888" }}>
            {Number(rating) > 0 && (
              <span>{`★ ${Number(rating).toFixed(1)}`}</span>
            )}
            {Number(downloads) > 0 && (
              <span>{`${Number(downloads).toLocaleString()} installs`}</span>
            )}
            <span
              style={{
                color: isFree ? "#22c55e" : "#D1D2BD",
                fontWeight: 600,
              }}
            >
              {isFree ? "Free" : `$${Number(price).toFixed(2)}`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "24px",
              fontWeight: 600,
              color: "#4a5d4f",
            }}
          >
            roughinhub.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    }
  );
}
