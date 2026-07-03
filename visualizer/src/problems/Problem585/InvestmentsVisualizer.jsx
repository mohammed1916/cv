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
import './InvestmentsVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "// Find investments where tiv_2015 is non-unique" },
  { line: 2, text: "// AND location is unique" },
  { line: 3, text: "SELECT SUM(tiv_2016)" },
  { line: 4, text: "FROM Insurance" },
  { line: 5, text: "WHERE tiv_2015 IN (" },
  { line: 6, text: "  SELECT tiv_2015 FROM Insurance" },
  { line: 7, text: "  GROUP BY tiv_2015" },
  { line: 8, text: "  HAVING COUNT(*) > 1" },
  { line: 9, text: ")" },
  { line: 10, text: "AND (lat, lon) IN (" },
  { line: 11, text: "  SELECT lat, lon FROM Insurance" },
  { line: 12, text: "  GROUP BY lat, lon" },
  { line: 13, text: "  HAVING COUNT(*) = 1" },
  { line: 14, text: ")" },
]

function calculateInvestments(input) {
  try {
    const data = JSON.parse(input)
    if (!Array.isArray(data) || data.length === 0) {
      return { rows: [], result: 0, tiv2015Groups: {}, locationGroups: {}, error: null }
    }

    // Group by tiv_2015 to find non-unique values
    const tiv2015Groups = {}
    data.forEach((row) => {
      const tiv = row.tiv_2015
      if (!tiv2015Groups[tiv]) {
        tiv2015Groups[tiv] = []
      }
      tiv2015Groups[tiv].push(row)
    })

    // Group by location to find unique locations
    const locationGroups = {}
    data.forEach((row) => {
      const key = `${row.lat},${row.lon}`
      if (!locationGroups[key]) {
        locationGroups[key] = []
      }
      locationGroups[key].push(row)
    })

    // Identify which rows to include
    const enrichedRows = data.map((row, idx) => {
      const hasDuplicateTiv = tiv2015Groups[row.tiv_2015].length > 1
      const locationKey = `${row.lat},${row.lon}`
      const hasUniqueLocation = locationGroups[locationKey].length === 1
      const isIncluded = hasDuplicateTiv && hasUniqueLocation

      return {
        ...row,
        index: idx,
        hasDuplicateTiv,
        hasUniqueLocation,
        isIncluded,
      }
    })

    // Calculate sum
    const result = enrichedRows
      .filter((row) => row.isIncluded)
      .reduce((sum, row) => sum + row.tiv_2016, 0)

    return {
      rows: enrichedRows,
      result,
      tiv2015Groups,
      locationGroups,
      error: null,
    }
  } catch (err) {
    return {
      rows: [],
      result: 0,
      tiv2015Groups: {},
      locationGroups: {},
      error: err.message,
    }
  }
}

function generateSteps(input) {
  const steps = []

  const calc = calculateInvestments(input)

  steps.push({
    phase: 'init',
    activeLine: 3,
    message: 'Initialize investment data.',
    result: null,
    highlight: 'none',
  })

  steps.push({
    phase: 'processing',
    activeLine: 6,
    message: 'Find investments with non-unique tiv_2015 values.',
    result: null,
    highlight: 'tiv2015',
  })

  steps.push({
    phase: 'processing',
    activeLine: 11,
    message: 'Find investments with unique locations.',
    result: null,
    highlight: 'location',
  })

  steps.push({
    phase: 'processing',
    activeLine: 3,
    message: `Calculating sum of tiv_2016 for matching investments...`,
    result: calc.result,
    highlight: 'both',
  })

  steps.push({
    phase: 'done',
    activeLine: 3,
    message: `Result: ${calc.result}`,
    result: calc.result,
    highlight: 'both',
  })

  return steps
}

const EXAMPLES = getExamples('investments-2016')

export default function InvestmentsVisualizer() {
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')

  const calc = useMemo(() => calculateInvestments(input), [input])

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

  // Count stats
  const includedCount = calc.rows.filter((r) => r.isIncluded).length
  const duplicateTivCount = Object.values(calc.tiv2015Groups).filter((group) => group.length > 1).length

  return (
    <div className="investments_2016-shell">
      <ResizableSplitPanels
        className="investments_2016-top-split"
        storageKey="cpviz.split.investments-2016.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="investments_2016-panel">
            <div className="investments_2016-panel-head">Input & Visualization</div>
            <div className="investments_2016-panel-body">
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {EXAMPLES?.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="investments_2016-example-btn"
                  >
                    {ex.label}
                  </button>
                )) || null}
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleReset() }}
                  placeholder="Enter JSON array of investments"
                  className="investments_2016-input"
                  style={{ flex: 1 }}
                />
              </div>

              {calc.error && (
                <div className="investments_2016-status fail" style={{ marginBottom: 16 }}>
                  Error: {calc.error}
                </div>
              )}

              {!calc.error && calc.rows.length > 0 && (
                <div className="investments_2016-visualization">
                  <table className="investments_2016-table">
                    <thead>
                      <tr>
                        <th>PID</th>
                        <th>TIV 2015</th>
                        <th>TIV 2016</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.rows.map((row) => (
                        <motion.tr
                          key={row.index}
                          className={row.isIncluded ? 'included' : 'excluded'}
                          animate={{
                            opacity: step?.highlight === 'both' || step?.highlight === 'tiv2015' && row.hasDuplicateTiv || step?.highlight === 'location' && row.hasUniqueLocation ? 1 : 0.5,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <td>{row.index + 1}</td>
                          <td className={!row.hasDuplicateTiv ? 'investments_2016-excluded-tiv' : ''}>{row.tiv_2015}</td>
                          <td>{row.tiv_2016}</td>
                          <td>{row.lat}</td>
                          <td>{row.lon}</td>
                          <td>
                            {row.isIncluded ? (
                              <span style={{ color: '#3b82f6', fontWeight: '600' }}>✓ Include</span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>✗ Exclude</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {calc.rows.length === 0 && !calc.error && (
                <div className="investments_2016-visualization" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <span>Enter valid investment data to visualize</span>
                </div>
              )}
            </div>
          </div>
        )}
        right={(
          <div className="investments_2016-panel">
            <div className="investments_2016-panel-head">Analysis & Results</div>
            <div className="investments_2016-panel-body">
              {step && calc.rows.length > 0 && (
                <div className="investments_2016-details">
                  <div className="investments_2016-summary">
                    <div className="investments_2016-stat">
                      <div className="investments_2016-stat-label">Total Investments</div>
                      <div className="investments_2016-stat-value">{calc.rows.length}</div>
                    </div>
                    <div className="investments_2016-stat">
                      <div className="investments_2016-stat-label">Included Count</div>
                      <div className="investments_2016-stat-value" style={{ color: '#3b82f6' }}>{includedCount}</div>
                    </div>
                    <div className="investments_2016-stat">
                      <div className="investments_2016-stat-label">Non-Unique TIV 2015</div>
                      <div className="investments_2016-stat-value">{duplicateTivCount}</div>
                    </div>
                    <div className="investments_2016-stat">
                      <div className="investments_2016-stat-label">Result Sum</div>
                      <div className="investments_2016-stat-value" style={{ color: '#22c55e', fontSize: '18px' }}>
                        {step?.result ?? calc.result}
                      </div>
                    </div>
                  </div>

                  <div className="investments_2016-legend">
                    <div className="investments_2016-legend-item">
                      <div className="investments_2016-legend-color" style={{ background: 'rgba(59, 130, 246, 0.3)' }} />
                      <span>Included (Non-unique TIV, Unique Location)</span>
                    </div>
                    <div className="investments_2016-legend-item">
                      <div className="investments_2016-legend-color" style={{ background: 'rgba(156, 163, 175, 0.2)' }} />
                      <span>Excluded</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>Step {stepIndex + 1}:</strong> {step?.message}
                    </p>
                  </div>
                </div>
              )}

              {calc.rows.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>
                  <p>No data to analyze</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>Enter investment data to see analysis</p>
                </div>
              )}
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

      <div className={`investments_2016-status ${step?.phase === "done" ? "success" : ""}`}>
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
