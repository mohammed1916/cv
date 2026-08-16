import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./PascalsTriangleVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('pascals-triangle')

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
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
      <svg width="100%" height="400" viewBox="0 0 400 400" style={{ border: '1px solid var(--text)', borderRadius: 8 }}>
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
                      stroke={isPrev ? '#f59e0b' : isCur ? '#0ea5e9' : 'var(--border)'}
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
          <text key={`label-${ri}`} x="10" y={50 + ri * 35 + 4} fontSize="11" fill="var(--text-muted)">
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

      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        Building row {curRow} • {curRow + 1} element{curRow !== 0 ? 's' : ''}
      </div>
    </div>
  );
}

function VisualizationPanel({ triangle, step, ex, applyEx, numRowsInput, setNumRowsInput, inputError, handleReset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>numRows:</label>
          <input
            value={numRowsInput}
            onChange={(e) => {
              setNumRowsInput(e.target.value);
              handleReset();
            }}
            placeholder="5"
            style={{
              padding: '6px 8px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--border)',
              width: '60px',
            }}
            type="number"
            min="1"
            max="30"
          />
          {inputError && <span style={{ fontSize: 11, color: '#dc2626' }}>{inputError}</span>}
        </div>
      </div>

      <PyramidVisualization triangle={triangle} step={step} ex={ex} />
    </div>
  );
}

export default function PascalsTriangleVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numRowsInput, setNumRowsInput] = useState(String(EXAMPLES[0]?.numRows || 5));

  const { numRows, inputError } = useMemo(() => {
    try {
      const val = parseInt(numRowsInput, 10);
      if (isNaN(val) || val < 1) throw new Error('numRows must be >= 1');
      if (val > 30) throw new Error('Max 30 rows for clarity');
      return { numRows: val, inputError: '' };
    } catch (e) {
      return { numRows: EXAMPLES[0]?.numRows || 5, inputError: e.message };
    }
  }, [numRowsInput]);

  const steps = useMemo(() => generateSteps(numRows), [numRows]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => {
    setEx(e);
    setNumRowsInput(String(e.numRows));
    handleReset();
  }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const triangle = step?.triangle ?? [[1]];

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"numRows","label":"numRows","type":"string"}]}
        values={{ numRows: numRowsInput }}
        onChange={(k, v) => { if (k === 'numRows') setNumRowsInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />

    <div className="pt-panel">
      <VisualizationPanel
        triangle={triangle}
        step={step}
        ex={ex}
        applyEx={applyEx}
        numRowsInput={numRowsInput}
        setNumRowsInput={setNumRowsInput}
        inputError={inputError}
        handleReset={handleReset}
      />
    </div>
  
    </>)

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
      {showPatternOverlay && <CodePatternAnnotations activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="pt-status">
      {step?.message || 'Ready'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend />}
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
  )

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🏗️ Pyramid', dockMode: 'split-right' },
      { id: 'code',    title: 'Code', dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return block
  return (
    <div className="pt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}

