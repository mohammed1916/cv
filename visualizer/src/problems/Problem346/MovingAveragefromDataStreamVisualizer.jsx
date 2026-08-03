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
import './MovingAveragefromDataStreamVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const MOVING_AVERAGE_PATTERNS = ['init', 'process']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'process',
  5: 'process',
}

const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Moving Average from Data Stream' },
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
    relatedLines: [1],
    message: 'Initialize algorithm'
  })

  steps.push({
    phase: 'process',
    activeLine: 3,
    relatedLines: [3],
    message: 'Processing input...'
  })

  steps.push({
    phase: 'done',
    activeLine: 5,
    relatedLines: [5],
    message: 'Algorithm complete'
  })

  return steps
}

const EXAMPLES = getExamples('moving-average-data-stream') || []

export default function MovingAveragefromDataStreamVisualizer() {
  const [inputValue, setInputValue] = useState(EXAMPLES.length > 0 ? JSON.stringify(EXAMPLES[0]) : '{}')

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })) : []
  }, [input])

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
    if (!input) return <div className="moving-averagefrom-data-stream-error">{inputError}</div>

    return (
      <motion.div
        className="moving-averagefrom-data-stream-viz"
        key={stepIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="moving-averagefrom-data-stream-step-info">
          <h3>{step?.message}</h3>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="moving-averagefrom-data-stream-shell">
      <ResizableSplitPanels
        left={
          <div className="moving-averagefrom-data-stream-panel moving-averagefrom-data-stream-panel-input">
            <div className="moving-averagefrom-data-stream-panel-head">Input</div>
            <div className="moving-averagefrom-data-stream-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="moving-averagefrom-data-stream-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>
        }
        right={
          <div className="moving-averagefrom-data-stream-panel moving-averagefrom-data-stream-panel-viz">
            <div className="moving-averagefrom-data-stream-panel-head">Visualization</div>
            <div className="moving-averagefrom-data-stream-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>
        }
        ratio={0.35}
      />

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

      <div className="moving-averagefrom-data-stream-middle">
        <div className="moving-averagefrom-data-stream-panel" style={{ display: 'none' }}>
          <div className="moving-averagefrom-data-stream-panel-head">Code Trace</div>
          <div className="moving-averagefrom-data-stream-panel-body">
          </div>
        </div>

        <div className="moving-averagefrom-data-stream-panel">
          <div className="moving-averagefrom-data-stream-panel-head">Examples</div>
          <div className="moving-averagefrom-data-stream-panel-body moving-averagefrom-data-stream-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="moving-averagefrom-data-stream-example-btn"
                onClick={() => {
                  setInputValue(JSON.stringify(example))
                  handleReset()
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="moving-averagefrom-data-stream-status" style={{ margin: '16px', color: '#64748b' }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={MOVING_AVERAGE_PATTERNS} />
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
