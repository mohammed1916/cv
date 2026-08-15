import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'
const PATTERNS = ['cycle_detected', 'direction_change', 'done', 'invalid_cycle', 'moving', 'start', 'start_iteration', 'valid_cycle']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  3: 'start_iteration',
  6: 'moving',
  9: 'cycle_detected',
  10: 'valid_cycle',
  12: 'invalid_cycle',
  13: 'direction_change',
  15: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def circularArrayLoop(nums):' },
  { line: 2, text: '    n = len(nums)' },
  { line: 3, text: '    for i in range(n):' },
  { line: 4, text: '        slow = fast = i' },
  { line: 5, text: '        while True:' },
  { line: 6, text: '            slow = (slow + nums[slow]) % n' },
  { line: 7, text: '            fast = (fast + nums[fast]) % n' },
  { line: 8, text: '            fast = (fast + nums[fast]) % n' },
  { line: 9, text: '            if slow == fast:' },
  { line: 10, text: '                if slow == i:' },
  { line: 11, text: '                    return True' },
  { line: 12, text: '                break' },
  { line: 13, text: '            if (nums[slow] > 0) != (nums[i] > 0):' },
  { line: 14, text: '                break' },
  { line: 15, text: '    return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('circular-array-loop', [
  { label: 'Example 1', nums: [2, -1, 1, 2, 2], expected: true },
  { label: 'Example 2', nums: [-2, 1, -1, -2, -2], expected: false },
  { label: 'Example 3', nums: [1, 1, 1, 1, 1], expected: true },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [2, 3] },
  { id: 'fast_slow', label: 'Fast/Slow Pointers', lines: [4, 5, 6, 7, 8] },
  { id: 'check_cycle', label: 'Check Cycle', lines: [9, 10, 11, 12] },
  { id: 'validate', label: 'Validate', lines: [13, 14, 15] },
]

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums: [],
      result: false,
      stepNum: 0,
      message: 'Empty array.',
    }]
  }

  const n = nums.length
  steps.push({
    phase: 'start',
    activeLine: 2,
    nums,
    n,
    stepNum: 0,
    message: `Checking for circular loop in array of length ${n}`,
  })

  let found = false
  let stepNum = 1

  for (let startIdx = 0; startIdx < Math.min(n, 3); startIdx++) {
    if (found) break

    steps.push({
      phase: 'start_iteration',
      activeLine: 3,
      nums,
      startIdx,
      stepNum,
      message: `Starting from index ${startIdx}`,
    })
    stepNum++

    let slow = startIdx, fast = startIdx
    let cycleFound = false

    for (let iteration = 0; iteration < 10 && !cycleFound; iteration++) {
      const oldSlow = slow
      const oldFast = fast

      slow = (slow + nums[slow]) % n
      if (slow < 0) slow += n

      fast = (fast + nums[fast]) % n
      if (fast < 0) fast += n

      fast = (fast + nums[fast]) % n
      if (fast < 0) fast += n

      steps.push({
        phase: 'moving',
        activeLine: 6,
        nums,
        slow,
        fast,
        startIdx,
        stepNum,
        message: `Slow: ${oldSlow} -> ${slow}, Fast: ${oldFast} -> ${fast}`,
      })
      stepNum++

      if (slow === fast) {
        steps.push({
          phase: 'cycle_detected',
          activeLine: 9,
          nums,
          slow,
          fast,
          startIdx,
          stepNum,
          message: `Pointers met at index ${slow}!`,
        })
        stepNum++

        if (slow === startIdx) {
          steps.push({
            phase: 'valid_cycle',
            activeLine: 10,
            nums,
            slow,
            fast,
            startIdx,
            stepNum,
            message: `Valid cycle found starting at ${startIdx}!`,
          })
          stepNum++

          found = true
          cycleFound = true
        } else {
          steps.push({
            phase: 'invalid_cycle',
            activeLine: 12,
            nums,
            slow,
            fast,
            startIdx,
            stepNum,
            message: `Cycle doesn't include start, skipping`,
          })
          stepNum++

          cycleFound = true
        }
      }

      if (!cycleFound && iteration > 0) {
        const sameSign = (nums[slow] > 0) === (nums[startIdx] > 0)
        if (!sameSign) {
          steps.push({
            phase: 'direction_change',
            activeLine: 13,
            nums,
            slow,
            fast,
            startIdx,
            stepNum,
            message: `Direction changed, breaking`,
          })
          stepNum++

          cycleFound = true
        }
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 15,
    nums,
    result: found,
    stepNum,
    message: found ? `Found circular loop!` : `No circular loop found`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'start_iteration') return 'init'
  if (phase === 'moving') return 'fast_slow'
  if (phase === 'cycle_detected' || phase === 'valid_cycle' || phase === 'invalid_cycle') return 'check_cycle'
  if (phase === 'direction_change' || phase === 'done') return 'validate'
  return 'init'
}

function CircularArrayVisualization({ step }) {
  const nums = step?.nums || []
  const slow = step?.slow ?? -1
  const fast = step?.fast ?? -1
  const startIdx = step?.startIdx ?? -1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Array Visualization
        </header>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
          {nums.map((val, idx) => {
            const isSlow = idx === slow
            const isFast = idx === fast
            const isStart = idx === startIdx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isSlow || isFast ? 1.15 : 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                style={{
                  minWidth: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSlow && isFast ? '#ef4444' : isSlow ? '#3b82f6' : isFast ? '#8b5cf6' : isStart ? '#fef08a' : '#f3f4f6',
                  border: `2px solid ${isSlow && isFast ? '#991b1b' : isSlow ? '#1e40af' : isFast ? '#5b21b6' : isStart ? '#eab308' : '#d1d5db'}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSlow && isFast ? '#ffffff' : isSlow ? '#1e40af' : isFast ? '#5b21b6' : isStart ? '#713f12' : '#1f2937',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 4,
          border: '2px solid #3b82f6',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>Slow Pointer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>Index {slow >= 0 ? slow : '?'}</div>
        </div>

        <div style={{
          padding: 12,
          backgroundColor: '#ede9fe',
          borderRadius: 4,
          border: '2px solid #8b5cf6',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#5b21b6', marginBottom: 4 }}>Fast Pointer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6' }}>Index {fast >= 0 ? fast : '?'}</div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, nums, EXAMPLES, handleExampleClick, numsInput, setNumsInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          Array (comma-separated)
        </label>
        <input
          value={numsInput}
          onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
          placeholder="e.g., 2,-1,1,2,2"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <CircularArrayVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Cycle Detection
        </div>
        <div style={{ fontSize: 12, color: '#178740', lineHeight: 1.4 }}>
          Floyd's cycle detection. Fast pointer moves 2 steps, slow pointer moves 1 step each iteration.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem457Visualizer() {
  const [numsInput, setNumsInput] = useState('2,-1,1,2,2')

  const nums = useMemo(() => {
    if (!numsInput || numsInput.trim() === '') return []
    return numsInput.split(',').map(s => {
      const n = parseInt(s.trim())
      return isNaN(n) ? 0 : n
    })
  }, [numsInput])

  const steps = useMemo(
    () => generateSteps(nums).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setNumsInput(ex.nums.join(','))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />),
    viz: (<VisualizationPanel
          step={step}
          nums={nums}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          numsInput={numsInput}
          setNumsInput={setNumsInput}
          handleReset={handleReset}
        />),
  }), [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    nums,
    numsInput,
    autoScrollCode,
    handleReset,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"string"}]}
        values={{ nums: numsInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
        showExamples={false}
      />

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
