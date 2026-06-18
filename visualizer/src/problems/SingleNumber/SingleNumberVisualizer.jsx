import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useSolutionCode } from "../../hooks/useSolutionCode";
import { getExamples } from '../../config/examplesRegistry'
import "./SingleNumberVisualizer.css";

const EXAMPLES = getExamples('single-number');

function toBin(n, bits = 4) {
  return (n >>> 0).toString(2).padStart(bits, "0");
}

function generateSteps(nums) {
  const steps = [];
  let result = 0;
  const eliminated = new Set();
  steps.push({ activeLine: 2, result, cur: -1, message: "Init result = 0", eliminated: new Set() });
  for (let i = 0; i < nums.length; i++) {
    const prev = result;
    result ^= nums[i];
    if (result === 0 && prev !== 0) {
      eliminated.add(i);
    }
    steps.push({
      activeLine: 4, result, prev, cur: i,
      message: `result(${toBin(prev)}) XOR ${nums[i]}(${toBin(nums[i])}) = ${result}(${toBin(result)})`,
      eliminated: new Set(eliminated)
    });
  }
  steps.push({ activeLine: 5, result, cur: -1, done: true, message: `Return ${result} — the single number`, eliminated });
  return steps;
}

function CollisionVisualization({ nums, step }) {
  const currentI = step?.cur ?? -1;
  const eliminated = step?.eliminated ?? new Set();
  const remaining = nums.filter((_, i) => !eliminated.has(i) && i !== currentI);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Array with collision effects */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Active Elements</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 60 }}>
          <AnimatePresence>
            {nums.map((val, idx) => {
              if (eliminated.has(idx)) return null;
              const isCur = idx === currentI;

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    backgroundColor: isCur ? '#fbbf24' : '#dbeafe',
                    border: isCur ? '3px solid #f59e0b' : '2px solid #0ea5e9',
                    color: isCur ? '#78350f' : '#1e3a8a',
                    boxShadow: isCur ? '0 0 12px rgba(245, 158, 11, 0.5)' : 'none'
                  }}
                >
                  {val}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Result accumulator */}
      <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 8, border: '2px solid #0ea5e9' }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Accumulated Result (XOR)</div>
        <div style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#0ea5e9',
          fontFamily: 'monospace'
        }}>
          {step?.result ?? 0}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
          Binary: {toBin(step?.result ?? 0, 8)}
        </div>
      </div>

      {/* Eliminated pairs */}
      {eliminated.size > 0 && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 12, color: '#65a30d', marginBottom: 8 }}>Cancelled Out</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from(eliminated).map(idx => (
              <div
                key={idx}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  fontSize: 12,
                  color: '#15803d'
                }}
              >
                {nums[idx]} ✓
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VisualizationPanel({ nums, step, applyEx }) {
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

      <CollisionVisualization nums={nums} step={step} />
    </div>
  );
}

export default function SingleNumberVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const SOLUTION_CODE = useSolutionCode('single-number');
  const steps = useMemo(
    () =>
      generateSteps(ex.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex],
  );
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

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
      title: '🎭 XOR Collision',
      content: (
        <VisualizationPanel
          nums={ex.nums}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx]);

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
