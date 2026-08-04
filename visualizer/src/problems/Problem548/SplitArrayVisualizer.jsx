import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SplitArrayVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def splitArray(self, nums: List[int], m: int) -> int:' },
  { line: 3, text: '        def canSplit(maxSum):' },
  { line: 4, text: '            splits = 1' },
  { line: 5, text: '            current = 0' },
  { line: 6, text: '            for num in nums:' },
  { line: 7, text: '                if current + num <= maxSum:' },
  { line: 8, text: '                    current += num' },
  { line: 9, text: '                else:' },
  { line: 10, text: '                    splits += 1' },
  { line: 11, text: '                    current = num' },
  { line: 12, text: '            return splits <= m' },
  { line: 13, text: '        ' },
  { line: 14, text: '        left = max(nums)' },
  { line: 15, text: '        right = sum(nums)' },
  { line: 16, text: '        ' },
  { line: 17, text: '        while left < right:' },
  { line: 18, text: '            mid = (left + right) // 2' },
  { line: 19, text: '            if canSplit(mid):' },
  { line: 20, text: '                right = mid' },
  { line: 21, text: '            else:' },
  { line: 22, text: '                left = mid + 1' },
  { line: 23, text: '        return left' },
]

const PATTERNS = ['check', 'binary_search', 'split', 'sum', 'done']
const LINE_PATTERN_MAP = {
  3: 'check',
  17: 'binary_search',
  7: 'split',
  14: 'sum',
  23: 'done',
}

function generateSteps(nums, m) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0 || m <= 0) {
    steps.push({
      phase: 'done',
      activeLine: 23,
      relatedLines: [23],
      message: 'Invalid input.',
      result: 0,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'sum',
    activeLine: 14,
    relatedLines: [14, 15],
    message: 'Set binary search bounds.',
    nums,
    m,
  })

  const left = Math.max(...nums)
  const right = nums.reduce((a, b) => a + b, 0)

  steps.push({
    phase: 'binary_search',
    activeLine: 17,
    relatedLines: [17],
    message: `Binary search between ${left} (max) and ${right} (sum).`,
    left,
    right,
    nums,
    m,
  })

  let lo = left
  let hi = right

  function canSplit(maxSum) {
    let splits = 1
    let current = 0
    for (const num of nums) {
      if (current + num <= maxSum) {
        current += num
      } else {
        splits++
        current = num
      }
    }
    return splits <= m
  }

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)

    steps.push({
      phase: 'binary_search',
      activeLine: 18,
      relatedLines: [18],
      message: `Mid = ${mid}. Check if splittable into ${m} parts.`,
      left: lo,
      right: hi,
      mid,
      nums,
      m,
    })

    const fits = canSplit(mid)

    steps.push({
      phase: 'check',
      activeLine: 19,
      relatedLines: [19],
      message: `Can split with max=${mid}? ${fits ? 'Yes' : 'No'}`,
      left: lo,
      right: hi,
      mid,
      canFit: fits,
      nums,
      m,
    })

    if (fits) {
      steps.push({
        phase: 'split',
        activeLine: 20,
        relatedLines: [20],
        message: `Move right bound down to ${mid}`,
        left: lo,
        right: hi,
        mid,
        nums,
        m,
      })
      hi = mid
    } else {
      steps.push({
        phase: 'split',
        activeLine: 22,
        relatedLines: [22],
        message: `Move left bound up to ${mid + 1}`,
        left: lo,
        right: hi,
        mid,
        nums,
        m,
      })
      lo = mid + 1
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 23,
    relatedLines: [23],
    message: `Minimum largest sum: ${lo}`,
    result: lo,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.nums && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Array</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {step.nums.map((num, idx) => (
                <motion.div
                  key={`${idx}-${num}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    backgroundColor: '#334155',
                    color: '#e2e8f0',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {num}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.left !== undefined && step?.right !== undefined && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Binary Search Range</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '2px solid #38bdf8' }}>
              <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>Left</div>
              <div style={{ fontSize: 14, color: '#38bdf8', fontFamily: 'monospace' }}>{step.left}</div>
            </div>
            {step.mid !== undefined && (
              <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '2px solid #f59e0b' }}>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Mid</div>
                <div style={{ fontSize: 14, color: '#f59e0b', fontFamily: 'monospace' }}>{step.mid}</div>
              </div>
            )}
            <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '2px solid #a78bfa' }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Right</div>
              <div style={{ fontSize: 14, color: '#a78bfa', fontFamily: 'monospace' }}>{step.right}</div>
            </div>
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Min Largest Sum</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#22c55e' }}>{step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function SplitArrayVisualizer() {
  const examples = useMemo(() => getExamplesOr('split-array', []), [])
  const [numsInput, setNumsInput] = useState('[7,2,5,10,8]')
  const [m, setM] = useState(2)

  const { nums, numsError } = useMemo(() => {
    try {
      const parsed = JSON.parse(numsInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array')
      return { nums: parsed, numsError: '' }
    } catch (e) {
      return { nums: [], numsError: e.message }
    }
  }, [numsInput])

  const steps = useMemo(() => generateSteps(nums, m), [nums, m])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setNumsInput(JSON.stringify(ex.nums || ex))
      setM(ex.m || 2)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
      {
        id: 'viz',
        title: '📊 Split Array',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Array</div>
                <textarea
                  value={numsInput}
                  onChange={(e) => {
                    setNumsInput(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    height: 60,
                    padding: '8px',
                    borderRadius: 4,
                    border: numsError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
                {numsError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{numsError}</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>M (splits)</div>
                <input
                  type="number"
                  value={m}
                  onChange={(e) => {
                    setM(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, numsInput, m, numsError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
