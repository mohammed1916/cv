import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem376.css'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def wiggleMaxLength(nums):' },
  { line: 2, text: '    if len(nums) <= 1: return len(nums)' },
  { line: 3, text: '    up = 1' },
  { line: 4, text: '    down = 1' },
  { line: 5, text: '    for i in range(1, len(nums)):' },
  { line: 6, text: '        if nums[i] > nums[i-1]:' },
  { line: 7, text: '            up = down + 1' },
  { line: 8, text: '        elif nums[i] < nums[i-1]:' },
  { line: 9, text: '            down = up + 1' },
  { line: 10, text: '    return max(up, down)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
  const steps = []

  // Initialization
  if (nums.length <= 1) {
    steps.push({
      activeLine: 2,
      selected: [],
      ups: 0,
      downs: 0,
      currentIdx: -1,
      message: `Array length ${nums.length} ≤ 1: return ${nums.length}`,
    })
    return steps
  }

  steps.push({
    activeLine: 3,
    selected: [0],
    ups: 1,
    downs: 1,
    currentIdx: 0,
    message: `Initialization: up=1 (include first), down=1 (starting state).`,
  })

  let up = 1, down = 1
  const selected = [0]

  // Process elements
  for (let i = 1; i < nums.length; i++) {
    steps.push({
      activeLine: 5,
      selected: [...selected],
      ups: up,
      downs: down,
      currentIdx: i,
      message: `Compare nums[${i}]=${nums[i]} with nums[${i - 1}]=${nums[i - 1]}.`,
    })

    if (nums[i] > nums[i - 1]) {
      up = down + 1
      selected.push(i)
      steps.push({
        activeLine: 7,
        selected: [...selected],
        ups: up,
        downs: down,
        currentIdx: i,
        highlighted: i,
        message: `Wiggle up! nums[${i}] > nums[${i - 1}]: up = down + 1 = ${up}.`,
      })
    } else if (nums[i] < nums[i - 1]) {
      down = up + 1
      selected.push(i)
      steps.push({
        activeLine: 9,
        selected: [...selected],
        ups: up,
        downs: down,
        currentIdx: i,
        highlighted: i,
        message: `Wiggle down! nums[${i}] < nums[${i - 1}]: down = up + 1 = ${down}.`,
      })
    }
  }

  // Result
  const result = Math.max(up, down)
  steps.push({
    activeLine: 10,
    selected: [...selected],
    ups: up,
    downs: down,
    currentIdx: -1,
    message: `Final: max(up=${up}, down=${down}) = ${result}. Wiggle subsequence length.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    nums: [1, 7, 4, 9, 2, 5],
  },
  {
    label: 'Example 2',
    nums: [1, 17, 5, 10, 13, 15, 10, 5, 16, 8],
  },
  {
    label: 'Example 3',
    nums: [1, 2, 3, 4, 5],
  },
]

export default function Problem376Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.nums), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
      title: '↗↘ Wiggle Subsequence',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Original Array:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ex.nums.map((num, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: i === step.currentIdx ? 1.2 : 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: i === step.currentIdx ? '2px solid #f59e0b' : '1px solid #d97706',
                        backgroundColor: i === step.currentIdx ? '#fbbf24' : '#fcd34d',
                        color: '#78350f',
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#15803d' }}>Selected Wiggle Subsequence:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.selected.map((idx, order) => (
                    <motion.div
                      key={idx}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '2px solid #22c55e',
                        backgroundColor: '#86efac',
                        color: '#15803d',
                        fontSize: 11,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {ex.nums[idx]}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>State Tracking:</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div>
                    <span style={{ color: '#1e40af' }}>up: </span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{step.ups}</span>
                  </div>
                  <div>
                    <span style={{ color: '#1e40af' }}>down: </span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{step.downs}</span>
                  </div>
                  <div>
                    <span style={{ color: '#1e40af' }}>result: </span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{Math.max(step.ups, step.downs)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, ex])

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
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
