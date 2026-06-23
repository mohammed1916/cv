import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './SuperWashingMachinesVisualizer.css'

const EXAMPLES = getExamples('super-washing-machines')

function generateSteps(machines) {
  const steps = []

  const total = machines.reduce((a, b) => a + b, 0)
  const target = Math.floor(total / machines.length)

  steps.push({
    activeLine: 1,
    machines: [...machines],
    total,
    target,
    balance: new Array(machines.length).fill(0),
    idx: 0,
    maxOps: 0,
    message: `Total: ${total}, Target per machine: ${target}`,
    relatedLines: [1]
  })

  if (total % machines.length !== 0) {
    steps.push({
      activeLine: 2,
      machines: [...machines],
      total,
      done: true,
      message: 'Cannot distribute evenly',
      relatedLines: [2]
    })
    return steps
  }

  const balance = new Array(machines.length).fill(0)
  let maxOps = 0
  let leftSum = 0

  for (let i = 0; i < machines.length; i++) {
    leftSum += machines[i] - target
    const right = leftSum < 0 ? Math.abs(leftSum) : 0
    const left = leftSum > 0 ? leftSum : 0
    const ops = Math.max(left, right, machines[i] - target)

    balance[i] = leftSum

    steps.push({
      activeLine: 3,
      machines: [...machines],
      total,
      target,
      balance: [...balance],
      idx: i,
      maxOps: Math.max(maxOps, ops),
      message: `Machine ${i}: balance=${leftSum}, ops=${ops}`,
      relatedLines: [3]
    })

    maxOps = Math.max(maxOps, ops)
  }

  steps.push({
    activeLine: 4,
    machines,
    total,
    target,
    balance,
    done: true,
    result: maxOps,
    message: `Minimum operations needed: ${maxOps}`,
    relatedLines: [4]
  })

  return steps
}

function VisualizationPanel({ machines, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          "Distribute dresses equally among washing machines. Transfer operations move one dress left or right in one step."
        </div>
      </div>

      {/* Examples */}
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

      {/* Machines */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Washing Machines (Target: {step?.target ?? Math.floor((step?.total || 0) / machines.length)})
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.machines?.map((count, idx) => {
            const isActive = step && idx === step.idx && !step.done
            const isProcessed = step && idx < step.idx
            return (
              <motion.div
                key={`mach-${idx}`}
                style={{
                  padding: '16px 12px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                  minWidth: 80,
                  backgroundColor: isActive ? '#a7f3d0' : isProcessed ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#10b981' : isProcessed ? '#6ee7b7' : '#cbd5e1',
                  color: isActive ? '#065f46' : isProcessed ? '#059669' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                🧺
                <div style={{ fontSize: 12, marginTop: 4 }}>{count}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Balance Info */}
      {step?.balance && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#d1fae5',
            borderRadius: 6,
            border: '1px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Cumulative Balance
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.balance.map((bal, idx) => (
              <div key={idx} style={{
                padding: '6px 12px',
                backgroundColor: bal > 0 ? '#d1fae5' : bal < 0 ? '#fecaca' : '#f1f5f9',
                borderRadius: 4,
                border: `1px solid ${bal > 0 ? '#10b981' : bal < 0 ? '#ef4444' : '#cbd5e1'}`,
                fontSize: 11,
                fontWeight: 600,
                color: bal > 0 ? '#065f46' : bal < 0 ? '#7f1d1d' : '#334155'
              }}>
                M{idx}: {bal}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#d1fae5',
          borderRadius: 6,
          border: '2px solid #10b981',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Minimum Operations</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>
          {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function SuperWashingMachinesVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { machines: [1, 0, 5] })

  const steps = useMemo(
    () =>
      generateSteps(ex.machines).map((current) => ({
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
      title: '🧺 Super Washing Machines',
      content: (
        <VisualizationPanel
          machines={ex.machines}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
