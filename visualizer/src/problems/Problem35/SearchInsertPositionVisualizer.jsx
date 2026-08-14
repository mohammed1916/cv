import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './SearchInsertPositionVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def searchInsert(self, nums: List[int], target: int) -> int:' },
  { line: 3, text: '        left, right = 0, len(nums) - 1' },
  { line: 4, text: '        ' },
  { line: 5, text: '        while left <= right:' },
  { line: 6, text: '            mid = left + (right - left) // 2' },
  { line: 7, text: '            ' },
  { line: 8, text: '            if nums[mid] == target:' },
  { line: 9, text: '                return mid' },
  { line: 10, text: '            elif nums[mid] < target:' },
  { line: 11, text: '                left = mid + 1' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                right = mid - 1' },
  { line: 14, text: '                ' },
  { line: 15, text: '        return left' },
]

const SEARCHINSERTPOSITION_PATTERNS = ['calc_mid', 'check_greater', 'check_less', 'check_target', 'done', 'found', 'init', 'update_left', 'update_right', 'while_check']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'while_check',
  6: 'calc_mid',
  8: 'check_target',
  9: 'found',
  10: 'check_less',
  11: 'update_left',
  12: 'check_greater',
  13: 'update_right',
  15: 'done',
}

function generateSteps(nums, target) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      phase: 'done', left: 0, right: -1, mid: null, insertPos: 0,
      activeLine: 15, message: 'Array is empty. Insert at position 0.'
    })
    return steps
  }

  let left = 0
  let right = nums.length - 1

  steps.push({
    phase: 'init', left, right, mid: null,
    activeLine: 3, message: `Initialize left = 0, right = ${right} (${nums.length} - 1).`
  })

  while (left <= right) {
    steps.push({
      phase: 'while_check', left, right, mid: null,
      activeLine: 5, message: `Check if left (${left}) <= right (${right}). Yes, continue.`
    })

    const mid = Math.floor(left + (right - left) / 2)
    steps.push({
      phase: 'calc_mid', left, right, mid,
      activeLine: 6, message: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}.`
    })

    steps.push({
      phase: 'check_target', left, right, mid,
      activeLine: 8, message: `Is nums[mid] (${nums[mid]}) == target (${target})?`
    })

    if (nums[mid] === target) {
      steps.push({
        phase: 'found', left, right, mid, insertPos: mid,
        activeLine: 9, message: `Target found at index ${mid}! Return ${mid}.`
      })
      return steps
    }

    steps.push({
      phase: 'check_less', left, right, mid,
      activeLine: 10, message: `No. Is nums[mid] (${nums[mid]}) < target (${target})?`
    })

    if (nums[mid] < target) {
      left = mid + 1
      steps.push({
        phase: 'update_left', left, right, mid,
        activeLine: 11, message: `Yes, target should be in the right half. Update left = mid + 1 = ${left}.`
      })
    } else {
      steps.push({
        phase: 'check_greater', left, right, mid,
        activeLine: 12, message: `No, nums[mid] (${nums[mid]}) > target (${target}).`
      })

      right = mid - 1
      steps.push({
        phase: 'update_right', left, right, mid,
        activeLine: 13, message: `Target should be in the left half. Update right = mid - 1 = ${right}.`
      })
    }
  }

  steps.push({
    phase: 'done', left, right, mid: null, insertPos: left,
    activeLine: 15, message: `Loop ends (left > right). Insert target at position ${left}.`
  })

  return steps
}

const EXAMPLES = getExamples('search-insert-position')

export default function SearchInsertPositionVisualizer() {
  const [numsInput, setNumsInput] = useState('[1, 3, 5, 6]')
  const [targetInput, setTargetInput] = useState('5')

  const { nums, target, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      const t = Number(targetInput)
      if (!Array.isArray(n)) throw new Error('nums must be an array')
      if (isNaN(t)) throw new Error('target must be a number')

      // Search insert requires sorted array, we'll sort it if it isn't
      const isSorted = n.every((val, i, arr) => !i || val >= arr[i - 1])
      if (!isSorted) {
        return { nums: [...n].sort((a, b) => a - b), target: t, inputError: 'Input array was automatically sorted.' }
      }
      return { nums: n, target: t, inputError: '' }
    } catch (e) {
      return { nums: [1, 3, 5, 6], target: 5, inputError: e.message || 'Invalid input' }
    }
  }, [numsInput, targetInput])

  const steps = useMemo(
    () => generateSteps(nums, target).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums, target],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    setTargetInput(String(ex.target))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"},{"key":"target","label":"target","type":"number"}]}
        values={{ nums: numsInput, target: targetInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'target') setTargetInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <div className="sip-panel" style={{ flex: 1 }}>
      <div className="sip-panel-head">
        Array State & Search Space
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="sip-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="sip-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <input
            value={numsInput}
            onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
            placeholder="[1, 3, 5, 6]"
            className="sip-input"
            style={{ flex: 1, margin: 0 }}
          />
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>target=</span>
          <input
            value={targetInput}
            onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
            placeholder="5"
            className="sip-input"
            style={{ width: '60px', margin: 0, textAlign: 'center' }}
          />
        </div>

        <div className="sip-pointers-legend">
          <div className="sip-legend-item left"><div className="sip-legend-swatch" /> Left</div>
          <div className="sip-legend-item mid"><div className="sip-legend-swatch" /> Mid</div>
          <div className="sip-legend-item right"><div className="sip-legend-swatch" /> Right</div>
        </div>

        <div className="sip-array-container">
          {nums.map((num, i) => {
            const isLeft = step?.left === i
            const isRight = step?.right === i
            const isMid = step?.mid === i
            const isOutOfBounds = step && (i < step.left || i > step.right)
            const isFound = step?.phase === 'found' && isMid
            const isInsertPos = step?.phase === 'done' && i === step.insertPos && step.insertPos < nums.length

            let cellClass = "sip-cell "
            if (isLeft) cellClass += "left "
            if (isRight) cellClass += "right "
            if (isMid) cellClass += "mid "
            if (isFound) cellClass += "found "
            if (isInsertPos) cellClass += "insert-pos "
            if (isOutOfBounds && !isFound) cellClass += "out-of-bounds "

            return (
              <div key={i} className="sip-cell-wrapper">
                <div className="sip-index">{i}</div>
                <div className={cellClass}>
                  {num}
                </div>
                <div className="sip-pointers">
                  {isLeft && <div className="sip-ptr left">L</div>}
                  {isMid && <div className="sip-ptr mid">M</div>}
                  {isRight && <div className="sip-ptr right">R</div>}
                </div>
              </div>
            )
          })}
          {step?.phase === 'done' && step.insertPos === nums.length && (
            <div className="sip-cell-wrapper sip-insert-marker">
              <div className="sip-index">{nums.length}</div>
              <div className="sip-insert-cell">
                Insert here
              </div>
            </div>
          )}
        </div>

        <div className="sip-stats">
          <div className="sip-stat-box">
            <span className="sip-stat-label">Search Space Size</span>
            <span className="sip-stat-val">{step ? Math.max(0, step.right - step.left + 1) : nums.length}</span>
          </div>
          <div className="sip-stat-box">
            <span className="sip-stat-label">Target</span>
            <span className="sip-stat-val" style={{ color: '#eab308' }}>{target}</span>
          </div>
          {step?.insertPos !== undefined && (
            <div className="sip-stat-box">
              <span className="sip-stat-label">Insert Position</span>
              <span className="sip-stat-val" style={{ color: '#06b6d4' }}>{step.insertPos}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const statusPanel = (
    <div className={`sip-status ${step?.phase === 'found' ? 'found' : step?.phase === 'done' ? 'done' : ''}`}>
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={SEARCHINSERTPOSITION_PATTERNS} />
      )}
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
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Array State & Search Space', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="sip-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
