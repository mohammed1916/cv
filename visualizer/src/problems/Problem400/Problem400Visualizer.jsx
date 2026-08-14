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
import './Problem400Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['calculate', 'check_range', 'done', 'error', 'extract_digit', 'find_number', 'init', 'init_vars', 'range_update']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'init_vars',
  7: 'check_range',
  9: 'range_update',
  13: 'find_number',
  15: 'extract_digit'
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findNthDigit(n):' },
  { line: 2, text: '    # Length of numbers: 1-9 (len 1), 10-99 (len 2), etc.' },
  { line: 3, text: '    length = 1' },
  { line: 4, text: '    count = 9  # Count of numbers with this length' },
  { line: 5, text: '    start = 1  # First number with this length' },
  { line: 6, text: '    ' },
  { line: 7, text: '    while n > length * count:' },
  { line: 8, text: '        n -= length * count' },
  { line: 9, text: '        length += 1' },
  { line: 10, text: '        count *= 10' },
  { line: 11, text: '        start *= 10' },
  { line: 12, text: '    ' },
  { line: 13, text: '    num = start + (n - 1) // length' },
  { line: 14, text: '    digit_index = (n - 1) % length' },
  { line: 15, text: '    return int(str(num)[digit_index])' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nStr) {
  const steps = []

  try {
    const n = Number(nStr)
    if (isNaN(n) || n < 1) throw new Error('n must be a positive integer')

    // Build sequence for visualization
    let sequence = ''
    let sequenceData = []
    for (let i = 1; i <= 100 && sequence.length < 200; i++) {
      const str = i.toString()
      for (const ch of str) {
        sequence += ch
        sequenceData.push({ digit: ch, source: i })
      }
    }

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Find the ${n}th digit in sequence: 123456789101112131415...`,
      n,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    // Simulate algorithm
    let remaining = n
    let length = 1
    let count = 9
    let start = 1

    steps.push({
      phase: 'init_vars',
      activeLine: 3,
      message: `Initialize: length=1 (1-digit numbers), count=9, start=1`,
      n,
      length,
      count,
      start,
      remaining,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    // Find which length group contains n
    while (remaining > length * count) {
      const totalDigits = length * count
      steps.push({
        phase: 'check_range',
        activeLine: 7,
        message: `${remaining} > ${length} × ${count} = ${totalDigits}? Yes. Move to next range.`,
        n,
        length,
        count,
        start,
        remaining,
        currentRange: { start, end: start + count - 1, digitCount: length },
        skipped: totalDigits,
      })

      remaining -= totalDigits
      length += 1
      count *= 10
      start *= 10

      steps.push({
        phase: 'range_update',
        activeLine: 9,
        message: `Now checking ${start}-digit numbers (${start} to ${start + count - 1}). Remaining: ${remaining}`,
        n,
        length,
        count,
        start,
        remaining,
        currentRange: { start, end: start + count - 1, digitCount: length },
      })
    }

    // Find exact position
    steps.push({
      phase: 'find_number',
      activeLine: 13,
      message: `Found range! Length=${length}, Count=${count}, Start=${start}. Remaining=${remaining}`,
      n,
      length,
      count,
      start,
      remaining,
      currentRange: { start, end: start + count - 1, digitCount: length },
    })

    const num = start + Math.floor((remaining - 1) / length)
    const digitIdx = (remaining - 1) % length

    steps.push({
      phase: 'calculate',
      activeLine: 13,
      message: `Number: ${start} + ⌊(${remaining} - 1) / ${length}⌋ = ${num}`,
      n,
      length,
      count,
      start,
      remaining,
      num,
      digitIdx,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    const numStr = num.toString()
    const result = parseInt(numStr[digitIdx])

    steps.push({
      phase: 'extract_digit',
      activeLine: 15,
      message: `Number ${num}: [${numStr.split('').join(', ')}]. Index ${digitIdx} → Digit: ${result}`,
      n,
      num,
      numStr,
      digitIdx,
      result,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    steps.push({
      phase: 'done',
      activeLine: 15,
      message: `The ${n}th digit is: ${result}`,
      n,
      result,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamplesOr('nth-digit', [
  { label: 'Example 1', n: '3' },
  { label: 'Example 2', n: '10' },
  { label: 'Example 3', n: '15' },
])

export default function Problem400Visualizer() {
  const [nInput, setNInput] = useState('3')
  const [panelDivs, setPanelDivs] = useState(null)

  // Validates the input for the inline hint; generateSteps re-parses nInput
  // itself, so only the error message is needed here.
  const { inputError } = useMemo(() => {
    const val = Number(nInput)
    if (nInput.trim() === '' || isNaN(val) || val < 1) {
      return { inputError: 'n must be a positive integer' }
    }
    return { inputError: '' }
  }, [nInput])

  const steps = useMemo(
    // generateSteps(nStr) was called with no argument, so Number(undefined) was
    // NaN and it threw on every run — the visualizer only ever rendered the
    // error step regardless of input.
    () => generateSteps(nInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(ex.n)
    handleReset()
  }, [handleReset],
  )

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex,
    onStepJump: setStepIndex,
  })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"number"}]}
        values={{ n: nInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <div className="p400-panel-primary">
      <div className="p400-card">
        <div className="p400-section-label">Input</div>
        <div className="p400-input-row">
          <div className="p400-field">
            <label className="p400-input-label" htmlFor="p400-n">Position (n)</label>
            <input
              id="p400-n"
              className={`p400-input mono ${inputError ? 'has-error' : ''}`}
              value={nInput}
              onChange={(e) => { setNInput(e.target.value); handleReset() }}
              placeholder="3"
              type="number"
              min="1"
            />
          </div>
        </div>
        <p className={`p400-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Digits are concatenated as 1,2,…,9,10,11,… — find the nth one.'}
        </p>
        <div className="p400-example-row" style={{ marginTop: '0.7rem' }}>
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p400-example-btn ${nInput === ex.n ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} (n={ex.n})
            </button>
          ))}
        </div>
      </div>

      <div className="p400-card">
        <div className="p400-section-label">Digit Sequence</div>
        <div className="p400-seq">
          {step?.sequence?.split('').map((digit, idx) => (
            <motion.div
              key={idx}
              className={`p400-digit ${idx === step?.targetPos ? 'target' : ''}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: idx === step?.targetPos ? 1.18 : 1 }}
            >
              {digit}
            </motion.div>
          ))}
        </div>
      </div>

      {step?.numStr && (
        <div className="p400-card">
          <div className="p400-section-label">Digits in Target Number</div>
          <div className="p400-seq">
            {step.numStr.split('').map((d, idx) => (
              <div key={idx} className={`p400-digit ${idx === step.digitIdx ? 'target' : ''}`}>
                {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div className="p400-result">
          <div className="p400-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p400-result-val">{step.result}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p400-panel-state">
      <div className="p400-card">
        <div className="p400-section-label">Algorithm State</div>
        <div className="p400-stat-grid">
          {step?.length !== undefined && (
            <div className="p400-stat"><span className="p400-stat-key">length</span><span className="p400-stat-val">{step.length}</span></div>
          )}
          {step?.count !== undefined && (
            <div className="p400-stat"><span className="p400-stat-key">count</span><span className="p400-stat-val">{step.count}</span></div>
          )}
          {step?.start !== undefined && (
            <div className="p400-stat"><span className="p400-stat-key">start</span><span className="p400-stat-val">{step.start}</span></div>
          )}
          {step?.remaining !== undefined && (
            <div className="p400-stat highlight"><span className="p400-stat-key">remaining</span><span className="p400-stat-val">{step.remaining}</span></div>
          )}
          {step?.num !== undefined && (
            <div className="p400-stat highlight"><span className="p400-stat-key">num</span><span className="p400-stat-val">{step.num}</span></div>
          )}
          {step?.digitIdx !== undefined && (
            <div className="p400-stat"><span className="p400-stat-key">digit idx</span><span className="p400-stat-val">{step.digitIdx}</span></div>
          )}
        </div>
      </div>

      {step?.currentRange && (
        <div className="p400-card">
          <div className="p400-section-label">Current Range</div>
          <div className="p400-stat">
            <span className="p400-stat-key">numbers</span>
            <span className="p400-stat-val">{step.currentRange.start} – {step.currentRange.end}</span>
          </div>
          <p className="p400-hint" style={{ marginTop: '0.45rem' }}>
            Each has {step.currentRange.digitCount} digit(s).
          </p>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p400-panel-code">
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
    <div className="p400-panel-status">
      <div className={`p400-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
      { id: 'state',   title: 'State',         dockMode: 'split-right' },
      { id: 'code',    title: 'Code',          dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status',        dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  return (
    <div className="p400-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state   && createPortal(statePanel,   panelDivs.state)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
