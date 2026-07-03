import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FindCustomerRefereeVisualizer.css'

// ─── Pattern annotations ───────────────────────────────────────────────────
const SOLUTION_CODE = [
  { line: 1, text: 'SELECT name FROM Customer' },
  { line: 2, text: 'WHERE referee_id IS NULL' },
  { line: 3, text: '   OR referee_id != 2;' },
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
    const isIncluded = refereeId === null || refereeId !== targetRefereeId

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

const EXAMPLES = getExamples('find-customer-referee')

const SNIPPETS = [
  { id: 'select', label: 'SELECT', lines: [1] },
  { id: 'where_null', label: 'IS NULL', lines: [2] },
  { id: 'where_ne', label: '!= Check', lines: [3] },
]

function VisualizationPanel({ step, applyExample, examples }) {
  const customers = step.result || []
  const included = step.included || []
  const excluded = step.excluded || []
  const currentCustomer = step.currentCustomer

  return (
    <div className="find-customer-referee-visualizer">
      <motion.div
        key={`message-${step.phase}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="step-message"
      >
        {step.message}
      </motion.div>

      <div className="filter-section">
        <div className="filter-header">Customer Table</div>
        <div className="filter-description">
          Filtering customers where referee_id IS NULL or referee_id ≠ 2
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
                {[
                  { id: 1, name: 'Will', referee_id: null },
                  { id: 2, name: 'Jane', referee_id: null },
                  { id: 3, name: 'Alex', referee_id: 2 },
                  { id: 4, name: 'Bill', referee_id: null },
                  { id: 5, name: 'Zack', referee_id: 1 },
                ].map((customer) => {
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
                          <span style={{ color: '#22c55e', fontWeight: 600 }}>
                            ✓ Include
                          </span>
                        )}
                        {isExcluded && (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            ✗ Exclude
                          </span>
                        )}
                        {!isIncluded && !isExcluded && (
                          <span style={{ color: '#9ca3af' }}>–</span>
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

      {step.done && (
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

      {step.done && (included.length > 0 || excluded.length > 0) && (
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
  const defaultInput = [
    { id: 1, name: 'Will', referee_id: null },
    { id: 2, name: 'Jane', referee_id: null },
    { id: 3, name: 'Alex', referee_id: 2 },
    { id: 4, name: 'Bill', referee_id: null },
    { id: 5, name: 'Zack', referee_id: 1 },
  ]

  const { step, stepIndex, totalSteps, next, prev, reset, jump } =
    usePlaybackState(defaultInput, generateSteps)

  const { activeCodeLines } = useCodeVisualConnectivity(step, LINE_PATTERN_MAP)
  const { patternOverlay } = usePatternOverlay(PATTERNS, LINE_PATTERN_MAP)

  const examples = EXAMPLES || [
    {
      id: 'example1',
      input: [
        { id: 1, name: 'Will', referee_id: null },
        { id: 2, name: 'Jane', referee_id: null },
        { id: 3, name: 'Alex', referee_id: 2 },
        { id: 4, name: 'Bill', referee_id: null },
        { id: 5, name: 'Zack', referee_id: 1 },
      ],
      label: 'Standard',
    },
    {
      id: 'example2',
      input: [
        { id: 1, name: 'Alice', referee_id: null },
        { id: 2, name: 'Bob', referee_id: 1 },
      ],
      label: 'Minimal',
    },
  ]

  const applyExample = useCallback(
    (exampleInput) => {
      reset(exampleInput)
    },
    [reset]
  )

  return (
    <DockableWorkspace
      title="Find Customer Referee Visualizer"
      panels={{
        main: {
          label: 'Visualization',
          content: (
            <VisualizationPanel
              step={step}
              applyExample={applyExample}
              examples={examples}
            />
          ),
        },
        code: {
          label: 'SQL Code',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CodePatternAnnotations
                code={SOLUTION_CODE}
                activeLines={activeCodeLines}
                patternOverlay={patternOverlay}
                language="sql"
              />
              <PatternLegend
                patterns={PATTERNS.map((p) => ({
                  id: p,
                  label: p.charAt(0).toUpperCase() + p.slice(1),
                }))}
              />
            </div>
          ),
        },
      }}
      footer={
        <PlaybackControls
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onNext={next}
          onPrev={prev}
          onReset={reset}
          onJump={jump}
        />
      }
    />
  )
}
