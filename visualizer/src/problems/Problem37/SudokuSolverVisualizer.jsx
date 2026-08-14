import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./SudokuSolverVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel';
import LuminoDockPanel from '../../components/LuminoDockPanel';

const SUDOKUSOLVER_PATTERNS = ['backtrack', 'done', 'init', 'place', 'recurse', 'skip']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  13: 'skip',
  14: 'place',
  15: 'recurse',
  16: 'backtrack',
  18: 'done',
}

const SOLUTION_CODE = [
  { line: 1,  text: "def solveSudoku(board):" },
  { line: 2,  text: "    def is_valid(r, c, d):" },
  { line: 3,  text: "        if d in board[r]: return False" },
  { line: 4,  text: "        if d in [board[i][c] for i in range(9)]: return False" },
  { line: 5,  text: "        br, bc = 3*(r//3), 3*(c//3)" },
  { line: 6,  text: "        if d in [board[br+i][bc+j] ...]: return False" },
  { line: 7,  text: "        return True" },
  { line: 8,  text: "    def backtrack():" },
  { line: 9,  text: "        for r in range(9):" },
  { line: 10, text: "            for c in range(9):" },
  { line: 11, text: "                if board[r][c] != '.': continue" },
  { line: 12, text: "                for d in '123456789':" },
  { line: 13, text: "                    if is_valid(r, c, d):" },
  { line: 14, text: "                        board[r][c] = d" },
  { line: 15, text: "                        if backtrack(): return True" },
  { line: 16, text: "                        board[r][c] = '.'  # undo" },
  { line: 17, text: "                return False" },
  { line: 18, text: "        return True  # all filled" },
];

const EXAMPLES = getExamples('sudoku-solver');

function generateSteps(initBoard) {
  const steps = [];
  const board = initBoard.map(r => [...r]); // Init copy only
  const initialDots = new Set();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === ".") initialDots.add(`${r},${c}`);

  function isValid(r, c, d) {
    for (let i = 0; i < 9; i++) if (board[r][i] === d || board[i][c] === d) return false;
    const br = 3 * Math.floor(r / 3), bc = 3 * Math.floor(c / 3);
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) if (board[br+dr][bc+dc] === d) return false;
    return true;
  }

  function backtrack() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== ".") continue;
        for (let d = 1; d <= 9; d++) {
          const ch = String(d);
          const valid = isValid(r, c, ch);
          steps.push({
            activeLine: valid ? 14 : 13,
            board, activeR: r, activeC: c, tryDigit: ch,
            phase: valid ? "place" : "skip",
            message: valid ? `Place '${ch}' at [${r},${c}]` : `'${ch}' invalid at [${r},${c}]`,
          });
          if (valid) {
            board[r][c] = ch;
            steps.push({
              activeLine: 15,
              board, activeR: r, activeC: c, tryDigit: ch,
              phase: "recurse",
              message: `Placed '${ch}' at [${r},${c}], recurse…`,
            });
            if (backtrack()) return true;
            board[r][c] = ".";
            steps.push({
              activeLine: 16,
              board, activeR: r, activeC: c, tryDigit: ch,
              phase: "backtrack",
              message: `Backtrack: remove '${ch}' from [${r},${c}]`,
            });
          }
        }
        return false;
      }
    }
    return true;
  }

  steps.push({ activeLine: 1, board, activeR: -1, activeC: -1, phase: "init", message: "Starting backtracking solver…" });
  backtrack();
  steps.push({ activeLine: 18, board, activeR: -1, activeC: -1, phase: "done", done: true, message: "Sudoku solved!" });
  return steps;
}

export default function SudokuSolverVisualizer() {
  const [ex] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.board), [ex]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const board = step?.board ?? ex.board;
  const activeR = step?.activeR ?? -1;
  const activeC = step?.activeC ?? -1;
  const phase = step?.phase ?? "init";

  // Pre-compute which cells were originally empty (mutable cells)
  const originalDots = useMemo(() => {
    const s = new Set();
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (ex.board[r][c] === ".") s.add(`${r},${c}`);
    return s;
  }, [ex]);

  // Step 3: Extract panels into consts
  const primaryPanel = (
    <div className="su-panel">
      <div className="su-panel-label">Sudoku Board</div>
      <div className="su-grid">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isActive = r === activeR && c === activeC;
            const isMutable = originalDots.has(`${r},${c}`);
            const boxBorderR = (r + 1) % 3 === 0 && r !== 8;
            const boxBorderC = (c + 1) % 3 === 0 && c !== 8;
            return (
              <motion.div
                key={`${r}-${c}`}
                className={[
                  "su-cell",
                  isMutable ? "mutable" : "fixed",
                  isActive ? `active-${phase}` : "",
                  boxBorderR ? "box-border-r" : "",
                  boxBorderC ? "box-border-c" : "",
                ].join(" ")}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {cell === "." ? "" : cell}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );

  const statePanel = (
    <div className="su-panel">
      <div className="su-panel-label">State</div>
      <div className="su-trackers">
        <div className="su-tracker">
          <span className="su-tracker-label">Cell</span>
          <span className="su-tracker-val">{activeR < 0 ? "—" : `[${activeR},${activeC}]`}</span>
        </div>
        <div className="su-tracker">
          <span className="su-tracker-label">Trying</span>
          <span className="su-tracker-val su-digit">{step?.tryDigit ?? "—"}</span>
        </div>
        <div className="su-tracker">
          <span className="su-tracker-label">Phase</span>
          <span className={`su-tracker-val su-phase ${phase}`}>{phase}</span>
        </div>
        <div className="su-tracker">
          <span className="su-tracker-label">Steps</span>
          <span className="su-tracker-val su-small">{stepIndex < 0 ? 0 : stepIndex + 1}/{steps.length}</span>
        </div>
      </div>
      {step?.done && <div className="su-result">✓ Sudoku Solved!</div>}
    </div>
  );

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
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

  const statusPanel = (
    <div className="su-status">{step?.message ?? "Press Play to begin."}</div>
  );

  const playbackPanel = (
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={SUDOKUSOLVER_PATTERNS} />
      )}
      <PlaybackControls
        isPlaying={isPlaying} isDone={isDone} speed={speed}
        onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
        prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
        onSpeedChange={e => setSpeed(Number(e.target.value))}
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
      { id: 'primary', title: 'Sudoku Board', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return block with portals
  return (
    <div className="su-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
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
