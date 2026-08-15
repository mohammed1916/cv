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
import './ArrayNestingVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def arrayNesting(self, nums: list[int]) -> int:' },
  { line: 3, text: '        n = len(nums)' },
  { line: 4, text: '        visited = [False] * n' },
  { line: 5, text: '        max_cycle = 0' },
  { line: 6, text: '        ' },
  { line: 7, text: '        for i in range(n):' },
  { line: 8, text: '            if not visited[i]:' },
  { line: 9, text: '                cycle_size = 0' },
  { line: 10, text: '                curr = i' },
  { line: 11, text: '                ' },
  { line: 12, text: '                while not visited[curr]:' },
  { line: 13, text: '                    visited[curr] = True' },
  { line: 14, text: '                    curr = nums[curr]' },
  { line: 15, text: '                    cycle_size += 1' },
  { line: 16, text: '                ' },
  { line: 17, text: '                max_cycle = max(max_cycle, cycle_size)' },
  { line: 18, text: '        ' },
  { line: 19, text: '        return max_cycle' },
]

const PATTERNS = ['init', 'traversal', 'jump', 'mark_visited', 'update_max', 'done']
const LINE_PATTERN_MAP = {
  7: 'init',
  8: 'init',
  12: 'traversal',
  13: 'mark_visited',
  14: 'jump',
  15: 'jump',
  17: 'update_max',
  19: 'done',
}

function generateSteps(arrayInput) {
  const steps = []

  if (!Array.isArray(arrayInput) || arrayInput.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 19,
      relatedLines: [19],
      message: 'Invalid input.',
      result: 0,
      done: true,
    })
    return steps
  }

  const n = arrayInput.length
  let visited = new Array(n).fill(false)
  let maxCycle = 0

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5],
    message: `Initialize: n = ${n}, visited = [false x ${n}], max_cycle = 0`,
    array: arrayInput,
    visited: [...visited],
    maxCycle,
  })

  for (let i = 0; i < n; i++) {
    if (visited[i]) {
      steps.push({
        phase: 'init',
        activeLine: 8,
        relatedLines: [8],
        message: `Index ${i} already visited, skip.`,
        array: arrayInput,
        visited: [...visited],
        currentIndex: i,
        maxCycle,
      })
      continue
    }

    steps.push({
      phase: 'init',
      activeLine: 8,
      relatedLines: [8],
      message: `Start cycle detection from index ${i}`,
      array: arrayInput,
      visited: [...visited],
      currentIndex: i,
      maxCycle,
    })

    steps.push({
      phase: 'traversal',
      activeLine: 9,
      relatedLines: [9, 10],
      message: `Initialize cycle_size = 0, curr = ${i}`,
      array: arrayInput,
      visited: [...visited],
      currentIndex: i,
      cycleSize: 0,
      curr: i,
      path: [i],
      maxCycle,
    })

    let cycleSize = 0
    let curr = i
    const path = [i]
    const localVisited = [...visited]

    while (!localVisited[curr]) {
      steps.push({
        phase: 'traversal',
        activeLine: 12,
        relatedLines: [12],
        message: `Check: visited[${curr}] = ${localVisited[curr]}, continue`,
        array: arrayInput,
        visited: [...localVisited],
        currentIndex: i,
        cycleSize,
        curr,
        path: [...path],
        maxCycle,
      })

      localVisited[curr] = true
      steps.push({
        phase: 'mark_visited',
        activeLine: 13,
        relatedLines: [13],
        message: `Mark visited[${curr}] = true`,
        array: arrayInput,
        visited: [...localVisited],
        currentIndex: i,
        cycleSize,
        curr,
        path: [...path],
        maxCycle,
      })

      const nextIndex = arrayInput[curr]
      path.push(nextIndex)

      steps.push({
        phase: 'jump',
        activeLine: 14,
        relatedLines: [14],
        message: `Jump: curr = nums[${curr}] = ${nextIndex}`,
        array: arrayInput,
        visited: [...localVisited],
        currentIndex: i,
        cycleSize,
        curr: nextIndex,
        path: [...path],
        maxCycle,
      })

      cycleSize++

      steps.push({
        phase: 'jump',
        activeLine: 15,
        relatedLines: [15],
        message: `Increment cycle_size to ${cycleSize}`,
        array: arrayInput,
        visited: [...localVisited],
        currentIndex: i,
        cycleSize,
        curr: nextIndex,
        path: [...path],
        maxCycle,
      })
    }

    steps.push({
      phase: 'traversal',
      activeLine: 12,
      relatedLines: [12],
      message: `Loop ends: visited[${curr}] = true, cycle complete`,
      array: arrayInput,
      visited: [...localVisited],
      currentIndex: i,
      cycleSize,
      curr,
      path: [...path],
      maxCycle,
    })

    const newMaxCycle = Math.max(maxCycle, cycleSize)

    steps.push({
      phase: 'update_max',
      activeLine: 17,
      relatedLines: [17],
      message: `Update max_cycle: max(${maxCycle}, ${cycleSize}) = ${newMaxCycle}`,
      array: arrayInput,
      visited: [...localVisited],
      currentIndex: i,
      cycleSize,
      maxCycle: newMaxCycle,
      path: [...path],
    })

    maxCycle = newMaxCycle
    visited = localVisited
  }

  steps.push({
    phase: 'done',
    activeLine: 19,
    relatedLines: [19],
    message: `Array nesting complete. Longest cycle size: ${maxCycle}`,
    result: maxCycle,
    array: arrayInput,
    visited,
    maxCycle,
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

      {step?.array && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Array</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', gap: 6 }}>
            {step.array.map((val, idx) => {
              const isCurrentIndex = idx === step.currentIndex
              const isInPath = step.path?.includes(idx)
              const isVisited = step.visited?.[idx]

              let bgColor = '#1e293b'
              let borderColor = '#475569'

              if (isCurrentIndex) {
                bgColor = '#fca5a5'
                borderColor = '#f87171'
              } else if (isInPath) {
                bgColor = '#a78bfa'
                borderColor = '#9f7aea'
              } else if (isVisited) {
                bgColor = '#22c55e'
                borderColor = '#16a34a'
              }

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: 8,
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: 4,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: '#5577a4',
                    fontSize: 12,
                  }}
                  animate={{ scale: isCurrentIndex ? 1.1 : 1 }}
                >
                  <div style={{ fontSize: 10, color: '#627794' }}>i:{idx}</div>
                  <div>{val}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {step?.path && step?.path.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #9f7aea' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8758e5', marginBottom: 8 }}>Path (Index Jumps)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {step.path.map((idx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #9f7aea',
                    borderRadius: 3,
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {idx}
                </div>
                {i < step.path.length - 1 && (
                  <div style={{ color: '#8758e5', fontWeight: 'bold' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.cycleSize !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f87171' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ea0c0c', marginBottom: 6 }}>Cycle Size</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#ea0c0c' }}>
            {step.cycleSize}
          </div>
        </div>
      )}

      {step?.maxCycle !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Max Cycle Found</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#067db1' }}>
            {step.maxCycle}
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#178740' }}>
            Longest Cycle: {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ArrayNestingVisualizer() {
  const examples = useMemo(() => getExamplesOr('array-nesting', []), [])
  const [arrayInput, setArrayInput] = useState("[5,4,0,3,1,6,2]");
  const { array, inputError } = useMemo(() => {
    try {
      const arr = JSON.parse(arrayInput)
      if (!Array.isArray(arr)) throw new Error('Input must be array')
      if (!arr.every((x) => typeof x === 'number' && x >= 0 && x < arr.length)) {
        throw new Error('All elements must be 0 <= x < length')
      }
      return { array: arr, inputError: '' }
    } catch (e) {
      return { array: [], inputError: e.message }
    }
  }, [arrayInput])

  const steps = useMemo(() => generateSteps(array), [array])

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
      setArrayInput(JSON.stringify(ex.array || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔄 Array Nesting', dockMode: 'split-right' },
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
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
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
          fields={[{"key":"array","label":"array","type":"string"}]}
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
