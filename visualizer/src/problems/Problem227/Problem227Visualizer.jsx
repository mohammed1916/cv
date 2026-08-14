import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './Problem227Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'read_digit', 'push', 'apply_high', 'negate', 'sum', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  6: 'read_digit',
  9: 'push',
  11: 'negate',
  13: 'apply_high',
  15: 'apply_high',
  19: 'sum',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def calculate(s):' },
  { line: 2, text: '    stack = []; num = 0; op = "+"' },
  { line: 3, text: '    ' },
  { line: 4, text: '    for i, ch in enumerate(s):' },
  { line: 5, text: '        if ch.isdigit():' },
  { line: 6, text: '            num = num * 10 + int(ch)' },
  { line: 7, text: '        if ch in "+-*/" or i == len(s) - 1:' },
  { line: 8, text: '            if op == "+":' },
  { line: 9, text: '                stack.append(num)' },
  { line: 10, text: '            elif op == "-":' },
  { line: 11, text: '                stack.append(-num)' },
  { line: 12, text: '            elif op == "*":' },
  { line: 13, text: '                stack.append(stack.pop() * num)' },
  { line: 14, text: '            else:' },
  { line: 15, text: '                stack.append(int(stack.pop() / num))' },
  { line: 16, text: '            op = ch' },
  { line: 17, text: '            num = 0' },
  { line: 18, text: '    ' },
  { line: 19, text: '    return sum(stack)' },
]

function truncDiv(a, b) {
  return Math.trunc(a / b)
}

function generateSteps(exprRaw) {
  const steps = []
  try {
    const s = String(exprRaw)
    if (!s.trim()) throw new Error('Enter an expression, e.g. 3+2*2')
    if (/[()]/.test(s)) throw new Error('LC 227 has no parentheses — use only + - * /')
    if (/[^0-9+\-*/\s]/.test(s)) throw new Error('Only digits, spaces and + - * / are allowed')
    if (s.length > 40) throw new Error('Keep the expression under 40 characters')

    const stack = []
    let num = 0
    let op = '+'

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Evaluate "${s}". stack = [], num = 0, pending op = '+'`,
      expr: s, i: -1, stack: [], num, op,
    })

    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (ch === ' ') continue
      const isDigit = ch >= '0' && ch <= '9'

      if (isDigit) {
        num = num * 10 + Number(ch)
        steps.push({
          phase: 'read_digit',
          activeLine: 6,
          message: `Digit '${ch}' → num = ${num}`,
          expr: s, i, stack: [...stack], num, op,
        })
      }

      const isOp = ch === '+' || ch === '-' || ch === '*' || ch === '/'
      if (isOp || i === s.length - 1) {
        if (op === '+') {
          stack.push(num)
          steps.push({
            phase: 'push',
            activeLine: 9,
            message: `Pending '+' → push ${num} onto the stack`,
            expr: s, i, stack: [...stack], num, op, touched: stack.length - 1,
          })
        } else if (op === '-') {
          stack.push(-num)
          steps.push({
            phase: 'negate',
            activeLine: 11,
            message: `Pending '-' → push ${-num} onto the stack`,
            expr: s, i, stack: [...stack], num, op, touched: stack.length - 1,
          })
        } else if (op === '*') {
          const top = stack.pop()
          const prod = top * num
          stack.push(prod)
          steps.push({
            phase: 'apply_high',
            activeLine: 13,
            message: `Pending '*' → pop ${top}, push ${top} × ${num} = ${prod} (higher precedence, applied now)`,
            expr: s, i, stack: [...stack], num, op, touched: stack.length - 1,
          })
        } else {
          const top = stack.pop()
          if (num === 0) throw new Error('Division by zero')
          const q = truncDiv(top, num)
          stack.push(q)
          steps.push({
            phase: 'apply_high',
            activeLine: 15,
            message: `Pending '/' → pop ${top}, push trunc(${top} / ${num}) = ${q}`,
            expr: s, i, stack: [...stack], num, op, touched: stack.length - 1,
          })
        }

        if (isOp) {
          op = ch
          steps.push({
            phase: 'push',
            activeLine: 16,
            message: `Remember operator '${ch}' for the next number; reset num = 0`,
            expr: s, i, stack: [...stack], num: 0, op,
          })
        }
        num = 0
      }
    }

    const result = stack.reduce((a, b) => a + b, 0)
    steps.push({
      phase: 'sum',
      activeLine: 19,
      message: `Sum the stack: ${stack.join(' + ').replace(/\+ -/g, '- ')} = ${result}`,
      expr: s, i: s.length - 1, stack: [...stack], num: 0, op, result,
    })
    steps.push({
      phase: 'done',
      activeLine: 19,
      message: `"${s}" = ${result}`,
      expr: s, i: s.length - 1, stack: [...stack], num: 0, op, result,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, message: `Error: ${e.message}`, error: true })
  }
  return steps
}

const EXAMPLES = getExamplesOr('basic-calculator-ii', [
  { label: 'Example 1', expr: '3+2*2' },
  { label: 'Example 2', expr: ' 3/2 ' },
  { label: 'Example 3', expr: ' 3+5 / 2 ' },
])

export default function Problem227Visualizer() {
  const [exprInput, setExprInput] = useState('3+2*2')
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(
    () => generateSteps(exprInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [exprInput],
  )

  const inputError = steps.length === 1 && steps[0].error ? steps[0].message : ''

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setExprInput(ex.expr)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const expr = step?.expr ?? ''

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"expr","label":"expr","type":"string"}]}
        values={{ expr: exprInput }}
        onChange={(k, v) => { if (k === 'expr') setExprInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <div className="p227-panel-primary">
      <div className="p227-card">
        <div className="p227-section-label">Input</div>
        <div className="p227-input-row">
          <div className="p227-field grow">
            <label className="p227-input-label" htmlFor="p227-expr">Expression</label>
            <input
              id="p227-expr"
              className={`p227-input mono ${inputError ? 'has-error' : ''}`}
              value={exprInput}
              onChange={(e) => { setExprInput(e.target.value); handleReset() }}
              placeholder="3+2*2"
            />
          </div>
        </div>
        <p className={`p227-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Evaluate with normal precedence (× and ÷ before + and −), no parentheses. Division truncates toward zero.'}
        </p>
        <div className="p227-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p227-example-btn ${exprInput === ex.expr ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} ({ex.expr.trim()})
            </button>
          ))}
        </div>
      </div>

      <div className="p227-card">
        <div className="p227-section-label">Scan Position</div>
        <div className="p227-strip">
          {expr.split('').map((ch, idx) => (
            <motion.div
              key={idx}
              className={`p227-char ${idx === step?.i ? 'cursor' : ''} ${idx < (step?.i ?? -1) ? 'seen' : ''}`}
              initial={{ scale: 0.85 }}
              animate={{ scale: idx === step?.i ? 1.18 : 1 }}
            >
              {ch === ' ' ? '␠' : ch}
            </motion.div>
          ))}
        </div>
        <p className="p227-hint">num = {step?.num ?? 0} &nbsp;·&nbsp; pending op = &lsquo;{step?.op ?? '+'}&rsquo;</p>
      </div>

      <div className="p227-card">
        <div className="p227-section-label">Stack (deferred additions)</div>
        {step?.stack?.length ? (
          <div className="p227-stack">
            {step.stack.map((v, idx) => (
              <motion.div
                key={idx}
                className={`p227-stack-item ${idx === step.touched ? 'touched' : ''} ${v < 0 ? 'neg' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {v}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="p227-hint">Stack is empty.</p>
        )}
      </div>

      {step?.result !== undefined && (
        <div className="p227-result">
          <div className="p227-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p227-result-val">{step.result}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p227-panel-state">
      <div className="p227-card">
        <div className="p227-section-label">Algorithm State</div>
        <div className="p227-stat-grid">
          <div className="p227-stat"><span className="p227-stat-key">index</span><span className="p227-stat-val">{step && step.i >= 0 ? step.i : '—'}</span></div>
          <div className="p227-stat"><span className="p227-stat-key">char</span><span className="p227-stat-val">{step && step.i >= 0 ? (expr[step.i] === ' ' ? '␠' : expr[step.i]) : '—'}</span></div>
          <div className="p227-stat highlight"><span className="p227-stat-key">num</span><span className="p227-stat-val">{step?.num ?? '—'}</span></div>
          <div className="p227-stat highlight"><span className="p227-stat-key">op</span><span className="p227-stat-val">{step?.op ?? '—'}</span></div>
          <div className="p227-stat"><span className="p227-stat-key">stack size</span><span className="p227-stat-val">{step?.stack?.length ?? 0}</span></div>
          <div className="p227-stat"><span className="p227-stat-key">running sum</span><span className="p227-stat-val">{step?.stack ? step.stack.reduce((a, b) => a + b, 0) : '—'}</span></div>
        </div>
      </div>

      <div className="p227-card">
        <div className="p227-section-label">How Precedence Is Handled</div>
        <p className="p227-hint">
          + and − are <em>deferred</em>: the operand is pushed (negated for −) and summed at the end.
          × and ÷ are applied <em>immediately</em> against the stack top, so they bind tighter than
          the pending additions. One pass, O(n) time, O(n) space.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p227-panel-code">
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
  )

  const statusPanel = (
    <div className="p227-panel-status">
      <div className={`p227-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p227-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
