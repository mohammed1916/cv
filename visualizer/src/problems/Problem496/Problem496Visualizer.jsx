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
import './Problem496Visualizer.css'

const EXAMPLES = getExamples('next-greater-element-i') || [
  { label: 'Example 1', nums1: [4, 1, 2], nums2: [1, 3, 4, 2] },
  { label: 'Example 2', nums1: [2, 4], nums2: [1, 2, 3, 4] },
]

function generateSteps(nums1, nums2) {
  const steps = []

  if (!nums1 || !nums2 || nums1.length === 0) {
    steps.push({ activeLine: 1, message: 'Invalid input', done: true, result: [] })
    return steps
  }

  steps.push({ activeLine: 1, message: `Find next greater element for each nums1 element in nums2`, nums1, nums2 })

  steps.push({ activeLine: 2, message: 'Use monotonic decreasing stack to efficiently find next greater elements' })

  const result = new Map()
  const stack = []

  steps.push({ activeLine: 3, message: 'Initialize: stack=[], result_map={}', stack: [], result: new Map() })

  for (let i = 0; i < nums2.length; i++) {
    const num = nums2[i]
    steps.push({ activeLine: 4, message: `Process nums2[${i}]=${num}`, current: num, index: i })

    let popped = false
    while (stack.length > 0 && stack[stack.length - 1] < num) {
      const top = stack.pop()
      result.set(top, num)
      steps.push({ activeLine: 5, message: `Pop ${top}: next greater = ${num}`, popped: top, greater: num, stack: [...stack], result: new Map(result) })
      popped = true
    }

    if (!popped) {
      steps.push({ activeLine: 6, message: `Stack top ${stack.length > 0 ? stack[stack.length - 1] : 'empty'} >= ${num}, no popping` })
    }

    stack.push(num)
    steps.push({ activeLine: 7, message: `Push ${num} to stack`, stack: [...stack], result: new Map(result) })
  }

  steps.push({ activeLine: 8, message: `Process remaining stack elements (no greater element found)` })
  for (const remaining of stack) {
    result.set(remaining, -1)
    steps.push({ activeLine: 9, message: `${remaining}: no next greater element = -1`, stack: [], result: new Map(result) })
  }

  const ans = nums1.map(n => result.get(n) ?? -1)
  steps.push({ activeLine: 10, message: `Build answer for nums1: [${ans.join(', ')}]`, ans, result: new Map(result) })

  steps.push({ activeLine: 11, message: `Result: [${ans.join(', ')}]`, done: true, ans, result })

  return steps
}

function VisualizationPanel({ nums1, nums2, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b', fontSize: 12, color: '#92400e' }}>
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
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Algorithm</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Monotonic decreasing stack: process nums2 right-to-left. When we find a larger element, it's the next greater for all popped elements. O(n) time!
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>nums1 (Query)</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            {nums1.map((num, i) => (
              <motion.div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: '#dbeafe',
                  border: '1px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0c4a6e',
                }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>nums2 (Reference)</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            {nums2.map((num, i) => (
              <motion.div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: step?.current === num ? '#fef08a' : '#f0fdf4',
                  border: step?.current === num ? '2px solid #f59e0b' : '1px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: step?.current === num ? '#92400e' : '#047857',
                }}
                animate={{ scale: step?.current === num ? 1.1 : 1 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {step?.stack && (
        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #d8b4fe' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>Stack (Decreasing)</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.stack.length === 0 ? (
              <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>empty</div>
            ) : (
              step.stack.map((s, i) => (
                <motion.div
                  key={i}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    backgroundColor: '#ede9fe',
                    border: '1px solid #d8b4fe',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 12,
                    color: '#6b21a8',
                  }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {s}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {step?.result && step.result.size > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Result Map</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from(step.result.entries()).slice(0, 5).map(([key, val], i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: '#047857' }}>
                {key} → {val ?? '-1'}
              </div>
            ))}
            {step.result.size > 5 && (
              <div style={{ fontSize: 11, color: '#94a3b8' }}>... and {step.result.size - 5} more</div>
            )}
          </div>
        </div>
      )}

      {step?.ans && (
        <motion.div
          style={{ padding: 16, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e', textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Final Answer</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>
            [{step.ans.join(', ')}]
          </div>
        </motion.div>
      )}
    </div>
  )
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def nextGreaterElement(nums1,nums2):' },
  { line: 2, text: '    stack=[]' },
  { line: 3, text: '    mapping={}' },
  { line: 4, text: '    for num in nums2:' },
  { line: 5, text: '        while stack and stack[-1]<num:' },
  { line: 6, text: '            mapping[stack.pop()]=num' },
  { line: 7, text: '        stack.append(num)' },
  { line: 8, text: '    result=[]' },
  { line: 9, text: '    for num in nums1:' },
  { line: 10, text: '        result.append(mapping.get(num,-1))' },
  { line: 11, text: '    return result' },
]

export default function Problem496Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(ex.nums1, ex.nums2).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
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
      title: '📈 Next Greater Element',
      content: <VisualizationPanel nums1={ex.nums1} nums2={ex.nums2} step={step} applyEx={applyEx} />,
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
