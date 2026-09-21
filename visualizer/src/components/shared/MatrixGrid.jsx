import { useMemo } from "react";
import { motion } from "framer-motion";
import "./MatrixGrid.css";

export default function MatrixGrid({
  matrix = [],

  label = "Matrix",

  activeCell = null,
  foundCell = null,

  activeFlatIndex = null,

  rangeStart = null,
  rangeEnd = null,

  highlightedCells = [],
  dimmedCells = [],

  showCoordinates = true,
  showFlatIndices = false,
  showRowLabels = true,
  showColumnLabels = true,

  cellWidth = 58,
  cellHeight = 54,

  tone = "main",
  className = "",
}) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const highlightedSet = useMemo(
    () => new Set(highlightedCells.map(({ row, col }) => `${row}:${col}`)),
    [highlightedCells],
  );

  const dimmedSet = useMemo(
    () => new Set(dimmedCells.map(({ row, col }) => `${row}:${col}`)),
    [dimmedCells],
  );

  if (!rows || !cols) {
    return (
      <div className={`matrix-grid matrix-grid--${tone} ${className}`.trim()}>
        <div className="matrix-grid__empty">Empty matrix</div>
      </div>
    );
  }

  return (
    <div
      className={`matrix-grid matrix-grid--${tone} ${className}`.trim()}
      role="region"
      aria-label={label}
    >
      <div className="matrix-grid__scroll">
        <div
          className="matrix-grid__layout"
          style={{
            gridTemplateColumns: `${
              showRowLabels ? "34px " : ""
            }repeat(${cols}, ${cellWidth}px)`,
          }}
        >
          {showColumnLabels && (
            <>
              {showRowLabels && <div className="matrix-grid__corner">r\c</div>}

              {Array.from({ length: cols }, (_, col) => (
                <div
                  key={`col-${col}`}
                  className="matrix-grid__axis-label matrix-grid__axis-label--column"
                >
                  {col}
                </div>
              ))}
            </>
          )}

          {matrix.map((row, rowIndex) => (
            <MatrixRow
              key={`row-${rowIndex}`}
              row={row}
              rowIndex={rowIndex}
              cols={cols}
              showRowLabels={showRowLabels}
              showCoordinates={showCoordinates}
              showFlatIndices={showFlatIndices}
              activeCell={activeCell}
              foundCell={foundCell}
              activeFlatIndex={activeFlatIndex}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              highlightedSet={highlightedSet}
              dimmedSet={dimmedSet}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MatrixRow({
  row,
  rowIndex,
  cols,

  showRowLabels,
  showCoordinates,
  showFlatIndices,

  activeCell,
  foundCell,
  activeFlatIndex,

  rangeStart,
  rangeEnd,

  highlightedSet,
  dimmedSet,

  cellWidth,
  cellHeight,
}) {
  return (
    <>
      {showRowLabels && (
        <div className="matrix-grid__axis-label matrix-grid__axis-label--row">
          {rowIndex}
        </div>
      )}

      {row.map((value, colIndex) => {
        const flatIndex = rowIndex * cols + colIndex;

        const key = `${rowIndex}:${colIndex}`;

        const isActive =
          activeCell?.row === rowIndex && activeCell?.col === colIndex;

        const isFound =
          foundCell?.row === rowIndex && foundCell?.col === colIndex;

        const isFlatActive = activeFlatIndex === flatIndex;

        const hasRange =
          rangeStart !== null &&
          rangeStart !== undefined &&
          rangeEnd !== null &&
          rangeEnd !== undefined;

        const isInRange =
          !hasRange || (flatIndex >= rangeStart && flatIndex <= rangeEnd);

        const isHighlighted = highlightedSet.has(key);

        const isExplicitlyDimmed = dimmedSet.has(key);

        const classes = [
          "matrix-grid__cell",

          isActive || isFlatActive ? "is-active" : "",

          isFound ? "is-found" : "",

          isHighlighted ? "is-highlighted" : "",

          hasRange && isInRange ? "is-in-range" : "",

          hasRange && !isInRange ? "is-out-of-range" : "",

          isExplicitlyDimmed ? "is-dimmed" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <motion.div
            key={key}
            className={classes}
            style={{
              width: cellWidth,
              height: cellHeight,
            }}
            initial={false}
            animate={{
              scale: isActive || isFlatActive || isFound ? 1.08 : 1,

              y: isActive || isFlatActive || isFound ? -4 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 27,
            }}
          >
            <span className="matrix-grid__value">{String(value)}</span>

            <div className="matrix-grid__meta">
              {showCoordinates && (
                <span className="matrix-grid__coordinate">
                  [{rowIndex},{colIndex}]
                </span>
              )}

              {showFlatIndices && (
                <span className="matrix-grid__flat">#{flatIndex}</span>
              )}
            </div>

            {(isActive || isFlatActive) && !isFound && (
              <span className="matrix-grid__active-marker">mid</span>
            )}

            {isFound && <span className="matrix-grid__found-marker">✓</span>}
          </motion.div>
        );
      })}
    </>
  );
}
