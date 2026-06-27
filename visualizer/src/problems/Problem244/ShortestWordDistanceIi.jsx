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
import './ShortestWordDistanceIi.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def solution(input):' },
  { line: 2, text: '    # Word Index Cache Dance - precomputed positions enable lightning-fast lookups' },
  { line: 3, text: '    pass' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize: Word Index Cache Dance - precomputed positions enable lightning-fast lookups'
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

const EXAMPLES = getExamples('shortest-word-distance-ii') || []

export default function ShortestWordDistanceIi() {
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
    <div className="shortest-word-distance-ii-shell">
      <ResizableSplitPanels
        className="shortest-word-distance-ii-top-split"
        storageKey="cpviz.split.shortest-word-distance-ii.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="shortest-word-distance-ii-panel">
            <div className="shortest-word-distance-ii-panel-head">
              Input
              {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
            </div>
            <div className="shortest-word-distance-ii-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="shortest-word-distance-ii-example-btn"
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
                  className="shortest-word-distance-ii-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>

              <div className="shortest-word-distance-ii-visualization">
                <div className="shortest-word-distance-ii-title">Problem 244</div>
                <motion.div
                  className="shortest-word-distance-ii-content"
                  animate={{ opacity: step ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {step && (
                    <div>
                      <p className="shortest-word-distance-ii-story">Word Index Cache Dance - precomputed positions enable lightning-fast lookups</p>
                      <p className="shortest-word-distance-ii-phase">Phase: {step.phase}</p>
                      {step.index !== undefined && <p className="shortest-word-distance-ii-index">Step: {step.index + 1}</p>}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}
        right={(
          <div className="shortest-word-distance-ii-panel">
            <div className="shortest-word-distance-ii-panel-head">Details</div>
            <div className="shortest-word-distance-ii-panel-body">
              <div className="shortest-word-distance-ii-info">
                <h3>Problem 244</h3>
                <p><strong>Story:</strong> Word Index Cache Dance - precomputed positions enable lightning-fast lookups</p>
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

      <div className="shortest-word-distance-ii-status">
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div className="shortest-word-distance-ii-dock">
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
