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
import './OptimalDivisionVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def optimalDivision(self, nums: List[int]) -> str:' },
  { line: 3, text: '        n = len(nums)' },
  { line: 4, text: '        ' },
  { line: 5, text: '        if n == 1:' },
  { line: 6, text: '            return str(nums[0])' },
  { line: 7, text: '        ' },
  { line: 8, text: '        if n == 2:' },
  { line: 9, text: '            return f"{nums[0]}/{nums[1]}"' },
  { line: 10, text: '        ' },
  { line: 11, text: '        # For n >= 3: num[0] / (num[1] / num[2] / ... / num[n-1])' },
  { line: 12, text: '        result = str(nums[0]) + "/" + "(" + "/" .join(map(str, nums[1:])) + ")"' },
  { line: 13, text: '        ' },
  { line: 14, text: '        return result' },
]

const PATTERNS = ['setup', 'basecase_one', 'basecase_two', 'optimal', 'compute', 'return']
const LINE_PATTERN_MAP = {
  3: 'setup',
  5: 'basecase_one',
  8: 'basecase_two',
  11: 'optimal',
  12: 'compute',
  14: 'return',
}

function generateSteps(numsStr) {
  const steps = []

  // Parse input
  let nums = []
  let parseError = ''
  try {
    const parsed = JSON.parse(numsStr)
    if (!Array.isArray(parsed) || !parsed.every((x) => Number.isInteger(x) && x > 0)) {
      parseError = 'Array must contain positive integers'
    } else {
      nums = parsed
    }
  } catch (e) {
    parseError = 'Invalid JSON format'
  }

  // Step 1: Setup
  steps.push({
    phase: 'setup',
    activeLine: 3,
    relatedLines: [3],
    message: 'Get array length',
    n: nums.length,
    array: nums,
  })

  if (parseError) {
    steps.push({
      phase: 'return',
      activeLine: 14,
      relatedLines: [14],
      message: `Error: ${parseError}`,
      result: 'ERROR',
      done: true,
    })
    return steps
  }

  // Step 2: Check if n == 1
  steps.push({
    phase: 'basecase_one',
    activeLine: 5,
    relatedLines: [5, 6],
    message: `Check if n == 1? ${nums.length === 1 ? 'Yes' : 'No'}`,
    n: nums.length,
    array: nums,
  })

  if (nums.length === 1) {
    steps.push({
      phase: 'return',
      activeLine: 6,
      relatedLines: [6],
      message: `Return single number: ${nums[0]}`,
      result: String(nums[0]),
      done: true,
    })
    return steps
  }

  // Step 3: Check if n == 2
  steps.push({
    phase: 'basecase_two',
    activeLine: 8,
    relatedLines: [8, 9],
    message: `Check if n == 2? ${nums.length === 2 ? 'Yes' : 'No'}`,
    n: nums.length,
    array: nums,
  })

  if (nums.length === 2) {
    const result = `${nums[0]}/${nums[1]}`
    steps.push({
      phase: 'return',
      activeLine: 9,
      relatedLines: [9],
      message: `Return simple division: ${result}`,
      result,
      done: true,
    })
    return steps
  }

  // Step 4: For n >= 3, explain optimal strategy
  steps.push({
    phase: 'optimal',
    activeLine: 11,
    relatedLines: [11],
    message: 'For n >= 3: Use optimal pattern num[0] / (num[1] / num[2] / ... / num[n-1])',
    n: nums.length,
    array: nums,
    showOptimal: true,
  })

  // Step 5: Build the result string step by step
  steps.push({
    phase: 'compute',
    activeLine: 12,
    relatedLines: [12],
    message: 'Build result string with parentheses',
    n: nums.length,
    array: nums,
    building: true,
  })

  // Show intermediate steps of building
  const denomPart = nums.slice(1).join(' / ')
  steps.push({
    phase: 'compute',
    activeLine: 12,
    relatedLines: [12],
    message: `Denominator part: ${denomPart}`,
    n: nums.length,
    array: nums,
    denominator: denomPart,
  })

  // Calculate actual result
  let result = nums[0]
  for (let i = 1; i < nums.length; i++) {
    result = result / nums[i]
  }
  const resultStr = `${nums[0]}/( ${denomPart} )`

  steps.push({
    phase: 'return',
    activeLine: 14,
    relatedLines: [14],
    message: `Return optimal division string`,
    result: resultStr,
    numericalResult: result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  const getDivisionVisualization = () => {
    if (!step?.array || step.array.length === 0) return null

    const nums = step.array
    if (nums.length === 1) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16 }}>
          <div
            style={{
              padding: 12,
              backgroundColor: '#1e293b',
              borderRadius: 6,
              border: '2px solid #38bdf8',
              fontSize: 14,
              fontWeight: 700,
              color: '#38bdf8',
              minWidth: 60,
              textAlign: 'center',
            }}
          >
            {nums[0]}
          </div>
        </div>
      )
    }

    if (nums.length === 2) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Numerator</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
              {nums[0]}
            </div>
          </div>
          <div style={{ fontSize: 18, color: '#64748b', fontWeight: 700 }}>÷</div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Denominator</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
              {nums[1]}
            </div>
          </div>
        </div>
      )
    }

    // For n >= 3
    if (step?.showOptimal || step?.denominator) {
      return (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #a78bfa',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>
            Optimal Division Pattern
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{nums[0]}</span>
            <span style={{ color: '#64748b' }}>÷</span>
            <span style={{ color: '#64748b' }}>(</span>
            <span style={{ color: '#f59e0b' }}>{nums.slice(1).join(' ÷ ')}</span>
            <span style={{ color: '#64748b' }}>)</span>
          </div>
          {step?.denominator && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #475569' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                Denominator Expression
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#f59e0b',
                  padding: 8,
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                }}
              >
                {step.denominator}
              </div>
            </div>
          )}
        </motion.div>
      )
    }

    return null
  }

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

      {step?.array && step.array.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Input Array</div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              padding: 12,
              backgroundColor: '#1e293b',
              borderRadius: 6,
              border: '1px solid #475569',
            }}
          >
            {step.array.map((num, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

      {getDivisionVisualization()}

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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 13,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: 8,
              wordBreak: 'break-all',
            }}
          >
            {step.result}
          </div>
          {step?.numericalResult !== undefined && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, paddingTop: 8, borderTop: '1px solid #475569' }}>
              Numerical value: <span style={{ color: '#22c55e', fontWeight: 600 }}>{step.numericalResult.toFixed(2)}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function OptimalDivisionVisualizer() {
  const examples = useMemo(() => getExamplesOr('optimal-division', []), [])
  const [arrayInput, setArrayInput] = useState('[1000, 100, 10, 2]')

  const steps = useMemo(() => generateSteps(arrayInput), [arrayInput])

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
      setArrayInput(JSON.stringify(ex.nums || ex))
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
        title: '÷ Optimal Division',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
                Array (JSON format)
              </div>
              <textarea
                value={arrayInput}
                onChange={(e) => {
                  setArrayInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder="e.g., [1000, 100, 10, 2]"
              />
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, arrayInput, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
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
