export default function LayoutControls({ layoutWidth, onChange, compact = false }) {
  return (
    <div className={`layout-controls ${compact ? "compact" : ""}`}>
      <span className="layout-label">Layout</span>
      <div className="layout-pill">
        <button
          className={`layout-btn ${layoutWidth === "normal" ? "active" : ""}`}
          aria-pressed={layoutWidth === "normal"}
          onClick={() => onChange("normal")}
        >
          Normal
        </button>
        <button
          className={`layout-btn ${layoutWidth === "wide" ? "active" : ""}`}
          aria-pressed={layoutWidth === "wide"}
          onClick={() => onChange("wide")}
        >
          Wide
        </button>
        <button
          className={`layout-btn ${layoutWidth === "full" ? "active" : ""}`}
          aria-pressed={layoutWidth === "full"}
          onClick={() => onChange("full")}
        >
          Full
        </button>
      </div>
    </div>
  );
}

