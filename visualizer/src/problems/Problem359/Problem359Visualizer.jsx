import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './Problem359.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = ['check_exists', 'cooldown_active', 'cooldown_expired', 'done', 'init', 'new_message', 'request_arrives']
const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'request_arrives',
  7: 'new_message',
  10: 'cooldown_expired',
  12: 'cooldown_active'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Logger:' },
  { line: 2, text: '    def __init__(self, threshold=10):' },
  { line: 3, text: '        self.threshold = threshold' },
  { line: 4, text: '        self.logs = {}  # msg -> last_print_time' },
  { line: 5, text: '    def shouldPrintMessage(self, timestamp, msg):' },
  { line: 6, text: '        if msg not in self.logs:' },
  { line: 7, text: '            self.logs[msg] = timestamp' },
  { line: 8, text: '            return True' },
  { line: 9, text: '        if timestamp - self.logs[msg] >= self.threshold:' },
  { line: 10, text: '            self.logs[msg] = timestamp' },
  { line: 11, text: '            return True' },
  { line: 12, text: '        return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('logger-rate-limiter', [
  {
    label: 'Example 1',
    requests: [
      { timestamp: 1, message: 'foo' },
      { timestamp: 1, message: 'bar' },
      { timestamp: 3, message: 'foo' },
      { timestamp: 8, message: 'bar' },
      { timestamp: 10, message: 'foo' },
      { timestamp: 11, message: 'foo' },
    ],
    threshold: 5,
  },
  {
    label: 'Example 2',
    requests: [
      { timestamp: 0, message: 'a' },
      { timestamp: 0, message: 'b' },
      { timestamp: 0, message: 'c' },
      { timestamp: 2, message: 'a' },
      { timestamp: 5, message: 'a' },
    ],
    threshold: 2,
  },
  {
    label: 'Example 3',
    requests: [
      { timestamp: 0, message: 'msg' },
      { timestamp: 5, message: 'msg' },
      { timestamp: 10, message: 'msg' },
      { timestamp: 15, message: 'msg' },
    ],
    threshold: 10,
  },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [2, 3, 4] },
  { id: 'check', label: 'Check Message', lines: [5, 6, 7, 8] },
  { id: 'cooldown', label: 'Check Cooldown', lines: [9, 10, 11] },
  { id: 'reject', label: 'Reject', lines: [12] },
]

function generateSteps(requests, threshold) {
  const steps = []
  const logs = {} // msg -> last_print_time

  steps.push({
    phase: 'init',
    activeLine: 2,
    logs: { ...logs },
    threshold,
    requests,
    currentRequestIdx: -1,
    timestamp: null,
    message: null,
    decision: null,
    reason: null,
    printedMessages: [],
    stepNum: 0,
    message: `Logger initialized. Threshold: ${threshold}s. Ready to process ${requests.length} requests.`,
  })

  requests.forEach((req, idx) => {
    const { timestamp, message } = req

    // Step: Request arrives
    steps.push({
      phase: 'request_arrives',
      activeLine: 5,
      logs: { ...logs },
      threshold,
      requests,
      currentRequestIdx: idx,
      timestamp,
      message,
      decision: null,
      reason: null,
      printedMessages: steps[steps.length - 1]?.printedMessages || [],
      stepNum: steps.length,
      message: `Request: "${message}" at time ${timestamp}`,
    })

    // Step: Check if message exists in logs
    const messageExists = message in logs
    steps.push({
      phase: 'check_exists',
      activeLine: messageExists ? 9 : 6,
      logs: { ...logs },
      threshold,
      requests,
      currentRequestIdx: idx,
      timestamp,
      message,
      decision: null,
      reason: null,
      printedMessages: steps[steps.length - 1].printedMessages,
      stepNum: steps.length,
      message: messageExists
        ? `"${message}" exists in logs. Last printed at ${logs[message]}.`
        : `"${message}" is new. No history.`,
    })

    let shouldPrint = false
    let reason = ''

    if (!messageExists) {
      // New message - always print
      shouldPrint = true
      reason = 'First occurrence of message'
      logs[message] = timestamp

      steps.push({
        phase: 'new_message',
        activeLine: 7,
        logs: { ...logs },
        threshold,
        requests,
        currentRequestIdx: idx,
        timestamp,
        message,
        decision: true,
        reason,
        printedMessages: [...steps[steps.length - 1].printedMessages, { message, timestamp }],
        stepNum: steps.length,
        message: `✓ ACCEPT: "${message}" is new. Print and record at time ${timestamp}.`,
      })
    } else {
      // Message exists - check cooldown
      const lastPrintTime = logs[message]
      const timeDiff = timestamp - lastPrintTime
      const isCooldownExpired = timeDiff >= threshold

      if (isCooldownExpired) {
        shouldPrint = true
        reason = `Cooldown expired (${timeDiff}s >= ${threshold}s)`
        logs[message] = timestamp

        steps.push({
          phase: 'cooldown_expired',
          activeLine: 10,
          logs: { ...logs },
          threshold,
          requests,
          currentRequestIdx: idx,
          timestamp,
          message,
          decision: true,
          reason,
          printedMessages: [...steps[steps.length - 1].printedMessages, { message, timestamp }],
          stepNum: steps.length,
          message: `✓ ACCEPT: Cooldown expired (${timeDiff}s >= ${threshold}s). Print and update time to ${timestamp}.`,
        })
      } else {
        shouldPrint = false
        reason = `Within cooldown window (${timeDiff}s < ${threshold}s)`

        steps.push({
          phase: 'cooldown_active',
          activeLine: 12,
          logs: { ...logs },
          threshold,
          requests,
          currentRequestIdx: idx,
          timestamp,
          message,
          decision: false,
          reason,
          printedMessages: steps[steps.length - 1].printedMessages,
          stepNum: steps.length,
          message: `✗ REJECT: Within cooldown (${timeDiff}s < ${threshold}s). Discard message.`,
        })
      }
    }
  })

  steps.push({
    phase: 'done',
    activeLine: 12,
    logs: { ...logs },
    threshold,
    requests,
    currentRequestIdx: -1,
    timestamp: null,
    message: null,
    decision: null,
    reason: null,
    printedMessages: steps[steps.length - 1]?.printedMessages || [],
    stepNum: steps.length,
    message: `Done. Processed ${requests.length} requests. Printed ${steps[steps.length - 1]?.printedMessages?.length || 0} messages.`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'check_exists') return 'check'
  if (phase === 'new_message') return 'check'
  if (phase === 'cooldown_expired' || phase === 'cooldown_active') return 'cooldown'
  if (phase === 'reject') return 'reject'
  return 'init'
}

function RequestTimeline({ step, requests }) {
  if (!step || !requests) return null
  const maxTime = Math.max(...requests.map(r => r.timestamp), 1)

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>
        Request Timeline
      </header>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map((req, idx) => {
            const pos = (req.timestamp / maxTime) * 100
            const isActive = step.currentRequestIdx === idx
            const isPrinted = step.printedMessages?.some(p => p.message === req.message && p.timestamp === req.timestamp)

            return (
              <motion.div
                key={`${req.message}-${req.timestamp}-${idx}`}
                style={{
                  position: 'relative',
                  paddingLeft: 60,
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  minWidth: 50,
                }}>
                  t={req.timestamp}
                </div>

                <motion.div
                  style={{
                    height: 40,
                    position: 'relative',
                    backgroundColor: 'var(--surface2)',
                    borderRadius: 4,
                    border: `2px solid ${isPrinted ? '#22c55e' : 'var(--text)'}`,
                    paddingLeft: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  animate={{
                    backgroundColor: isActive ? '#fef3c7' : isPrinted ? '#f0fdf4' : 'var(--surface2)',
                    borderColor: isActive ? '#fbbf24' : isPrinted ? '#22c55e' : 'var(--text)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: 13,
                      color: 'var(--surface2)',
                    }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    "{req.message}"
                  </motion.div>

                  <motion.div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 2,
                      marginLeft: 'auto',
                      marginRight: 8,
                      backgroundColor: isPrinted ? '#dcfce7' : '#fee2e2',
                      color: isPrinted ? '#15803d' : '#991b1b',
                    }}
                  >
                    {isPrinted ? 'PRINTED' : 'REJECTED'}
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LogMapState({ step }) {
  if (!step) return null

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderLeft: '1px solid var(--text)' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>
        Message Map (message → last_print_time)
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {Object.entries(step.logs || {}).length === 0 ? (
          <div style={{ color: '#627794', fontSize: 12, fontStyle: 'italic' }}>
            (empty)
          </div>
        ) : (
          <AnimatePresence>
            {Object.entries(step.logs || {}).map(([msg, lastTime]) => {
              const timeSinceLastPrint = step.timestamp !== null ? step.timestamp - lastTime : 0
              const timeUntilExpiry = step.threshold - timeSinceLastPrint
              const isExpired = timeUntilExpiry <= 0

              return (
                <motion.div
                  key={msg}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: isExpired && step.timestamp !== null ? '#fef3c7' : 'var(--surface)',
                    border: `2px solid ${isExpired && step.timestamp !== null ? '#fbbf24' : 'var(--border)'}`,
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--surface2)' }}>"{msg}"</span>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>last: {lastTime}</span>
                    {step.timestamp !== null && (
                      <motion.span
                        style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 2,
                          backgroundColor: isExpired ? '#dcfce7' : '#fee2e2',
                          color: isExpired ? '#15803d' : '#991b1b',
                          fontWeight: 600,
                        }}
                        animate={{
                          backgroundColor: isExpired ? '#dcfce7' : '#fee2e2',
                          color: isExpired ? '#15803d' : '#991b1b',
                        }}
                      >
                        {isExpired ? '✓ ready' : `-${Math.ceil(timeUntilExpiry)}s`}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <div style={{ padding: 10, backgroundColor: '#eff6ff', borderRadius: 4, border: '1px solid #0ea5e9' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>
          Cooldown Rule (threshold={step.threshold}s)
        </div>
        <div style={{ fontSize: 11, color: '#0369a1', fontFamily: 'monospace' }}>
          Can re-print when: current_time - last_print_time ≥ {step.threshold}s
        </div>
      </div>
    </section>
  )
}

function DecisionFlow({ step }) {
  if (!step) return null

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>
        Decision Flow
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {step.phase === 'init' ? (
          <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #0ea5e9', textAlign: 'center', color: '#0c4a6e', fontSize: 12 }}>
            Ready to process requests
          </div>
        ) : step.phase === 'request_arrives' ? (
          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#fef3c7',
              borderRadius: 4,
              border: '2px solid #fbbf24',
              fontSize: 12,
              color: '#78350f',
            }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <strong>Message:</strong> "{step.message}" @ t={step.timestamp}
          </motion.div>
        ) : (
          <>
            <motion.div
              style={{
                padding: 12,
                backgroundColor: '#fef3c7',
                borderRadius: 4,
                border: '2px solid #fbbf24',
                fontSize: 12,
                color: '#78350f',
              }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <strong>Message:</strong> "{step.message}" @ t={step.timestamp}
            </motion.div>

            {step.decision !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{
                  padding: 12,
                  backgroundColor: step.decision ? '#dcfce7' : '#fee2e2',
                  borderRadius: 4,
                  border: `2px solid ${step.decision ? '#22c55e' : '#ef4444'}`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: step.decision ? '#15803d' : '#991b1b',
                }}
              >
                {step.decision ? '✓ ACCEPT & PRINT' : '✗ REJECT'}
              </motion.div>
            )}

            {step.reason && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{
                  padding: 10,
                  backgroundColor: 'var(--surface2)',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                <strong>Reason:</strong> {step.reason}
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function OutputLog({ step }) {
  if (!step) return null

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderLeft: '1px solid var(--text)' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>
        Printed Output ({(step.printedMessages || []).length})
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', maxHeight: 300 }}>
        {(step.printedMessages || []).length === 0 ? (
          <div style={{ color: '#627794', fontSize: 12, fontStyle: 'italic' }}>
            (none printed yet)
          </div>
        ) : (
          <AnimatePresence>
            {step.printedMessages.map((msg, idx) => (
              <motion.div
                key={`output-${msg.message}-${msg.timestamp}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #22c55e',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: '#15803d' }}>
                  {idx + 1}. "{msg.message}"
                </span>
                <span style={{ fontSize: 11, color: '#15803d', opacity: 0.7 }}>
                  t={msg.timestamp}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}

function VisualizationPanel({ step, requests, inputPanel }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      {inputPanel}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <RequestTimeline step={step} requests={requests} />
        <LogMapState step={step} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <DecisionFlow step={step} />
        <OutputLog step={step} />
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem359Visualizer() {
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')
  const [requestsInput, setRequestsInput] = useState(
    JSON.stringify(EXAMPLES[0]?.requests ?? []),
  )
  const [thresholdInput, setThresholdInput] = useState(String(EXAMPLES[0]?.threshold ?? 10))

  const { requests, threshold, inputError } = useMemo(() => {
    try {
      const parsedRequests = JSON.parse(requestsInput)
      if (!Array.isArray(parsedRequests)) throw new Error('requests must be an array')
      parsedRequests.forEach((r) => {
        if (!r || typeof r !== 'object' || Array.isArray(r)) {
          throw new Error('each request must be an object { "timestamp": number, "message": string }')
        }
        if (typeof r.timestamp !== 'number' || !Number.isFinite(r.timestamp)) {
          throw new Error('each request needs a numeric "timestamp"')
        }
        if (typeof r.message !== 'string') {
          throw new Error('each request needs a string "message"')
        }
      })
      const parsedThreshold = Number(thresholdInput)
      if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
        throw new Error('threshold must be a non-negative number')
      }
      return { requests: parsedRequests, threshold: parsedThreshold, inputError: '' }
    } catch (e) {
      return { requests: [], threshold: 10, inputError: e.message }
    }
  }, [requestsInput, thresholdInput])

  const steps = useMemo(
    () => generateSteps(requests, threshold).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [requests, threshold],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })

  const applyExample = useCallback((ex) => {
    if (!ex) return
    setActiveLabel(ex.label)
    setRequestsInput(JSON.stringify(ex.requests ?? []))
    setThresholdInput(String(ex.threshold ?? 10))
    handleReset()
  }, [handleReset])

  const handleInputChange = useCallback((key, text) => {
    if (key === 'requests') setRequestsInput(text)
    if (key === 'threshold') setThresholdInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />),
    viz: (<VisualizationPanel
          step={step}
          requests={requests}
          inputPanel={(
            <ManualInputPanel
              fields={[
                { key: 'requests', label: 'requests', type: 'array' },
                { key: 'threshold', label: 'threshold', type: 'number' },
              ]}
              values={{ requests: requestsInput, threshold: thresholdInput }}
              onChange={handleInputChange}
              examples={EXAMPLES}
              activeLabel={activeLabel}
              applyExample={applyExample}
              inputError={inputError}
            />
          )}
        />),
  }), [
    step,
    connectivity,
    setActiveLineDom,
    requests,
    requestsInput,
    thresholdInput,
    activeLabel,
    inputError,
    applyExample,
    handleInputChange,
    autoScrollCode,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: 'var(--text-muted)' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
