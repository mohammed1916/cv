import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './DifferentWaysToAddParentheses.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'def solution(input):' },
  { line: 2, text: '    # Parentheses Splitting Recursion - expression tree grows with every split point' },
  { line: 3, text: '    pass' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize: Parentheses Splitting Recursion - expression tree grows with every split point'
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

const EXAMPLES = getExamplesOr('different-ways-to-add-parentheses', [])

export default function DifferentWaysToAddParentheses() {
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

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Details", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="different-ways-to-add-parentheses-panel">
            <div className="different-ways-to-add-parentheses-panel-head">
              Input
              {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
            </div>
            <div className="different-ways-to-add-parentheses-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="different-ways-to-add-parentheses-example-btn"
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
                  className="different-ways-to-add-parentheses-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>

              <div className="different-ways-to-add-parentheses-visualization">
                <div className="different-ways-to-add-parentheses-title">Problem 241</div>
                <motion.div
                  className="different-ways-to-add-parentheses-content"
                  animate={{ opacity: step ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {step && (
                    <div>
                      <p className="different-ways-to-add-parentheses-story">Parentheses Splitting Recursion - expression tree grows with every split point</p>
                      <p className="different-ways-to-add-parentheses-phase">Phase: {step.phase}</p>
                      {step.index !== undefined && <p className="different-ways-to-add-parentheses-index">Step: {step.index + 1}</p>}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>),
    right: (<div className="different-ways-to-add-parentheses-panel">
            <div className="different-ways-to-add-parentheses-panel-head">Details</div>
            <div className="different-ways-to-add-parentheses-panel-body">
              <div className="different-ways-to-add-parentheses-info">
                <h3>Problem 241</h3>
                <p><strong>Story:</strong> Parentheses Splitting Recursion - expression tree grows with every split point</p>
              </div>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="different-ways-to-add-parentheses-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
      />

      <div className="different-ways-to-add-parentheses-status">
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div className="different-ways-to-add-parentheses-dock">
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
