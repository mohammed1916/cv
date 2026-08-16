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
import './RemoveInvalidParenthesesVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'process', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'process',
  5: 'done'
}

const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Remove Invalid Parentheses' },
  { line: 2, text: '# Implement step-by-step visualization' },
  { line: 3, text: 'def solve(input):' },
  { line: 4, text: '    # Algorithm here' },
  { line: 5, text: '    return result' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize algorithm'
  })

  steps.push({
    phase: 'process',
    activeLine: 3,
    message: 'Processing input...'
  })

  steps.push({
    phase: 'done',
    activeLine: 5,
    message: 'Algorithm complete'
  })

  return steps
}

const EXAMPLES = getExamplesOr('remove-invalid-parentheses', [])

export default function RemoveInvalidParenthesesVisualizer() {
  const [inputValue, setInputValue] = useState(EXAMPLES.length > 0 ? JSON.stringify(EXAMPLES[0]) : '{}')

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
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
    if (!input) return <div className="remove-invalid-parentheses-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <motion.div
        className="remove-invalid-parentheses-viz"
        key={stepIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="remove-invalid-parentheses-step-info">
          <h3>{currentStepData.message || 'Press Play or Step to begin.'}</h3>
        </div>
      </motion.div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="remove-invalid-parentheses-panel remove-invalid-parentheses-panel-input">
            <div className="remove-invalid-parentheses-panel-head">Input</div>
            <div className="remove-invalid-parentheses-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="remove-invalid-parentheses-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="remove-invalid-parentheses-panel remove-invalid-parentheses-panel-viz">
            <div className="remove-invalid-parentheses-panel-head">Visualization</div>
            <div className="remove-invalid-parentheses-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="remove-invalid-parentheses-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

      <div className="remove-invalid-parentheses-middle">
        <div className="remove-invalid-parentheses-panel">
          <div className="remove-invalid-parentheses-panel-head">Code Trace</div>
          <div className="remove-invalid-parentheses-panel-body">
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

        <div className="remove-invalid-parentheses-panel">
          <div className="remove-invalid-parentheses-panel-head">Examples</div>
          <div className="remove-invalid-parentheses-panel-body remove-invalid-parentheses-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="remove-invalid-parentheses-example-btn"
                onClick={() => applyExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="remove-invalid-parentheses-bottom">
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
