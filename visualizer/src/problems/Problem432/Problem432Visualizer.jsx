import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem432Visualizer.css'

const EXAMPLES = getExamples('all-o1-data-structure')

function generateSteps(operations) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    operations,
    valToIdx: new Map(),
    vals: [],
    currentOp: null,
    message: `Initialize O(1) data structure with map and array`,
  })

  let valToIdx = new Map()
  let vals = []

  for (let i = 0; i < Math.min(operations.length, 6); i++) {
    const op = operations[i]

    if (op === 'add') {
      vals.push(Math.floor(Math.random() * 100))
      valToIdx.set(vals[vals.length - 1], vals.length - 1)
    }

    steps.push({
      activeLine: 2,
      phase: 'execute_op',
      operations,
      valToIdx: new Map(valToIdx),
      vals: [...vals],
      currentOp: op,
      message: `Execute operation: ${op}`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'complete',
    operations,
    valToIdx: new Map(valToIdx),
    vals: [...vals],
    currentOp: null,
    isComplete: true,
    message: `All operations completed`,
  })

  return steps
}

function MapVisualization({ valToIdx, vals }) {
  const entries = Array.from(valToIdx.entries()).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Map (val → index)</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {entries.length > 0 ? (
          entries.map(([val, idx]) => (
            <motion.div
              key={val}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #0284c7',
                backgroundColor: '#dbeafe',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#0c4a6e',
                display: 'flex',
                justifyContent: 'space-between',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span>{val}</span>
              <span>→</span>
              <span>{idx}</span>
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>map empty</div>
        )}
      </div>
    </div>
  )
}

function ArrayVisualization({ vals }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Array (values)</div>
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {vals.length > 0 ? (
          vals.map((val, idx) => (
            <motion.div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: '#047857',
              }}>
                {val}
              </div>
              <div style={{
                fontSize: 10,
                color: '#64748b',
                fontWeight: 600,
              }}>
                [{idx}]
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>array empty</div>
        )}
      </div>
    </div>
  )
}

function OperationVisualization({ operations, currentOp }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Operations</div>
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {operations.map((op, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: op === currentOp ? '3px solid #dc2626' : '2px solid #cbd5e1',
              backgroundColor: op === currentOp ? '#fee2e2' : '#f1f5f9',
              fontSize: 12,
              fontWeight: 600,
              color: op === currentOp ? '#991b1b' : '#64748b',
            }}
            animate={{
              scale: op === currentOp ? 1.08 : 1,
            }}
          >
            {op}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
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
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <OperationVisualization
          operations={step?.operations || []}
          currentOp={step?.currentOp}
        />

        <MapVisualization
          valToIdx={step?.valToIdx || new Map()}
          vals={step?.vals || []}
        />

        <ArrayVisualization
          vals={step?.vals || []}
        />
      </div>
    </div>
  )
}

export default function Problem432Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { operations: ['add', 'insert', 'getRandom', 'remove'], label: 'DataStructure' })
  const SOLUTION_CODE = useSolutionCode('all-o1-data-structure')

  const steps = useMemo(
    () =>
      generateSteps(ex.operations).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
      title: '⚡ O(1) Structure',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
  )
}
