import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../../components/shared/DockableWorkspace";
import FloatingPanel from "../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./LengthOfLastWordVisualizer.css";

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
  const steps = useMemo(() => generateSteps(ex.s), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const chars = ex.s.split("");
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

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '📝 Last Word',
      content: (
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
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, chars, i, length, phase, lastWordEnd]);

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}
