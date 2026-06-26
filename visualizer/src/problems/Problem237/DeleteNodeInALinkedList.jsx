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
import './DeleteNodeInALinkedList.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def solution(input):' },
  { line: 2, text: '    # Node Teleportation Trick - copy next node value and skip over it' },
  { line: 3, text: '    pass' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize: Node Teleportation Trick - copy next node value and skip over it'
  })

  for (let i = 0; i < Math.min(5, (input && input.length) || 0); i++) {
    steps.push({
      phase: 'processing',
      index: i,
      activeLine: 2,
      message: `Processing step ${i + 1}...`
    })
  }

  steps.push({
    phase: 'complete',
    activeLine: 3,
    message: 'Algorithm complete!'
  })

  return steps
}

const EXAMPLES = getExamples('delete-node-in-a-linked-list') || []

export default function DeleteNodeInALinkedList() {
  const [input, setInput] = useState('[1, 2, 3]')
  const { inputValue, inputError } = useMemo(() => {
    try {
      const val = JSON.parse(input)
      return { inputValue: val, inputError: '' }
    } catch (e) {
      return { inputValue: [1, 2, 3], inputError: e.message || 'Invalid input' }
    }
  }, [input])

  const steps = useMemo(
    () => generateSteps(inputValue).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [inputValue],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInput(JSON.stringify(ex.input || ex.nums || ex.array || []))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  return (
    <div className="delete-node-in-a-linked-list-shell">
      <ResizableSplitPanels
        className="delete-node-in-a-linked-list-top-split"
        storageKey="cpviz.split.delete-node-in-a-linked-list.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="delete-node-in-a-linked-list-panel">
            <div className="delete-node-in-a-linked-list-panel-head">
              Input
              {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
            </div>
            <div className="delete-node-in-a-linked-list-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="delete-node-in-a-linked-list-example-btn"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleReset() }}
                  placeholder="[1, 2, 3]"
                  className="delete-node-in-a-linked-list-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>

              <div className="delete-node-in-a-linked-list-visualization">
                <div className="delete-node-in-a-linked-list-title">Problem 237</div>
                <motion.div
                  className="delete-node-in-a-linked-list-content"
                  animate={{ opacity: step ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {step && (
                    <div>
                      <p className="delete-node-in-a-linked-list-story">Node Teleportation Trick - copy next node value and skip over it</p>
                      <p className="delete-node-in-a-linked-list-phase">Phase: {step.phase}</p>
                      {step.index !== undefined && <p className="delete-node-in-a-linked-list-index">Step: {step.index + 1}</p>}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}
        right={(
          <div className="delete-node-in-a-linked-list-panel">
            <div className="delete-node-in-a-linked-list-panel-head">Details</div>
            <div className="delete-node-in-a-linked-list-panel-body">
              <div className="delete-node-in-a-linked-list-info">
                <h3>Problem 237</h3>
                <p><strong>Story:</strong> Node Teleportation Trick - copy next node value and skip over it</p>
              </div>
            </div>
          </div>
        )}
      />

      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
      />

      <div className="delete-node-in-a-linked-list-status">
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div className="delete-node-in-a-linked-list-dock">
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
      </div>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
