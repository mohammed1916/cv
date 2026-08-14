import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './KthLargestElementVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findKthLargest(self, nums, k):' },
  { line: 3, text: '        heap = []' },
  { line: 4, text: '        for n in nums:' },
  { line: 5, text: '            heappush(heap, n)' },
  { line: 6, text: '            if len(heap) > k:' },
  { line: 7, text: '                heappop(heap)' },
  { line: 8, text: '        return heap[0]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function parseArray(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed)) throw new Error('nums must be array')
  return parsed.map(Number)
}

function generateSteps(nums, k) {
  const steps = []
  const heap = []
  steps.push({ phase: 'init', activeLine: 3, nums, k, heap: [...heap], i: -1, val: null, message: `Build min-heap of size k=${k}.` })
  for (let i = 0; i < nums.length; i++) {
    const val = nums[i]
    heap.push(val)
    heap.sort((a, b) => a - b)
    steps.push({ phase: 'push', activeLine: 5, nums, k, heap: [...heap], i, val, message: `Push ${val}.` })
    if (heap.length > k) {
      const removed = heap.shift()
      steps.push({ phase: 'pop', activeLine: 7, nums, k, heap: [...heap], i, val, removed, message: `Heap size > k, pop ${removed}.` })
    }
  }
  steps.push({ phase: 'done', activeLine: 8, nums, k, heap: [...heap], i: nums.length - 1, val: null, message: `kth largest = ${heap[0]}.` })
  return steps
}

const EXAMPLES = getExamples('kth-largest-element')

export default function KthLargestElementVisualizer() {
  const [numsInput, setNumsInput] = useState('[3,2,1,5,6,4]')
  const [kInput, setKInput] = useState('2')
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { nums, k, inputError } = useMemo(() => {
    try {
      const arr = parseArray(numsInput)
      const kv = Number(kInput)
      if (!Number.isInteger(kv) || kv < 1 || kv > arr.length) throw new Error('k must be between 1 and len(nums)')
      return { nums: arr, k: kv, inputError: '' }
    } catch (e) {
      return { nums: [3, 2, 1, 5, 6, 4], k: 2, inputError: e.message || 'Invalid input' }
    }
  }, [numsInput, kInput])

  const steps = useMemo(() => generateSteps(nums, k), [nums, k])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    setKInput(String(ex.k))
    handleReset()
  }, [handleReset])

  const inputPanel = (
    <div className="kl-body">
      <div className="kl-examples">{EXAMPLES.map((ex) => <button key={ex.label} className="kl-chip" onClick={() => applyExample(ex)}>{ex.label}</button>)}</div>
      <div className="kl-inputs">
        <input className="kl-input" value={numsInput} onChange={(e) => { setNumsInput(e.target.value); handleReset() }} placeholder="e.g., [3,2,1,5,6,4]" />
        <input className="kl-input small" value={kInput} onChange={(e) => { setKInput(e.target.value); handleReset() }} placeholder="k" />
      </div>
      {inputError && <div className="kl-error">{inputError}</div>}
      <div className="kl-stream">
        {nums.map((v, i) => <motion.div key={`${v}-${i}`} className={`kl-num ${step?.i === i ? 'active' : ''}`} animate={step?.i === i ? { y: -5 } : { y: 0 }}>{v}</motion.div>)}
      </div>
    </div>
  )

  const heapPanel = (
    <div className="kl-body">
      <div className="kl-heap">{(step?.heap || []).map((v, i) => <div key={`${v}-${i}`} className={`kl-node ${i === 0 ? 'root' : ''}`}>{v}</div>)}</div>
      <div className={`kl-result ${step?.phase === 'done' ? 'ok' : ''}`}>{step?.phase === 'done' ? `Return ${step.heap[0]}` : `Current kth candidate: ${step?.heap?.[0] ?? '—'}`}</div>
      <div className="kl-status">{step?.message || 'Press Play.'}</div>
    </div>
  )

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
      autoScroll={autoScrollCode}
    />
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input & Heap Evolution' },
    { id: 'heap', title: 'Min-Heap State', dockMode: 'split-right' },
    { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="kl-shell">
    <>
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"string"},{"key":"k","label":"k","type":"number"}]}
        values={{ nums: numsInput, k: kInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'k') setKInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

      <section className="kl-hero">
        <div className="kl-hero-copy">
          <span className="kl-kicker">LeetCode 215 • Binary Heap</span>
          <h2>Find the Kth Largest Element using a min-heap.</h2>
          <p>
            This walkthrough shows how maintaining a min-heap of size k lets us efficiently find
            the kth largest element in a single pass.
          </p>
        </div>
      </section>

      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.heap && createPortal(heapPanel, panelDivs.heap)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          <PlaybackControls
            onReset={handleReset}
            onPrev={stepBack}
            onPlayToggle={togglePlay}
            onNext={stepForward}
            resetDisabled={steps.length === 0}
            prevDisabled={stepIndex <= 0}
            nextDisabled={steps.length === 0 || isDone}
            isPlaying={isPlaying}
            isDone={isDone}
            speed={speed}
            onSpeedChange={(e) => setSpeed(Number(e.target.value))}
            speedIndicator={`${speed}ms`}
            autoScroll={autoScrollCode}
            onAutoScrollChange={setAutoScrollCode}
            autoScrollLabel="Auto-scroll code"
            showAutoScroll
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
          />
        </FloatingPanel>,
        document.body
      )}

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
