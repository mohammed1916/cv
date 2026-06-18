import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './ValidParenthesesVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isValid(self, s: str) -> bool:' },
  { line: 3, text: '        stack = []' },
  { line: 4, text: '        closeToOpen = {")": "(", "]": "[", "}": "{"}' },
  { line: 5, text: '' },
  { line: 6, text: '        for c in s:' },
  { line: 7, text: '            if c in closeToOpen:' },
  { line: 8, text: '                if stack and stack[-1] == closeToOpen[c]:' },
  { line: 9, text: '                    stack.pop()' },
  { line: 10, text: '                else:' },
  { line: 11, text: '                    return False' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                stack.append(c)' },
  { line: 14, text: '' },
  { line: 15, text: '        return True if not stack else False' },
]

function generateSteps(s) {
  const steps = []

  if (typeof s !== 'string') {
    steps.push({
      phase: 'done',
      i: null,
      stack: [],
      c: null,
      success: false,
      activeLine: 15,
      message: 'Invalid input. Return False.',
    })
    return steps
  }

  const stack = []
  const closeToOpen = { ')': '(', ']': '[', '}': '{' }

  steps.push({
    phase: 'init',
    i: null,
    stack: [...stack],
    c: null,
    activeLine: 3,
    message: 'Initialize empty stack and closeToOpen mapping.',
  })

  for (let i = 0; i < s.length; i++) {
    const c = s[i]

    steps.push({
      phase: 'loop',
      i,
      stack: [...stack],
      c,
      activeLine: 6,
      message: `Read character c = '${c}' at index ${i}.`,
    })

    steps.push({
      phase: 'check_close',
      i,
      stack: [...stack],
      c,
      activeLine: 7,
      message: `Is '${c}' a closing bracket? (in closeToOpen?)`,
    })

    if (c in closeToOpen) {
      const match = closeToOpen[c]

      steps.push({
        phase: 'check_stack',
        i,
        stack: [...stack],
        c,
        activeLine: 8,
        message: `Yes. Check if stack is non-empty and top of stack == '${match}'.`,
      })

      if (stack.length > 0 && stack[stack.length - 1] === match) {
        const popped = stack.pop()
        steps.push({
          phase: 'pop',
          i,
          stack: [...stack],
          c,
          popped,
          activeLine: 9,
          message: `Match found! Pop '${popped}' from stack.`,
        })
      } else {
        steps.push({
          phase: 'fail_mismatch',
          i,
          stack: [...stack],
          c,
          activeLine: 11,
          message: `Mismatch or empty stack. Expected '${match}' but got ${stack.length ? "'" + stack[stack.length - 1] + "'" : 'empty stack'}. Return False.`,
        })
        return steps
      }
    } else {
      stack.push(c)
      steps.push({
        phase: 'push',
        i,
        stack: [...stack],
        c,
        activeLine: 13,
        message: `No, '${c}' is an opening bracket. Push it onto the stack.`,
      })
    }
  }

  const success = stack.length === 0
  steps.push({
    phase: 'done',
    i: null,
    stack: [...stack],
    c: null,
    success,
    activeLine: 15,
    message: success
      ? 'Loop finished and stack is empty. Return True!'
      : 'Loop finished but stack is NOT empty (unmatched open brackets). Return False.',
  })

  return steps
}

const EXAMPLES = getExamples('valid-parentheses')

function InputPanel({ sInput, setSInput, handleReset, applyExample, inputError }) {
  return (
    <div className="vp-panel-body">
      <div className="vp-examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            className="vp-example-btn"
            onClick={() => applyExample(ex)}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="vp-input-section">
        <label htmlFor="s-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b', minWidth: 40 }}>s =</span>
          <input
            id="s-input"
            value={sInput}
            onChange={(e) => {
              setSInput(e.target.value)
              handleReset()
            }}
            placeholder="()[]{}"
            className="vp-input"
          />
        </label>
        {inputError && (
          <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
            {inputError}
          </div>
        )}
      </div>

      <div className="vp-map-legend">
        <div className="vp-legend-title">Closing Bracket Mapping</div>
        <div className="vp-map-pairs">
          <span className="vp-map-pair">) → (</span>
          <span className="vp-map-pair">] → [</span>
          <span className="vp-map-pair">{"} → {"}</span>
        </div>
      </div>
    </div>
  )
}

function StringVisualizationPanel({ step, s }) {
  return (
    <div className="vp-panel-body">
      <div className="vp-viz-section">
        <h3 className="vp-section-title">String Characters</h3>
        <div className="vp-string-container">
          {s.split('').map((char, idx) => {
            const isActive = step?.i === idx
            const isProcessed = (step?.i > idx) || step?.phase === 'done' || step?.phase === 'fail_mismatch'
            const isMatched = isActive && step?.phase === 'pop'
            const isMismatch = isActive && step?.phase === 'fail_mismatch'

            return (
              <div key={idx} className="vp-char-wrapper">
                <div className="vp-char-index">{idx}</div>
                <motion.div
                  className={`vp-char-cell ${isActive ? 'active' : ''} ${isProcessed && !isActive ? 'processed' : ''} ${isMatched ? 'matched' : ''} ${isMismatch ? 'mismatch' : ''}`}
                  animate={isActive ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {char}
                </motion.div>
                <div className="vp-ptr-container">
                  {isActive && (
                    <motion.div
                      className="vp-ptr"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      ▲
                    </motion.div>
                  )}
                </div>
              </div>
            )
          })}
          {s.length === 0 && (
            <div className="vp-empty-string">Empty string</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StackVisualizationPanel({ step }) {
  return (
    <div className="vp-panel-body">
      <div className="vp-viz-section">
        <h3 className="vp-section-title">Stack State</h3>
        <div className="vp-stack-wrapper">
          <div className="vp-stack-container">
            <AnimatePresence mode="popLayout">
              {step?.stack && step.stack.map((char, idx) => {
                const isTop = idx === step.stack.length - 1
                const closeToOpen = { ')': '(', ']': '[', '}': '{' }
                const isMatching = isTop && step.phase === 'check_stack' && char === closeToOpen[step.c]
                const isFailing = isTop && step.phase === 'fail_mismatch'

                return (
                  <motion.div
                    key={`${idx}-${char}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6, x: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`vp-stack-item ${isTop ? 'top' : ''} ${isMatching ? 'matching' : ''} ${isFailing ? 'failing' : ''}`}
                  >
                    <span className="vp-stack-value">{char}</span>
                    {isTop && <span className="vp-stack-top-label">TOP</span>}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          {(!step?.stack || step.stack.length === 0) && (
            <div className="vp-empty-stack">Stack is empty</div>
          )}
          <div className="vp-stack-base" />
        </div>
      </div>
    </div>
  )
}

function StatusPanel({ step }) {
  return (
    <div className="vp-panel-body">
      <div className="vp-status-content">
        <div className="vp-step-info">
          {step?.message ?? 'Press Play to begin.'}
        </div>
        {step?.phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`vp-result-badge ${step?.success ? 'valid' : 'invalid'}`}
          >
            {step?.success ? '✓ VALID' : '✗ INVALID'}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ValidParenthesesVisualizer() {
  const [sInput, setSInput] = useState('({[]})')
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { s, inputError } = useMemo(() => {
    return { s: sInput, inputError: '' }
  }, [sInput])

  const steps = useMemo(() => generateSteps(s), [s])

  const {
    stepIndex,
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
      setSInput(ex.s)
      handleReset()
    },
    [handleReset],
  )

  const dockPanels = useMemo(() => [
    {
      id: 'input',
      title: 'Input & Mapping',
      subtitle: sInput ? `${sInput.length} character(s)` : 'Enter a string',
      defaultZone: 'left',
      content: (
        <InputPanel
          sInput={sInput}
          setSInput={setSInput}
          handleReset={handleReset}
          applyExample={applyExample}
          inputError={inputError}
        />
      ),
    },
    {
      id: 'string-viz',
      title: 'String Visualization',
      subtitle: step ? `Step ${stepIndex + 1} of ${steps.length}` : 'Press play to start',
      defaultZone: 'left',
      content: <StringVisualizationPanel step={step} s={s} />,
    },
    {
      id: 'stack-viz',
      title: 'Stack State',
      subtitle: step ? `${step.stack?.length ?? 0} element(s)` : 'Stack visualization',
      defaultZone: 'right',
      content: <StackVisualizationPanel step={step} />,
    },
    {
      id: 'code',
      title: 'Code Trace',
      subtitle: step ? `Active line ${step.activeLine}` : 'Line-by-line solution view',
      defaultZone: 'full',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          autoScroll={autoScrollCode}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'status',
      title: 'Status',
      subtitle: step?.phase === 'done' ? (step.success ? 'Valid' : 'Invalid') : 'Current step message',
      defaultZone: 'right',
      content: <StatusPanel step={step} />,
    },
  ], [sInput, step, stepIndex, steps.length, s, applyExample, inputError, autoScrollCode, setActiveLineDom, handleReset])

  const summaryCards = [
    { label: 'Algorithm', value: 'Stack-based Matching' },
    { label: 'Time Complexity', value: 'O(n)' },
    { label: 'Space Complexity', value: 'O(n)' },
    { label: 'Input Length', value: s.length || '—' },
  ]

  return (
    <div className="vp-shell">
      <section className="vp-hero">
        <div className="vp-hero-copy">
          <span className="vp-kicker">Valid Parentheses • LeetCode #20</span>
          <h2>Determine if Parentheses String is Valid</h2>
          <p>
            This visualization shows how a stack-based algorithm efficiently validates whether
            parentheses, brackets, and braces are properly matched and ordered in a string. Each
            opening bracket must have a corresponding closing bracket in the correct order.
          </p>
        </div>

        <div className="vp-summary-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="vp-summary-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <DockableWorkspace
        title="Valid Parentheses Workspace"
        panels={dockPanels}
        initialLayout={{
          rows: [
            ['input', 'string-viz', 'stack-viz'],
            ['code'],
            ['status'],
          ],
          minimized: [],
        }}
      />

      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          onReset={handleReset}
          onPrev={stepBack}
          onPlayToggle={togglePlay}
          onNext={stepForward}
          resetDisabled={steps.length === 0}
          prevDisabled={stepIndex <= 0}
          nextDisabled={steps.length === 0 || isDone}
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          speedIndicator={`${speed}ms`}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          autoScrollLabel="Auto-scroll code"
          showAutoScroll
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  )
}
