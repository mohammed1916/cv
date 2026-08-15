import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './LargestOrdersVisualizer.css'
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const SOLUTION_CODE = [
  { line: 1, text: 'SELECT c.name, COUNT(*) as count, SUM(o.amount) as total' },
  { line: 2, text: 'FROM Orders o' },
  { line: 3, text: 'JOIN Customers c ON o.customerId = c.id' },
  { line: 4, text: 'GROUP BY o.customerId, c.name' },
  { line: 5, text: 'HAVING COUNT(*) > 1' },
  { line: 6, text: 'ORDER BY total DESC;' },
]

const PATTERNS = ['parse', 'join', 'aggregate', 'filter', 'sort', 'done']
const LINE_PATTERN_MAP = {
  1: 'parse',
  3: 'join',
  4: 'aggregate',
  5: 'filter',
  6: 'sort',
}

function generateSteps(input) {
  const steps = []

  let orders = []
  let customers = {}

  try {
    const data = JSON.parse(input)
    orders = data.orders || []
    customers = data.customers || {}
  } catch (e) {
    steps.push({
      phase: 'done',
      activeLine: 1,
      relatedLines: [1],
      message: 'Invalid input format.',
      result: [],
      done: true,
      error: true,
    })
    return steps
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 6,
      relatedLines: [6],
      message: 'No orders found.',
      result: [],
      done: true,
    })
    return steps
  }

  // Parse phase
  steps.push({
    phase: 'parse',
    activeLine: 1,
    relatedLines: [1, 2],
    message: `Parsing ${orders.length} orders and ${Object.keys(customers).length} customers.`,
    orders,
    customers,
  })

  // Join and aggregate phase
  const customerOrders = {}
  const customerNames = {}

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i]
    const customerId = order.customerId
    const customerName = customers[customerId] || `Customer ${customerId}`

    steps.push({
      phase: 'join',
      activeLine: 3,
      relatedLines: [3],
      message: `Joining Order ${order.orderId} (${order.amount}) with ${customerName}`,
      orders,
      customers,
      customerOrders: { ...customerOrders },
      customerNames: { ...customerNames },
      currentOrderIdx: i,
    })

    if (!customerOrders[customerId]) {
      customerOrders[customerId] = []
      customerNames[customerId] = customerName
    }
    customerOrders[customerId].push(order)

    // Calculate aggregates
    const count = customerOrders[customerId].length
    const total = customerOrders[customerId].reduce((sum, o) => sum + o.amount, 0)

    steps.push({
      phase: 'aggregate',
      activeLine: 4,
      relatedLines: [4],
      message: `Aggregating for ${customerName}: ${count} orders, total = $${total}`,
      orders,
      customers,
      customerOrders: { ...customerOrders },
      customerNames: { ...customerNames },
      currentCustomerId: customerId,
    })
  }

  // Filter phase - HAVING COUNT(*) > 1
  steps.push({
    phase: 'filter',
    activeLine: 5,
    relatedLines: [5],
    message: 'Filtering customers with more than 1 order...',
    orders,
    customers,
    customerOrders: { ...customerOrders },
    customerNames: { ...customerNames },
  })

  const filtered = Object.entries(customerOrders)
    .filter(([customerId, customerOrderList]) => customerOrderList.length > 1)
    .map(([customerId, customerOrderList]) => ({
      customerId: parseInt(customerId),
      name: customerNames[customerId],
      count: customerOrderList.length,
      total: customerOrderList.reduce((sum, o) => sum + o.amount, 0),
    }))

  // Sort phase
  steps.push({
    phase: 'sort',
    activeLine: 6,
    relatedLines: [6],
    message: `Found ${filtered.length} customers with multiple orders. Sorting by total amount...`,
    filtered,
  })

  const result = filtered.sort((a, b) => b.total - a.total)

  steps.push({
    phase: 'done',
    activeLine: 6,
    relatedLines: [6],
    message: `Query complete. ${result.length} customers with largest orders identified.`,
    result,
    orders,
    customers,
    customerOrders,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, orders, customerOrders, customerNames, applyExample, examples }) {
  if (!step) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%' }}>
        {examples?.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(ex)}
                  className="largest_orders-example-btn"
                >
                  {ex.label || `Example ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                className="largest_orders-example-btn"
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step.orders && (
        <div className="largest_orders-table-section">
          <div className="largest_orders-table-label">Orders Table</div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <table className="largest_orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {step.orders.map((order, idx) => (
                  <tr key={idx} style={{
                    backgroundColor: step.currentOrderIdx === idx ? 'rgba(56, 189, 248, 0.15)' : undefined,
                  }}>
                    <td>#{order.orderId}</td>
                    <td>{order.customerId}</td>
                    <td>${order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step.customerOrders && Object.keys(step.customerOrders).length > 0 && (
        <div className="largest_orders-table-section">
          <div className="largest_orders-table-label">Customer Aggregates</div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <table className="largest_orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(step.customerOrders).map(([customerId, orderList]) => (
                  <tr key={customerId} style={{
                    backgroundColor: step.currentCustomerId === parseInt(customerId) ? 'rgba(168, 139, 250, 0.15)' : undefined,
                  }}>
                    <td>{step.customerNames[customerId]}</td>
                    <td style={{ textAlign: 'center' }}>{orderList.length}</td>
                    <td>${orderList.reduce((sum, o) => sum + o.amount, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step.filtered && step.filtered.length > 0 && (
        <div className="largest_orders-table-section">
          <div className="largest_orders-table-label">Filtered Results (Count &gt; 1)</div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <table className="largest_orders-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {step.filtered.map((record, idx) => (
                  <tr key={idx}>
                    <td><span className="largest_orders-rank-badge">{idx + 1}</span></td>
                    <td>{record.name}</td>
                    <td style={{ textAlign: 'center' }}>{record.count}</td>
                    <td>${record.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step.result && step.result.length > 0 && (
        <div className="largest_orders-table-section">
          <div className="largest_orders-table-label">Final Result (Sorted by Total)</div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <table className="largest_orders-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {step.result.map((record, idx) => (
                  <tr key={idx}>
                    <td><span className="largest_orders-rank-badge">{idx + 1}</span></td>
                    <td>{record.name}</td>
                    <td style={{ textAlign: 'center' }}>{record.count}</td>
                    <td>${record.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailsPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: 'var(--text-secondary)' }}>
        Press play or step to begin.
      </div>
    )
  }

  return (
    <div className="largest_orders-details" style={{ padding: 16 }}>
      <div className="largest_orders-detail-item">
        <div className="largest_orders-detail-label">Current Phase</div>
        <div style={{ textTransform: 'capitalize' }}>{step.phase}</div>
      </div>

      <div className="largest_orders-detail-item">
        <div className="largest_orders-detail-label">Active Code Line</div>
        <div>Line {step.activeLine}</div>
      </div>

      {step.phase === 'parse' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Input Statistics</div>
          <div>Orders: {step.orders?.length || 0}</div>
          <div>Customers: {Object.keys(step.customers || {}).length}</div>
        </div>
      )}

      {step.phase === 'join' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Current Action</div>
          <div>Processing order with customer relationship</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Building customer-order mapping
          </div>
        </div>
      )}

      {step.phase === 'aggregate' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Aggregation</div>
          <div>Calculating totals for customers with multiple orders</div>
        </div>
      )}

      {step.phase === 'filter' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Filter Criteria</div>
          <div>COUNT(*) &gt; 1</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Removing customers with single orders
          </div>
        </div>
      )}

      {step.phase === 'sort' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Sorting</div>
          <div>Ranking by total amount (descending)</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {step.filtered?.length || 0} customers matched
          </div>
        </div>
      )}

      {step.phase === 'done' && (
        <div className="largest_orders-detail-item">
          <div className="largest_orders-detail-label">Final Result</div>
          <div>
            {step.result?.length > 0
              ? `${step.result.length} customers ranked by largest orders`
              : 'No customers with multiple orders'}
          </div>
        </div>
      )}
    </div>
  )
}

const EXAMPLES = getExamples('largest-orders')

export default function LargestOrdersVisualizer() {
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

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input & Visualization" },
    { id: 'right', title: "Step Details", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="largest_orders-panel">
            <div className="largest_orders-panel-head">Input & Visualization</div>
            <div className="largest_orders-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES?.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => applyExample(ex)}
                    className="largest_orders-example-btn"
                  >
                    {ex.label || `Example ${i + 1}`}
                  </button>
                )) || null}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <textarea
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleReset() }}
                  placeholder='Enter JSON: {"orders": [{"orderId": 1, "customerId": 1, "amount": 100}], "customers": {"1": "John"}}'
                  className="largest_orders-input"
                  style={{ flex: 1, minHeight: 80, fontFamily: 'monospace' }}
                />
              </div>

              <VisualizationPanel
                step={step}
                orders={step?.orders}
                customerOrders={step?.customerOrders}
                customerNames={step?.customerNames}
                applyExample={applyExample}
                examples={EXAMPLES}
              />
            </div>
          </div>),
    right: (<div className="largest_orders-panel">
            <div className="largest_orders-panel-head">Step Details</div>
            <div className="largest_orders-panel-body">
              <DetailsPanel step={step} />
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="largest_orders-shell">
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

      <div className={`largest_orders-status ${step?.phase === "done" ? "success" : ""}`}>
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
    </div>
  )
}
