import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem480Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = []

const EXAMPLES = getExamples('sliding-window-median') || [
  { label: 'Example 1', nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def medianSlidingWindow(nums, k):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    window = []' },
  { line: 4, text: '    for i in range(len(nums)):' },
  { line: 5, text: '        if window and i >= k: window.remove(nums[i-k])' },
  { line: 6, text: '        bisect.insort(window, nums[i])' },
  { line: 7, text: '        if i >= k - 1:' },
  { line: 8, text: '            if k % 2 == 1:' },
  { line: 9, text: '                result.append(window[k//2])' },
  { line: 10, text: '            else:' },
  { line: 11, text: '                result.append((window[k//2-1] + window[k//2]) / 2)' },
  { line: 12, text: '    return result' },
]

function generateSteps(nums, k) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({ activeLine: 1, message: 'Empty array → return []', done: true, result: [] })
    return steps
  }

  steps.push({ activeLine: 1, message: `Initialize: nums=[${nums.join(',')}], k=${k}`, result: [] })

  if (k > nums.length) {
    steps.push({ activeLine: 2, message: 'k > length → return []', done: true, result: [] })
    return steps
  }

  steps.push({ activeLine: 3, message: 'Initialize heaps for running median', small: {}, large: {} })

  const result = []
  steps.push({ activeLine: 4, message: 'result = []' })

  for (let i = 0; i < Math.min(nums.length, k + 3); i++) {
    steps.push({ activeLine: 5, message: `i=${i}: process nums[${i}]=${nums[i]}`, windowStart: Math.max(0, i - k + 1), windowEnd: i + 1, window: nums.slice(Math.max(0, i - k + 1), i + 1), result })

    const num = nums[i]

    if (i >= k - 1) {
      steps.push({ activeLine: 6, message: `Window complete at i=${i}. Window: [${nums.slice(i - k + 1, i + 1).join(',')}]`, windowStart: i - k + 1, windowEnd: i + 1, window: nums.slice(i - k + 1, i + 1), result })

      const window = nums.slice(i - k + 1, i + 1).sort((a, b) => a - b)
      const median = k % 2 === 1 ? window[Math.floor(k / 2)] : (window[k / 2 - 1] + window[k / 2]) / 2

      steps.push({ activeLine: 7, message: `Sorted window: [${window.join(',')}]`, windowStart: i - k + 1, windowEnd: i + 1, window, result, sorted: true })

      if (k % 2 === 1) {
        steps.push({ activeLine: 8, message: `k=${k} (odd): median = window[${Math.floor(k / 2)}] = ${median}`, windowStart: i - k + 1, windowEnd: i + 1, window, result, median })
      } else {
        const mid1 = window[k / 2 - 1]
        const mid2 = window[k / 2]
        steps.push({ activeLine: 9, message: `k=${k} (even): median = (${mid1} + ${mid2}) / 2 = ${median}`, windowStart: i - k + 1, windowEnd: i + 1, window, result, median })
      }

      result.push(median)
      steps.push({ activeLine: 10, message: `Add median ${median} to result: [${result.join(',')}]`, windowStart: i - k + 1, windowEnd: i + 1, window, result: [...result] })
    }
  }

  steps.push({ activeLine: 11, message: `All windows processed`, result, done: true })
  return steps
}

function VisualizationPanel({ nums, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>Find the median of each sliding window. For odd k: middle element. For even k: average of two middles.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Array (k={k})</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
          {nums.map((num, idx) => {
            const inWindow = step && idx >= (step.windowStart || 0) && idx < (step.windowEnd || 0)
            return (
              <motion.div key={idx}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: inWindow ? '#dbeafe' : '#f1f5f9',
                  border: inWindow ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: inWindow ? '#0c4a6e' : '#64748b',
                }}
                animate={{ scale: inWindow ? 1.15 : 1 }}
              >
                {num}
              </motion.div>
            )
          })}
        </div>
      </div>

      {step?.window && step.window.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Current Window {step.sorted ? '(sorted)' : ''}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.window.map((num, i) => (
              <motion.div key={`w-${i}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: step.sorted && (step.window.length % 2 === 1 ? i === Math.floor(step.window.length / 2) : i === step.window.length / 2 - 1 || i === step.window.length / 2) ? '3px solid #10b981' : '2px solid #10b981',
                  backgroundColor: step.sorted && (step.window.length % 2 === 1 ? i === Math.floor(step.window.length / 2) : i === step.window.length / 2 - 1 || i === step.window.length / 2) ? '#dcfce7' : '#f0fdf4',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#166534'
                }}
                animate={{ scale: 1 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Median</div>
        <div style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>
          {step?.median !== undefined ? step.median.toFixed(1) : '—'}
        </div>
      </motion.div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>

      {step?.result && step.result.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Medians So Far</div>
          <div style={{ fontFamily: 'monospace', color: '#047857' }}>[{step.result.map(m => m.toFixed(1)).join(', ')}]</div>
        </div>
      )}
    </div>
  )
}

export default function Problem480Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 })
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

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
