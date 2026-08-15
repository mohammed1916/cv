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
const PATTERNS = ['checking', 'done', 'found_missing', 'initialized', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  4: 'initialized',
  5: 'checking',
  6: 'found_missing',
  7: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findDisappearedNumbers(nums: list) -> list:' },
  { line: 2, text: '    seen = set(nums)' },
  { line: 3, text: '    result = []' },
  { line: 4, text: '    for i in range(1, len(nums) + 1):' },
  { line: 5, text: '        if i not in seen:' },
  { line: 6, text: '            result.append(i)' },
  { line: 7, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('find-all-numbers-disappeared-in-array', [
  { label: 'Example 1', nums: [4, 3, 2, 7, 8, 2, 3, 1], expected: [5, 6] },
  { label: 'Example 2', nums: [1, 1], expected: [2] },
  { label: 'Example 3', nums: [1, 2, 3], expected: [] },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2, 3] },
  { id: 'loop', label: 'Check Range', lines: [4, 5, 6] },
  { id: 'return', label: 'Return', lines: [7] },
]

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums: [],
      seen: new Set(),
      result: [],
      stepNum: 0,
      message: 'Invalid or empty input.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    nums: [...nums],
    seen: new Set(nums),
    result: [],
    stepNum: 0,
    message: `Input: ${JSON.stringify(nums)}, n=${nums.length}`,
  })

  const seen = new Set(nums)
  let result = []
  let stepNum = 1

  steps.push({
    phase: 'initialized',
    activeLine: 4,
    nums: [...nums],
    seen,
    result: [],
    stepNum,
    message: `Set built: ${JSON.stringify([...seen].sort((a, b) => a - b))}`,
  })
  stepNum++

  for (let i = 1; i <= nums.length; i++) {
    steps.push({
      phase: 'checking',
      activeLine: 5,
      nums: [...nums],
      seen,
      result: [...result],
      currentNum: i,
      stepNum,
      message: `Checking i=${i}. In set? ${seen.has(i)}`,
    })
    stepNum++

    if (!seen.has(i)) {
      result.push(i)

      steps.push({
        phase: 'found_missing',
        activeLine: 6,
        nums: [...nums],
        seen,
        result: [...result],
        currentNum: i,
        stepNum,
        message: `${i} not found! Added to result.`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 7,
    nums: [...nums],
    seen,
    result: [...result],
    stepNum,
    message: `Missing numbers: ${JSON.stringify(result)}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'initialized') return 'init'
  if (phase === 'checking' || phase === 'found_missing') return 'loop'
  if (phase === 'done') return 'return'
  return 'init'
}

function InputArray({ nums, currentNum }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Input Array
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {nums.map((val, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              minWidth: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#1e40af',
            }}
          >
            {val}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SeenSet({ seen, currentNum }) {
  const arr = Array.from(seen).sort((a, b) => a - b)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Seen Set ({arr.length} elements)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {arr.map((val) => {
          const isActive = val === currentNum
          return (
            <motion.div
              key={val}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isActive ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? '#dcfce7' : '#e0e7ff',
                border: `2px solid ${isActive ? '#22c55e' : '#818cf8'}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? '#15803d' : '#3730a3',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ResultBuilder({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Missing Numbers ({result.length} found)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {result.length === 0 ? (
          <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>None</div>
        ) : (
          result.map((num, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fecaca',
                border: '2px solid #dc2626',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                color: '#7f1d1d',
              }}
            >
              {num}
            </motion.div>
          ))
        )}
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
          Array (comma-separated, 1 to n range)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={numsInput}
            onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
            placeholder="e.g., 4,3,2,7,8,2,3,1"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
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
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, flex: 1 }}>
        <InputArray nums={step?.nums || []} currentNum={step?.currentNum} />
        <SeenSet seen={step?.seen || new Set()} currentNum={step?.currentNum} />
        <ResultBuilder result={step?.result || []} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Finding the Missing Guests
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Track which guests attended the party (1 to n), then identify who was invited but didn't show.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem448Visualizer() {
  const [numsInput, setNumsInput] = useState('4,3,2,7,8,2,3,1')

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
