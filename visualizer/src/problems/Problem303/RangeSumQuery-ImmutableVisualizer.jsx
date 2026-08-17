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
import './RangeSumQuery-ImmutableVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PointerRail from '../../components/shared/PointerRail'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'build', 'query', 'done']

const LINE_PATTERN_MAP = {
  3: 'init', 5: 'build', 7: 'query', 8: 'done'
}

const SOLUTION_CODE = [
  { line: 1, text: 'class NumArray:' },
  { line: 2, text: '    def __init__(self, nums: List[int]):' },
  { line: 3, text: '        self.prefix = [0]' },
  { line: 4, text: '        for value in nums:' },
  { line: 5, text: '            self.prefix.append(self.prefix[-1] + value)' },
  { line: 6, text: '    def sumRange(self, left: int, right: int) -> int:' },
  { line: 7, text: '        return self.prefix[right + 1] - self.prefix[left]' },
]

function generateSteps({ nums, left, right }) {
  const prefix = [0]; const steps = [{ phase: 'init', activeLine: 3, nums, prefix: [...prefix], left, right, message: 'Prefix[0] is zero: no values are included yet.' }]
  nums.forEach((value, index) => { prefix.push(prefix.at(-1) + value); steps.push({ phase: 'build', activeLine: 5, nums, prefix: [...prefix], index, left, right, message: `prefix[${index + 1}] = ${prefix[index]} + ${value} = ${prefix[index + 1]}.` }) })
  const result = prefix[right + 1] - prefix[left]
  steps.push({ phase: 'query', activeLine: 7, nums, prefix, left, right, result, message: `Subtract prefix[${left}] from prefix[${right + 1}] to get ${result}.` })
  steps.push({ phase: 'done', activeLine: 7, nums, prefix, left, right, result, message: `Range sum nums[${left}..${right}] = ${result}.` })
  return steps
}

const EXAMPLES = getExamplesOr('range-sum-query-immutable', [{ label: 'Classic query', nums: [-2, 0, 3, -5, 2, -1], left: 0, right: 2 }, { label: 'Middle range', nums: [-2, 0, 3, -5, 2, -1], left: 2, right: 5 }])

export default function RangeSumQueryImmutableVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.nums) || !data.nums.every(Number.isFinite) || !Number.isInteger(data.left) || !Number.isInteger(data.right) || data.left < 0 || data.right < data.left || data.right >= data.nums.length) throw new Error('Use { "nums": [-2,0,3], "left": 0, "right": 2 }.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(
    () => {
      if (!input) return []
      return generateSteps(input).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      }))
    },
    [input],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const renderVisualization = () => {
    if (!input) return <div className="range-sum-query--immutable-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <div className="range-sum-query--immutable-viz">
        <div className="range-sum-query--immutable-step-info">
          <h3>{currentStepData.message}</h3>
        </div><PointerRail title="Input range" values={input.nums} range={{ start: step?.left ?? input.left, end: step?.right ?? input.right }} pointers={step?.index === undefined ? [{ id: 'L', label: 'L', index: input.left, tone: 'primary' }, { id: 'R', label: 'R', index: input.right, tone: 'warning' }] : [{ id: 'build', label: 'build', index: step.index, tone: 'primary' }]} /><PointerRail title="Prefix sums" values={step?.prefix || [0]} pointers={step?.result === undefined ? [] : [{ id: 'left', label: `prefix[L]=${step.prefix[step.left]}`, index: step.left, tone: 'warning' }, { id: 'right', label: `prefix[R+1]=${step.prefix[step.right + 1]}`, index: step.right + 1, tone: 'primary' }]} note={step?.result === undefined ? 'Build once, then answer every query in O(1).' : `answer ${step.result}`} />
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="range-sum-query--immutable-panel range-sum-query--immutable-panel-input">
            <div className="range-sum-query--immutable-panel-head">Input</div>
            <div className="range-sum-query--immutable-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="range-sum-query--immutable-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="range-sum-query--immutable-panel range-sum-query--immutable-panel-viz">
            <div className="range-sum-query--immutable-panel-head">Visualization</div>
            <div className="range-sum-query--immutable-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="range-sum-query--immutable-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

      <div className="range-sum-query--immutable-middle">
        <div className="range-sum-query--immutable-panel">
          <div className="range-sum-query--immutable-panel-head">Code Trace</div>
          <div className="range-sum-query--immutable-panel-body">
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
          </div>
        </div>

        <div className="range-sum-query--immutable-panel">
          <div className="range-sum-query--immutable-panel-head">Examples</div>
          <div className="range-sum-query--immutable-panel-body range-sum-query--immutable-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="range-sum-query--immutable-example-btn"
                onClick={() => applyExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="range-sum-query--immutable-bottom">
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
    </div>
  )
}
