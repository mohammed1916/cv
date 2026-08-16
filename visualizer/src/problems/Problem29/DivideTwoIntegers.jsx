import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './DivideTwoIntegers.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def solution(input):' },
  { line: 2, text: '    # Bit Dance - binary representation performs subtraction through bit shifts' },
  { line: 3, text: '    pass' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialize: Bit Dance - binary representation performs subtraction through bit shifts'
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

const EXAMPLES = getExamplesOr('divide-two-integers', [])

export default function DivideTwoIntegers() {
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

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <div className="divide-two-integers-panel">
      <div className="divide-two-integers-panel-head">
        Input
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="divide-two-integers-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="divide-two-integers-example-btn"
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
            className="divide-two-integers-input"
            style={{ flex: 1, margin: 0 }}
          />
        </div>

        <div className="divide-two-integers-visualization">
          <div className="divide-two-integers-title">Problem 29</div>
          <motion.div
            className="divide-two-integers-content"
            animate={{ opacity: step ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {step && (
              <div>
                <p className="divide-two-integers-story">Bit Dance - binary representation performs subtraction through bit shifts</p>
                <p className="divide-two-integers-phase">Phase: {step.phase}</p>
                {step.index !== undefined && <p className="divide-two-integers-index">Step: {step.index + 1}</p>}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )

  const statePanel = (
    <div className="divide-two-integers-panel">
      <div className="divide-two-integers-panel-head">Details</div>
      <div className="divide-two-integers-panel-body">
        <div className="divide-two-integers-info">
          <h3>Problem 29</h3>
          <p><strong>Story:</strong> Bit Dance - binary representation performs subtraction through bit shifts</p>
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="divide-two-integers-status">
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
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
  )

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Input', dockMode: 'split-right' },
      { id: 'state', title: 'Details', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block with portals
  return (
    <div className="divide-two-integers-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
