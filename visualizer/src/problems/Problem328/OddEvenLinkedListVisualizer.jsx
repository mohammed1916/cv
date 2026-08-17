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
import './OddEvenLinkedListVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PointerRail from '../../components/shared/PointerRail'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'rewire', 'done']
const LINE_PATTERN_MAP = {
  3: 'init', 6: 'rewire', 9: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def oddEvenList(self, head: Optional[ListNode]) -> Optional[ListNode]:' },
  { line: 3, text: '        if not head or not head.next: return head' },
  { line: 4, text: '        odd, even, even_head = head, head.next, head.next' },
  { line: 5, text: '        while even and even.next:' },
  { line: 6, text: '            odd.next = even.next; odd = odd.next' },
  { line: 7, text: '            even.next = odd.next; even = even.next' },
  { line: 8, text: '        odd.next = even_head' },
  { line: 9, text: '        return head' },
]

function generateSteps({ values }) {
  const steps = [{ phase: 'init', activeLine: 4, values, odd: 0, even: 1, message: 'Keep the first even node so the odd chain can be connected at the end.' }]
  let odd = 0; let even = 1
  while (even < values.length && even + 1 < values.length) {
    odd += 2
    steps.push({ phase: 'rewire', activeLine: 6, values, odd, even, message: `Link odd node ${odd - 2} to the next odd node ${odd}.` })
    even += 2
    steps.push({ phase: 'rewire', activeLine: 7, values, odd, even: even < values.length ? even : null, message: `Advance the even pointer to ${even < values.length ? even : 'the end'}.` })
  }
  steps.push({ phase: 'done', activeLine: 9, values, odd, even: null, result: [...values.filter((_, i) => i % 2 === 0), ...values.filter((_, i) => i % 2 === 1)], message: 'Append the saved even chain after the odd chain.' })
  return steps
}

const EXAMPLES = getExamplesOr('odd-even-linked-list', [{ label: '1 → 2 → 3 → 4 → 5', values: [1, 2, 3, 4, 5] }, { label: 'Even length', values: [2, 1, 3, 5, 6, 4, 7] }])

export default function OddEvenLinkedListVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.values) || !data.values.every(Number.isFinite)) throw new Error('Use { "values": [1, 2, 3, 4, 5] }.')
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
    if (!input) return <div className="odd-even-linked-list-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <div className="odd-even-linked-list-viz">
        <div className="odd-even-linked-list-step-info"><h3>{currentStepData.message}</h3></div>
        <PointerRail title="Linked-list rewiring pointers" values={currentStepData.values || []} pointers={[{ id: 'odd', label: 'odd', index: currentStepData.odd, tone: 'primary' }, ...(currentStepData.even === null ? [] : [{ id: 'even', label: 'even', index: currentStepData.even, tone: 'warning' }])]} note={currentStepData.result ? `result: ${currentStepData.result.join(' → ')}` : 'Odd and even pointers advance by two nodes.'} />
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="odd-even-linked-list-panel odd-even-linked-list-panel-input">
            <div className="odd-even-linked-list-panel-head">Input</div>
            <div className="odd-even-linked-list-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="odd-even-linked-list-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="odd-even-linked-list-panel odd-even-linked-list-panel-viz">
            <div className="odd-even-linked-list-panel-head">Visualization</div>
            <div className="odd-even-linked-list-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="odd-even-linked-list-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

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

      <div className="odd-even-linked-list-middle">
        <div className="odd-even-linked-list-panel">
          <div className="odd-even-linked-list-panel-head">Examples</div>
          <div className="odd-even-linked-list-panel-body odd-even-linked-list-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="odd-even-linked-list-example-btn"
                onClick={() => applyExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
