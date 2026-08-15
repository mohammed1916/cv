import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import GridRayOverlay from "../../components/shared/GridRayOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useGridRayOverlay } from "../../hooks/useGridRayOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./NQueensVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const NQUEENS_PATTERNS = ['init', 'check', 'place', 'skip', 'remove', 'solution']

const LINE_PATTERN_MAP = {
  5: 'solution',
  6: 'check',
  7: 'check',
  8: 'skip',
  9: 'place',
  10: 'place',
  11: 'remove',
}

const SOLUTION_CODE = [
  { line: 1,  text: "def solveNQueens(n):" },
  { line: 2,  text: "    cols, diag1, diag2 = set(), set(), set()" },
  { line: 3,  text: "    board = [['.']*n for _ in range(n)]" },
  { line: 4,  text: "    def backtrack(row):" },
  { line: 5,  text: "        if row == n: solutions.append(board_copy())" },
  { line: 6,  text: "        for col in range(n):" },
  { line: 7,  text: "            if col in cols or (row-col) in diag1 or (row+col) in diag2:" },
  { line: 8,  text: "                continue  # under attack" },
  { line: 9,  text: "            place queen; add to cols/diag1/diag2" },
  { line: 10, text: "            backtrack(row + 1)" },
  { line: 11, text: "            remove queen; remove from cols/diag1/diag2" },
];

const EXAMPLES = getExamples('nqueens');

function generateSteps(n) {
  const steps = [];
  const board = Array.from({ length: n }, () => Array(n).fill("."));
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  const solutions = [];

  steps.push({
    activeLine: 2, boardRef: board.map(r => [...r]),
    row: 0, col: -1, phase: "init", solutions: 0,
    message: `Start N-Queens for n=${n}. Empty board.`,
  });

  function backtrack(row) {
    if (row === n) {
      solutions.push(board.map(r => [...r])); // Keep this copy for solutions storage (algo correctness)
      steps.push({
        activeLine: 5, boardRef: board.map(r => [...r]),
        row, col: -1, phase: "solution", solutions: solutions.length,
        message: `✓ Solution #${solutions.length} found!`,
      });
      return;
    }
    for (let col = 0; col < n; col++) {
      steps.push({
        activeLine: 7, boardRef: board.map(r => [...r]),
        row, col, phase: "check", solutions: solutions.length,
        message: `Row ${row}, Col ${col}: check attacks`,
      });
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        steps.push({
          activeLine: 8, boardRef: board.map(r => [...r]),
          row, col, phase: "skip", solutions: solutions.length,
          message: `(${row},${col}) under attack — skip`,
        });
        continue;
      }
      board[row][col] = "Q";
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      steps.push({
        activeLine: 9, boardRef: board.map(r => [...r]),
        row, col, phase: "place", solutions: solutions.length,
        message: `Place Queen at (${row},${col})`,
      });
      backtrack(row + 1);
      board[row][col] = ".";
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
      steps.push({
        activeLine: 11, boardRef: board.map(r => [...r]),
        row, col, phase: "remove", solutions: solutions.length,
        message: `Backtrack: remove Queen from (${row},${col})`,
      });
    }
  }

  backtrack(0);
  steps.push({
    activeLine: 1, boardRef: board.map(r => [...r]),
    row: -1, col: -1, phase: "done", solutions: solutions.length, done: true,
    message: `Done! Found ${solutions.length} solution(s) for n=${n}.`,
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

function getAttackers(board, n, row, col) {
  if (row < 0 || col < 0) return [];
  const attackers = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] !== "Q" || (r === row && c === col)) continue;
      if (r === row) attackers.push({ r, c, type: "row" });
      else if (c === col) attackers.push({ r, c, type: "col" });
      else if (Math.abs(r - row) === Math.abs(c - col)) attackers.push({ r, c, type: "diag" });
    }
  }
  return attackers;
}

const ATTACK_COLORS = { row: "#89b4fa", col: "#fab387", diag: "#f38ba8" };

// Board visualization panel component
function BoardPanel({ EXAMPLES, ex, n, board, activeRow, activeCol, phase, attacked, attackers, step, applyEx }) {
  const { gridRef: boardRef, gridSize, getCellCenter } = useGridRayOverlay();

  const showRays = (phase === "check" || phase === "skip") && activeRow >= 0 && activeCol >= 0 && attackers.length > 0;
  const targetCenter = showRays ? getCellCenter(activeRow, activeCol) : null;
  const rays = (showRays && targetCenter)
    ? attackers
        .map((a, i) => {
          const from = getCellCenter(a.r, a.c);
          if (!from) return null;
          return {
            key: `${step?.activeLine}-${activeRow}-${activeCol}-${a.r}-${a.c}-${i}`,
            from,
            to: targetCenter,
            color: ATTACK_COLORS[a.type],
          };
        })
        .filter(Boolean)
    : [];

  return (
    <div className="nq-panel-content">
      <div className="nq-examples">
        {EXAMPLES.map(e => (
          <button key={e.label} className={`nq-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="nq-panel">
        <div className="nq-panel-label">Board ({n}×{n})</div>
        <div className="nq-board-wrap" style={{ maxWidth: 320 }}>
          <div className="nq-board" ref={boardRef} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {board.map((row, r) => row.map((cell, c) => {
              const isActive = r === activeRow && c === activeCol;
              const isQueen = cell === "Q";
              const isAttack = attacked[r][c] && !isQueen;
              const isActiveRow = r === activeRow && !step?.done;
              const isDark = (r + c) % 2 === 1;
              const isAttacker = showRays && attackers.some(a => a.r === r && a.c === c);
              return (
                <motion.div
                  key={`${r}-${c}`}
                  data-cell={`${r}-${c}`}
                  className={`nq-cell ${isDark ? "dark" : "light"} ${isQueen ? "queen" : ""} ${isActive && phase === "check" ? "checking" : ""} ${isActive && phase === "place" ? "placing" : ""} ${isActive && phase === "skip" ? "skipping" : ""} ${isAttack && isActiveRow ? "attacked" : ""} ${phase === "solution" ? "solution-flash" : ""} ${isAttacker ? "attacker" : ""}`}
                  animate={{ scale: isActive && phase === "place" ? 1.15 : isAttacker ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {isQueen ? "♛" : ""}
                </motion.div>
              );
            }))}
          </div>
          <GridRayOverlay gridSize={gridSize} rays={rays} />
        </div>
      </div>

      <div className="nq-trackers">
        <div className="nq-tracker">
          <span className="nq-tracker-label">Row</span>
          <span className="nq-tracker-val">{activeRow < 0 ? "—" : activeRow}</span>
        </div>
        <div className="nq-tracker">
          <span className="nq-tracker-label">Col</span>
          <span className="nq-tracker-val">{activeCol < 0 ? "—" : activeCol}</span>
        </div>
        <div className="nq-tracker">
          <span className="nq-tracker-label">Solutions</span>
          <motion.span key={step?.solutions} className="nq-tracker-val nq-sol" initial={{ scale: 1.4, color: "#a6e3a1" }} animate={{ scale: 1, color: "#cdd6f4" }}>
            {step?.solutions ?? 0}
          </motion.span>
        </div>
        <div className="nq-tracker">
          <span className="nq-tracker-label">Phase</span>
          <span className={`nq-tracker-val nq-phase ${phase}`}>{phase}</span>
        </div>
      </div>

      {step?.done && (
        <div className="nq-result">✓ {step.solutions} solution(s) for {n}-Queens</div>
      )}

      <div className="nq-status">{step?.message ?? "Press Play to begin."}</div>
    </div>
  );
}

export default function NQueensVisualizer() {
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
  const attackers = useMemo(() => getAttackers(board, n, activeRow, activeCol), [board, n, activeRow, activeCol]);

  // Extract panels into consts (before return)
  const primaryPanel = (
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
    <BoardPanel EXAMPLES={EXAMPLES} ex={ex} n={n} board={board} activeRow={activeRow} activeCol={activeCol} phase={phase} attacked={attacked} attackers={attackers} step={step} applyEx={applyEx} />
  
    </>);

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} disableResizer />
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
    <div className="nq-status">{step?.message ?? "Press Play to begin."}</div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={NQUEENS_PATTERNS} />
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

  // State + config for Lumino
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Board Visualization', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="nq-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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

