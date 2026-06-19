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
import './Problem477Visualizer.css'

const EXAMPLES = getExamples('total-hamming-distance')

function generateSteps(nums) {
  const steps = []

  steps.push({
    activeLine: 1,
    nums,
    totalDistance: 0,
    bitPosition: 0,
    message: 'Calculate total Hamming distance: count differing bits at each position'
  })

  let totalDistance = 0
  for (let bitPos = 0; bitPos < 32 && bitPos < Math.max(...nums).toString(2).length; bitPos++) {
    let ones = 0
    for (let num of nums) {
      if ((num >> bitPos) & 1) ones++
    }
    const zeros = nums.length - ones
    const contribution = ones * zeros

    steps.push({
      activeLine: 2,
      nums,
      totalDistance,
      bitPosition: bitPos,
      ones,
      zeros,
      contribution,
      message: `Bit ${bitPos}: ${ones} ones, ${zeros} zeros → ${contribution} pairs differ`
    })

    totalDistance += contribution
  }

  steps.push({
    activeLine: 3,
    nums,
    totalDistance,
    bitPosition: 0,
    done: true,
    message: `Total Hamming distance: ${totalDistance}`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Calculate total Hamming distance between all pairs. For each bit position, count 1s and 0s: contribution = ones × zeros."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Numbers: {JSON.stringify(nums)}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map((num, i) => (
            <motion.div key={`num-${i}`} style={{ padding: '8px 12px', borderRadius: 4, border: '2px solid #cbd5e1', fontFamily: 'monospace', backgroundColor: '#f1f5f9' }} animate={{ scale: 1 }}>
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Ones</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>{step?.ones ?? 0}</div>
        </motion.div>

        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Zeros</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626', marginTop: 4 }}>{step?.zeros ?? 0}</div>
        </motion.div>

        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Contribution</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>{step?.contribution ?? 0}</div>
        </motion.div>
      </div>

      <motion.div style={{ padding: 16, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Total Distance</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>{step?.totalDistance ?? 0}</div>
      </motion.div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem477Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [4, 14, 2] })
  const SOLUTION_CODE = useSolutionCode('total-hamming-distance')

  const steps = useMemo(
    () => generateSteps(ex.nums).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '📊 Total Hamming Distance', content: <VisualizationPanel nums={ex.nums} step={step} applyEx={applyEx} /> },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
