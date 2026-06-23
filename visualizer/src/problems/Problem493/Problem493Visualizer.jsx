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
import './Problem493Visualizer.css'

const EXAMPLES = getExamples('reverse-pairs') || [
  { label: 'Example 1', nums: [1, 2, 3, 4, 5] },
  { label: 'Example 2', nums: [40, 26, 26, 2, 6, 4, 85] },
]

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({ activeLine: 1, message: 'Empty array → 0 pairs', done: true, result: 0 })
    return steps
  }

  steps.push({ activeLine: 1, message: `Find reverse pairs: i < j where nums[i] > 2*nums[j]`, nums })

  steps.push({ activeLine: 2, message: `Initialize pair count = 0`, count: 0 })

  const pairs = []

  for (let i = 0; i < Math.min(nums.length, 5); i++) {
    steps.push({ activeLine: 3, message: `Outer loop i=${i}, nums[${i}]=${nums[i]}`, i, current: nums[i] })

    for (let j = i + 1; j < Math.min(nums.length, 6); j++) {
      const threshold = 2 * nums[j]
      steps.push({ activeLine: 4, message: `Check j=${j}: is ${nums[i]} > 2×${nums[j]}=${threshold}?`, i, j, nums_i: nums[i], nums_j: nums[j], threshold })

      if (nums[i] > threshold) {
        pairs.push([i, j])
        steps.push({ activeLine: 5, message: `✓ Match! nums[${i}]=${nums[i]} > ${threshold}`, i, j, matched: true, pairs: [...pairs] })
        steps.push({ activeLine: 6, message: `Increment count: ${pairs.length}`, count: pairs.length })
      } else {
        steps.push({ activeLine: 7, message: `✗ No match: ${nums[i]} ≤ ${threshold}`, i, j, matched: false })
      }
    }
  }

  steps.push({ activeLine: 8, message: `Loop complete`, pairs: [...pairs] })

  steps.push({ activeLine: 9, message: `Return total reverse pairs: ${pairs.length}`, done: true, result: pairs.length, pairs: [...pairs] })
  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #8b5cf6', fontSize: 12, color: '#4c1d95' }}>
          {step.message}
        </div>
      )}

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

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Definition</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Reverse pair: indices (i, j) where i &lt; j AND nums[i] &gt; 2 × nums[j]. Use nested loop to find all such pairs.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Array</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          {nums.map((num, idx) => (
            <motion.div
              key={idx}
              style={{
                width: 45,
                height: 45,
                borderRadius: 4,
                backgroundColor: step?.i === idx || step?.j === idx ? '#dbeafe' : '#f1f5f9',
                border: step?.i === idx ? '3px solid #0284c7' : step?.j === idx ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: step?.i === idx ? '#0c4a6e' : step?.j === idx ? '#0e7490' : '#475569',
              }}
              animate={{ scale: step?.i === idx ? 1.2 : step?.j === idx ? 1.1 : 1 }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {step?.threshold !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
          <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #0284c7' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#0c4a6e' }}>nums[{step.i}]</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.nums_i}</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#cffafe', borderRadius: 6, border: '1px solid #06b6d4' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#0e7490' }}>nums[{step.j}]</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4', marginTop: 4 }}>{step.nums_j}</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>2×nums[{step.j}]</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>{step.threshold}</div>
          </div>
        </div>
      )}

      {step?.matched !== undefined && (
        <div style={{ padding: 12, backgroundColor: step.matched ? '#dcfce7' : '#fee2e2', borderRadius: 6, border: `2px solid ${step.matched ? '#22c55e' : '#ef4444'}`, fontSize: 12, fontWeight: 600, color: step.matched ? '#166534' : '#991b1b' }}>
          {step.matched ? '✓ Reverse Pair Found!' : '✗ Not a Reverse Pair'}
        </div>
      )}

      {step?.pairs && step.pairs.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', marginBottom: 8 }}>Pairs Found ({step.pairs.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.pairs.slice(-12).map((p, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: 4,
                  border: '1px solid #8b5cf6',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#4c1d95',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                ({p[0]},{p[1]})
              </motion.div>
            ))}
            {step.pairs.length > 12 && (
              <div style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>
                ... and {step.pairs.length - 12} more
              </div>
            )}
          </div>
        </div>
      )}

      {step?.count !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Pair Count</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
            {step.count}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Total Reverse Pairs</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
            {step.result}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem493Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])

  const steps = useMemo(
    () => generateSteps(ex.nums).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '🔄 Reverse Pairs',
      content: <VisualizationPanel nums={ex.nums} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
