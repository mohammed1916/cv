import { useState, useMemo, useCallback } from "react";

import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "framer-motion";

import FloatingPanel from "../../components/shared/FloatingPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

import MatrixGrid from "../../components/shared/MatrixGrid";
import FlatIndexBounds from "../../components/shared/FlatIndexBounds";
import WeightedComparison from "../../components/shared/WeightedComparison";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";

import { usePatternOverlay } from "../../hooks/usePatternOverlay";

import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";

import { getExamples } from "../../config/examplesRegistry";

import "./Search2DMatrixVisualizer.css";

/* =========================================================
   PATTERNS
   ========================================================= */

const SEARCH2DMATRIX_PATTERNS = [
  "init",
  "calc",
  "found",
  "lo",
  "hi",
  "not_found",
];

const LINE_PATTERN_MAP = {
  3: "init",
  5: "calc",
  8: "found",
  9: "lo",
  10: "hi",
  11: "not_found",
};

/* =========================================================
   SOLUTION
   ========================================================= */

const SOLUTION_CODE = [
  {
    line: 1,
    text: "def searchMatrix(matrix, target):",
  },
  {
    line: 2,
    text: "    rows, cols = len(matrix), len(matrix[0])",
  },
  {
    line: 3,
    text: "    lo, hi = 0, rows * cols - 1",
  },
  {
    line: 4,
    text: "    while lo <= hi:",
  },
  {
    line: 5,
    text: "        mid = (lo + hi) // 2",
  },
  {
    line: 6,
    text: "        r, c = mid // cols, mid % cols",
  },
  {
    line: 7,
    text: "        val = matrix[r][c]",
  },
  {
    line: 8,
    text: "        if val == target: return True",
  },
  {
    line: 9,
    text: "        elif val < target: lo = mid + 1",
  },
  {
    line: 10,
    text: "        else: hi = mid - 1",
  },
  {
    line: 11,
    text: "    return False",
  },
];

/* =========================================================
   COMPARISONS
   ========================================================= */

function createEqualityComparison(value, target, row, col) {
  return {
    title: "Does the midpoint equal the target?",

    subtitle: `Compare matrix[${row}][${col}] with target.`,

    operands: [
      {
        id: "matrix-value",

        label: `matrix[${row}][${col}]`,

        value,

        tone: "mid",

        active: true,
      },

      {
        id: "target",

        label: "target",

        value: target,

        tone: "target",

        active: true,
      },
    ],

    operators: ["=="],

    result: value === target,
  };
}

function createLessComparison(value, target, row, col) {
  return {
    title: "Which half can be discarded?",

    subtitle: `Check whether matrix[${row}][${col}] is below the target.`,

    operands: [
      {
        id: "matrix-value",

        label: `matrix[${row}][${col}]`,

        value,

        tone: "mid",

        active: true,
      },

      {
        id: "target",

        label: "target",

        value: target,

        tone: "target",

        active: true,
      },
    ],

    operators: ["<"],

    result: value < target,
  };
}

function createGreaterComparison(value, target, row, col) {
  return {
    title: "Which half can be discarded?",

    subtitle: `The midpoint is above the target, so search lower flat indices.`,

    operands: [
      {
        id: "matrix-value",

        label: `matrix[${row}][${col}]`,

        value,

        tone: "mid",

        active: true,
      },

      {
        id: "target",

        label: "target",

        value: target,

        tone: "target",

        active: true,
      },
    ],

    operators: [">"],

    result: value > target,
  };
}

/* =========================================================
   STEPS
   ========================================================= */

function generateSteps(matrix, target) {
  const steps = [];

  if (!matrix.length || !matrix[0]?.length) {
    steps.push({
      phase: "not_found",

      activeLine: 11,

      lo: 0,

      hi: -1,

      mid: -1,

      r: -1,

      c: -1,

      found: false,

      message: "Matrix is empty. Return false.",

      comparison: null,
    });

    return steps;
  }

  const rows = matrix.length;

  const cols = matrix[0].length;

  const total = rows * cols;

  let lo = 0;

  let hi = total - 1;

  steps.push({
    phase: "init",

    activeLine: 3,

    lo,
    hi,

    mid: -1,

    r: -1,

    c: -1,

    found: null,

    message: `Treat the ${rows}×${cols} matrix as a sorted 1D array of ${total} values. Initialize lo = 0 and hi = ${hi}.`,

    comparison: null,
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    const r = Math.floor(mid / cols);

    const c = mid % cols;

    const val = matrix[r][c];

    steps.push({
      phase: "calc",

      activeLine: 5,

      lo,
      hi,
      mid,
      r,
      c,
      val,

      found: null,

      message: `mid = (${lo} + ${hi}) // 2 = ${mid}. Flat index ${mid} maps to row ${r}, column ${c}.`,

      mapping: {
        mid,
        row: r,
        col: c,
        cols,
      },

      comparison: null,
    });

    steps.push({
      phase: "compare",

      activeLine: 8,

      lo,
      hi,
      mid,
      r,
      c,
      val,

      found: null,

      message: `Compare matrix[${r}][${c}] = ${val} with target ${target}.`,

      mapping: {
        mid,
        row: r,
        col: c,
        cols,
      },

      comparison: createEqualityComparison(val, target, r, c),
    });

    if (val === target) {
      steps.push({
        phase: "found",

        activeLine: 8,

        lo,
        hi,
        mid,
        r,
        c,
        val,

        found: true,

        message: `matrix[${r}][${c}] = ${target}. Target found at row ${r}, column ${c}. Return true.`,

        mapping: {
          mid,
          row: r,
          col: c,
          cols,
        },

        comparison: createEqualityComparison(val, target, r, c),
      });

      return steps;
    }

    if (val < target) {
      steps.push({
        phase: "compare_lo",

        activeLine: 9,

        lo,
        hi,
        mid,
        r,
        c,
        val,

        found: null,

        message: `${val} < ${target}. The target must be at a larger flat index.`,

        mapping: {
          mid,
          row: r,
          col: c,
          cols,
        },

        comparison: createLessComparison(val, target, r, c),
      });

      const previousLo = lo;

      const previousHi = hi;

      lo = mid + 1;

      steps.push({
        phase: "lo",

        activeLine: 9,

        lo,
        hi,
        mid,
        r,
        c,
        val,

        previousLo,
        previousHi,

        found: null,

        eliminatedStart: previousLo,

        eliminatedEnd: mid,

        message: `Discard flat indices ${previousLo}..${mid}. Move lo to ${lo}.`,

        mapping: {
          mid,
          row: r,
          col: c,
          cols,
        },

        comparison: null,
      });
    } else {
      steps.push({
        phase: "compare_hi",

        activeLine: 10,

        lo,
        hi,
        mid,
        r,
        c,
        val,

        found: null,

        message: `${val} > ${target}. The target must be at a smaller flat index.`,

        mapping: {
          mid,
          row: r,
          col: c,
          cols,
        },

        comparison: createGreaterComparison(val, target, r, c),
      });

      const previousLo = lo;

      const previousHi = hi;

      hi = mid - 1;

      steps.push({
        phase: "hi",

        activeLine: 10,

        lo,
        hi,
        mid,
        r,
        c,
        val,

        previousLo,
        previousHi,

        found: null,

        eliminatedStart: mid,

        eliminatedEnd: previousHi,

        message: `Discard flat indices ${mid}..${previousHi}. Move hi to ${hi}.`,

        mapping: {
          mid,
          row: r,
          col: c,
          cols,
        },

        comparison: null,
      });
    }
  }

  steps.push({
    phase: "not_found",

    activeLine: 11,

    lo,
    hi,

    mid: -1,

    r: -1,

    c: -1,

    found: false,

    message: `Search window is empty because lo (${lo}) > hi (${hi}). ${target} is not in the matrix. Return false.`,

    comparison: null,
  });

  return steps;
}

/* =========================================================
   EXAMPLES
   ========================================================= */

const EXAMPLES = getExamples("search2-dmatrix");

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Search2DMatrixVisualizer() {
  const [sel, setSel] = useState(0);

  const [matrixInput, setMatrixInput] = useState(
    JSON.stringify(
      EXAMPLES[0]?.matrix ?? [
        [1, 3, 5, 7],
        [10, 11, 16, 20],
        [23, 30, 34, 60],
      ],
    ),
  );

  const [targetInput, setTargetInput] = useState(
    String(EXAMPLES[0]?.target ?? 3),
  );

  /* =======================================================
     INPUT
     ======================================================= */

  const { matrix, target, inputError } = useMemo(() => {
    try {
      const parsedMatrix = JSON.parse(matrixInput);

      const parsedTarget = Number(targetInput);

      if (!Array.isArray(parsedMatrix) || parsedMatrix.length === 0) {
        throw new Error("matrix must be a non-empty 2D array");
      }

      if (!Array.isArray(parsedMatrix[0]) || parsedMatrix[0].length === 0) {
        throw new Error("matrix must contain non-empty rows");
      }

      const cols = parsedMatrix[0].length;

      if (
        !parsedMatrix.every((row) => Array.isArray(row) && row.length === cols)
      ) {
        throw new Error("all matrix rows must have equal length");
      }

      if (
        !parsedMatrix.every((row) =>
          row.every(
            (value) => typeof value === "number" && Number.isFinite(value),
          ),
        )
      ) {
        throw new Error("matrix must contain only numbers");
      }

      if (!Number.isFinite(parsedTarget)) {
        throw new Error("target must be a number");
      }

      const flattened = parsedMatrix.flat();

      const sorted = flattened.every(
        (value, index, array) => index === 0 || value > array[index - 1],
      );

      if (!sorted) {
        throw new Error("matrix must be globally sorted in ascending order");
      }

      return {
        matrix: parsedMatrix,

        target: parsedTarget,

        inputError: "",
      };
    } catch (error) {
      return {
        matrix: EXAMPLES[sel]?.matrix ?? [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],

        target: EXAMPLES[sel]?.target ?? 3,

        inputError: error.message || "Invalid input",
      };
    }
  }, [matrixInput, targetInput, sel]);

  /* =======================================================
     STEPS
     ======================================================= */

  const steps = useMemo(
    () =>
      generateSteps(matrix, target).map((current) => ({
        ...current,

        relatedLines:
          current.relatedLines ??
          (current.activeLine != null ? [current.activeLine] : []),
      })),
    [matrix, target],
  );

  /* =======================================================
     PLAYBACK
     ======================================================= */

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  /* =======================================================
     PATTERN OVERLAY
     ======================================================= */

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  /* =======================================================
     CONNECTIVITY
     ======================================================= */

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  /* =======================================================
     EXAMPLES
     ======================================================= */

  const applyExample = useCallback(
    (index) => {
      const example = EXAMPLES[index];

      if (!example) {
        return;
      }

      setSel(index);

      setMatrixInput(JSON.stringify(example.matrix));

      setTargetInput(String(example.target));

      handleReset();
    },
    [handleReset],
  );

  /* =======================================================
     DERIVED
     ======================================================= */

  const rows = matrix.length;

  const cols = matrix[0]?.length ?? 0;

  const flattened = useMemo(() => matrix.flat(), [matrix]);

  const total = flattened.length;

  const lo = step?.lo ?? 0;

  const hi = step?.hi ?? total - 1;

  const mid = step?.mid ?? -1;

  const activeCell =
    step && step.r >= 0 && step.c >= 0
      ? {
          row: step.r,

          col: step.c,
        }
      : null;

  const foundCell = step?.found === true && activeCell ? activeCell : null;

  /* =======================================================
     PRIMARY PANEL
     ======================================================= */

  const primaryPanel = (
    <div className="s2m-primary">
      <ManualInputPanel
        fields={[
          {
            key: "matrix",

            label: "matrix",

            type: "array",
          },

          {
            key: "target",

            label: "target",

            type: "number",
          },
        ]}
        values={{
          matrix: matrixInput,

          target: targetInput,
        }}
        onChange={(key, value) => {
          if (key === "matrix") {
            setMatrixInput(value);
          }

          if (key === "target") {
            setTargetInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={EXAMPLES[sel]?.label}
        applyExample={(example) => applyExample(EXAMPLES.indexOf(example))}
        inputError={inputError}
      />

      <section className="s2m-panel">
        <header className="s2m-head">
          <div>
            <div className="s2m-title">Search a 2D Matrix</div>

            <div className="s2m-subtitle">
              Binary search over a virtual flattened array
            </div>
          </div>

          <div className="s2m-target">
            <span>target</span>

            <strong>{target}</strong>
          </div>
        </header>

        <div className="s2m-body">
          {/* =============================================
              DIMENSIONS
             ============================================= */}

          <div className="s2m-dimensions">
            <div className="s2m-dimension">
              <span>rows</span>

              <strong>{rows}</strong>
            </div>

            <span className="s2m-dimension-times">×</span>

            <div className="s2m-dimension">
              <span>cols</span>

              <strong>{cols}</strong>
            </div>

            <span className="s2m-dimension-equals">=</span>

            <div className="s2m-dimension total">
              <span>flat length</span>

              <strong>{total}</strong>
            </div>
          </div>

          {/* =============================================
              FLATTENED SEARCH SPACE
             ============================================= */}

          <FlatIndexBounds
            length={total}
            values={flattened}
            lo={lo}
            hi={hi}
            mid={mid}
            eliminatedStart={step?.eliminatedStart ?? null}
            eliminatedEnd={step?.eliminatedEnd ?? null}
            label="Virtual flattened array"
            showValues
            showIndices
          />

          {/* =============================================
              FLAT -> MATRIX MAPPING
             ============================================= */}

          <AnimatePresence mode="wait">
            {mid >= 0 && step?.r >= 0 && step?.c >= 0 && (
              <motion.div
                key={`${stepIndex}-${mid}`}
                className="s2m-mapping"
                initial={{
                  opacity: 0,

                  y: 6,
                }}
                animate={{
                  opacity: 1,

                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
              >
                <div className="s2m-mapping-node mid">
                  <span>flat mid</span>

                  <strong>{mid}</strong>
                </div>

                <div className="s2m-mapping-arrow">→</div>

                <div className="s2m-mapping-formula">
                  <div>
                    <span>row</span>

                    <code>
                      {mid} // {cols} = {step.r}
                    </code>
                  </div>

                  <div>
                    <span>col</span>

                    <code>
                      {mid} % {cols} = {step.c}
                    </code>
                  </div>
                </div>

                <div className="s2m-mapping-arrow">→</div>

                <div className="s2m-mapping-node coordinate">
                  <span>matrix</span>

                  <strong>
                    [{step.r},{step.c}]
                  </strong>
                </div>

                <div className="s2m-mapping-arrow">→</div>

                <div className="s2m-mapping-node value">
                  <span>value</span>

                  <strong>{matrix[step.r][step.c]}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =============================================
              MATRIX
             ============================================= */}

          <section className="s2m-matrix-section">
            <div className="s2m-section-head">
              <span>Physical matrix</span>

              <span>flat index = row × {cols} + col</span>
            </div>

            <MatrixGrid
              matrix={matrix}
              activeCell={activeCell}
              foundCell={foundCell}
              activeFlatIndex={mid >= 0 ? mid : null}
              rangeStart={lo}
              rangeEnd={hi}
              showCoordinates
              showFlatIndices
              showRowLabels
              showColumnLabels
            />
          </section>

          {/* =============================================
              WEIGHTED COMPARISON
             ============================================= */}

          <AnimatePresence mode="wait">
            {step?.comparison && (
              <motion.div
                key={`${stepIndex}-${step.phase}`}
                className="s2m-comparison"
                initial={{
                  opacity: 0,

                  y: 8,
                }}
                animate={{
                  opacity: 1,

                  y: 0,
                }}
                exit={{
                  opacity: 0,

                  y: -5,
                }}
              >
                <WeightedComparison
                  title={step.comparison.title}
                  subtitle={step.comparison.subtitle}
                  operands={step.comparison.operands}
                  operators={step.comparison.operators}
                  result={step.comparison.result}
                  showScale
                  showExpression
                  showPairResults
                  showOverallResult
                  animate
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* =============================================
              RESULT
             ============================================= */}

          <AnimatePresence>
            {step?.found !== null && step?.found !== undefined && (
              <motion.div
                className={[
                  "s2m-result",

                  step.found ? "found" : "not-found",
                ].join(" ")}
                initial={{
                  opacity: 0,

                  y: 8,
                }}
                animate={{
                  opacity: 1,

                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
              >
                {step.found ? (
                  <>
                    <span className="s2m-result-icon">✓</span>

                    <div>
                      <strong>Target found</strong>

                      <span>
                        {target} is at matrix[
                        {step.r}
                        ][
                        {step.c}
                        ], flat index {step.mid}.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="s2m-result-icon">×</span>

                    <div>
                      <strong>Target not found</strong>

                      <span>Search window is empty.</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );

  /* =======================================================
     CODE
     ======================================================= */

  const codePanel = (
    <div
      style={{
        position: "relative",

        height: "100%",
      }}
    >
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />

      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  );

  /* =======================================================
     STATUS
     ======================================================= */

  const statusPanel = (
    <div className="s2m-status">
      {step?.message ?? "Press Play or Step to begin."}
    </div>
  );

  /* =======================================================
     PLAYBACK
     ======================================================= */

  const playbackPanel = (
    <>
      <PlaybackControls
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onPlayToggle={togglePlay}
        onPrev={stepBack}
        onNext={stepForward}
        onReset={handleReset}
        prevDisabled={stepIndex < 0}
        nextDisabled={isDone}
        resetDisabled={stepIndex < 0}
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />

      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={SEARCH2DMATRIX_PATTERNS}
        />
      )}
    </>
  );

  /* =======================================================
     PANELS
     ======================================================= */

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",

        title: "Search a 2D Matrix",

        dockMode: "split-right",
      },

      {
        id: "code",

        title: "Code",

        dockMode: "split-right",
      },

      {
        id: "status",

        title: "Status",

        dockMode: "split-bottom",

        ratio: 0.08,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="s2m-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {playbackPanel}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
