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
import './ArrayPartitionVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def arrayPairSum(self, nums: List[int]) -> int:' },
  { line: 3, text: '        nums.sort()' },
  { line: 4, text: '        ' },
  { line: 5, text: '        total = 0' },
  { line: 6, text: '        for i in range(0, len(nums), 2):' },
  { line: 7, text: '            total += nums[i]' },
  { line: 8, text: '        ' },
  { line: 9, text: '        return total' },
]

const PATTERNS = ['sort', 'iterate', 'sum_pair', 'done']
const LINE_PATTERN_MAP = {
  3: 'sort',
  6: 'iterate',
  7: 'sum_pair',
  9: 'done',
}

function generateSteps(numsInput) {
  const steps = []

  if (!Array.isArray(numsInput) || numsInput.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 9,
      relatedLines: [9],
      message: 'Empty array. Result = 0',
      result: 0,
      done: true,
    })
    return steps
  }

  if (numsInput.length % 2 !== 0) {
    steps.push({
      phase: 'done',
      activeLine: 9,
      relatedLines: [9],
      message: 'Array length must be even.',
      result: 0,
      done: true,
    })
    return steps
  }

  // Initial state
  steps.push({
    phase: 'sort',
    activeLine: 2,
    relatedLines: [2],
    message: `Start with array: ${JSON.stringify(numsInput)}`,
    array: numsInput,
    arrayState: 'original',
  })

  // Sorting step
  const sorted = [...numsInput].sort((a, b) => a - b)
  steps.push({
    phase: 'sort',
    activeLine: 3,
    relatedLines: [3],
    message: `Sort the array in ascending order`,
    array: sorted,
    arrayState: 'sorting',
  })

  steps.push({
    phase: 'sort',
    activeLine: 3,
    relatedLines: [3],
    message: `Sorted array: ${JSON.stringify(sorted)}. Now extract every 2nd element starting from index 0.`,
    array: sorted,
    arrayState: 'sorted',
  })

  // Initialize total
  steps.push({
    phase: 'iterate',
    activeLine: 5,
    relatedLines: [5],
    message: `Initialize total = 0`,
    array: sorted,
    total: 0,
    arrayState: 'sorted',
  })

  // Iterate and sum
  let total = 0
  const pairs = []
  const selectedIndices = []

  for (let i = 0; i < sorted.length; i += 2) {
    const minVal = sorted[i]
    const maxVal = sorted[i + 1]

    selectedIndices.push(i)
    pairs.push({ min: minVal, max: maxVal })
    total += minVal

    steps.push({
      phase: 'iterate',
      activeLine: 6,
      relatedLines: [6],
      message: `i = ${i}: Entering pair iteration for elements at indices ${i} and ${i + 1}`,
      array: sorted,
      total,
      currentIndex: i,
      pairs,
      selectedIndices,
      arrayState: 'sorted',
    })

    steps.push({
      phase: 'sum_pair',
      activeLine: 7,
      relatedLines: [7],
      message: `Pair (${minVal}, ${maxVal}): Add min value ${minVal}. Total: ${total}`,
      array: sorted,
      total,
      currentPair: { min: minVal, max: maxVal },
      currentIndex: i,
      pairs,
      selectedIndices,
      arrayState: 'sorted',
    })
  }

  // Final result
  steps.push({
    phase: 'done',
    activeLine: 9,
    relatedLines: [9],
    message: `All pairs processed. Maximum sum of minimums = ${total}`,
    array: sorted,
    total,
    pairs,
    selectedIndices,
    arrayState: 'done',
    result: total,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
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

      {step?.array && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Array</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {step.array.map((val, idx) => {
              const isSelected = step.selectedIndices && step.selectedIndices.includes(idx)
              const isMin = step.currentIndex !== undefined && (idx === step.currentIndex)
              const isMax = step.currentIndex !== undefined && (idx === step.currentIndex + 1)

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    backgroundColor: isSelected
                      ? '#38bdf8'
                      : isMin
                        ? '#22c55e'
                        : isMax
                          ? '#f97316'
                          : 'var(--border)',
                    color: isSelected || isMin || isMax ? 'var(--code-bg)' : 'var(--text)',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 12,
                    minWidth: 40,
                    textAlign: 'center',
                  }}
                  animate={{
                    scale: isSelected || isMin || isMax ? 1.1 : 1,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>
          <div style={{ fontSize: 10, color: '#627794', marginTop: 8 }}>
            <span style={{ color: '#178740', fontWeight: 600 }}>Green</span> = min of pair,{' '}
            <span style={{ color: '#c35305', fontWeight: 600 }}>Orange</span> = max of pair,{' '}
            <span style={{ color: '#067db1', fontWeight: 600 }}>Cyan</span> = selected minimums
          </div>
        </div>
      )}

      {step?.pairs && step.pairs.length > 0 && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Pairs Formed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {step.pairs.map((pair, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 3,
                    backgroundColor: 'var(--border)',
                    fontFamily: 'monospace',
                    color: 'var(--text)',
                    minWidth: 50,
                    textAlign: 'center',
                  }}
                >
                  ({pair.min}, {pair.max})
                </div>
                <span style={{ color: '#627794' }}>→</span>
                <span style={{ color: '#178740', fontWeight: 600 }}>min: {pair.min}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.currentPair && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #f97316' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#c35305', marginBottom: 6 }}>Current Pair</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span>({step.currentPair.min}, {step.currentPair.max})</span>
            <span style={{ color: '#627794' }}>→</span>
            <span style={{ color: '#178740', fontWeight: 600 }}>Add {step.currentPair.min}</span>
          </div>
        </div>
      )}

      {step?.total !== undefined && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Running Total</div>
          <div style={{ fontSize: 16, color: '#067db1', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.total}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Maximum Sum</div>
          <div
            style={{
              fontSize: 20,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#178740',
            }}
          >
            {step.result}
          </div>
          <div style={{ fontSize: 11, color: '#627794', marginTop: 8 }}>
            Sum of all pair minimums
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ArrayPartitionVisualizer() {
  const examples = useMemo(() => getExamplesOr('array-partition', []), [])
  const [arrayInput, setArrayInput] = useState('[1,4,3,2]')

  const { nums, inputError } = useMemo(() => {
    try {
      const arr = JSON.parse(arrayInput)
      if (!Array.isArray(arr)) throw new Error('Input must be an array')
      if (arr.length === 0) throw new Error('Array cannot be empty')
      if (arr.length % 2 !== 0) throw new Error('Array length must be even')
      if (!arr.every((x) => typeof x === 'number')) throw new Error('All elements must be numbers')
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
    { id: 'viz', title: '🔢 Array Partition', dockMode: 'split-right' },
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Array (JSON)</div>
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
              />
              {inputError && <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, arrayInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
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
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
