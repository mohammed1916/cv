import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './NestedListWeightSumVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['done', 'init', 'process']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'process',
  5: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Nested List Weight Sum' },
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

const EXAMPLES = getExamples('nested-list-weight-sum') || []

export default function NestedListWeightSumVisualizer() {
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
    if (!input) return <div className="nested-list-weight-sum-error">{inputError}</div>

    const currentStepData = steps[currentStep] || {}

    return (
      <motion.div
        className="nested-list-weight-sum-viz"
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nested-list-weight-sum-step-info">
          <h3>{currentStepData.message}</h3>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="nested-list-weight-sum-shell">
      <ResizableSplitPanels
        left={
          <div className="nested-list-weight-sum-panel nested-list-weight-sum-panel-input">
            <div className="nested-list-weight-sum-panel-head">Input</div>
            <div className="nested-list-weight-sum-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="nested-list-weight-sum-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>
        }
        right={
          <div className="nested-list-weight-sum-panel nested-list-weight-sum-panel-viz">
            <div className="nested-list-weight-sum-panel-head">Visualization</div>
            <div className="nested-list-weight-sum-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>
        }
        ratio={0.35}
      />

      <div className="nested-list-weight-sum-middle">
        <div className="nested-list-weight-sum-panel">
          <div className="nested-list-weight-sum-panel-head">Code Trace</div>
          <div className="nested-list-weight-sum-panel-body">
            <CodeTracePanel code={SOLUTION_CODE} connectivity={connectivity} />
          </div>
        </div>

        <div className="nested-list-weight-sum-panel">
          <div className="nested-list-weight-sum-panel-head">Examples</div>
          <div className="nested-list-weight-sum-panel-body nested-list-weight-sum-examples">
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

      <div className="nested-list-weight-sum-bottom">
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
