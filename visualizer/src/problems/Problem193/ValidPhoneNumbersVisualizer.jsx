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
import './ValidPhoneNumbersVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "#!/bin/bash" },
  { line: 2, text: "# Print valid phone numbers: (xxx) xxx-xxxx or xxx-xxx-xxxx" },
  { line: 3, text: "grep -E '^(\\([0-9]{3}\\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$' file.txt" },
  { line: 4, text: "" },
  { line: 5, text: "# Equivalent with sed:" },
  { line: 6, text: "# sed -nE '/^(\\([0-9]{3}\\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/p' file.txt" },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 2,
    message: 'Initialize algorithm.'
  })

  steps.push({
    phase: 'processing',
    activeLine: 4,
    message: 'Processing input data.'
  })

  steps.push({
    phase: 'done',
    activeLine: 5,
    message: 'Algorithm complete.'
  })

  return steps
}

const EXAMPLES = getExamples('valid-phone-numbers')

export default function ValidPhoneNumbersVisualizer() {
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')

  const steps = useMemo(
    () => generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [input],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInput(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  return (
    <div className="valid_phone_numbers-shell">
      <ResizableSplitPanels
        className="valid_phone_numbers-top-split"
        storageKey="cpviz.split.valid-phone-numbers.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="valid_phone_numbers-panel">
            <div className="valid_phone_numbers-panel-head">Input & State</div>
            <div className="valid_phone_numbers-panel-body">
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {EXAMPLES?.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="valid_phone_numbers-example-btn"
                  >
                    {ex.label}
                  </button>
                )) || null}
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleReset() }}
                  placeholder="Enter input"
                  className="valid_phone_numbers-input"
                  style={{ flex: 1 }}
                />
              </div>

              <div className="valid_phone_numbers-visualization">
                {/* Visualization content */}
              </div>
            </div>
          </div>
        )}
        right={(
          <div className="valid_phone_numbers-panel">
            <div className="valid_phone_numbers-panel-head">Step Details</div>
            <div className="valid_phone_numbers-panel-body">
              {step && <div className="valid_phone_numbers-details">{/* Details */}</div>}
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

      <div className={`valid_phone_numbers-status ${step?.phase === "done" ? "success" : ""}`}>
        {step?.message ?? "Press Play or Step to begin."}
      </div>

      <FloatingPanel title="Playback Controls">
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
      </FloatingPanel>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
