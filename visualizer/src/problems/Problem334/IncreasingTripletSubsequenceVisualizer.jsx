import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './IncreasingTripletSubsequenceVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const COLOR_TEXT = 'var(--text)'
const COLOR_FIRST = '#38bdf8'
const COLOR_SECOND = '#a78bfa'
const COLOR_FOUND = '#22c55e'
const COLOR_MISS = '#ef4444'

const SOLUTION_CODE = [
  { line: 1, text: 'def increasing_triplet(nums):' },
  { line: 2, text: '    first = float("inf")' },
  { line: 3, text: '    second = float("inf")' },
  { line: 4, text: '    for x in nums:' },
  { line: 5, text: '        if x <= first:' },
  { line: 6, text: '            first = x' },
  { line: 7, text: '        elif x <= second:' },
  { line: 8, text: '            second = x' },
  { line: 9, text: '        else:' },
  { line: 10, text: '            return True' },
  { line: 11, text: '    return False' },
]

const fmt = (v) => (v === Infinity ? '∞' : String(v))

function generateSteps(nums) {
  const steps = []
  if (!Array.isArray(nums) || nums.length === 0) return steps

  let first = Infinity
  let second = Infinity
  let firstIdx = -1
  let secondIdx = -1

  steps.push({
    phase: 'init',
    activeLine: 2,
    relatedLines: [2, 3],
    message: 'Initialize first = ∞ and second = ∞ (both still unset).',
    currentIndex: -1,
    currentValue: null,
    first,
    second,
    firstIdx,
    secondIdx,
    found: null,
    branch: 'init',
  })

  let found = false
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]

    steps.push({
      phase: 'loop',
      activeLine: 5,
      relatedLines: [4, 5, 7, 9],
      message: `i = ${i}: examine x = ${x}. Compare against first = ${fmt(first)} and second = ${fmt(second)}.`,
      currentIndex: i,
      currentValue: x,
      first,
      second,
      firstIdx,
      secondIdx,
      found: null,
      branch: 'compare',
    })

    if (x <= first) {
      first = x
      firstIdx = i
      steps.push({
        phase: 'update',
        activeLine: 6,
        relatedLines: [5, 6],
        message: `x = ${x} ≤ first → set first = ${x} (a new smallest candidate).`,
        currentIndex: i,
        currentValue: x,
        first,
        second,
        firstIdx,
        secondIdx,
        found: null,
        branch: 'first',
      })
    } else if (x <= second) {
      second = x
      secondIdx = i
      steps.push({
        phase: 'update',
        activeLine: 8,
        relatedLines: [7, 8],
        message: `first < x = ${x} ≤ second → set second = ${x} (a value with a smaller one before it).`,
        currentIndex: i,
        currentValue: x,
        first,
        second,
        firstIdx,
        secondIdx,
        found: null,
        branch: 'second',
      })
    } else {
      found = true
      steps.push({
        phase: 'done',
        activeLine: 10,
        relatedLines: [9, 10],
        message: `x = ${x} > second (${fmt(second)}) → found first < second < x. Triplet exists, return True.`,
        currentIndex: i,
        currentValue: x,
        first,
        second,
        firstIdx,
        secondIdx,
        found: true,
        branch: 'found',
      })
      break
    }
  }

  if (!found) {
    steps.push({
      phase: 'done',
      activeLine: 11,
      relatedLines: [11],
      message: 'Loop finished without a value greater than second. No increasing triplet, return False.',
      currentIndex: -1,
      currentValue: null,
      first,
      second,
      firstIdx,
      secondIdx,
      found: false,
      branch: 'notfound',
    })
  }

  return steps
}

const REGISTERED_EXAMPLES = getExamplesOr('increasing-triplet-subsequence', [])
const EXAMPLES =
  REGISTERED_EXAMPLES.length > 0
    ? REGISTERED_EXAMPLES
    : [
        { label: 'Triplet exists', inputs: [2, 1, 5, 0, 4, 6] },
        { label: 'Strictly increasing', inputs: [1, 2, 3, 4, 5] },
        { label: 'Decreasing (none)', inputs: [5, 4, 3, 2, 1] },
        { label: 'Tricky reset', inputs: [20, 100, 10, 12, 5, 13] },
        { label: 'Duplicates only', inputs: [2, 2, 2, 2] },
      ]

function parseInput(raw) {
  try {
    const parsed = JSON.parse(raw)
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.nums)
        ? parsed.nums
        : null
    if (!arr) {
      return { nums: [], error: 'Input must be a JSON array of numbers, e.g. [2,1,5,0,4,6]' }
    }
    if (!arr.every((n) => typeof n === 'number' && Number.isFinite(n))) {
      return { nums: [], error: 'All elements must be finite numbers.' }
    }
    return { nums: arr, error: '' }
  } catch (e) {
    return { nums: [], error: e.message }
  }
}

function VisualizationPanel({ step, stepIndex, nums, first, second, firstIndex, secondIndex, currentIndex, found }) {
  return <div className="increasing-triplet-subsequence-panel-body" style={{ height: '100%', overflow: 'auto' }}><div className="increasing-triplet-subsequence-viz">
    <div className="increasing-triplet-subsequence-step-info"><h3>{step?.message || 'Press play (or Next) to trace the greedy scan.'}</h3></div>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: `${COLOR_FIRST}1a`, border: `1px solid ${COLOR_FIRST}` }}><span style={{ color: COLOR_FIRST, fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>first</span><span style={{ color: COLOR_TEXT, fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>{fmt(first)}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: `${COLOR_SECOND}1a`, border: `1px solid ${COLOR_SECOND}` }}><span style={{ color: COLOR_SECOND, fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>second</span><span style={{ color: COLOR_TEXT, fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>{fmt(second)}</span></div></div>
    {nums.length === 0 ? <div style={{ color: '#627794', fontSize: 13 }}>Provide a non-empty array to visualize.</div> : <AnimatePresence mode="wait"><motion.div key={stepIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{nums.map((value, index) => { const isCurrent = index === currentIndex; const isFirst = index === firstIndex; const isSecond = index === secondIndex; const isFoundBox = isCurrent && found === true; const borderColor = isFoundBox ? COLOR_FOUND : isFirst ? COLOR_FIRST : isSecond ? COLOR_SECOND : isCurrent ? COLOR_TEXT : 'transparent'; return <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><div style={{ height: 16, display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>{isFirst && <span style={{ color: COLOR_FIRST }}>first</span>}{isSecond && <span style={{ color: COLOR_SECOND }}>second</span>}</div><div style={{ width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `2px solid ${borderColor}`, background: isFoundBox ? `${COLOR_FOUND}26` : isFirst ? `${COLOR_FIRST}1f` : isSecond ? `${COLOR_SECOND}1f` : isCurrent ? 'rgba(226,232,240,0.12)' : 'rgba(148,163,184,0.08)', color: COLOR_TEXT, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, boxShadow: isCurrent ? `0 0 0 3px ${borderColor}44` : 'none' }}>{value}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{index}</div></div> })}</motion.div></AnimatePresence>}
    {found !== null && <div style={{ padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: 14, background: found ? `${COLOR_FOUND}1f` : `${COLOR_MISS}1f`, border: `1px solid ${found ? COLOR_FOUND : COLOR_MISS}`, color: found ? COLOR_FOUND : COLOR_MISS }}>{found ? 'TRUE - an increasing triplet exists.' : 'FALSE - no increasing triplet subsequence exists.'}</div>}
  </div></div>
}

export default function IncreasingTripletSubsequenceVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify([2, 1, 5, 0, 4, 6]))

  const { nums, error: inputError } = useMemo(() => parseInput(inputValue), [inputValue])

  const steps = useMemo(() => generateSteps(nums), [nums])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const first = step ? step.first : Infinity
  const second = step ? step.second : Infinity
  const firstIdx = step ? step.firstIdx : -1
  const secondIdx = step ? step.secondIdx : -1
  const currentIndex = step ? step.currentIndex : -1
  const found = step ? step.found : null
  const applyExample = useCallback((example) => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }, [handleReset])
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Increasing Triplet', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="increasing-triplet-subsequence-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && <>
        {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'nums', label: 'Numbers', type: 'array' }]} values={{ nums: inputValue }} onChange={(_, value) => { setInputValue(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={inputError} />, panelDivs.input)}
        {panelDivs.viz && createPortal(<VisualizationPanel step={step} stepIndex={stepIndex} nums={nums} first={first} second={second} firstIndex={firstIdx} secondIndex={secondIdx} currentIndex={currentIndex} found={found} />, panelDivs.viz)}
        {panelDivs.code && createPortal(<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} />, panelDivs.code)}
      </>}

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        />
      </FloatingPanel>
    </div>
  )
}
