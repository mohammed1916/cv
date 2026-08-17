import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./FirstBadVersionVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def firstBadVersion(n):" },
  { line: 2, text: "    lo, hi = 1, n" },
  { line: 3, text: "    while lo < hi:" },
  { line: 4, text: "        mid = (lo + hi) // 2" },
  { line: 5, text: "        if isBadVersion(mid):" },
  { line: 6, text: "            hi = mid   # bad version, search left half" },
  { line: 7, text: "        else:" },
  { line: 8, text: "            lo = mid + 1  # good version, search right half" },
  { line: 9, text: "    return lo" },
];

const EXAMPLES = getExamples('first-bad-version');

function generateSteps(n, bad) {
  const steps = [];
  let lo = 1, hi = n;
  let apiCalls = 0;

  steps.push({
    activeLine: 2,
    lo,
    hi,
    mid: null,
    apiResult: null,
    apiCalls,
    message: `Initialize lo=1, hi=${n}. We must find the first bad version.`,
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      activeLine: 4,
      lo,
      hi,
      mid,
      apiResult: null,
      apiCalls,
      message: `Compute mid = (${lo} + ${hi}) // 2 = ${mid}`,
    });

    const isBad = mid >= bad;
    apiCalls++;
    steps.push({
      activeLine: 5,
      lo,
      hi,
      mid,
      apiResult: isBad,
      apiCalls,
      message: `isBadVersion(${mid}) → ${isBad ? "true (bad!)" : "false (good)"}  [API call #${apiCalls}]`,
    });

    if (isBad) {
      hi = mid;
      steps.push({
        activeLine: 6,
        lo,
        hi,
        mid,
        apiResult: isBad,
        apiCalls,
        message: `mid ${mid} is bad → hi = mid = ${hi}. First bad is at or before ${hi}.`,
      });
    } else {
      lo = mid + 1;
      steps.push({
        activeLine: 8,
        lo,
        hi,
        mid,
        apiResult: isBad,
        apiCalls,
        message: `mid ${mid} is good → lo = mid+1 = ${lo}. First bad is after ${mid}.`,
      });
    }
  }

  steps.push({
    activeLine: 9,
    lo,
    hi,
    mid: lo,
    apiResult: null,
    apiCalls,
    result: lo,
    message: `lo == hi == ${lo}. First bad version is ${lo}. Used ${apiCalls} API call${apiCalls !== 1 ? "s" : ""}.`,
  });

  return steps;
}

export default function FirstBadVersionVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(5);
  const [badInput, setBadInput] = useState(4);
  const { n, bad, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      const parsedBad = Number(badInput); if (isNaN(parsedBad)) throw new Error('bad must be a number');
      return { n: parsedN, bad: parsedBad, inputError: '' };
    } catch (e) {
      return { n: 5, bad: 4, inputError: e.message };
    }
  }, [nInput, badInput]);
  const steps = useMemo(() => generateSteps(n, bad), [n, bad]);
  const {
    stepIndex, stepForward, stepBack, togglePlay, handleReset,
    isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); setBadInput(String(e.bad)); handleReset(); }, [handleReset]);;

  const versions = Array.from({ length: n }, (_, i) => i + 1);

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input', dockMode: 'split-top' },
    { id: 'visualization', title: 'Visualization' },
    { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const inputPanel = <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"},{"key":"bad","label":"bad","type":"number"}]}
          values={{ n: nInput, bad: badInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); if (k === 'bad') setBadInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
  />
  const visualizationPanel = <div className="fbv-shell">
      {/* Versions row */}
      <div className="fbv-panel">
        <div className="fbv-panel-label">Versions (1 … {n})</div>
        <div className="fbv-versions">
          {versions.map((v) => {
            const isLo = step?.lo === v;
            const isHi = step?.hi === v;
            const isMid = step?.mid === v;
            const isResult = step?.result === v;
            const inRange =
              step != null && v >= (step.lo ?? 1) && v <= (step.hi ?? n);
            const isActuallyBad = v >= bad;

            let cellCls = "fbv-cell";
            if (isResult) cellCls += " result";
            else if (isMid) {
              cellCls += step.apiResult === true ? " mid-bad" : step.apiResult === false ? " mid-good" : " mid";
            } else if (!inRange && step != null) cellCls += " out";
            else if (isActuallyBad && step != null) cellCls += " bad-hint";

            return (
              <div key={v} className="fbv-cell-col">
                <motion.div
                  className={cellCls}
                  animate={{ opacity: (inRange || isResult || step == null) ? 1 : 0.25 }}
                  transition={{ duration: 0.25 }}
                >
                  {v}
                </motion.div>
                <div className="fbv-cell-ptrs">
                  {isLo && <span className="fbv-ptr lo">lo</span>}
                  {isMid && <span className="fbv-ptr mid">mid</span>}
                  {isHi && <span className="fbv-ptr hi">hi</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="fbv-legend">
          <span className="fbv-legend-dot bad" /> Bad version
          <span className="fbv-legend-dot good" /> Good version
          <span className="fbv-legend-dot mid-bad-dot" /> isBadVersion=true
          <span className="fbv-legend-dot mid-good-dot" /> isBadVersion=false
        </div>
      </div>

      {/* Pointer trackers + API counter */}
      <div className="fbv-trackers">
        {[
          { label: "lo", val: step?.lo ?? 1, cls: "lo" },
          { label: "mid", val: step?.mid != null ? step.mid : "-", cls: "mid" },
          { label: "hi", val: step?.hi ?? n, cls: "hi" },
          { label: "API calls", val: step?.apiCalls ?? 0, cls: "api" },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`fbv-tracker ${cls}`}>
            <span className="fbv-tracker-label">{label}</span>
            <motion.span
              key={String(val)}
              className="fbv-tracker-val"
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              {val}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Result banner */}
      {step?.result != null && (
        <motion.div
          className="fbv-result"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          First bad version: {step.result} &nbsp;|&nbsp; {step.apiCalls} API call{step.apiCalls !== 1 ? "s" : ""}
        </motion.div>
      )}

  </div>
  const codePanel = <>
    <div className="fbv-status">{step?.message ?? "Press Play or Step to begin."}</div>
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
  </>
  return (
    <>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
      {panelDivs && <>
        {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
        {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
        {panelDivs.code && createPortal(codePanel, panelDivs.code)}
      </>}
      <FloatingPanel title="Playback Controls">
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
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </>
  );
}
