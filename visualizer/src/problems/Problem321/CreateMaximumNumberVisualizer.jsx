import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './CreateMaximumNumberVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { StackLane } from '../../components/shared'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'choose', 'compare', 'done']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'choose',
  7: 'compare',
  9: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maxNumber(self, nums1: List[int], nums2: List[int], k: int) -> List[int]:' },
  { line: 3, text: '        best = []' },
  { line: 4, text: '        for take1 in range(max(0, k - len(nums2)), min(k, len(nums1)) + 1):' },
  { line: 5, text: '            a = pick_max(nums1, take1)  # monotonic stack' },
  { line: 6, text: '            b = pick_max(nums2, k - take1)' },
  { line: 7, text: '            candidate = merge(a, b)     # take larger remaining suffix' },
  { line: 8, text: '            best = max(best, candidate)' },
  { line: 9, text: '        return best' },
]

function pickMax(nums, count) {
  const stack = []
  let drop = nums.length - count
  for (const digit of nums) {
    while (drop && stack.length && stack[stack.length - 1] < digit) {
      stack.pop()
      drop -= 1
    }
    stack.push(digit)
  }
  return stack.slice(0, count)
}

function greater(a, i, b, j) {
  while (i < a.length && j < b.length && a[i] === b[j]) { i += 1; j += 1 }
  return j === b.length || (i < a.length && a[i] > b[j])
}

function merge(a, b) {
  const merged = []
  let i = 0; let j = 0
  while (i < a.length || j < b.length) merged.push(greater(a, i, b, j) ? a[i++] : b[j++])
  return merged
}

function generateSteps({ nums1, nums2, k }) {
  const steps = []
  steps.push({
    phase: 'init',
    activeLine: 1,
    nums1, nums2, k, best: [],
    message: `Build the largest ${k}-digit sequence by trying every valid split.`
  })
  let best = []
  const start = Math.max(0, k - nums2.length)
  const end = Math.min(k, nums1.length)
  for (let take1 = start; take1 <= end; take1 += 1) {
    const take2 = k - take1
    const chosen1 = pickMax(nums1, take1)
    const chosen2 = pickMax(nums2, take2)
    const candidate = merge(chosen1, chosen2)
    steps.push({ phase: 'choose', activeLine: 5, nums1, nums2, k, take1, take2, chosen1, chosen2, candidate, best, message: `Keep ${take1} digit${take1 === 1 ? '' : 's'} from nums1 and ${take2} from nums2 using a monotonic stack.` })
    const replacesBest = greater(candidate, 0, best, 0)
    if (replacesBest) best = candidate
    steps.push({ phase: 'compare', activeLine: 8, nums1, nums2, k, take1, take2, chosen1, chosen2, candidate, best, replacesBest, message: replacesBest ? 'This merged candidate is lexicographically larger, so it becomes the best answer.' : 'The current best answer remains lexicographically larger.' })
  }
  steps.push({ phase: 'done', activeLine: 9, nums1, nums2, k, best, message: `All splits are checked. The maximum number is ${best.join('')}.` })
  return steps
}

const EXAMPLES = getExamplesOr('create-maximum-number', [
  { label: 'Classic', nums1: [3, 4, 6, 5], nums2: [9, 1, 2, 5, 8, 3], k: 5 },
  { label: 'All digits', nums1: [6, 7], nums2: [6, 0, 4], k: 5 },
  { label: 'Tie break', nums1: [3, 9], nums2: [8, 9], k: 3 },
])

export default function CreateMaximumNumberVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.nums1) || !Array.isArray(data.nums2) || !Number.isInteger(data.k)) throw new Error('Use { "nums1": [digits], "nums2": [digits], "k": number }.')
      if (![...data.nums1, ...data.nums2].every((digit) => Number.isInteger(digit) && digit >= 0 && digit <= 9)) throw new Error('nums1 and nums2 must contain digits from 0 through 9.')
      if (data.k < 0 || data.k > data.nums1.length + data.nums2.length) throw new Error('k must be between 0 and nums1.length + nums2.length.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(
    () => (input ? generateSteps(input) : []).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [input],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const renderVisualization = () => {
    if (!input) return <div className="create-maximum-number-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <div className="create-maximum-number-viz">
        <div className="create-maximum-number-step-info"><h3>{currentStepData.message}</h3></div>
        <div className="create-maximum-number-source"><span>nums1</span>{(currentStepData.nums1 || []).map((digit, i) => <b key={`a-${i}`}>{digit}</b>)}</div>
        <div className="create-maximum-number-source"><span>nums2</span>{(currentStepData.nums2 || []).map((digit, i) => <b key={`b-${i}`}>{digit}</b>)}</div>
        {currentStepData.candidate && <>
          <div className="create-maximum-number-split">Split: {currentStepData.take1} from nums1 + {currentStepData.take2} from nums2</div>
          <StackLane title="pickMax(nums1)" items={currentStepData.chosen1} note="monotonic stack result" />
          <StackLane title="pickMax(nums2)" items={currentStepData.chosen2} note="monotonic stack result" />
          <div className="create-maximum-number-result-row"><span>picked</span><code>{currentStepData.chosen1.join('')} + {currentStepData.chosen2.join('')}</code></div>
          <div className={`create-maximum-number-result-row ${currentStepData.replacesBest ? 'is-best' : ''}`}><span>candidate</span><code>{currentStepData.candidate.join('')}</code></div>
        </>}
        <div className="create-maximum-number-result-row is-best"><span>best</span><code>{(currentStepData.best || []).join('') || '—'}</code></div>
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'code', title: 'Code', dockMode: 'split-bottom' },
    { id: 'viz', title: '📚 Greedy stacks', dockMode: 'split-right' },
  ], [])
  const panelContents = {
    code: (<div style={{ position: 'relative', height: '100%', minHeight: 0 }}><CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} disableResizer />{showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}</div>),
    input: (<div className="create-maximum-number-panel"><div className="create-maximum-number-panel-head">Arrays & k input</div><div className="create-maximum-number-panel-body"><textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="create-maximum-number-textarea"
                placeholder="Enter input..."
              />
      <div className="create-maximum-number-examples">{EXAMPLES.map((example, i) => <button key={i} className="create-maximum-number-example-btn" onClick={() => applyExample(example)}>{example.label}</button>)}</div></div></div>),
    viz: (<div className="create-maximum-number-panel create-maximum-number-panel-viz"><div className="create-maximum-number-panel-head">Greedy stacks</div><div className="create-maximum-number-panel-body">{renderVisualization()}</div></div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="create-maximum-number-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.input && createPortal(panelContents.input, panelDivs.input)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
      </FloatingPanel>
    </div>
  )
}
