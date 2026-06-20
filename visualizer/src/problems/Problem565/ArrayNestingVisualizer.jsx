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
import './ArrayNestingVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def arrayNesting(arr):' },
  { line: 2, text: '    visited = [False] * len(arr)' },
  { line: 3, text: '    max_length = 0' },
  { line: 4, text: '    ' },
  { line: 5, text: '    for i in range(len(arr)):' },
  { line: 6, text: '        if visited[i]:' },
  { line: 7, text: '            continue' },
  { line: 8, text: '        ' },
  { line: 9, text: '        current_index = i' },
  { line: 10, text: '        length = 0' },
  { line: 11, text: '        ' },
  { line: 12, text: '        while not visited[current_index]:' },
  { line: 13, text: '            visited[current_index] = True' },
  { line: 14, text: '            current_index = arr[current_index]' },
  { line: 15, text: '            length += 1' },
  { line: 16, text: '        ' },
  { line: 17, text: '        max_length = max(max_length, length)' },
  { line: 18, text: '    ' },
  { line: 19, text: '    return max_length' },
]

const EXAMPLES = getExamples('array-nesting')

function generateSteps(arr) {
  const steps = []
  const visited = Array(arr.length).fill(false)
  let maxLength = 0

  steps.push({
    activeLine: 2,
    visited: [...visited],
    maxLength,
    currentCycle: [],
    currentIndex: null,
    cycleLength: 0,
    message: 'Initialize visited array and max_length = 0',
    relatedLines: [2, 3],
  })

  for (let i = 0; i < arr.length; i++) {
    if (visited[i]) {
      steps.push({
        activeLine: 6,
        visited: [...visited],
        maxLength,
        currentCycle: [],
        currentIndex: i,
        cycleLength: 0,
        message: `Skip index ${i}: already visited`,
        relatedLines: [6, 7],
      })
      continue
    }

    steps.push({
      activeLine: 5,
      visited: [...visited],
      maxLength,
      currentCycle: [],
      currentIndex: i,
      cycleLength: 0,
      message: `Start new cycle from index ${i}`,
      relatedLines: [5],
    })

    let currentIndex = i
    let length = 0
    const cycle = []

    while (!visited[currentIndex]) {
      visited[currentIndex] = true
      cycle.push(currentIndex)

      steps.push({
        activeLine: 13,
        visited: [...visited],
        maxLength,
        currentCycle: [...cycle],
        currentIndex,
        cycleLength: length + 1,
        message: `Mark index ${currentIndex} as visited, value=${arr[currentIndex]}`,
        relatedLines: [12, 13],
      })

      currentIndex = arr[currentIndex]
      length += 1

      steps.push({
        activeLine: 14,
        visited: [...visited],
        maxLength,
        currentCycle: [...cycle],
        currentIndex,
        cycleLength: length,
        message: `Follow to index ${currentIndex}, cycle length=${length}`,
        relatedLines: [14, 15],
      })
    }

    maxLength = Math.max(maxLength, length)

    steps.push({
      activeLine: 17,
      visited: [...visited],
      maxLength,
      currentCycle: [...cycle],
      currentIndex: null,
      cycleLength: length,
      message: `Cycle complete with length ${length}. Max length=${maxLength}`,
      relatedLines: [17],
    })
  }

  steps.push({
    activeLine: 19,
    visited: [...visited],
    maxLength,
    currentCycle: [],
    currentIndex: null,
    cycleLength: 0,
    message: `Final result: ${maxLength}`,
    relatedLines: [19],
  })

  return steps
}

function ArrayVisualization({ arr, step }) {
  const cycle = step?.currentCycle || []
  const visited = step?.visited || []

  return (
    <div className="an-grid">
      {arr.map((val, idx) => (
        <motion.div
          key={idx}
          className={`an-cell ${visited[idx] ? 'visited' : ''} ${cycle.includes(idx) ? 'active' : ''}`}
          animate={{
            scale: cycle.includes(idx) ? 1.1 : 1,
            boxShadow: cycle.includes(idx) ? '0 0 12px rgba(249, 115, 22, 0.5)' : 'none',
          }}
        >
          <div className="an-index">{idx}</div>
          <div className="an-value">{val}</div>
        </motion.div>
      ))}
    </div>
  )
}

function StatePanel({ arr, step, stepIndex, steps }) {
  return (
    <div className="an-main-column">
      <div className="an-card">
        <div className="an-card-head">
          <div>
            <div className="an-section-label">Array Cycles</div>
            <div className="an-subtitle">Following indices to find the longest cycle.</div>
          </div>
          <div className="an-output-preview">
            <span className="an-output-label">Max Cycle Length</span>
            <span className="mono an-output-text">{step?.maxLength ?? 0}</span>
          </div>
        </div>

        <ArrayVisualization arr={arr} step={step} />

        <div className="an-info-grid">
          <div className="an-info-item">
            <span className="an-info-key">Current Index</span>
            <span className="mono an-info-value">{step?.currentIndex ?? '—'}</span>
          </div>
          <div className="an-info-item">
            <span className="an-info-key">Cycle Length</span>
            <span className="mono an-info-value">{step?.cycleLength ?? 0}</span>
          </div>
          <div className="an-info-item">
            <span className="an-info-key">Visited Count</span>
            <span className="mono an-info-value">{step?.visited?.filter(v => v).length ?? 0}</span>
          </div>
          <div className="an-info-item wide">
            <span className="an-info-key">Explanation</span>
            <span className="an-info-value">{step?.message ?? 'Start tracing array cycles.'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArrayNestingVisualizer() {
  const [arrayInput, setArrayInput] = useState('[5,4,0,3,1,6,2]')
  const [source, setSource] = useState([5, 4, 0, 3, 1, 6, 2])
  const [steps, setSteps] = useState(() => generateSteps([5, 4, 0, 3, 1, 6, 2]))
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null
  const previousStep = stepIndex > 0 ? steps[stepIndex - 1] : null

  const handleVisualize = useCallback(() => {
    setAttemptedSubmit(true)
    try {
      const parsed = JSON.parse(arrayInput)
      if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 10) {
        return
      }
      setSource(parsed)
      setSteps(generateSteps(parsed))
      setStepIndex(-1)
      setIsPlaying(false)
    } catch {
      // Invalid input
    }
  }, [arrayInput, setIsPlaying, setStepIndex])

  const applyExample = useCallback((example) => {
    setArrayInput(JSON.stringify(example.arr))
    setSource(example.arr)
    setSteps(generateSteps(example.arr))
    setStepIndex(-1)
    setIsPlaying(false)
    setAttemptedSubmit(false)
  }, [setIsPlaying, setStepIndex])

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: <StatePanel arr={source} step={currentStep} stepIndex={stepIndex} steps={steps} />,
      },
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [source, currentStep, stepIndex, steps]
  )

  return (
    <div className="an-root">
      <div className="an-card an-input-card">
        <div className="an-input-row">
          <div className="an-field-group">
            <label className="an-input-label">Array</label>
            <input
              className="an-input mono"
              value={arrayInput}
              onChange={(e) => {
                setArrayInput(e.target.value)
                if (attemptedSubmit) setAttemptedSubmit(false)
              }}
              placeholder="[5,4,0,3,1,6,2]"
            />
          </div>
          <button className="an-btn an-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>

        <div className="an-example-grid">
          {EXAMPLES.map((example, idx) => (
            <button key={idx} className="an-example-card" onClick={() => applyExample(example)}>
              <span className="an-example-label">{example.label}</span>
              <span className="an-example-chip mono">{JSON.stringify(example.arr).slice(0, 20)}...</span>
            </button>
          ))}
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
