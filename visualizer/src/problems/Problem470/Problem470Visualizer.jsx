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
import './Problem470Visualizer.css'

const EXAMPLES = getExamples('implement-rand10')

function generateSteps(calls) {
  const steps = []

  steps.push({
    activeLine: 1,
    calls,
    callIndex: 0,
    result: 0,
    random: 0,
    message: 'Generate uniform random integer 1-10 using rand7()'
  })

  for (let i = 0; i < Math.min(calls, 5); i++) {
    const val1 = Math.floor(Math.random() * 7) + 1
    const val2 = Math.floor(Math.random() * 7) + 1

    steps.push({
      activeLine: 2,
      calls,
      callIndex: i,
      result: 0,
      random: val1,
      message: `Call 1: rand7() = ${val1}`
    })

    steps.push({
      activeLine: 3,
      calls,
      callIndex: i,
      result: 0,
      random: val2,
      message: `Call 2: rand7() = ${val2}`
    })

    const combined = (val1 - 1) * 7 + val2
    steps.push({
      activeLine: 4,
      calls,
      callIndex: i,
      result: combined,
      random: combined,
      message: `Combined: (${val1} - 1) * 7 + ${val2} = ${combined}`
    })

    if (combined <= 40) {
      const result = (combined % 10) + 1
      steps.push({
        activeLine: 5,
        calls,
        callIndex: i,
        result,
        random: combined,
        message: `${combined} <= 40: return ${result}`
      })
    } else {
      steps.push({
        activeLine: 6,
        calls,
        callIndex: i,
        result: 0,
        random: combined,
        message: `${combined} > 40: retry`
      })
    }
  }

  steps.push({
    activeLine: 7,
    calls,
    callIndex: calls,
    result: 0,
    random: 0,
    done: true,
    message: `Generated ${calls} random numbers using rejection sampling`
  })

  return steps
}

function VisualizationPanel({ calls, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Implement rand10() using rand7(). Generate a uniform random 1-10 by combining two rand7() calls and using rejection sampling if result exceeds 40."
        </div>
      </div>

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

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Calls to Generate: {calls}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current Value</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>
            {step?.random ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>From rand7() combination</div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#f59e0b' }}>
            {step?.result || '-'}
          </div>
          <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>Valid output 1-10</div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem470Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { calls: 5 })

  const steps = useMemo(
    () =>
      generateSteps(ex.calls).map((current) => ({
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
      title: '🎲 Implement Rand10()',
      content: (
        <VisualizationPanel
          calls={ex.calls}
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
