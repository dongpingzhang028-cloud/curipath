import { ImageResponse } from "next/og";

export const alt = "CuriPath — Helping every child discover their next passion.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Categories are hardcoded rather than read from the database on purpose. This
// is the card people see when the link is shared, so it should be a stable
// image generated once at build time -- not something that reshuffles when a
// provider is added, and not a reason for the build to depend on the DB.
const CATEGORIES = [
  "Sports",
  "Arts",
  "Music",
  "Dance",
  "Enrichment",
  "Performing Arts",
  "Swim",
  "Camps",
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eef2ff",
          backgroundImage: "linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 76,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: -2,
          }}
        >
          CuriPath
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: "#475569",
            textAlign: "center",
          }}
        >
          Helping every child discover their next passion.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 52,
            maxWidth: 980,
          }}
        >
          {CATEGORIES.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "10px 8px",
                padding: "14px 30px",
                borderRadius: 999,
                backgroundColor: "#ffffff",
                border: "2px solid #e2e8f0",
                fontSize: 28,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: 26,
            fontWeight: 600,
            color: "#4f46e5",
          }}
        >
          Find and book kids&apos; classes across Seattle &amp; the Eastside
        </div>
      </div>
    ),
    size,
  );
}
