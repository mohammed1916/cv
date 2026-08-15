import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './FindCustomerRefereeVisualizer.css'

// ─── Pattern annotations ───────────────────────────────────────────────────
const buildSolutionCode = (targetRefereeId) => [
  { line: 1, text: 'SELECT name FROM Customer' },
  { line: 2, text: 'WHERE referee_id IS NULL' },
  { line: 3, text: `   OR referee_id != ${targetRefereeId};` },
]

const PATTERNS = ['init', 'check_referee', 'check_value', 'include', 'exclude', 'done']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'check_referee',
  3: 'check_value',
}

function generateSteps(customers, targetRefereeId = 2) {
  const steps = []

  if (!Array.isArray(customers) || customers.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 1,
      relatedLines: [1, 2, 3],
      message: 'No customers in table.',
      result: [],
      included: [],
      excluded: [],
      done: true,
    })
    return steps
  }

  // Step 1: Init
  steps.push({
    phase: 'init',
    activeLine: 1,
    relatedLines: [1],
    message: `SELECT all customers from Customer table. Total: ${customers.length}`,
    result: [],
    included: [],
    excluded: [],
  })

  const included = []
  const excluded = []

  // Step 2: Check each customer
  for (const customer of customers) {
    const refereeId = customer.referee_id
    const customerName = customer.name

    // Check if referee_id is NULL
    steps.push({
      phase: 'check_referee',
      activeLine: 2,
      relatedLines: [2],
      message: `Check customer "${customerName}": referee_id = ${refereeId === null ? 'NULL' : refereeId}`,
      currentCustomer: customer,
      result: [...included],
      included: [...included],
      excluded: [...excluded],
    })

    // Check if referee_id is NULL or != targetRefereeId
    if (refereeId === null) {
      steps.push({
        phase: 'check_value',
        activeLine: 2,
        relatedLines: [2],
        message: `✓ "${customerName}": referee_id IS NULL → INCLUDE`,
        currentCustomer: customer,
        result: [...included, customer],
        included: [...included, customer],
        excluded: [...excluded],
      })
      included.push(customer)
    } else if (refereeId !== targetRefereeId) {
      steps.push({
        phase: 'check_value',
        activeLine: 3,
        relatedLines: [3],
        message: `✓ "${customerName}": referee_id (${refereeId}) != ${targetRefereeId} → INCLUDE`,
        currentCustomer: customer,
        result: [...included, customer],
        included: [...included, customer],
        excluded: [...excluded],
      })
      included.push(customer)
    } else {
      steps.push({
        phase: 'exclude',
        activeLine: 3,
        relatedLines: [2, 3],
        message: `✗ "${customerName}": referee_id (${refereeId}) = ${targetRefereeId} → EXCLUDE`,
        currentCustomer: customer,
        result: [...included],
        included: [...included],
        excluded: [...excluded, customer],
      })
      excluded.push(customer)
    }
  }

  // Final step
  steps.push({
    phase: 'done',
    activeLine: 1,
    relatedLines: [1, 2, 3],
    message: `Result: ${included.length} customers not referred by customer ${targetRefereeId}`,
    result: included,
    included,
    excluded,
    done: true,
  })

  return steps
}

const EXAMPLES = getExamplesOr('find-customer-referee', [
  {
    label: 'Standard',
    customers: [
      { id: 1, name: 'Will', referee_id: null },
      { id: 2, name: 'Jane', referee_id: null },
      { id: 3, name: 'Alex', referee_id: 2 },
      { id: 4, name: 'Bill', referee_id: null },
      { id: 5, name: 'Zack', referee_id: 1 },
    ],
    refereeId: 2,
  },
  {
    label: 'Minimal',
    customers: [
      { id: 1, name: 'Alice', referee_id: null },
      { id: 2, name: 'Bob', referee_id: 1 },
    ],
    refereeId: 1,
  },
  {
    label: 'All referred',
    customers: [
      { id: 1, name: 'Ann', referee_id: 2 },
      { id: 2, name: 'Ben', referee_id: 2 },
    ],
    refereeId: 2,
  },
])

function VisualizationPanel({ step, allCustomers, targetRefereeId, inputPanel }) {
  const customers = step?.result || []
  const included = step?.included || []
  const excluded = step?.excluded || []
  const currentCustomer = step?.currentCustomer

  return (
    <div className="find-customer-referee-visualizer">
      {inputPanel}

      <motion.div
        key={`message-${step?.phase}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="step-message"
      >
        {step?.message ?? 'Press Next to begin.'}
      </motion.div>

      <div className="filter-section">
        <div className="filter-header">Customer Table</div>
        <div className="filter-description">
          Filtering customers where referee_id IS NULL or referee_id ≠ {targetRefereeId}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="customer-table-wrapper"
        >
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Referee ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {allCustomers.map((customer) => {
                  const isIncluded = included.some(c => c.id === customer.id)
                  const isExcluded = excluded.some(c => c.id === customer.id)
                  const isCurrent = currentCustomer?.id === customer.id

                  return (
                    <motion.tr
                      key={customer.id}
                      className={`customer-row ${
                        isCurrent ? 'active' : ''
                      } ${isIncluded ? 'filtered' : ''} ${isExcluded ? 'excluded' : ''}`}
                      animate={{
                        backgroundColor:
                          isCurrent ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="customer-id">{customer.id}</td>
                      <td>{customer.name}</td>
                      <td className="referee-cell">
                        {customer.referee_id === null ? (
                          <span className="null">NULL</span>
                        ) : (
                          <span className="value">{customer.referee_id}</span>
                        )}
                      </td>
                      <td>
                        {isIncluded && (
                          <span style={{ color: '#178740', fontWeight: 600 }}>
                            ✓ Include
                          </span>
                        )}
                        {isExcluded && (
                          <span style={{ color: '#e91414', fontWeight: 600 }}>
                            ✗ Exclude
                          </span>
                        )}
                        {!isIncluded && !isExcluded && (
                          <span style={{ color: '#6c7686' }}>–</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>

      {step?.done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="result-summary"
        >
          <div className="result-summary-title">Final Result</div>
          <div className="result-list">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="result-badge"
                >
                  {customer.name}
                </motion.div>
              ))
            ) : (
              <div className="result-badge empty">No results</div>
            )}
          </div>
        </motion.div>
      )}

      {step?.done && (included.length > 0 || excluded.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="comparison-section"
        >
          <div className="comparison-box">
            <div className="comparison-box-title">
              ✓ Included ({included.length})
            </div>
            <div className="comparison-list">
              {included.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="comparison-item included"
                >
                  <span className="check-icon">✓</span>
                  <span>
                    {customer.name} (referee_id:{' '}
                    {customer.referee_id === null ? 'NULL' : customer.referee_id})
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="comparison-box">
            <div className="comparison-box-title">
              ✗ Excluded ({excluded.length})
            </div>
            <div className="comparison-list">
              {excluded.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="comparison-item excluded"
                >
                  <span className="check-icon">✗</span>
                  <span>
                    {customer.name} (referee_id: {customer.referee_id})
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function FindCustomerRefereeVisualizer() {
  const [customersInput, setCustomersInput] = useState(JSON.stringify(EXAMPLES[0].customers))
  const [refereeIdInput, setRefereeIdInput] = useState(String(EXAMPLES[0].refereeId ?? 2))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0].label)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { customers, targetRefereeId, inputError } = useMemo(() => {
    const fallback = { customers: [], targetRefereeId: 2 }
    try {
      const parsedReferee = JSON.parse(refereeIdInput)
      if (typeof parsedReferee !== 'number' || Number.isNaN(parsedReferee)) {
        throw new Error('refereeId must be a number')
      }

      const parsed = JSON.parse(customersInput)
      if (!Array.isArray(parsed)) throw new Error('customers must be an array')
      parsed.forEach((c, i) => {
        if (!c || typeof c !== 'object' || Array.isArray(c)) {
          throw new Error(`customers[${i}] must be an object`)
        }
        if (typeof c.id !== 'number') throw new Error(`customers[${i}].id must be a number`)
        if (typeof c.name !== 'string') throw new Error(`customers[${i}].name must be a string`)
        if (c.referee_id !== null && typeof c.referee_id !== 'number') {
          throw new Error(`customers[${i}].referee_id must be a number or null`)
        }
      })

      return { customers: parsed, targetRefereeId: parsedReferee, inputError: '' }
    } catch (e) {
      return { ...fallback, inputError: e.message }
    }
  }, [customersInput, refereeIdInput])

  const solutionCode = useMemo(() => buildSolutionCode(targetRefereeId), [targetRefereeId])
  const steps = useMemo(() => generateSteps(customers, targetRefereeId), [customers, targetRefereeId])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset,
    isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] ?? null : null

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((example) => {
    setCustomersInput(JSON.stringify(example.customers))
    setRefereeIdInput(String(example.refereeId ?? 2))
    setActiveLabel(example.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'customers') setCustomersInput(text)
    else if (key === 'refereeId') setRefereeIdInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'main', title: 'Visualization' },
    { id: 'code', title: 'SQL Code', dockMode: 'split-right' },
  ], [])
  const panelContents = {
    main: (
      <VisualizationPanel
        step={step}
        allCustomers={customers}
        targetRefereeId={targetRefereeId}
        inputPanel={(
          <ManualInputPanel
            fields={[
              { key: 'customers', label: 'customers', type: 'array' },
              { key: 'refereeId', label: 'refereeId', type: 'number' },
            ]}
            values={{ customers: customersInput, refereeId: refereeIdInput }}
            onChange={handleFieldChange}
            examples={EXAMPLES}
            activeLabel={activeLabel}
            applyExample={applyExample}
            inputError={inputError}
          />
        )}
      />
    ),
    code: (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CodeTracePanel
          step={step}
          codeLines={solutionCode}
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
    ),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.main && createPortal(panelContents.main, panelDivs.main)}
          {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
        </>
      )}
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex <= 0}
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
