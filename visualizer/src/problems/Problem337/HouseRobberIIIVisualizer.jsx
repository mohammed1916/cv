import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './HouseRobberIIIVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: '# Solution for House Robber III' },
  { line: 2, text: '# Step-by-step visualization' },
  { line: 3, text: 'def solve(data):' },
  { line: 4, text: '    # Algorithm implementation' },
  { line: 5, text: '    return result' },
]

function generateSteps() {
  return [
    { phase: 'init', activeLine: 1, relatedLines: [1], message: 'Initialize algorithm' },
    { phase: 'process', activeLine: 3, relatedLines: [3], message: 'Process the input' },
    { phase: 'done', activeLine: 5, relatedLines: [5], message: 'Algorithm complete' },
  ]
}

const EXAMPLES = getExamples('house-robber-iii') || []

export default function HouseRobberIIIVisualizer() {
  const [inputValue, setInputValue] = useState(
    EXAMPLES.length > 0 ? JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]) : '{}',
  )

  const inputError = useMemo(() => {
    try { JSON.parse(inputValue); return '' } catch (e) { return e.message }
  }, [inputValue])

  const steps = useMemo(() => generateSteps(), [])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  return (
    <div className="house-robber-i-i-i-shell">
      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Input</div>
        <div className="house-robber-i-i-i-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="house-robber-i-i-i-textarea"
            placeholder="Enter input..."
          />
          {inputError && <div className="house-robber-i-i-i-error">{inputError}</div>}
        </div>
      </div>

      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Visualization</div>
        <div className="house-robber-i-i-i-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="house-robber-i-i-i-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="house-robber-i-i-i-step-info">
                <h3>{step?.message || 'Press play to begin'}</h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Code</div>
        <div className="house-robber-i-i-i-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="house-robber-i-i-i-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="house-robber-i-i-i-example-btn"
              onClick={() => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}

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
