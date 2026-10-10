import { ImageResponse } from "next/og";
export const alt = "CircuitWiki — Learn circuits. Connect knowledge.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 72px",
        background: "#fff",
        color: "#111",
        fontFamily: "sans-serif",
        border: "1px solid #e4e4e7",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          color: "#626269",
          letterSpacing: 3,
        }}
      >
        CIRCUITS / KNOWLEDGE / LEARNING
      </div>
      <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 88, fontWeight: 700 }}>CircuitWiki</div>
          <div style={{ fontSize: 28, marginTop: 24 }}>
            Learn circuits. Connect knowledge.
          </div>
        </div>
        <svg width="220" height="180" viewBox="0 0 220 180">
          <path
            d="M20 40H75M145 40H200V140H145M75 140H20V40"
            fill="none"
            stroke="#111"
            strokeWidth="4"
          />
          <rect
            x="75"
            y="27"
            width="70"
            height="26"
            fill="#fff"
            stroke="#111"
            strokeWidth="4"
          />
          <rect
            x="75"
            y="127"
            width="70"
            height="26"
            fill="#fff"
            stroke="#111"
            strokeWidth="4"
          />
          <circle cx="20" cy="40" r="7" fill="#111" />
          <circle cx="200" cy="140" r="7" fill="#111" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #ddd",
          paddingTop: 24,
          fontSize: 20,
          color: "#626269",
        }}
      >
        <span>Concepts · Formulas · Interactive labs</span>
        <span>circuit-wiki.vercel.app</span>
      </div>
    </div>,
    size,
  );
}
