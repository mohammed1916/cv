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
import "./GasStationVisualizer.css";
const EXAMPLES = getExamples('gas-station');

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def canCompleteCircuit(gas, cost):' },
  { line: 2, text: '    total = tank = start = 0' },
  { line: 3, text: '    for i in range(len(gas)):' },
  { line: 4, text: '        total += gas[i] - cost[i]' },
  { line: 5, text: '        tank += gas[i] - cost[i]' },
  { line: 6, text: '        if tank < 0: start, tank = i+1, 0' },
  { line: 7, text: '    return start if total >= 0 else -1' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(gas, cost) {
  const steps = [];
  let total = 0, tank = 0, start = 0;
  steps.push({ activeLine: 2, i: -1, total, tank, start, message: "Init total=0, tank=0, start=0" });

  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    steps.push({ activeLine: 4, i, total, tank, start, diff, message: `i=${i}: diff = gas[${i}](${gas[i]}) - cost[${i}](${cost[i]}) = ${diff}` });
    total += diff;
    tank += diff;
    steps.push({ activeLine: 6, i, total, tank, start, diff, message: `total=${total}, tank=${tank}` });
    if (tank < 0) {
      start = i + 1;
      tank = 0;
      steps.push({ activeLine: 8, i, total, tank, start, diff, message: `tank<0 → reset start=${start}, tank=0` });
    }
  }
  const result = total >= 0 ? start : -1;
  steps.push({ activeLine: 10, i: -1, total, tank, start, result, message: total >= 0 ? `total(${total}) >= 0 → return start=${start}` : `total(${total}) < 0 → return -1 (impossible)` });
  return steps;
}

function RoadJourneyVisualization({ gas, cost, step }) {
  const currentI = step?.i ?? -1;
  const startPos = step?.start ?? 0;
  const tankLevel = Math.max(0, step?.tank ?? 0);
  const maxTank = Math.max(...gas) + 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Road visualization */}
      <div style={{ position: 'relative', height: 140 }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: '#d4af37',
          transform: 'translateY(-50%)',
          borderRadius: 2
        }} />

        {/* Stations */}
        {gas.map((g, i) => {
          const isStart = i === startPos;
          const isCurrent = i === currentI;
          const x = (i / (gas.length - 1 || 1)) * 100;

          return (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
              <motion.div
                animate={{ scale: isCurrent ? 1.3 : isStart ? 1.15 : 1, y: isCurrent ? -20 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isStart ? '#10b981' : '#3b82f6',
                  border: isCurrent ? '3px solid #fbbf24' : '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  boxShadow: isCurrent ? '0 0 12px #fbbf24' : 'none',
                  color: 'white'
                }}
              >
                {isStart && !isCurrent ? '🚗' : isCurrent ? '⛽' : i}
              </motion.div>
              <div style={{ marginTop: 8, fontSize: 11, textAlign: 'center', color: '#64748b' }}>
                <div>gas:{g}</div>
                <div>cost:{cost[i]}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fuel tank gauge */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, width: 50 }}>Tank:</div>
        <div style={{
          flex: 1,
          height: 28,
          backgroundColor: '#e2e8f0',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            animate={{ width: `${(tankLevel / maxTank) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              backgroundColor: tankLevel < 0 ? '#ef4444' : '#3b82f6',
              borderRadius: 4
            }}
          />
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 12,
            fontWeight: 600,
            color: '#1e293b',
            pointerEvents: 'none'
          }}>
            {tankLevel.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 11, color: '#65a30d' }}>Total Balance</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#15803d' }}>{step?.total ?? 0}</div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 6, border: '1px solid #93c5fd' }}>
          <div style={{ fontSize: 11, color: '#1e40af' }}>Current Tank</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' }}>{tankLevel.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}

function VisualizationPanel({ gas, cost, step, applyEx }) {
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

      <RoadJourneyVisualization gas={gas} cost={cost} step={step} />
    </div>
  );
}

export default function GasStationVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.gas, ex.cost), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

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
      title: '🚗 Road Trip',
      content: (
        <VisualizationPanel
          gas={ex.gas}
          cost={ex.cost}
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

