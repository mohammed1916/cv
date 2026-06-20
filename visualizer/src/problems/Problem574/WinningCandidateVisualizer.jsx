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
import './WinningCandidateVisualizer.css'

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

const EXAMPLES = getExamples('winning-candidate')

function generateSteps(input) {
  return [{
    activeLine: 1,
    message: 'Algorithm execution trace',
    relatedLines: [1],
  }]
}

export default function WinningCandidateVisualizer() {
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
    <div className="winningCandidate-root">
      <div className="winningCandidate-card winningCandidate-input-card">
        <div className="winningCandidate-input-row">
          <div className="winningCandidate-field-group">
            <label className="winningCandidate-input-label">Input</label>
            <input className="winningCandidate-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter input" />
          </div>
          <button className="winningCandidate-btn winningCandidate-btn-primary" onClick={handleVisualize}>
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
