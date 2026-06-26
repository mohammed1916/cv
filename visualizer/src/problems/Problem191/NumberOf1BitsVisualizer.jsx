import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./NumberOf1BitsVisualizer.css";

const SOLUTION_CODE = [
  { line: 1, text: "def hammingWeight(n):" },
  { line: 2, text: "    count = 0" },
  { line: 3, text: "    while n != 0:" },
  { line: 4, text: "        count += n & 1  # check LSB" },
  { line: 5, text: "        n >>= 1        # shift right" },
  { line: 6, text: "    return count" },
];

const EXAMPLES = getExamples('number-of1-bits');

function toBin32(n) {
  return (n >>> 0).toString(2).padStart(32, "0");
}

function generateSteps(nIn) {
  const steps = [];
  let n = nIn >>> 0;
  let count = 0;
  steps.push({ activeLine: 2, n, count, lsb: null, shift: false, message: `Init: n = ${toBin32(n)}, count = 0` });
  while (n !== 0) {
    const lsb = n & 1;
    steps.push({ activeLine: 4, n, count, lsb, shift: false, message: `LSB = ${n} & 1 = ${lsb} → count + ${lsb} = ${count + lsb}` });
    count += lsb;
    steps.push({ activeLine: 5, n, count, lsb, shift: true, message: `Shift right: n = ${toBin32(n)} >> 1 = ${toBin32(n >>> 1)}` });
    n = n >>> 1;
    steps.push({ activeLine: 3, n, count, lsb: null, shift: false, message: `n = ${toBin32(n)}, count = ${count}` });
  }
  steps.push({ activeLine: 6, n, count, lsb: null, shift: false, done: true, message: `Result: ${count} set bit(s)` });
  return steps;
}

export default function NumberOf1BitsVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.n), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const displayN = step?.n ?? (ex.n >>> 0);
  const count = step?.count ?? 0;
  const lsb = step?.lsb;
  const bin = toBin32(displayN);

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
      title: '📈 Bit Counter',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map(e => (
                <button
                  key={e.label}
                  onClick={() => applyEx(e)}
                  style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: 13 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {bin.split("").map((bit, idx) => (
                <motion.div
                  key={idx}
                  animate={{ scale: idx === 31 && lsb !== null ? 1.3 : 1 }}
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bit === '1' ? '#dbeafe' : '#f3f4f6',
                    border: idx === 31 && lsb !== null ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    color: bit === '1' ? '#1e3a8a' : '#9ca3af'
                  }}
                >
                  {bit}
                </motion.div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>32-bit representation (LSB rightmost)</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac' }}>
              <div style={{ fontSize: 11, color: '#65a30d', marginBottom: 4 }}>Count</div>
              <motion.div key={count} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={{ fontSize: 24, fontWeight: 'bold', color: '#15803d' }}>
                {count}
              </motion.div>
            </div>
            <div style={{ padding: 12, backgroundColor: lsb === 1 ? '#dbeafe' : '#f3f4f6', borderRadius: 6, border: lsb === 1 ? '2px solid #0ea5e9' : '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>LSB (n & 1)</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={lsb === null ? 'none' : lsb}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 24, fontWeight: 'bold', color: lsb === 1 ? '#0ea5e9' : '#94a3b8' }}
                >
                  {lsb === null ? '—' : lsb}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {step?.done && (
            <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>
              ✓ Hamming weight = {count}
            </div>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, bin, count, lsb, applyEx]);

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
