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
import './DepartmentTopThreeSalariesVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "-- Department Top Three Salaries (MySQL 8+)" },
  { line: 2, text: "WITH ranked AS (" },
  { line: 3, text: "    SELECT" },
  { line: 4, text: "        e.departmentId," },
  { line: 5, text: "        e.name," },
  { line: 6, text: "        e.salary," },
  { line: 7, text: "        DENSE_RANK() OVER (" },
  { line: 8, text: "            PARTITION BY e.departmentId" },
  { line: 9, text: "            ORDER BY e.salary DESC" },
  { line: 10, text: "        ) AS rnk" },
  { line: 11, text: "    FROM Employee AS e" },
  { line: 12, text: ")" },
  { line: 13, text: "SELECT" },
  { line: 14, text: "    d.name AS Department," },
  { line: 15, text: "    r.name AS Employee," },
  { line: 16, text: "    r.salary AS Salary" },
  { line: 17, text: "FROM ranked AS r" },
  { line: 18, text: "JOIN Department AS d" },
  { line: 19, text: "    ON r.departmentId = d.id" },
  { line: 20, text: "WHERE r.rnk <= 3;" },
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

const EXAMPLES = getExamples('department-top-three-salaries')

export default function DepartmentTopThreeSalariesVisualizer() {
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
    <div className="department_top_three_salaries-shell">
      <ResizableSplitPanels
        className="department_top_three_salaries-top-split"
        storageKey="cpviz.split.department-top-three-salaries.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="department_top_three_salaries-panel">
            <div className="department_top_three_salaries-panel-head">Input & State</div>
            <div className="department_top_three_salaries-panel-body">
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {EXAMPLES?.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="department_top_three_salaries-example-btn"
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
                  className="department_top_three_salaries-input"
                  style={{ flex: 1 }}
                />
              </div>

              <div className="department_top_three_salaries-visualization">
                {/* Visualization content */}
              </div>
            </div>
          </div>
        )}
        right={(
          <div className="department_top_three_salaries-panel">
            <div className="department_top_three_salaries-panel-head">Step Details</div>
            <div className="department_top_three_salaries-panel-body">
              {step && <div className="department_top_three_salaries-details">{/* Details */}</div>}
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

      <div className={`department_top_three_salaries-status ${step?.phase === "done" ? "success" : ""}`}>
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
