import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('reverse-string')
;
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./ReverseStringVisualizer.css";
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
const PATTERNS = []

const EXAMPLES = getExamples('reverse-string');

function generateSteps(sIn) {
    const steps = [];
    const arr = [...sIn];
    let l = 0, r = arr.length - 1;
    steps.push({ activeLine: 2, arr: [...arr], l, r, message: `Init: l=${l}, r=${r}` });
    while (l < r) {
        steps.push({ activeLine: 3, arr: [...arr], l, r, message: `l=${l} < r=${r}: swap s[${l}]='${arr[l]}' ↔ s[${r}]='${arr[r]}'` });
        [arr[l], arr[r]] = [arr[r], arr[l]];
        steps.push({ activeLine: 4, arr: [...arr], l, r, message: `Swapped → [${arr.map(c => `'${c}'`).join(", ")}]` });
        l++; r--;
        steps.push({ activeLine: 6, arr: [...arr], l, r, message: `Advance: l=${l}, r=${r}` });
    }
    steps.push({ activeLine: 3, arr: [...arr], l, r, done: true, message: `l=${l} ≥ r=${r}: done → [${arr.join("")}]` });
    return steps;
}

function RopeFlipVisualization({ arr, step, ex }) {
  const l = step?.l ?? 0;
  const r = step?.r ?? (ex.s.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
      {/* Rope visualization */}
      <div style={{ position: 'relative', height: 160 }}>
        <svg width="100%" height="160" viewBox="0 0 400 160" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
          {/* Rope curve showing the flip */}
          {arr.map((ch, idx) => {
            const isL = idx === l && !step?.done;
            const isR = idx === r && !step?.done;
            const x = (idx / (arr.length - 1 || 1)) * 350 + 25;
            const y = isL || isR ? 40 : 80;

            return (
              <motion.g key={idx}>
                {/* Rope point */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isL || isR ? 12 : 8}
                  fill={isL ? '#3b82f6' : isR ? '#ef4444' : '#dbeafe'}
                  stroke={isL ? '#0ea5e9' : isR ? '#dc2626' : '#cbd5e1'}
                  strokeWidth={isL || isR ? '2' : '1'}
                  animate={{ scale: isL || isR ? 1.3 : 1 }}
                  transition={{ duration: 0.2 }}
                />
                {/* Character label */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="13"
                  fontWeight="bold"
                  fill={isL || isR ? 'white' : '#1e3a8a'}
                >
                  {ch}
                </text>

                {/* Index label */}
                <text x={x} y={y + 28} textAnchor="middle" fontSize="10" fill="#64748b">
                  {idx}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Current state */}
      <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '2px solid #0ea5e9' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Reversed String</div>
        <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 'bold', color: '#0ea5e9', letterSpacing: 4 }}>
          {arr.join("")}
        </div>
      </div>

      {/* Pointers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#1e40af' }}>Left (l)</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e40af' }}>{l}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#991b1b' }}>Right (r)</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#991b1b' }}>{r}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#15803d' }}>Swaps Left</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#15803d' }}>
            {Math.max(0, r - l + 1 > 0 ? Math.floor((r - l + 1) / 2) : 0)}
          </div>
        </div>
      </div>
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

      <RopeFlipVisualization arr={arr} step={step} ex={ex} />
    </div>
  );
}

export default function ReverseStringVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(
        () =>
            generateSteps(ex.s).map((current) => ({
                ...current,
                relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
            })),
        [ex]
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

    const arr = step?.arr ?? ex.s;

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
        title: '🪢 Rope Flip',
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

