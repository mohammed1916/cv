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
import './PowerofThreeVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'divide', 'done']
const LINE_PATTERN_MAP = {
  3: 'init', 5: 'divide', 7: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isPowerOfThree(self, n: int) -> bool:' },
  { line: 3, text: '        if n <= 0: return False' },
  { line: 4, text: '        while n % 3 == 0:' },
  { line: 5, text: '            n //= 3' },
  { line: 6, text: '        return n == 1' },
]

function generateSteps({ n }) {
  if (n <= 0) return [{ phase: 'done', activeLine: 3, values: [n], result: false, message: 'Non-positive values cannot be powers of three.' }]
  const steps = [{ phase: 'init', activeLine: 3, values: [n], current: n, message: `Start with n = ${n}.` }]
  let current = n
  while (current % 3 === 0) { const next = current / 3; steps.push({ phase: 'divide', activeLine: 5, values: [n, current, next], current: next, message: `${current} ÷ 3 = ${next}.` }); current = next }
  steps.push({ phase: 'done', activeLine: 6, values: [n, current], current, result: current === 1, message: current === 1 ? 'Reached 1: this is a power of three.' : `${current} is not divisible by 3: this is not a power of three.` })
  return steps
}

const EXAMPLES = getExamplesOr('power-of-three', [{ label: '27 = 3³', n: 27 }, { label: '45 is not', n: 45 }, { label: '1 = 3⁰', n: 1 }])

export default function PowerofThreeVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Number.isInteger(data.n)) throw new Error('Use { "n": 27 }.')
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
    if (!input) return <div className="powerof-three-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <div className="powerof-three-viz">
        <div className="powerof-three-step-info">
          <h3>{currentStepData.message}</h3>
        </div><div className="powerof-three-chain">{(currentStepData.values || []).map((value, index) => <span key={`${value}-${index}`}>{value}{index < currentStepData.values.length - 1 && ' ÷ 3 → '}</span>)}</div>
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="powerof-three-panel powerof-three-panel-input">
            <div className="powerof-three-panel-head">Input</div>
            <div className="powerof-three-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="powerof-three-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="powerof-three-panel powerof-three-panel-viz">
            <div className="powerof-three-panel-head">Visualization</div>
            <div className="powerof-three-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="powerof-three-shell">
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

      <div className="powerof-three-middle">
        <div className="powerof-three-panel">
          <div className="powerof-three-panel-head">Examples</div>
          <div className="powerof-three-panel-body powerof-three-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="powerof-three-example-btn"
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
