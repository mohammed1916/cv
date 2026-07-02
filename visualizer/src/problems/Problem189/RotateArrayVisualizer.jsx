import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./RotateArrayVisualizer.css";
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('rotate-array')

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('rotate-array');

function generateSteps(inputNums, inputK) {
  const steps = [];
  const nums = [...inputNums];
  const n = nums.length;
  const k = ((inputK % n) + n) % n;

  steps.push({
    activeLine: 2, nums: [...nums], lo: -1, hi: -1, phase: "start", rotation: 0,
    message: `k = ${inputK} % ${n} = ${k}`
  });

  function revSteps(lo0, hi0, label) {
    let lo = lo0, hi = hi0;
    steps.push({
      activeLine: label === "all" ? 7 : label === "first" ? 8 : 9, nums: [...nums], lo, hi,
      phase: label, rotation: 0, message: `Reverse ${label} [${lo}..${hi}]`
    });
    while (lo < hi) {
      [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
      steps.push({
        activeLine: 5, nums: [...nums], lo, hi, phase: label, rotation: 0,
        message: `Swap nums[${lo}]↔nums[${hi}]`
      });
      lo++; hi--;
    }
  }

  revSteps(0, n - 1, "all");
  revSteps(0, k - 1, "first");
  revSteps(k, n - 1, "rest");

  const finalRotation = (k / n) * 360;
  steps.push({
    activeLine: 9, nums: [...nums], lo: -1, hi: -1, phase: "done", rotation: finalRotation,
    message: `Complete! Rotated by ${k} positions`
  });
  return steps;
}

function CarouselVisualization({ nums, step, n, k }) {
  const rotation = step?.rotation ?? 0;
  const radius = Math.min(150, Math.max(80, nums.length * 20));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <svg width="360" height="360" viewBox="0 0 360 360" style={{ border: '2px solid #e2e8f0', borderRadius: 8 }}>
        <circle cx="180" cy="180" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx="180" cy="180" r="12" fill="#3b82f6" />

        {nums.map((val, idx) => {
          const angle = (idx / nums.length) * 360 - 90 + rotation;
          const rad = (angle * Math.PI) / 180;
          const x = 180 + radius * Math.cos(rad);
          const y = 180 + radius * Math.sin(rad);

          const isActive = idx === step?.lo || idx === step?.hi;
          const swapColor = idx === step?.lo ? '#ef4444' : '#f59e0b';

          return (
            <g key={idx}>
              <motion.circle
                cx={x} cy={y} r="18"
                fill={isActive ? swapColor : '#dbeafe'}
                stroke={isActive ? swapColor : '#0ea5e9'}
                strokeWidth={isActive ? "2" : "1"}
                animate={{ scale: isActive ? 1.3 : 1 }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={x} y={y} textAnchor="middle" dy="0.3em"
                fontSize="14" fontWeight="bold" fill="#1e3a8a"
              >
                {val}
              </text>
              <text
                x={x} y={y + 28} textAnchor="middle"
                fontSize="12" fill="#64748b"
              >
                {idx}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ textAlign: 'center', color: '#475569', fontSize: 14 }}>
        <div>↻ Rotating by <strong>{k}</strong> steps</div>
        <div style={{ fontSize: 12, marginTop: 4, color: '#78909c' }}>
          {step?.phase === 'done' ? '✓ Complete' : `Phase: ${step?.phase || 'start'}`}
        </div>
      </div>
    </div>
  );
}

function VisualizationPanel({ nums, step, n, k, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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

      <CarouselVisualization nums={nums} step={step} n={n} k={k} />

      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Array State</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((val, idx) => (
          <div
            key={idx}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#dbeafe',
              border: '2px solid #0ea5e9',
              borderRadius: 4,
              fontWeight: 'bold',
              color: '#1e3a8a'
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RotateArrayVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.nums, ex.k), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const nums = step?.nums ?? ex.nums;

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
      title: '🎠 Carousel',
      content: (
        <VisualizationPanel
          nums={nums}
          step={step}
          n={ex.nums.length}
          k={ex.k}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, nums, ex, applyEx]);

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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

