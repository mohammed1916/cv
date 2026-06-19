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
import './Problem480Visualizer.css'

const EXAMPLES = getExamples('sliding-window-median')

function generateSteps(nums, k) {
  const steps = []
  steps.push({ activeLine: 1, nums, k, index: 0, window: [], median: 0, message: 'Find median of each sliding window' })

  for (let i = k - 1; i < Math.min(nums.length, k + 2); i++) {
    const window = nums.slice(i - k + 1, i + 1).sort((a, b) => a - b)
    let median = k % 2 === 1 ? window[Math.floor(k / 2)] : (window[k / 2 - 1] + window[k / 2]) / 2

    steps.push({ activeLine: 2, nums, k, index: i, window, median, message: `Window [${i - k + 1}:${i + 1}]: ${JSON.stringify(window)} → median = ${median}` })
  }

  steps.push({ activeLine: 3, nums, k, index: nums.length, window: [], median: 0, done: true, message: 'All medians calculated' })
  return steps
}

function VisualizationPanel({ nums, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>Find the median of each sliding window using two heaps to maintain running median.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Array: {JSON.stringify(nums)}</div>
      </div>

      {step?.window && step.window.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Current Window</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.window.map((num, i) => <motion.div key={`w-${i}`} style={{ padding: '8px 12px', borderRadius: 4, border: '2px solid #10b981', backgroundColor: '#f0fdf4', fontFamily: 'monospace', fontWeight: 600 }} animate={{ scale: 1 }}>{num}</motion.div>)}
          </div>
        </div>
      )}

      <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Median</div>
        <div style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>{step?.median?.toFixed(1) ?? 0}</div>
      </motion.div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem480Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [1,3,-1,-3,5,3,6,7], k: 3 })
  const SOLUTION_CODE = useSolutionCode('sliding-window-median')

  const steps = useMemo(() => generateSteps(ex.nums, ex.k).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '📊 Sliding Window Median', content: <VisualizationPanel nums={ex.nums} k={ex.k} step={step} applyEx={applyEx} /> },
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
