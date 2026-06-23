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
import { getExamples } from '../../config/examplesRegistry'
import "./HappyNumberVisualizer.css";

const EXAMPLES = getExamples('happy-number');

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def isHappy(n):' },
  { line: 2, text: '    seen = set()' },
  { line: 3, text: '    while n != 1 and n not in seen:' },
  { line: 4, text: '        seen.add(n)' },
  { line: 5, text: '        n = sum(int(d)**2 for d in str(n))' },
  { line: 6, text: '    return n == 1' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function sumOfSquaredDigits(n) {
  return String(n).split("").reduce((acc, d) => acc + Number(d) ** 2, 0);
}

function generateSteps(n) {
  const steps = [];
  const seen = new Set();
  let cur = n;
  steps.push({ activeLine: 2, cur, seen: new Set(seen), chain: [cur], message: `Start with n=${cur}` });

  const chain = [cur];
  while (cur !== 1) {
    if (seen.has(cur)) {
      steps.push({ activeLine: 4, cur, seen: new Set(seen), chain: [...chain], result: false, message: `${cur} seen before → cycle detected → return False` });
      return steps;
    }
    seen.add(cur);
    const digits = String(cur).split("").map(Number);
    const sq = digits.map(d => `${d}²=${d * d}`).join(" + ");
    const next = sumOfSquaredDigits(cur);
    chain.push(next);
    steps.push({ activeLine: 6, cur, seen: new Set(seen), chain: [...chain], squaredExpr: sq, next, message: `${sq} = ${next}` });
    cur = next;
    if (chain.length > 20) break; // safety
  }
  if (cur === 1) {
    steps.push({ activeLine: 7, cur, seen: new Set(seen), chain: [...chain], result: true, message: `n=1 → it's a Happy Number! Return True` });
  }
  return steps;
}

function JourneyPathVisualization({ chain, step, ex }) {
  const maxChain = Math.max(...chain, 1);
  const scale = 300 / maxChain;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Path visualization */}
      <svg width="100%" height="280" viewBox="0 0 400 280" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
        {/* Grid background */}
        {chain.map((v, i) => {
          const x = 40 + (i * 350) / (chain.length - 1 || 1);
          const y = 240 - v * scale;
          const isCur = i === chain.length - 1;
          const isHappy = v === 1;
          const isCycle = step?.seen?.has(v) && !isHappy && isCur;

          return (
            <g key={i}>
              {/* Connector line */}
              {i < chain.length - 1 && (
                <line
                  x1={x}
                  y1={y}
                  x2={40 + ((i + 1) * 350) / (chain.length - 1)}
                  y2={240 - chain[i + 1] * scale}
                  stroke={isCycle ? '#ef4444' : '#cbd5e1'}
                  strokeWidth="2"
                />
              )}

              {/* Node */}
              <motion.circle
                cx={x}
                cy={y}
                r={isCur ? 18 : 14}
                fill={isHappy ? '#10b981' : isCycle ? '#ef4444' : '#dbeafe'}
                stroke={isHappy ? '#059669' : isCycle ? '#dc2626' : '#0ea5e9'}
                strokeWidth={isCur ? 3 : 2}
                animate={{ scale: isCur ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.3em"
                fontSize="13"
                fontWeight="bold"
                fill={isHappy || isCycle ? 'white' : '#1e3a8a'}
              >
                {v}
              </text>

              {/* Label */}
              {i % 2 === 0 && (
                <text x={x} y={y + 40} textAnchor="middle" fontSize="11" fill="#64748b">
                  Step {i}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis label */}
        <text x="10" y="240" fontSize="11" fill="#64748b">
          0
        </text>
        <text x="10" y="20" fontSize="11" fill="#64748b">
          {Math.max(...chain)}
        </text>
      </svg>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 11, color: '#65a30d' }}>Steps Taken</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#15803d' }}>{chain.length}</div>
        </div>
        <div style={{ padding: 12, backgroundColor: step?.result ? '#f0fdf4' : '#fef2f2', borderRadius: 6, border: step?.result ? '1px solid #86efac' : '1px solid #fecaca' }}>
          <div style={{ fontSize: 11, color: step?.result ? '#65a30d' : '#b91c1c' }}>
            {step?.result ? '✓ Happy!' : step?.result === false ? '✗ Cycle' : 'In Progress'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: step?.result ? '#15803d' : '#991b1b' }}>
            {step?.cur ?? ex.n}
          </div>
        </div>
      </div>

      {/* Transformation */}
      {step?.squaredExpr && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d', fontFamily: 'monospace', fontSize: 12 }}>
          {step.cur} → {step.squaredExpr} = <strong>{step.next}</strong>
        </div>
      )}
    </div>
  );
}

function VisualizationPanel({ chain, step, ex, applyEx }) {
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

      <JourneyPathVisualization chain={chain} step={step} ex={ex} />

      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Visited Numbers</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...(step?.seen ?? [])].map(v => (
          <div
            key={v}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              backgroundColor: step?.cur === v && step?.result === false ? '#fee2e2' : '#e2e8f0',
              border: step?.cur === v && step?.result === false ? '1px solid #ef4444' : '1px solid #cbd5e1',
              fontSize: 12,
              fontWeight: 'bold',
              color: step?.cur === v && step?.result === false ? '#991b1b' : '#1e293b'
            }}
          >
            {v}
          </div>
        ))}
        {(step?.seen?.size ?? 0) === 0 && <span style={{ color: '#64748b', fontSize: 12 }}>—</span>}
      </div>
    </div>
  );
}

export default function HappyNumberVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(
    () =>
      generateSteps(ex.n).map((current) => ({
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

  const chain = step?.chain ?? [ex.n];

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
      title: '🎯 Journey',
      content: (
        <VisualizationPanel
          chain={chain}
          step={step}
          ex={ex}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, chain, ex, applyEx]);

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
