import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ExcelSheetColumnTitleVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "class Solution(object):" },
  { line: 2, text: "    def convertToTitle(self, columnNumber):" },
  { line: 3, text: "        result = []" },
  { line: 4, text: "        while columnNumber > 0:" },
  { line: 5, text: "            columnNumber -= 1" },
  { line: 6, text: "            result.append(chr(ord('A') + columnNumber % 26))" },
  { line: 7, text: "            columnNumber //= 26" },
  { line: 8, text: "        return ''.join(reversed(result))" },
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

const EXAMPLES = getExamples('excel-sheet-column-title')

export default function ExcelSheetColumnTitleVisualizer() {
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

  // ─── Panel extraction ───────────────────────────────────────────────────
  const primaryPanel = (
    <div className="excel_sheet_column_title-panel">
      <div className="excel_sheet_column_title-panel-head">Input & State</div>
      <div className="excel_sheet_column_title-panel-body">
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {EXAMPLES?.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="excel_sheet_column_title-example-btn"
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
            className="excel_sheet_column_title-input"
            style={{ flex: 1 }}
          />
        </div>

        <div className="excel_sheet_column_title-visualization">
          {/* Visualization content */}
        </div>
      </div>
    </div>
  )

  const statePanel = (
    <div className="excel_sheet_column_title-panel">
      <div className="excel_sheet_column_title-panel-head">Step Details</div>
      <div className="excel_sheet_column_title-panel-body">
        {step && <div className="excel_sheet_column_title-details">{/* Details */}</div>}
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className={`excel_sheet_column_title-status ${step?.phase === "done" ? "success" : ""}`}>
      {step?.message ?? "Press Play or Step to begin."}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend />}
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
    </>
  )

  // ─── Lumino state + config ──────────────────────────────────────────────
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Input & State', dockMode: 'split-right' },
      { id: 'state', title: 'Step Details', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="excel_sheet_column_title-shell">
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
