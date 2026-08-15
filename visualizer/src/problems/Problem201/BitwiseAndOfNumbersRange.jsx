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
import './BitwiseAndOfNumbersRange.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'def solution(input):' },
  { line: 2, text: '    # Bit Pattern Convergence - watch numbers align their bit patterns toward a common core' },
  { line: 3, text: '    pass' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize: Bit Pattern Convergence - watch numbers align their bit patterns toward a common core'
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

const EXAMPLES = getExamplesOr('bitwise-and-of-numbers-range', [])

export default function BitwiseAndOfNumbersRange() {
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
    left: (<div className="bitwise-and-of-numbers-range-panel">
            <div className="bitwise-and-of-numbers-range-panel-head">
              Input
              {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
            </div>
            <div className="bitwise-and-of-numbers-range-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="bitwise-and-of-numbers-range-example-btn"
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
                  className="bitwise-and-of-numbers-range-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>

              <div className="bitwise-and-of-numbers-range-visualization">
                <div className="bitwise-and-of-numbers-range-title">Problem 201</div>
                <motion.div
                  className="bitwise-and-of-numbers-range-content"
                  animate={{ opacity: step ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {step && (
                    <div>
                      <p className="bitwise-and-of-numbers-range-story">Bit Pattern Convergence - watch numbers align their bit patterns toward a common core</p>
                      <p className="bitwise-and-of-numbers-range-phase">Phase: {step.phase}</p>
                      {step.index !== undefined && <p className="bitwise-and-of-numbers-range-index">Step: {step.index + 1}</p>}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>),
    right: (<div className="bitwise-and-of-numbers-range-panel">
            <div className="bitwise-and-of-numbers-range-panel-head">Details</div>
            <div className="bitwise-and-of-numbers-range-panel-body">
              <div className="bitwise-and-of-numbers-range-info">
                <h3>Problem 201</h3>
                <p><strong>Story:</strong> Bit Pattern Convergence - watch numbers align their bit patterns toward a common core</p>
              </div>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="bitwise-and-of-numbers-range-shell">
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

      <div className="bitwise-and-of-numbers-range-status">
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div className="bitwise-and-of-numbers-range-dock">
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
