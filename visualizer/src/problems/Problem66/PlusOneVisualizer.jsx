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
import "./PlusOneVisualizer.css";
const EXAMPLES = getExamples('plus-one');

function generateSteps(digIn) {
    const steps = [];
    const arr = [...digIn];
    steps.push({ activeLine: 1, arr: [...arr], i: -1, carry: false, message: `Start: [${arr.join(", ")}] + 1` });
    for (let i = arr.length - 1; i >= 0; i--) {
        steps.push({ activeLine: 3, arr: [...arr], i, carry: false, message: `i=${i}: digits[${i}] = ${arr[i]}` });
        if (arr[i] < 9) {
            arr[i] += 1;
            steps.push({ activeLine: 4, arr: [...arr], i, carry: false, message: `digits[${i}] < 9 → increment to ${arr[i]}` });
            steps.push({ activeLine: 5, arr: [...arr], i, carry: false, done: true, message: `Return [${arr.join(", ")}]` });
            return steps;
        }
        arr[i] = 0;
        steps.push({ activeLine: 6, arr: [...arr], i, carry: true, message: `digits[${i}] = 9 → set to 0, carry` });
    }
    const result = [1, ...arr];
    steps.push({ activeLine: 7, arr: result, i: -1, carry: false, done: true, message: `All digits were 9 → prepend 1: [${result.join(", ")}]` });
    return steps;
}

function DominoChainVisualization({ arr, step, ex }) {
  const activeI = step?.i ?? -1;
  const carry = step?.carry ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Domino chain */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center', minHeight: 120 }}>
        <AnimatePresence>
          {arr.map((d, idx) => {
            const isActive = idx === activeI;
            const isNew = idx === 0 && arr.length > ex.digits.length;
            const isFalling = isActive && carry;

            return (
              <motion.div
                key={`${idx}-${d}`}
                layout
                initial={isNew ? { opacity: 0, x: -40, y: 40 } : undefined}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: isFalling ? -30 : isActive ? -20 : 0,
                  rotateZ: isFalling ? 15 : 0,
                  scale: isActive ? 1.25 : 1
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 50,
                  height: 70,
                  backgroundColor: isNew ? '#10b981' : isFalling ? '#f59e0b' : isActive ? '#3b82f6' : '#dbeafe',
                  border: isActive ? '3px solid #0ea5e9' : '2px solid #cbd5e1',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: isNew ? 'white' : '#1e3a8a',
                  boxShadow: isActive ? '0 8px 16px rgba(59, 130, 246, 0.3)' : 'none',
                  cursor: 'default'
                }}
              >
                {d}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Carry cascade effect */}
      {carry && activeI >= 0 && (
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ fontSize: 12, color: '#f59e0b', fontWeight: 'bold' }}
          >
            ⬇️ Carry cascading...
          </motion.div>
        </div>
      )}

      {/* Status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Current Index</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0ea5e9' }}>
            {activeI < 0 ? '—' : activeI}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: carry ? '#fef3c7' : '#f3f4f6',
          borderRadius: 6,
          border: carry ? '1px solid #fcd34d' : '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: carry ? '#92400e' : '#64748b', marginBottom: 4 }}>Carry</div>
          <motion.div
            key={String(carry)}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: carry ? '#f59e0b' : '#9ca3af'
            }}
          >
            {carry ? '🔗' : '—'}
          </motion.div>
        </div>
      </div>

      {/* Result */}
      {step?.done && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac' }}>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ Result</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#15803d', marginTop: 6 }}>
            [{arr.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
}

function VisualizationPanel({ arr, step, ex, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <DominoChainVisualization arr={arr} step={step} ex={ex} />
    </div>
  );
}

export default function PlusOneVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => generateSteps(ex.digits), [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const arr = step?.arr ?? ex.digits;

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
        title: '🧮 Domino Chain',
        content: (
          <VisualizationPanel
            arr={arr}
            step={step}
            ex={ex}
            applyEx={applyEx}
          />
        ),
      },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, arr, ex, applyEx]);

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

