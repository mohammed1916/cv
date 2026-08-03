import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './CumulativeSalaryVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const CUMULATIVE_PATTERNS = ['select', 'filter', 'window', 'cumsum', 'sort']

const LINE_PATTERN_MAP = {
  3: 'select',   // SELECT e.id, e.month, e.salary
  4: 'select',   // SUM(e2.salary) as salary
  5: 'filter',   // WHERE e.id = e2.id
  6: 'window',   // AND e2.month <= e.month
  7: 'cumsum',   // AND year(e2.date) = year(e.date)
  8: 'sort',     // ORDER BY month DESC
}

const SOLUTION_CODE = [
  { line: 1, text: 'SELECT e.id, e.month, e.salary,' },
  { line: 2, text: '       SUM(e2.salary) as Salary' },
  { line: 3, text: 'FROM employee e' },
  { line: 4, text: 'JOIN employee e2 ON e.id = e2.id' },
  { line: 5, text: '     AND e2.month <= e.month' },
  { line: 6, text: '     AND YEAR(e2.date) = YEAR(e.date)' },
  { line: 7, text: 'GROUP BY e.id, e.month' },
  { line: 8, text: 'ORDER BY e.month DESC' },
]

// Sample employee data: { id, month (1-12), salary, year }
const DEFAULT_EMPLOYEES = [
  { id: 1, month: 1, salary: 5000 },
  { id: 1, month: 2, salary: 5000 },
  { id: 1, month: 3, salary: 5000 },
  { id: 2, month: 1, salary: 3500 },
  { id: 2, month: 2, salary: 3500 },
]

function generateSteps(employees) {
  const steps = []

  if (!employees || employees.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 8,
      message: 'No employee data provided.',
      results: [],
    })
    return steps
  }

  // Sort by id, month for processing
  const sortedEmps = [...employees].sort((a, b) => a.id - b.id || a.month - b.month)

  steps.push({
    phase: 'start',
    activeLine: 1,
    message: 'Initialize cumulative salary calculation for all employees.',
    results: [],
  })

  // Process each employee's record
  for (let i = 0; i < sortedEmps.length; i++) {
    const current = sortedEmps[i]

    // Calculate cumulative sum up to this month
    const cumulativeSum = sortedEmps
      .filter(
        (e) =>
          e.id === current.id &&
          e.month <= current.month
      )
      .reduce((sum, e) => sum + e.salary, 0)

    steps.push({
      phase: 'filter',
      activeLine: 5,
      message: `Processing Employee ${current.id}: Month ${current.month}. Filtering employee records.`,
      currentRecord: current,
      currentIndex: i,
    })

    steps.push({
      phase: 'window',
      activeLine: 6,
      message: `Finding all months up to Month ${current.month} for Employee ${current.id}.`,
      currentRecord: current,
      currentIndex: i,
    })

    steps.push({
      phase: 'cumsum',
      activeLine: 7,
      message: `Calculating cumulative sum for Employee ${current.id}, Month ${current.month}.`,
      currentRecord: current,
      currentIndex: i,
      cumulativeValue: cumulativeSum,
    })

    // Build result up to this point
    const result = {
      id: current.id,
      month: current.month,
      monthlySalary: current.salary,
      cumulativeSalary: cumulativeSum,
    }

    steps.push({
      phase: 'add_result',
      activeLine: 3,
      message: `Employee ${current.id}, Month ${current.month}: Cumulative = $${cumulativeSum}`,
      currentRecord: current,
      currentIndex: i,
      result,
    })
  }

  // Final sorting step
  steps.push({
    phase: 'sort',
    activeLine: 8,
    message: 'Sorting results by month (descending).',
    results: sortedEmps.map((emp) => {
      const cumulativeSum = sortedEmps
        .filter((e) => e.id === emp.id && e.month <= emp.month)
        .reduce((sum, e) => sum + e.salary, 0)

      return {
        id: emp.id,
        month: emp.month,
        monthlySalary: emp.salary,
        cumulativeSalary: cumulativeSum,
      }
    }),
  })

  steps.push({
    phase: 'done',
    activeLine: 8,
    message: 'Calculation complete. All cumulative salaries computed.',
    results: sortedEmps.map((emp) => {
      const cumulativeSum = sortedEmps
        .filter((e) => e.id === emp.id && e.month <= emp.month)
        .reduce((sum, e) => sum + e.salary, 0)

      return {
        id: emp.id,
        month: emp.month,
        monthlySalary: emp.salary,
        cumulativeSalary: cumulativeSum,
      }
    }),
  })

  return steps
}

const EXAMPLES = getExamples('cumulative-salary') || [
  {
    label: 'Example 1',
    employees: [
      { id: 1, month: 1, salary: 5000 },
      { id: 1, month: 2, salary: 5000 },
      { id: 1, month: 3, salary: 5000 },
      { id: 2, month: 1, salary: 3500 },
      { id: 2, month: 2, salary: 3500 },
    ],
  },
  {
    label: 'Example 2',
    employees: [
      { id: 1, month: 1, salary: 4000 },
      { id: 1, month: 2, salary: 4000 },
      { id: 2, month: 1, salary: 6000 },
    ],
  },
]

export default function CumulativeSalaryVisualizer() {
  const [employeesInput, setEmployeesInput] = useState(
    JSON.stringify(DEFAULT_EMPLOYEES)
  )
  const [inputError, setInputError] = useState('')

  const employees = useMemo(() => {
    try {
      const data = JSON.parse(employeesInput)
      if (!Array.isArray(data)) throw new Error('Must be an array of employees')
      if (data.length === 0) throw new Error('Array cannot be empty')

      // Validate each employee object
      for (const emp of data) {
        if (typeof emp.id !== 'number' || typeof emp.month !== 'number' || typeof emp.salary !== 'number') {
          throw new Error('Each employee must have id, month, and salary as numbers')
        }
      }

      setInputError('')
      return data
    } catch (e) {
      setInputError(e.message || 'Invalid input format')
      return DEFAULT_EMPLOYEES
    }
  }, [employeesInput])

  const steps = useMemo(
    () =>
      generateSteps(employees).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [employees]
  )

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (ex) => {
      setEmployeesInput(JSON.stringify(ex.employees))
      handleReset()
    },
    [handleReset]
  )

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } =
    usePatternOverlay()

  // Build the results table data for display
  const resultsData = useMemo(() => {
    if (!step || !step.results) return []
    return step.results
  }, [step])

  const totalSalarySum = useMemo(() => {
    if (!resultsData || resultsData.length === 0) return 0
    return resultsData.reduce((sum, record) => sum + record.monthlySalary, 0)
  }, [resultsData])

  const maxCumulativeSalary = useMemo(() => {
    if (!resultsData || resultsData.length === 0) return 0
    return Math.max(...resultsData.map((r) => r.cumulativeSalary))
  }, [resultsData])

  return (
    <div className="cumulative-salary-shell">
      <ResizableSplitPanels
        className="cumulative-salary-top-split"
        storageKey="cpviz.split.cumulative-salary.top"
        initialLeftPercent={50}
        minLeftPx={320}
        minRightPx={300}
        left={
          <div className="cumulative-salary-panel">
            <div className="cumulative-salary-panel-head">Employee Salary Data</div>
            <div className="cumulative-salary-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="cumulative-salary-example-btn"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <div className="cumulative-salary-input-group">
                <div style={{ width: '100%' }}>
                  <div className="cumulative-salary-label">Employee Records (JSON):</div>
                  <textarea
                    value={employeesInput}
                    onChange={(e) => {
                      setEmployeesInput(e.target.value)
                      handleReset()
                    }}
                    placeholder='[{"id": 1, "month": 1, "salary": 5000}]'
                    className="cumulative-salary-input"
                    style={{
                      width: '100%',
                      height: '140px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                  />
                  {inputError && (
                    <div style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>
                      {inputError}
                    </div>
                  )}
                </div>
              </div>

              <div className="cumulative-salary-summary">
                <div className="cumulative-salary-summary-item">
                  <div className="cumulative-salary-summary-label">Employees</div>
                  <div className="cumulative-salary-summary-value">
                    {new Set(employees.map((e) => e.id)).size}
                  </div>
                </div>
                <div className="cumulative-salary-summary-item">
                  <div className="cumulative-salary-summary-label">Records</div>
                  <div className="cumulative-salary-summary-value">{employees.length}</div>
                </div>
                <div className="cumulative-salary-summary-item">
                  <div className="cumulative-salary-summary-label">Total Salary</div>
                  <div className="cumulative-salary-summary-value">${totalSalarySum}</div>
                </div>
              </div>
            </div>
          </div>
        }
        right={
          <div className="cumulative-salary-panel">
            <div className="cumulative-salary-panel-head">Cumulative Salary Results</div>
            <div className="cumulative-salary-panel-body">
              <div className="cumulative-salary-table-container">
                <div className="cumulative-salary-table-header">
                  <div className="cumulative-salary-header-cell">Emp ID</div>
                  <div className="cumulative-salary-header-cell">Month</div>
                  <div className="cumulative-salary-header-cell">Monthly</div>
                  <div className="cumulative-salary-header-cell">Cumulative</div>
                  <div className="cumulative-salary-header-cell">Pct Max</div>
                </div>
                <div className="cumulative-salary-table-body">
                  <AnimatePresence>
                    {resultsData && resultsData.length > 0 ? (
                      resultsData.map((record, idx) => {
                        const pctOfMax = maxCumulativeSalary > 0
                          ? ((record.cumulativeSalary / maxCumulativeSalary) * 100).toFixed(1)
                          : 0

                        return (
                          <motion.div
                            key={`${record.id}-${record.month}`}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cumulative-salary-row"
                          >
                            <div className="cumulative-salary-cell employee-id">
                              {record.id}
                            </div>
                            <div className="cumulative-salary-cell">
                              {record.month}
                            </div>
                            <div className="cumulative-salary-cell">
                              ${record.monthlySalary}
                            </div>
                            <div className="cumulative-salary-cell cumulative">
                              ${record.cumulativeSalary}
                            </div>
                            <div className="cumulative-salary-cell">
                              {pctOfMax}%
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="cumulative-salary-empty">
                        No results yet. Press Play to begin.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {resultsData && resultsData.length > 0 && (
                <div className="cumulative-salary-summary">
                  <div className="cumulative-salary-summary-item">
                    <div className="cumulative-salary-summary-label">Total Records</div>
                    <div className="cumulative-salary-summary-value">{resultsData.length}</div>
                  </div>
                  <div className="cumulative-salary-summary-item">
                    <div className="cumulative-salary-summary-label">Max Cumulative</div>
                    <div className="cumulative-salary-summary-value">${maxCumulativeSalary}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div style={{ position: 'relative' }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>

      <div
        className={`cumulative-salary-status ${
          step?.phase === 'done' ? 'complete' : step?.phase === 'start' ? 'processing' : ''
        }`}
      >
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={CUMULATIVE_PATTERNS} />
        )}
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
    </div>
  )
}
