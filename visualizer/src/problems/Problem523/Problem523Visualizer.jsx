import { useState, useMemo } from 'react'
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
import './Problem523Visualizer.css'

const EXAMPLES = getExamples('continuous-subarray-sum') || [
  { label: 'Example 1', nums: [23,2,4,6,7], k: 6 },
  { label: 'Example 2', nums: [23,2,6,4,7], k: 13 },
]

function generateSteps(nums, k) {
  const steps = []

  steps.push({
    activeLine: 1,
    nums,
    k,
    message: `Find continuous subarray with sum divisible by ${k}`,
    phase: 'Initialize'
  })

  const seen = { 0: -1 }
  let sum = 0

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    const mod = sum % k

    steps.push({
      activeLine: 2,
      nums,
      k,
      currentIdx: i,
      currentSum: sum,
      message: `Index ${i}: sum = ${sum}, mod = ${mod}`,
      phase: 'Calculating'
    })

    if (mod in seen) {
      const start = seen[mod] + 1
      const end = i
      if (end - start >= 1) {
        steps.push({
          activeLine: 3,
          nums,
          k,
          found: true,
          startIdx: start,
          endIdx: end,
          subarray: nums.slice(start, end + 1),
          message: `Found subarray [${start}...${end}]: ${nums.slice(start, end + 1).join(', ')}`,
          phase: 'Found'
        })
        steps.push({
          activeLine: 4,
          nums,
          k,
          result: true,
          done: true,
          message: `Subarray with sum divisible by ${k} found!`,
          phase: 'Result'
        })
        return steps
      }
    }

    if (!(mod in seen)) {
      seen[mod] = i
    }
  }

  steps.push({
    activeLine: 4,
    nums,
    k,
    result: false,
    done: true,
    message: `No continuous subarray with sum divisible by ${k}`,
    phase: 'Result'
  })

  return steps
}

function VisualizationPanel({ nums, k, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid '#0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>Find continuous subarray with sum divisible by k.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Array | k = {k}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {nums.map((num, i) => (
            <motion.div
              key={i}
              style={{
                padding: '8px 12px',
                backgroundColor: step?.currentIdx === i ? '#60a5fa' : step?.startIdx !== undefined && i >= step.startIdx && i <= step.endIdx ? '#93c5fd' : '#e0f2fe',
                borderRadius: 4,
                border: step?.currentIdx === i ? '2px solid '#0284c7' : '1px solid '#7dd3fc',
                fontSize: 12,
                fontWeight: 600,
                color: step?.currentIdx === i ? 'white' : '#0c4a6e'
              }}
              animate={{ backgroundColor: step?.currentIdx === i ? '#60a5fa' : step?.startIdx !== undefined && i >= step.startIdx && i <= step.endIdx ? '#93c5fd' : '#e0f2fe' }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.currentSum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid '#fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f' }}>Running Sum: {step.currentSum}</div>
        </motion.div>
      )}

      {step?.found && step?.subarray && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid '#6ee7b7' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>Found Subarray</div>
          <div style={{ fontSize: 11, color: '#065f46' }}>[{step.subarray.join(', ')}]</div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? '#d1fae5' : '#fee2e2',
            borderRadius: 6,
            border: step.result ? '2px solid '#10b981' : '2px solid '#dc2626'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: step.result ? '#065f46' : '#7f1d1d', textAlign: 'center' }}>
            {step.result ? '✓ Found' : '✗ Not Found'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem523Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('continuous-subarray-sum')
  const steps = useMemo(() => generateSteps(ex.nums, ex.k).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '📊 Continuous Subarray', content: (<VisualizationPanel nums={ex.nums} k={ex.k} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
