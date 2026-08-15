import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './ShortestUnsortedVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findUnsortedSubarray(self, nums: List[int]) -> int:' },
  { line: 3, text: '        n = len(nums)' },
  { line: 4, text: '        right = -1' },
  { line: 5, text: '        left = n' },
  { line: 6, text: '        ' },
  { line: 7, text: '        # Find right boundary: last pos where nums[i] > nums[i+1]' },
  { line: 8, text: '        max_from_left = float("-inf")' },
  { line: 9, text: '        for i in range(n):' },
  { line: 10, text: '            if nums[i] < max_from_left:' },
  { line: 11, text: '                right = i' },
  { line: 12, text: '            max_from_left = max(max_from_left, nums[i])' },
  { line: 13, text: '        ' },
  { line: 14, text: '        # Find left boundary: first pos where nums[i] < nums[i-1]' },
  { line: 15, text: '        min_from_right = float("inf")' },
  { line: 16, text: '        for i in range(n - 1, -1, -1):' },
  { line: 17, text: '            if nums[i] > min_from_right:' },
  { line: 18, text: '                left = i' },
  { line: 19, text: '            min_from_right = min(min_from_right, nums[i])' },
  { line: 20, text: '        ' },
  { line: 21, text: '        return right - left + 1 if right != -1 else 0' },
]

const PATTERNS = ['init', 'scan_right', 'scan_left', 'found_bounds', 'calculate_length', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  8: 'scan_right',
  9: 'scan_right',
  10: 'scan_right',
  11: 'scan_right',
  12: 'scan_right',
  15: 'scan_left',
  16: 'scan_left',
  17: 'scan_left',
  18: 'scan_left',
  19: 'scan_left',
  21: 'calculate_length',
}

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 21,
      relatedLines: [21],
      message: 'Empty array.',
      left: nums.length,
      right: -1,
      length: 0,
      done: true,
    })
    return steps
  }

  const n = nums.length

  // Step 1: Initialize
  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5],
    message: 'Initialize left and right pointers.',
    left: n,
    right: -1,
    length: 0,
  })

  // Step 2: Scan left to right to find right boundary
  let right = -1
  let maxFromLeft = -Infinity

  steps.push({
    phase: 'scan_right',
    activeLine: 8,
    relatedLines: [7, 8, 9, 10, 11, 12],
    message: 'Scan left to right to find right boundary.',
    left: n,
    right: -1,
    maxFromLeft: maxFromLeft,
    scannedRight: [],
    length: 0,
  })

  for (let i = 0; i < n; i++) {
    if (nums[i] < maxFromLeft) {
      right = i
    }
    maxFromLeft = Math.max(maxFromLeft, nums[i])

    steps.push({
      phase: 'scan_right',
      activeLine: i === n - 1 ? 12 : 10,
      relatedLines: [9, 10, 11, 12],
      message: `At index ${i}: nums[${i}] = ${nums[i]}${nums[i] < maxFromLeft ? ' < max' : ' >= max'}. Right = ${right}`,
      left: n,
      right: right,
      maxFromLeft: maxFromLeft,
      currentIndex: i,
      scannedRight: Array.from({ length: i + 1 }, (_, idx) => idx),
      length: 0,
    })
  }

  // Step 3: Scan right to left to find left boundary
  let left = n
  let minFromRight = Infinity

  steps.push({
    phase: 'scan_left',
    activeLine: 15,
    relatedLines: [14, 15, 16, 17, 18, 19],
    message: 'Scan right to left to find left boundary.',
    left: left,
    right: right,
    minFromRight: minFromRight,
    scannedLeft: [],
    length: 0,
  })

  for (let i = n - 1; i >= 0; i--) {
    if (nums[i] > minFromRight) {
      left = i
    }
    minFromRight = Math.min(minFromRight, nums[i])

    steps.push({
      phase: 'scan_left',
      activeLine: i === 0 ? 19 : 17,
      relatedLines: [16, 17, 18, 19],
      message: `At index ${i}: nums[${i}] = ${nums[i]}${nums[i] > minFromRight ? ' > min' : ' <= min'}. Left = ${left}`,
      left: left,
      right: right,
      minFromRight: minFromRight,
      currentIndex: i,
      scannedLeft: Array.from({ length: n - i }, (_, idx) => n - 1 - idx),
      length: right !== -1 ? right - left + 1 : 0,
    })
  }

  // Step 4: Calculate result
  const resultLength = right !== -1 ? right - left + 1 : 0

  steps.push({
    phase: 'found_bounds',
    activeLine: 21,
    relatedLines: [21],
    message: `Found bounds: left = ${left}, right = ${right}. Length = ${resultLength}`,
    left: left,
    right: right,
    length: resultLength,
  })

  if (resultLength > 0) {
    steps.push({
      phase: 'calculate_length',
      activeLine: 21,
      relatedLines: [21],
      message: `Subarray from index ${left} to ${right} needs sorting.`,
      left: left,
      right: right,
      length: resultLength,
      done: true,
    })
  } else {
    steps.push({
      phase: 'done',
      activeLine: 21,
      relatedLines: [21],
      message: 'Array is already sorted.',
      left: left,
      right: right,
      length: 0,
      done: true,
    })
  }

  return steps
}

function VisualizationPanel({ step, applyExample, examples, nums }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Array</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)', minHeight: 60 }}>
          <AnimatePresence mode="popLayout">
            {nums.map((num, idx) => {
              let color = 'var(--text-muted)'
              let borderColor = 'var(--text-muted)'
              let bgColor = 'var(--code-bg)'

              if (step?.left <= idx && idx <= step?.right && step?.right !== -1) {
                // In unsorted subarray
                color = 'var(--surface)'
                borderColor = '#ef4444'
                bgColor = '#7f1d1d'
              } else if (step?.scannedRight?.includes(idx)) {
                // Scanned in right pass
                color = 'var(--text-muted)'
                borderColor = '#38bdf8'
                bgColor = '#0c2340'
              } else if (step?.scannedLeft?.includes(idx)) {
                // Scanned in left pass
                color = 'var(--text-muted)'
                borderColor = '#a78bfa'
                bgColor = '#2d1b4e'
              }

              return (
                <motion.div
                  key={`${idx}-${num}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 40,
                    height: 40,
                    padding: '0 8px',
                    borderRadius: 4,
                    border: `2px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    color: color,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {num}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {step?.phase && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7e56f8', marginBottom: 6 }}>Phase</div>
          <div style={{ fontSize: 13, color: '#5577a4', fontFamily: 'monospace', fontWeight: 600 }}>
            {step.phase.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Bounds Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 10, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#627794', marginBottom: 4 }}>Left Index</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#067db1' }}>
              {step?.left === nums.length ? '—' : step?.left}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#627794', marginBottom: 4 }}>Right Index</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#067db1' }}>
              {step?.right === -1 ? '—' : step?.right}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#627794', marginBottom: 4 }}>Max (Left Pass)</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#a36907' }}>
              {step?.maxFromLeft === -Infinity ? '—' : step?.maxFromLeft}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#627794', marginBottom: 4 }}>Min (Right Pass)</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#a36907' }}>
              {step?.minFromRight === Infinity ? '—' : step?.minFromRight}
            </div>
          </div>
        </div>
      </div>

      {step?.length !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Length</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#178740' }}>{step.length}</div>
          {step.length > 0 && (
            <div style={{ fontSize: 11, color: '#627794', marginTop: 8 }}>
              Subarray [{step.left}, {step.right}] needs sorting
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function ShortestUnsortedVisualizer() {
  const examples = useMemo(() => getExamplesOr('shortest-unsorted', []), [])
  const [arrayInput, setArrayInput] = useState('[1,2,4,5,3]')

  const { nums, inputError } = useMemo(() => {
    try {
      const arr = JSON.parse(arrayInput)
      if (!Array.isArray(arr)) throw new Error('Input must be array')
      if (arr.some(x => typeof x !== 'number')) throw new Error('Array must contain only numbers')
      return { nums: arr, inputError: '' }
    } catch (e) {
      return { nums: [], inputError: e.message }
    }
  }, [arrayInput])

  const steps = useMemo(() => generateSteps(nums), [nums])

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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '▢ Shortest Unsorted', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Array</div>
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
                  border: inputError ? '2px solid #f87171' : '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder='[1,2,4,5,3]'
              />
              {inputError && (
                <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel nums={nums} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, arrayInput, nums, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"array","label":"array","type":"array"}]}
        values={{ array: arrayInput }}
        onChange={(k, v) => { if (k === 'array') setArrayInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
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
          onShowPatternOverlayToggle={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
