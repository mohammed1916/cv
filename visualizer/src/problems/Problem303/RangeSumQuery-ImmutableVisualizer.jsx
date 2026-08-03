import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './RangeSumQuery-ImmutableVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = ['init', 'process', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'process',
  5: 'done'
}

const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Range Sum Query - Immutable' },
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

const EXAMPLES = getExamples('range-sum-query-immutable') || []

export default function RangeSumQueryImmutableVisualizer() {
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
    if (!input) return <div className="range-sum-query--immutable-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <motion.div
        className="range-sum-query--immutable-viz"
        key={stepIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="range-sum-query--immutable-step-info">
          <h3>{currentStepData.message}</h3>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="range-sum-query--immutable-shell">
      <ResizableSplitPanels
        left={
          <div className="range-sum-query--immutable-panel range-sum-query--immutable-panel-input">
            <div className="range-sum-query--immutable-panel-head">Input</div>
            <div className="range-sum-query--immutable-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="range-sum-query--immutable-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>
        }
        right={
          <div className="range-sum-query--immutable-panel range-sum-query--immutable-panel-viz">
            <div className="range-sum-query--immutable-panel-head">Visualization</div>
            <div className="range-sum-query--immutable-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>
        }
        ratio={0.35}
      />

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
