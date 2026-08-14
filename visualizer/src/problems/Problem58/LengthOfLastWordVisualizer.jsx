import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./LengthOfLastWordVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
const SOLUTION_CODE = [
  { line: 1, text: "def lengthOfLastWord(s):" },
  { line: 2, text: "    i = len(s) - 1" },
  { line: 3, text: "    while s[i] == ' ':  # skip trailing spaces" },
  { line: 4, text: "        i -= 1" },
  { line: 5, text: "    length = 0" },
  { line: 6, text: "    while i >= 0 and s[i] != ' ':" },
  { line: 7, text: "        length += 1" },
  { line: 8, text: "        i -= 1" },
  { line: 9, text: "    return length" },
];

const LENGTHOFLASTWORD_PATTERNS = ['count', 'done', 'init', 'skip'];

const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'skip',
  4: 'skip',
  5: 'count',
  6: 'count',
  7: 'count',
  8: 'count',
  9: 'done',
};

const EXAMPLES = getExamples('length-of-last-word');

function generateSteps(sIn) {
  const steps = [];
  const chars = sIn.split("");
  let i = chars.length - 1;
  steps.push({ activeLine: 2, i, length: 0, phase: "init", message: `Start at i=${i} (rightmost char)` });

  // skip trailing spaces
  while (i >= 0 && chars[i] === " ") {
    steps.push({ activeLine: 3, i, length: 0, phase: "skip", message: `s[${i}]=' ' (space) — skip` });
    i--;
    steps.push({ activeLine: 4, i, length: 0, phase: "skip", message: `i-- → i=${i}` });
  }
  steps.push({ activeLine: 5, i, length: 0, phase: "count", message: `First non-space at i=${i}: '${chars[i] ?? ""}'. Init length=0` });

  let length = 0;
  while (i >= 0 && chars[i] !== " ") {
    steps.push({ activeLine: 6, i, length, phase: "count", message: `s[${i}]='${chars[i]}' ≠ space → count` });
    length++;
    steps.push({ activeLine: 7, i, length, phase: "count", message: `length++ → ${length}` });
    i--;
    steps.push({ activeLine: 8, i, length, phase: "count", message: `i-- → ${i}` });
  }
  steps.push({ activeLine: 9, i, length, phase: "done", done: true, message: `Return ${length}` });
  return steps;
}

export default function LengthOfLastWordVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("Hello World");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "Hello World", inputError: e.message };
    }
  }, [sInput]);
  const steps = useMemo(() => generateSteps(s), [s]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); handleReset(); }, [handleReset]);;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const chars = s.split("");
  const i = step?.i ?? chars.length - 1;
  const length = step?.length ?? 0;
  const phase = step?.phase ?? "init";

  const lastWordEnd = (() => {
    let j = chars.length - 1;
    while (j >= 0 && chars[j] === " ") j--;
    let end = j;
    while (j >= 0 && chars[j] !== " ") j--;
    return { start: j + 1, end };
  })();

  // Extract panels into consts
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
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

  const primaryPanel = (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map(e => (
          <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>
            {e.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Characters</div>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {chars.map((ch, idx) => {
          const isActive = idx === i;
          const isDoneHighlight = phase === "done" && idx >= lastWordEnd.start && idx <= lastWordEnd.end;
          const isSpace = ch === " ";
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <motion.div animate={{ scale: isActive ? 1.2 : 1 }} style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isDoneHighlight ? '#dcfce7' : isActive ? '#fbbf24' : '#f3f4f6',
                border: isActive ? '2px solid #f59e0b' : isDoneHighlight ? '2px solid #86efac' : '1px solid #cbd5e1',
                borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b'
              }}>
                {isSpace ? '·' : ch}
              </motion.div>
              <span style={{ fontSize: 10, color: '#64748b' }}>{idx}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>i</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{i < 0 ? '-1' : i}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>length</div>
          <motion.div key={length} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={{ fontSize: 13, fontWeight: 'bold', color: '#0ea5e9' }}>
            {length}
          </motion.div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>phase</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{phase}</div>
        </div>
      </div>

      {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ Length = {length}</div>}
    </div>
  
    </>);

  const statusPanel = (
    <div className="lw-status">
      {step?.message || 'Ready'}
    </div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={LENGTHOFLASTWORD_PATTERNS} />
      )}
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
        onSpeedChange={e => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'primary', title: '📝 Last Word', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="lw-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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

