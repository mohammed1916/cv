import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./EditDistanceVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const EDITDISTANCE_PATTERNS = ['init', 'match', 'mismatch']

const LINE_PATTERN_MAP = {
  4: 'init',
  9: 'match',
  11: 'mismatch',
  14: 'init',
}
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
  { line: 11, text: "                dp[i][j] = 1 + min(dp[i-1][j],   # delete" },
  { line: 12, text: "                               dp[i][j-1],   # insert" },
  { line: 13, text: "                               dp[i-1][j-1]) # replace" },
  { line: 14, text: "    return dp[m][n]" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('edit-distance');

function DPTablePanel({ step, ex, dpTable, maxVal }) {
  return step && (
    <div className="ed-panel">
      <div className="ed-panel-label">DP Table</div>
      <div className="ed-table-wrap">
        <table className="ed-table">
          <thead>
            <tr>
              <th className="ed-th corner"></th>
              <th className="ed-th">ε</th>
              {w2.split("").map((c, j) => <th key={j} className="ed-th w2ch">{c}</th>)}
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
                    <motion.td key={j}
                      className={`ed-td ${isCur ? "cur" : val === 0 ? "zero" : ""}`}
                      animate={{ scale: isCur ? 1.25 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      style={{ background: isCur ? undefined : `rgba(137,180,250,${intensity * 0.35})` }}
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

function InputPanel({ EXAMPLES, ex, applyEx, step }) {
  return (
    <div className="ed-input-panel">
      <div className="ed-examples">
        {EXAMPLES.map((e) => (
          <button key={e.label} className={`ed-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>{e.label}</button>
        ))}
      </div>

      <div className="ed-strings">
        <span className="ed-lbl w1">word1:</span><span className="ed-val">{w1 || '""'}</span>
        <span className="ed-lbl w2">word2:</span><span className="ed-val">{w2 || '""'}</span>
      </div>

      <div className="ed-status">{step?.message ?? "Press Play to begin."}</div>
    </div>
  );
}

function generateSteps(w1, w2) {
  const m = w1.length, n = w2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  const steps = [];

  steps.push({ phase: 'init', activeLine: 4, dpRef: dp, curI: 0, curJ: 0, message: `Init base cases: dp[i][0]=i (delete all), dp[0][j]=j (insert all)` });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = w1[i - 1] === w2[j - 1];
      if (match) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push({ phase: 'match', activeLine: 9, dpRef: dp, curI: i, curJ: j, message: `w1[${i-1}]="${w1[i-1]}"==w2[${j-1}]="${w2[j-1]}": dp[${i}][${j}]=dp[${i-1}][${j-1}]=${dp[i][j]}` });
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        steps.push({ phase: 'mismatch', activeLine: 11, dpRef: dp, curI: i, curJ: j, message: `w1[${i-1}]="${w1[i-1]}"≠w2[${j-1}]="${w2[j-1]}": dp[${i}][${j}]=1+min(${dp[i-1][j]},${dp[i][j-1]},${dp[i-1][j-1]})=${dp[i][j]}` });
      }
    }
  }
  steps.push({ phase: 'init', activeLine: 14, dpRef: dp, curI: m, curJ: n, message: `Result: dp[${m}][${n}] = ${dp[m][n]}` });
  return steps;
}

export default function EditDistanceVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [w1Input, setW1Input] = useState("horse");
  const [w2Input, setW2Input] = useState("ros");
  const { w1, w2, inputError } = useMemo(() => {
    try {
      const parsedW1 = w1Input;
      const parsedW2 = w2Input;
      return { w1: parsedW1, w2: parsedW2, inputError: '' };
    } catch (e) {
      return { w1: "horse", w2: "ros", inputError: e.message };
    }
  }, [w1Input, w2Input]);
  const steps = useMemo(() => generateSteps(w1, w2), [w1, w2]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setW1Input(String(e.w1)); setW2Input(String(e.w2)); handleReset(); }, [handleReset]);;
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const dpTable = step ? step.dpRef : Array.from({ length: w1.length + 1 }, () => Array.from({ length: w2.length + 1 }, () => 0));
  const maxVal = useMemo(() => {
    return step ? Math.max(...dpTable.flat()) : 1;
  }, [step?.dp, dpTable]);

  // Step 3: Extract panels into consts
  const inputPanel = (
    <div className="ed-panel">
      <InputPanel EXAMPLES={EXAMPLES} ex={ex} applyEx={applyEx} step={step} />
    </div>
  );

  const tablePanel = (
    <div className="ed-panel">
      <DPTablePanel step={step} ex={ex} dpTable={dpTable} maxVal={maxVal} />
    </div>
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
    <div className="ed-status-panel">
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={EDITDISTANCE_PATTERNS} />
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
    </div>
  );

  // Step 4: Add panelConfigs and panel ready handler
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'input', title: 'Input', dockMode: 'split-right' },
      { id: 'table', title: 'DP Table', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return with portals
  return (
    <div className="ed-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.table && createPortal(tablePanel, panelDivs.table)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls" />,
        document.body
      )}
    </div>
  );
}

