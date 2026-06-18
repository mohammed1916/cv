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
import { useSolutionCode } from "../../hooks/useSolutionCode";
import { getExamples } from '../../config/examplesRegistry'
import "./PascalsTriangleVisualizer.css";

const EXAMPLES = getExamples('pascals-triangle');

function generateSteps(numRows) {
  const steps = [];
  const triangle = [[1]];
  steps.push({ activeLine: 2, triangle: [[1]], curRow: 0, curJ: -1, message: "Init triangle = [[1]]" });

  for (let i = 1; i < numRows; i++) {
    const prev = triangle[i - 1];
    steps.push({ activeLine: 4, triangle, curRow: i, curJ: -1, message: `Row ${i}: prev = [${prev.join(", ")}]` });
    const row = [1];
    steps.push({ activeLine: 5, triangle, curRow: i, curJ: -1, building: [...row], message: `Start row ${i} with [1]` });
    for (let j = 1; j < i; j++) {
      const sum = prev[j - 1] + prev[j];
      row.push(sum);
      steps.push({
        activeLine: 7, triangle, curRow: i, curJ: j,
        building: [...row], prevJ: [j - 1, j], sum,
        message: `prev[${j - 1}](${prev[j - 1]}) + prev[${j}](${prev[j]}) = ${sum}`,
      });
    }
    row.push(1);
    steps.push({ activeLine: 8, triangle, curRow: i, curJ: -1, building: [...row], message: `Append 1 → row = [${row.join(", ")}]` });
    triangle.push(row);
    steps.push({ activeLine: 9, triangle, curRow: i, curJ: -1, message: `triangle[${i}] = [${row.join(", ")}]` });
  }
  steps.push({ activeLine: 10, triangle, curRow: -1, curJ: -1, done: true, message: `Return ${numRows}-row Pascal's Triangle` });
  return steps;
}

function PyramidVisualization({ triangle, step, ex }) {
  const curRow = step?.curRow ?? -1;
  const building = step?.building ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 16 }}>
      <svg width="100%" height="400" viewBox="0 0 400 400" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
        {triangle.map((row, ri) => {
          const totalWidth = ex.numRows * 30;
          const startX = (400 - (row.length * 30)) / 2;
          const y = 50 + ri * 35;

          return (
            <g key={ri}>
              {row.map((v, ci) => {
                const x = startX + ci * 30;
                const isPrev = ri === curRow - 1 && step?.prevJ && (ci === step.prevJ[0] || ci === step.prevJ[1]);
                const isCur = ri === curRow && ci < (building?.length ?? 0);

                return (
                  <motion.g
                    key={`${ri}-${ci}`}
                    initial={{ scale: 0.4, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.05, duration: 0.3 }}
                  >
                    <rect
                      x={x - 12}
                      y={y - 12}
                      width={24}
                      height={24}
                      rx={4}
                      fill={isPrev ? '#fbbf24' : isCur ? '#3b82f6' : '#dbeafe'}
                      stroke={isPrev ? '#f59e0b' : isCur ? '#0ea5e9' : '#cbd5e1'}
                      strokeWidth={isPrev || isCur ? '2' : '1'}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="12"
                      fontWeight="bold"
                      fill={isPrev || isCur ? 'white' : '#1e3a8a'}
                    >
                      {v}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          );
        })}

        {/* Building row */}
        {building && curRow === triangle.length && (
          <g>
            {building.map((v, ci) => {
              const row = building;
              const startX = (400 - (row.length * 30)) / 2;
              const y = 50 + curRow * 35;
              const x = startX + ci * 30;

              return (
                <motion.g
                  key={`building-${ci}`}
                  initial={{ scale: 0.3, opacity: 0, y: -30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.08, duration: 0.4 }}
                >
                  <rect
                    x={x - 12}
                    y={y - 12}
                    width={24}
                    height={24}
                    rx={4}
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="12"
                    fontWeight="bold"
                    fill="white"
                  >
                    {v}
                  </text>
                </motion.g>
              );
            })}
          </g>
        )}

        {/* Row labels */}
        {triangle.map((row, ri) => (
          <text key={`label-${ri}`} x="10" y={50 + ri * 35 + 4} fontSize="11" fill="#94a3b8">
            R{ri}
          </text>
        ))}
      </svg>

      {step?.sum != null && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#92400e' }}>
            {step.prevJ?.[0] !== undefined && (
              <>
                prev[{step.prevJ[0]}] + prev[{step.prevJ[1]}] = <strong>{step.sum}</strong>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
        Building row {curRow} • {curRow + 1} element{curRow !== 0 ? 's' : ''}
      </div>
    </div>
  );
}

function VisualizationPanel({ triangle, step, ex, applyEx }) {
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

      <PyramidVisualization triangle={triangle} step={step} ex={ex} />
    </div>
  );
}

export default function PascalsTriangleVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const SOLUTION_CODE = useSolutionCode('pascals-triangle');
  const steps = useMemo(() => generateSteps(ex.numRows), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const triangle = step?.triangle ?? [[1]];

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
      title: '🏗️ Pyramid',
      content: (
        <VisualizationPanel
          triangle={triangle}
          step={step}
          ex={ex}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, triangle, ex, applyEx]);

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
