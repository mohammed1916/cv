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

import { NQUEENSII_PATTERNS, LINE_PATTERN_MAP, SOLUTION_CODE, generateSteps } from './algorithm';
const EXAMPLES = getExamples('nqueensii');

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
          <motion.span key={step?.solutions} className="nqii-tracker-val nqii-sol" initial={{ scale: 1.4, color: "#2f8628" }} animate={{ scale: 1, color: "#4f6ed8" }}>
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
      const parsedN = Number(nInput); if (!Number.isInteger(parsedN) || parsedN < 1 || parsedN > 9) throw new Error('Use an integer n from 1 to 9.');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 4, inputError: e.message };
    }
  }, [nInput]);
  const steps = useMemo(() => inputError ? [] : generateSteps(n), [n, inputError]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);
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
      {steps.truncated && <p role="status">All solutions are counted. Playback shows the first 12,000 events, then the final count; use a smaller n to inspect every event.</p>}
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
      <CodeTracePanel playgroundInput={{ n }} playgroundDisabled={Boolean(inputError)}
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
        <PatternLegend currentPhase={step?.phase} usedPatterns={NQUEENSII_PATTERNS} />
      )}
    </>
  );

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'board', title: 'Board Visualization', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
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

