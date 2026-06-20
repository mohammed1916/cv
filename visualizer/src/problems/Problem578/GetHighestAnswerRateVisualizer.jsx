import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './GetHighestAnswerRateVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: '# Solution implementation' },
  { line: 2, text: '# Line 2' },
  { line: 3, text: '# Line 3' },
  { line: 4, text: '# Line 4' },
  { line: 5, text: '# Line 5' },
  { line: 6, text: '# Line 6' },
  { line: 7, text: '# Line 7' },
  { line: 8, text: '# Line 8' },
  { line: 9, text: '# Line 9' },
  { line: 10, text: '# Line 10' },
  { line: 11, text: '# Line 11' },
  { line: 12, text: '# Line 12' },
  { line: 13, text: '# Line 13' },
  { line: 14, text: '# Line 14' },
]

const EXAMPLES = getExamples('get-highest-answer-rate')

function generateSteps(input) {
  return [{
    activeLine: 1,
    message: 'Algorithm execution trace',
    relatedLines: [1],
  }]
}

export default function GetHighestAnswerRateVisualizer() {
  const [input, setInput] = useState('')
  const [source, setSource] = useState('')
  const [steps, setSteps] = useState([])

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const handleVisualize = useCallback(() => {
    setSource(input)
    setSteps(generateSteps(input))
    setStepIndex(-1)
    setIsPlaying(false)
  }, [input, setIsPlaying, setStepIndex])

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [currentStep]
  )

  return (
    <div className="getHighestAnswerRate-root">
      <div className="getHighestAnswerRate-card getHighestAnswerRate-input-card">
        <div className="getHighestAnswerRate-input-row">
          <div className="getHighestAnswerRate-field-group">
            <label className="getHighestAnswerRate-input-label">Input</label>
            <input className="getHighestAnswerRate-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter input" />
          </div>
          <button className="getHighestAnswerRate-btn getHighestAnswerRate-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>
      </div>

      <DockableWorkspace panels={dockPanels}>
        <FloatingPanel>
          <PlaybackControls isPlaying={isPlaying} onPlayToggle={togglePlay} onStepForward={stepForward} onStepBack={stepBack} onReset={handleReset} speed={speed} onSpeedChange={setSpeed} currentStep={stepIndex + 1} totalSteps={steps.length} />
        </FloatingPanel>
      </DockableWorkspace>

      {showPatternOverlay && <PatternOverlay activeLineDom={activeLineDom} />}
    </div>
  )
}
