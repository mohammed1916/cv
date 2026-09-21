import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from "../../config/examplesRegistry";

import "./EditDistanceVisualizer.css";

const EDITDISTANCE_PATTERNS = ["init", "match", "mismatch"];

const LINE_PATTERN_MAP = {
  4: "init",
  9: "match",
  11: "mismatch",
  14: "init",
};

const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def minDistance(word1, word2):" },
  { line: 2, text: "    m, n = len(word1), len(word2)" },
  { line: 3, text: "    dp = [[0]*(n+1) for _ in range(m+1)]" },
  { line: 4, text: "    for i in range(m+1): dp[i][0] = i" },
  { line: 5, text: "    for j in range(n+1): dp[0][j] = j" },
  { line: 6, text: "    for i in range(1, m+1):" },
  { line: 7, text: "        for j in range(1, n+1):" },
  { line: 8, text: "            if word1[i-1] == word2[j-1]:" },
  { line: 9, text: "                dp[i][j] = dp[i-1][j-1]" },
  { line: 10, text: "            else:" },
  {
    line: 11,
    text: "                dp[i][j] = 1 + min(dp[i-1][j],   # delete",
  },
  {
    line: 12,
    text: "                               dp[i][j-1],   # insert",
  },
  {
    line: 13,
    text: "                               dp[i-1][j-1]) # replace",
  },
  { line: 14, text: "    return dp[m][n]" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE;

const EXAMPLES = getExamples("edit-distance");

function DPTablePanel({ step, w1, w2, dpTable, maxVal }) {
  if (!step) {
    return (
      <div className="ed-panel">
        <div className="ed-panel-label">DP Table</div>

        <div className="ed-empty-state">
          Press Play or Next to begin the visualization.
        </div>
      </div>
    );
  }

  return (
    <div className="ed-panel">
      <div className="ed-panel-label">DP Table</div>

      <div className="ed-table-wrap">
        <table className="ed-table">
          <thead>
            <tr>
              <th className="ed-th corner" />

              <th className="ed-th">ε</th>

              {w2.split("").map((c, j) => (
                <th key={j} className="ed-th w2ch">
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dpTable.map((row, i) => (
              <tr key={i}>
                <th className="ed-th w1ch">{i === 0 ? "ε" : w1[i - 1]}</th>

                {row.map((val, j) => {
                  const isCur = step.curI === i && step.curJ === j;

                  const intensity = maxVal > 0 ? val / maxVal : 0;

                  return (
                    <motion.td
                      key={j}
                      className={`ed-td ${
                        isCur ? "cur" : val === 0 ? "zero" : ""
                      }`}
                      animate={{
                        scale: isCur ? 1.25 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      style={{
                        background: isCur
                          ? undefined
                          : `rgba(
                              137,
                              180,
                              250,
                              ${intensity * 0.35}
                            )`,
                      }}
                    >
                      {val}
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InputInfo({ step, w1, w2 }) {
  return (
    <div className="ed-input-panel">
      <div className="ed-strings">
        <div className="ed-string-item">
          <span className="ed-lbl w1">word1:</span>

          <span className="ed-val">{w1 || '""'}</span>
        </div>

        <div className="ed-string-item">
          <span className="ed-lbl w2">word2:</span>

          <span className="ed-val">{w2 || '""'}</span>
        </div>
      </div>

      <div className="ed-status">{step?.message ?? "Press Play to begin."}</div>
    </div>
  );
}

function generateSteps(w1, w2) {
  const m = w1.length;
  const n = w2.length;

  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => {
      if (i === 0) return j;
      if (j === 0) return i;
      return 0;
    }),
  );

  const steps = [];

  /*
   * IMPORTANT:
   * Store a snapshot of the DP table for every step.
   *
   * Using `dpRef: dp` would make every step point to
   * the same final mutated array.
   */
  const snapshot = () => dp.map((row) => [...row]);

  steps.push({
    phase: "init",
    activeLine: 4,
    dpRef: snapshot(),
    curI: 0,
    curJ: 0,
    message:
      "Initialize base cases: dp[i][0] = i for deleting all characters, and dp[0][j] = j for inserting all characters.",
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = w1[i - 1];
      const char2 = w2[j - 1];

      const match = char1 === char2;

      if (match) {
        dp[i][j] = dp[i - 1][j - 1];

        steps.push({
          phase: "match",
          activeLine: 9,
          dpRef: snapshot(),
          curI: i,
          curJ: j,
          message:
            `Characters match: word1[${i - 1}] = "${char1}" and ` +
            `word2[${j - 1}] = "${char2}". ` +
            `Copy the diagonal value: dp[${i}][${j}] = ` +
            `dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
        });
      } else {
        const deleteCost = dp[i - 1][j];

        const insertCost = dp[i][j - 1];

        const replaceCost = dp[i - 1][j - 1];

        dp[i][j] = 1 + Math.min(deleteCost, insertCost, replaceCost);

        steps.push({
          phase: "mismatch",
          activeLine: 11,
          dpRef: snapshot(),
          curI: i,
          curJ: j,
          message:
            `Characters differ: "${char1}" ≠ "${char2}". ` +
            `Delete=${deleteCost}, insert=${insertCost}, ` +
            `replace=${replaceCost}. ` +
            `Therefore dp[${i}][${j}] = ` +
            `1 + min(${deleteCost}, ${insertCost}, ${replaceCost}) ` +
            `= ${dp[i][j]}.`,
        });
      }
    }
  }

  steps.push({
    phase: "init",
    activeLine: 14,
    dpRef: snapshot(),
    curI: m,
    curJ: n,
    message: `Finished. The edit distance is dp[${m}][${n}] = ${dp[m][n]}.`,
  });

  return steps;
}

export default function EditDistanceVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);

  const [w1Input, setW1Input] = useState(
    EXAMPLES[0]?.w1 != null ? String(EXAMPLES[0].w1) : "horse",
  );

  const [w2Input, setW2Input] = useState(
    EXAMPLES[0]?.w2 != null ? String(EXAMPLES[0].w2) : "ros",
  );

  const { w1, w2, inputError } = useMemo(() => {
    try {
      return {
        w1: w1Input,
        w2: w2Input,
        inputError: "",
      };
    } catch (error) {
      return {
        w1: "horse",
        w2: "ros",
        inputError: error instanceof Error ? error.message : String(error),
      };
    }
  }, [w1Input, w2Input]);

  const steps = useMemo(() => generateSteps(w1, w2), [w1, w2]);

  const {
    stepIndex,
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

  const applyEx = useCallback(
    (example) => {
      setEx(example);

      setW1Input(String(example.w1 ?? ""));

      setW2Input(String(example.w2 ?? ""));

      handleReset();
    },
    [handleReset],
  );

  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  /*
   * Before playback begins, show the initialized
   * base-case table rather than an entirely zero table.
   */
  const initialDpTable = useMemo(() => {
    const m = w1.length;
    const n = w2.length;

    return Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => {
        if (i === 0) return j;
        if (j === 0) return i;
        return 0;
      }),
    );
  }, [w1, w2]);

  const dpTable = step?.dpRef ?? initialDpTable;

  const maxVal = useMemo(() => {
    const values = dpTable.flat();

    if (values.length === 0) {
      return 1;
    }

    return Math.max(1, ...values);
  }, [dpTable]);

  /*
   * INPUT PANEL
   *
   * ManualInputPanel owns the examples.
   * Do not render EXAMPLES again below it.
   */
  const inputPanel = (
    <div className="ed-panel">
      <ManualInputPanel
        fields={[
          {
            key: "w1",
            label: "word1",
            type: "string",
          },
          {
            key: "w2",
            label: "word2",
            type: "string",
          },
        ]}
        values={{
          w1: w1Input,
          w2: w2Input,
        }}
        onChange={(key, value) => {
          /*
           * Manual input means the currently selected
           * predefined example is no longer active.
           */
          setEx(null);

          if (key === "w1") {
            setW1Input(value);
          }

          if (key === "w2") {
            setW2Input(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />

      <InputInfo step={step} w1={w1} w2={w2} />
    </div>
  );

  /*
   * DP TABLE PANEL
   */
  const tablePanel = (
    <DPTablePanel
      step={step}
      w1={w1}
      w2={w2}
      dpTable={dpTable}
      maxVal={maxVal}
    />
  );

  /*
   * CODE PANEL
   */
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
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
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

  /*
   * FLOATING PLAYBACK CONTENT
   *
   * This is deliberately NOT a Lumino panel.
   */
  const playbackContent = (
    <div className="ed-floating-controls">
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={steps.length === 0}
        prevDisabled={stepIndex <= 0}
        nextDisabled={steps.length === 0 || isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        speedIndicator={`${speed}ms`}
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        autoScrollLabel="Auto-scroll code"
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />

      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={EDITDISTANCE_PATTERNS}
        />
      )}
    </div>
  );

  /*
   * Only actual visualization panels belong in Lumino.
   *
   * Playback is intentionally absent.
   */
  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "input",
        title: "Input",
        dockMode: "split-right",
      },
      {
        id: "table",
        title: "DP Table",
        dockMode: "split-right",
      },
      {
        id: "code",
        title: "Code Trace",
        dockMode: "split-right",
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  return (
    <div className="ed-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

          {panelDivs.table && createPortal(tablePanel, panelDivs.table)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {playbackContent}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
