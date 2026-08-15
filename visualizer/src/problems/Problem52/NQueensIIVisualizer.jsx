import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./NQueensIIVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const NQUEENSII_PATTERNS = ['check', 'done', 'init', 'place', 'remove', 'skip', 'solution']

const LINE_PATTERN_MAP = {
  7: 'solution',
  9: 'check',
  10: 'skip',
  11: 'place',
  12: 'place',
  13: 'remove',
}

const SOLUTION_CODE = [
  { line: 1,  text: "def solveNQueens(n):" },
  { line: 2,  text: "    cols, diag1, diag2 = set(), set(), set()" },
  { line: 3,  text: "    count = 0" },
  { line: 4,  text: "    def backtrack(row):" },
  { line: 5,  text: "        nonlocal count" },
  { line: 6,  text: "        if row == n:" },
  { line: 7,  text: "            count += 1; return" },
  { line: 8,  text: "        for col in range(n):" },
  { line: 9,  text: "            if col in cols or (row-col) in diag1 or (row+col) in diag2:" },
  { line: 10, text: "                continue  # under attack" },
  { line: 11, text: "            place queen; add to cols/diag1/diag2" },
  { line: 12, text: "            backtrack(row + 1)" },
  { line: 13, text: "            remove queen; remove from cols/diag1/diag2" },
  { line: 14, text: "    backtrack(0)" },
  { line: 15, text: "    return count" },
];

const EXAMPLES = getExamples('nqueensii');

function generateSteps(n) {
  const steps = [];
  const board = Array.from({ length: n }, () => Array(n).fill("."));
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  let count = 0;

  steps.push({
    activeLine: 3, boardRef: board.map(r => [...r]),
    row: 0, col: -1, phase: "init", solutions: 0,
    message: `Start N-Queens II for n=${n}. Empty board, count=0.`,
  });

  function backtrack(row) {
    if (row === n) {
      count++;
      steps.push({
        activeLine: 7, boardRef: board.map(r => [...r]),
        row, col: -1, phase: "solution", solutions: count,
        message: `✓ Solution #${count} found! Increment count.`,
      });
      return;
    }
    for (let col = 0; col < n; col++) {
      steps.push({
        activeLine: 9, boardRef: board.map(r => [...r]),
        row, col, phase: "check", solutions: count,
        message: `Row ${row}, Col ${col}: check attacks`,
      });
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        steps.push({
          activeLine: 10, boardRef: board.map(r => [...r]),
          row, col, phase: "skip", solutions: count,
          message: `(${row},${col}) under attack — skip`,
        });
        continue;
      }
      board[row][col] = "Q";
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      steps.push({
        activeLine: 11, boardRef: board.map(r => [...r]),
        row, col, phase: "place", solutions: count,
        message: `Place Queen at (${row},${col})`,
      });
      backtrack(row + 1);
      board[row][col] = ".";
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
      steps.push({
        activeLine: 13, boardRef: board.map(r => [...r]),
        row, col, phase: "remove", solutions: count,
        message: `Backtrack: remove Queen from (${row},${col})`,
      });
    }
  }

  backtrack(0);
  steps.push({
    activeLine: 15, boardRef: board.map(r => [...r]),
    row: -1, col: -1, phase: "done", solutions: count, done: true,
    message: `Done! Found ${count} solution(s) for ${n}-Queens II.`,
  });
  return steps;
}

function getAttacked(board, n) {
  const attacked = Array.from({ length: n }, () => Array(n).fill(false));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === "Q") {
        for (let i = 0; i < n; i++) {
          attacked[r][i] = true;
          attacked[i][c] = true;
        }
        for (let d = 1; d < n; d++) {
          [[r+d,c+d],[r+d,c-d],[r-d,c+d],[r-d,c-d]].forEach(([nr,nc]) => {
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) attacked[nr][nc] = true;
          });
        }
      }
    }
  }
  return attacked;
}

// Board visualization panel component
function BoardPanel({ EXAMPLES, ex, n, board, activeRow, activeCol, phase, attacked, step, applyEx }) {
  return (
    <div className="nqii-panel-content">
      <div className="nqii-examples">
        {EXAMPLES.map(e => (
          <button key={e.label} className={`nqii-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="nqii-panel">
        <div className="nqii-panel-label">Board ({n}×{n})</div>
        <div className="nqii-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {board.map((row, r) => row.map((cell, c) => {
            const isActive = r === activeRow && c === activeCol;
            const isQueen = cell === "Q";
            const isAttack = attacked[r][c] && !isQueen;
            const isActiveRow = r === activeRow && !step?.done;
            const isDark = (r + c) % 2 === 1;
            return (
              <motion.div
                key={`${r}-${c}`}
                className={`nqii-cell ${isDark ? "dark" : "light"} ${isQueen ? "queen" : ""} ${isActive && phase === "check" ? "checking" : ""} ${isActive && phase === "place" ? "placing" : ""} ${isActive && phase === "skip" ? "skipping" : ""} ${isAttack && isActiveRow ? "attacked" : ""} ${phase === "solution" ? "solution-flash" : ""}`}
                animate={{ scale: isActive && phase === "place" ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {isQueen ? "♛" : ""}
              </motion.div>
            );
          }))}
        </div>
      </div>

      <div className="nqii-trackers">
        <div className="nqii-tracker">
          <span className="nqii-tracker-label">Row</span>
          <span className="nqii-tracker-val">{activeRow < 0 ? "—" : activeRow}</span>
        </div>
        <div className="nqii-tracker">
          <span className="nqii-tracker-label">Col</span>
          <span className="nqii-tracker-val">{activeCol < 0 ? "—" : activeCol}</span>
        </div>
        <div className="nqii-tracker">
          <span className="nqii-tracker-label">Count</span>
          <motion.span key={step?.solutions} className="nqii-tracker-val nqii-sol" initial={{ scale: 1.4, color: "#a6e3a1" }} animate={{ scale: 1, color: "#cdd6f4" }}>
            {step?.solutions ?? 0}
          </motion.span>
        </div>
        <div className="nqii-tracker">
          <span className="nqii-tracker-label">Phase</span>
          <span className={`nqii-tracker-val nqii-phase ${phase}`}>{phase}</span>
        </div>
      </div>

      {step?.done && (
        <div className="nqii-result">✓ {step.solutions} solution(s) for {n}-Queens II</div>
      )}

      <div className="nqii-status">{step?.message ?? "Press Play to begin."}</div>
    </div>
  );
}

export default function NQueensIIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(4);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 4, inputError: e.message };
    }
  }, [nInput]);
  const steps = useMemo(() => generateSteps(n), [n]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const board = step?.boardRef ?? Array.from({ length: n }, () => Array(n).fill("."));
  const activeRow = step?.row ?? -1;
  const activeCol = step?.col ?? -1;
  const phase = step?.phase ?? "init";
  const attacked = useMemo(() => getAttacked(board, n), [board, n]);

  // Step 3: Extract panel consts
  const boardPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"number"}]}
        values={{ n: nInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
      <BoardPanel
      EXAMPLES={EXAMPLES}
      ex={ex}
      n={n}
      board={board}
      activeRow={activeRow}
      activeCol={activeCol}
      phase={phase}
      attacked={attacked}
      step={step}
      applyEx={applyEx}
    />
    </>
  );

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
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

  const statusPanel = (
    <div className="nqii-status">{step?.message ?? "Press Play to begin."}</div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={NQUEENSII_PATTERNS} />
      )}
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
    </>
  );

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'board', title: 'Board Visualization', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return block
  return (
    <div className="nqii-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.board && createPortal(boardPanel, panelDivs.board)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  );
}

