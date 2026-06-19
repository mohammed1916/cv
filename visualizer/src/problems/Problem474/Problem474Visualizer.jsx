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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem474Visualizer.css'

const EXAMPLES = getExamples('ones-and-zeroes')

function generateSteps(strs, m, n) {
  const steps = []

  steps.push({
    activeLine: 1,
    strs,
    m,
    n,
    index: 0,
    dp: new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0)),
    message: `Initialize DP table: ${m}x${n}`
  })

  for (let i = 0; i < Math.min(strs.length, 3); i++) {
    const str = strs[i]
    const ones = str.split('1').length - 1
    const zeros = str.split('0').length - 1

    steps.push({
      activeLine: 2,
      strs,
      m,
      n,
      index: i,
      currentStr: str,
      ones,
      zeros,
      message: `Process str[${i}]: "${str}" has ${zeros} zeros and ${ones} ones`
    })
  }

  steps.push({
    activeLine: 3,
    strs,
    m,
    n,
    index: strs.length,
    dp: new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0)),
    done: true,
    message: `Maximum strings using ${m} zeros and ${n} ones found`
  })

  return steps
}

function VisualizationPanel({ strs, m, n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find maximum number of strings that can be formed using at most m zeros and n ones. Use DP with 2D state."
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
          Strings: {JSON.stringify(strs)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {strs.map((str, idx) => (
            <motion.div
              key={`str-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid',
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: step && idx === step.index ? '#fef08a' : '#f1f5f9',
                borderColor: step && idx === step.index ? '#eab308' : '#cbd5e1',
                color: step && idx === step.index ? '#854d0e' : '#334155'
              }}
              animate={{ scale: step && idx === step.index ? 1.15 : 1 }}
            >
              {str}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 6,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Max Zeros</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>{m}</div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: 6,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Max Ones</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginTop: 4 }}>{n}</div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: 6,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Current</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>
            {step?.ones ?? 0}/{step?.zeros ?? 0}
          </div>
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

export default function Problem474Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { strs: ['10','0001','111001','1','0'], m: 5, n: 3 })
  const SOLUTION_CODE = useSolutionCode('ones-and-zeroes')

  const steps = useMemo(
    () =>
      generateSteps(ex.strs, ex.m, ex.n).map((current) => ({
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
      title: '0️⃣1️⃣ Ones and Zeroes',
      content: (
        <VisualizationPanel
          strs={ex.strs}
          m={ex.m}
          n={ex.n}
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
