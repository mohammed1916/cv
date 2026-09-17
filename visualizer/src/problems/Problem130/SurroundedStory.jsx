import StoryPanel from "../../components/shared/StoryPanel";
import "./SurroundedStory.css";

export default function SurroundedStory({ story, step }) {
  if (!step || !story) {
    return (
      <StoryPanel
        title="Surrounded Regions"
        description="Press Play to begin."
      >
        <p>
          Capture all regions of &apos;O&apos; surrounded by &apos;X&apos; by flood-filling
          from boundary edges to identify safe cells.
        </p>
      </StoryPanel>
    );
  }

  const { rows, cols } = story;
  const board = step.board || [];
  const currentCell = step.currentCell;
  const activeNeighbors = step.activeNeighbors || [];
  const recentCell = step.recentCell;
  const stats = step.stats || {};

  const isBorderCell = (r, c) => r === 0 || r === rows - 1 || c === 0 || c === cols - 1;

  const isCurrent = (r, c) => currentCell && currentCell[0] === r && currentCell[1] === c;

  const isRecent = (r, c) => recentCell && recentCell[0] === r && recentCell[1] === c;

  const isActiveNeighbor = (r, c) =>
    activeNeighbors.some(([nr, nc]) => nr === r && nc === c);

  const isCaptured = (r, c) =>
    step.capturedCells && step.capturedCells.some(([cr, cc]) => cr === r && cc === c);

  const isRestored = (r, c) =>
    step.restoredCells && step.restoredCells.some(([rr, rc]) => rr === r && rc === c);

  const cellSize = Math.max(28, Math.min(54, Math.floor(460 / Math.max(rows, cols, 1))));

  const getCellTitle = (val, r, c) => {
    const borderText = isBorderCell(r, c) ? " (Border)" : " (Interior)";
    if (val === "X") {
      if (isCaptured(r, c)) return `(${r}, ${c}): Captured 'O' -> 'X'${borderText}`;
      return `(${r}, ${c}): Wall 'X'${borderText}`;
    }
    if (val === "E") return `(${r}, ${c}): Escaped 'E' (Safe via border)${borderText}`;
    if (val === "O") {
      if (isRestored(r, c)) return `(${r}, ${c}): Restored safe 'O'${borderText}`;
      return `(${r}, ${c}): 'O' (Unresolved)${borderText}`;
    }
    return `(${r}, ${c}): ${val}${borderText}`;
  };

  const getPanelTitle = () => {
    if (step.phase === "done") {
      return `Solved: ${stats.capturedCount ?? 0} Captured, ${stats.escapedCount ?? 0} Preserved`;
    }
    if (step.phase === "sweep") {
      return `Phase 2: Board Sweep ${currentCell ? `at (${currentCell[0]}, ${currentCell[1]})` : ""}`;
    }
    if (step.phase === "border-scan") {
      return `Phase 1: Border Scan & Flood-Fill ${currentCell ? `at (${currentCell[0]}, ${currentCell[1]})` : ""}`;
    }
    return "Surrounded Regions: Initialization";
  };

  return (
    <StoryPanel
      title={getPanelTitle()}
      description={step.message}
    >
      <div className="surrounded-story">
        <p className="surrounded-story__explanation">{step.explanation}</p>

        {/* Status Metrics Pills */}
        <div className="surrounded-story__metrics" role="region" aria-label="Algorithm statistics">
          <div className={`surrounded-story__pill surrounded-story__pill--${step.phase}`}>
            <span className="surrounded-story__pill-label">Phase:</span>
            <span className="surrounded-story__pill-value">
              {step.phase === "border-scan"
                ? "1. Border Flood-Fill"
                : step.phase === "sweep"
                ? "2. Board Sweep"
                : step.phase === "done"
                ? "Complete"
                : "Initialization"}
            </span>
          </div>
          <div className="surrounded-story__pill">
            <span className="surrounded-story__pill-label">Grid:</span>
            <span className="surrounded-story__pill-value">{rows} × {cols}</span>
          </div>
          <div className="surrounded-story__pill surrounded-story__pill--safe">
            <span className="surrounded-story__pill-label">Safe (Escaped):</span>
            <span className="surrounded-story__pill-value">{stats.escapedCount ?? 0}</span>
          </div>
          <div className="surrounded-story__pill surrounded-story__pill--captured">
            <span className="surrounded-story__pill-label">Captured:</span>
            <span className="surrounded-story__pill-value">{stats.capturedCount ?? 0}</span>
          </div>
        </div>

        {/* 2D Board Container with Boundary Markers */}
        <div className="surrounded-story__board-wrapper" role="region" aria-label="Surrounded regions grid">
          {/* Top Boundary Marker */}
          <div className="surrounded-story__boundary surrounded-story__boundary--top">
            <span>▲ Top Boundary (Escape Zone) ▲</span>
          </div>

          <div className="surrounded-story__middle-row">
            {/* Left Boundary Marker */}
            <div className="surrounded-story__boundary surrounded-story__boundary--left">
              <span>◄ Left</span>
            </div>

            {/* Grid */}
            <div
              className="surrounded-story__grid"
              role="grid"
              aria-label="2D Board Matrix"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              }}
            >
              {board.map((row, r) => (
                <div key={`row-${r}`} className="surrounded-story__row" role="row">
                  {row.map((cell, c) => {
                    const border = isBorderCell(r, c);
                    const current = isCurrent(r, c);
                    const recent = isRecent(r, c);
                    const neighbor = isActiveNeighbor(r, c);
                    const captured = isCaptured(r, c);
                    const restored = isRestored(r, c);

                    let stateClass = "surrounded-cell--x";
                    if (cell === "E") stateClass = "surrounded-cell--e";
                    else if (cell === "O") {
                      stateClass = restored
                        ? "surrounded-cell--restored"
                        : "surrounded-cell--o";
                    } else if (cell === "X" && captured) {
                      stateClass = "surrounded-cell--captured";
                    }

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        role="gridcell"
                        aria-label={`Row ${r + 1}, Column ${c + 1}: ${cell} ${border ? "(Border)" : ""} ${current ? "(Inspecting)" : ""}`}
                        title={getCellTitle(cell, r, c)}
                        className={`surrounded-cell ${stateClass} ${
                          border ? "surrounded-cell--border" : ""
                        } ${current ? "surrounded-cell--current" : ""} ${
                          recent ? "surrounded-cell--recent" : ""
                        } ${neighbor ? "surrounded-cell--wave-neighbor" : ""}`}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          fontSize: `${Math.max(11, Math.floor(cellSize * 0.42))}px`,
                        }}
                      >
                        <span className="surrounded-cell__coord">
                          {r},{c}
                        </span>
                        <span className="surrounded-cell__value">
                          {cell}
                        </span>
                        {border && (
                          <span
                            className="surrounded-cell__border-pip"
                            title="Border cell"
                            aria-hidden="true"
                          />
                        )}
                        {current && (
                          <span className="surrounded-cell__wave-ring" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Right Boundary Marker */}
            <div className="surrounded-story__boundary surrounded-story__boundary--right">
              <span>Right ►</span>
            </div>
          </div>

          {/* Bottom Boundary Marker */}
          <div className="surrounded-story__boundary surrounded-story__boundary--bottom">
            <span>▼ Bottom Boundary (Escape Zone) ▼</span>
          </div>
        </div>

        {/* Legend */}
        <div className="surrounded-story__legend" role="region" aria-label="Visual legend">
          <div className="surrounded-story__legend-item">
            <span className="surrounded-story__legend-swatch surrounded-cell--x">X</span>
            <span>Wall / Barrier</span>
          </div>
          <div className="surrounded-story__legend-item">
            <span className="surrounded-story__legend-swatch surrounded-cell--e">E</span>
            <span>Escaped (Safe via border)</span>
          </div>
          <div className="surrounded-story__legend-item">
            <span className="surrounded-story__legend-swatch surrounded-cell--captured">X</span>
            <span>Captured (&apos;O&apos; &rarr; &apos;X&apos;)</span>
          </div>
          <div className="surrounded-story__legend-item">
            <span className="surrounded-story__legend-swatch surrounded-cell--restored">O</span>
            <span>Preserved Safe (&apos;E&apos; &rarr; &apos;O&apos;)</span>
          </div>
          <div className="surrounded-story__legend-item">
            <span className="surrounded-story__legend-swatch surrounded-cell--current surrounded-cell--legend-active">
              <span className="surrounded-cell__legend-dot" />
            </span>
            <span>Flood-Fill Wave Active</span>
          </div>
        </div>
      </div>
    </StoryPanel>
  );
}
