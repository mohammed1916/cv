import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './SuperUglyNumberVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Super Ugly Number' },
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

const EXAMPLES = getExamples('super-ugly-number') || []

export default function SuperUglyNumberVisualizer() {
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
    return input ? generateSteps(input) : []
  }, [input])

  const { currentStep, isPlaying, setIsPlaying, setCurrentStep, speed, setSpeed } = usePlaybackState({
    totalSteps: steps.length,
    autoSpeed: 1000,
  })

  const connectivity = useCodeVisualConnectivity(steps, currentStep)
  const patternOverlay = usePatternOverlay()

  const handleStepClick = useCallback((index) => {
    setCurrentStep(index)
    setIsPlaying(false)
  }, [setCurrentStep, setIsPlaying])

  const renderVisualization = () => {
    if (!input) return <div className="super-ugly-number-error">{inputError}</div>

    const currentStepData = steps[currentStep] || {}

    return (
      <motion.div
        className="super-ugly-number-viz"
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="super-ugly-number-step-info">
          <h3>{currentStepData.message}</h3>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="super-ugly-number-shell">
      <ResizableSplitPanels
        left={
          <div className="super-ugly-number-panel super-ugly-number-panel-input">
            <div className="super-ugly-number-panel-head">Input</div>
            <div className="super-ugly-number-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="super-ugly-number-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>
        }
        right={
          <div className="super-ugly-number-panel super-ugly-number-panel-viz">
            <div className="super-ugly-number-panel-head">Visualization</div>
            <div className="super-ugly-number-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>
        }
        ratio={0.35}
      />

      <div className="super-ugly-number-middle">
        <div className="super-ugly-number-panel">
          <div className="super-ugly-number-panel-head">Code Trace</div>
          <div className="super-ugly-number-panel-body">
            <CodeTracePanel code={SOLUTION_CODE} connectivity={connectivity} />
          </div>
        </div>

        <div className="super-ugly-number-panel">
          <div className="super-ugly-number-panel-head">Examples</div>
          <div className="super-ugly-number-panel-body super-ugly-number-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className={className + '-example-btn'}
                onClick={() => {
                  setInputValue(JSON.stringify(example))
                  setCurrentStep(0)
                  setIsPlaying(false)
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="super-ugly-number-bottom">
        <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
          onPrev={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          onReset={() => setCurrentStep(0)}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      </FloatingPanel>
      </div>
    </div>
  )
}
