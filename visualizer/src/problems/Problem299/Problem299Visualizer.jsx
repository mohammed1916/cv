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
import './Problem299Visualizer.css'

const PATTERNS = ['init', 'bull_scan', 'bull_found', 'count_secret', 'cow_scan', 'cow_found', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'bull_scan',
  6: 'bull_found',
  8: 'count_secret',
  10: 'cow_scan',
  13: 'cow_scan',
  14: 'cow_found',
  16: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def getHint(secret: str, guess: str) -> str:' },
  { line: 2, text: '    bulls = cows = 0' },
  { line: 3, text: '    secret_count = [0] * 10' },
  { line: 4, text: '    for i in range(len(secret)):' },
  { line: 5, text: '        if secret[i] == guess[i]:' },
  { line: 6, text: '            bulls += 1' },
  { line: 7, text: '        else:' },
  { line: 8, text: '            secret_count[int(secret[i])] += 1' },
  { line: 9, text: '' },
  { line: 10, text: '    for i in range(len(guess)):' },
  { line: 11, text: '        if secret[i] == guess[i]:' },
  { line: 12, text: '            continue' },
  { line: 13, text: '        d = int(guess[i])' },
  { line: 14, text: '        if secret_count[d] > 0:' },
  { line: 15, text: '            cows += 1; secret_count[d] -= 1' },
  { line: 16, text: '    return f"{bulls}A{cows}B"' },
]

function generateSteps(secret, guess) {
  const steps = []
  try {
    const s = (secret ?? '').trim()
    const g = (guess ?? '').trim()
    if (!/^\d+$/.test(s) || !/^\d+$/.test(g)) throw new Error('secret and guess must contain digits only')
    if (s.length !== g.length) throw new Error('secret and guess must be the same length')

    const n = s.length
    let bulls = 0
    let cows = 0
    const counts = new Array(10).fill(0)
    const marks = new Array(n).fill(null)

    const snap = (extra) => ({
      secret: s,
      guess: g,
      bulls,
      cows,
      counts: [...counts],
      marks: [...marks],
      ...extra,
    })

    steps.push(snap({
      phase: 'init',
      activeLine: 2,
      message: `secret="${s}", guess="${g}". Pass 1: find bulls (exact position matches).`,
    }))

    for (let i = 0; i < n; i++) {
      steps.push(snap({
        phase: 'bull_scan',
        activeLine: 5,
        pointer: i,
        message: `Pass 1 @ i=${i}: secret[${i}]='${s[i]}' vs guess[${i}]='${g[i]}'`,
      }))
      if (s[i] === g[i]) {
        bulls++
        marks[i] = 'bull'
        steps.push(snap({
          phase: 'bull_found',
          activeLine: 6,
          pointer: i,
          message: `Exact match — bull! bulls = ${bulls}`,
        }))
      } else {
        counts[Number(s[i])]++
        steps.push(snap({
          phase: 'count_secret',
          activeLine: 8,
          pointer: i,
          message: `No match — tally unmatched secret digit '${s[i]}' → count[${s[i]}] = ${counts[Number(s[i])]}`,
        }))
      }
    }

    steps.push(snap({
      phase: 'cow_scan',
      activeLine: 10,
      message: 'Pass 2: find cows — guess digits still available in the unmatched secret tally.',
    }))

    for (let i = 0; i < n; i++) {
      if (s[i] === g[i]) continue
      const d = Number(g[i])
      steps.push(snap({
        phase: 'cow_scan',
        activeLine: 14,
        pointer: i,
        message: `Pass 2 @ i=${i}: guess digit '${g[i]}' — count[${d}] = ${counts[d]}`,
      }))
      if (counts[d] > 0) {
        counts[d]--
        cows++
        marks[i] = 'cow'
        steps.push(snap({
          phase: 'cow_found',
          activeLine: 15,
          pointer: i,
          message: `Available → cow! cows = ${cows}, count[${d}] = ${counts[d]}`,
        }))
      }
    }

    steps.push(snap({
      phase: 'done',
      activeLine: 16,
      result: `${bulls}A${cows}B`,
      message: `Result: ${bulls}A${cows}B (${bulls} bull${bulls === 1 ? '' : 's'}, ${cows} cow${cows === 1 ? '' : 's'})`,
    }))
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, error: true, message: `Error: ${e.message}` })
  }
  return steps
}

const EXAMPLES = getExamplesOr('bulls-and-cows', [
  { label: 'Example 1', secret: '1807', guess: '7810' },
  { label: 'Example 2', secret: '1123', guess: '0111' },
  { label: 'All bulls', secret: '1234', guess: '1234' },
])

export default function Problem299Visualizer() {
  const [secret, setSecret] = useState('1807')
  const [guess, setGuess] = useState('7810')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    if (!/^\d+$/.test(secret.trim()) || !/^\d+$/.test(guess.trim())) return 'Digits only, non-empty'
    if (secret.trim().length !== guess.trim().length) return 'secret and guess must be the same length'
    return ''
  }, [secret, guess])

  const steps = useMemo(
    () => generateSteps(secret, guess).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [secret, guess],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSecret(ex.secret)
    setGuess(ex.guess)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const renderRow = (label, str, marks, pointer) => (
    <div className="p299-row">
      <div className="p299-row-label">{label}</div>
      <div className="p299-digits">
        {str.split('').map((ch, idx) => (
          <motion.div
            key={idx}
            className={`p299-digit ${marks?.[idx] === 'bull' ? 'bull' : marks?.[idx] === 'cow' ? 'cow' : ''} ${idx === pointer ? 'pointer' : ''}`}
            animate={{ scale: idx === pointer ? 1.15 : 1 }}
          >
            {ch}
          </motion.div>
        ))}
      </div>
    </div>
  )

  const primaryPanel = (
    <div className="p299-panel-primary">
      <div className="p299-card">
        <div className="p299-section-label">Input</div>
        <div className="p299-input-row">
          <div className="p299-field">
            <label className="p299-input-label" htmlFor="p299-secret">secret</label>
            <input
              id="p299-secret"
              className={`p299-input mono ${inputError ? 'has-error' : ''}`}
              value={secret}
              onChange={(e) => { setSecret(e.target.value); handleReset() }}
              placeholder="1807"
            />
          </div>
          <div className="p299-field">
            <label className="p299-input-label" htmlFor="p299-guess">guess</label>
            <input
              id="p299-guess"
              className={`p299-input mono ${inputError ? 'has-error' : ''}`}
              value={guess}
              onChange={(e) => { setGuess(e.target.value); handleReset() }}
              placeholder="7810"
            />
          </div>
        </div>
        <p className={`p299-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Bulls = right digit, right spot. Cows = right digit, wrong spot.'}
        </p>
        <div className="p299-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p299-example-btn ${secret === ex.secret && guess === ex.guess ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {step && !step.error && (
        <div className="p299-card">
          <div className="p299-section-label">Comparison</div>
          {renderRow('secret', step.secret, step.marks, step.pointer)}
          {renderRow('guess', step.guess, step.marks, step.pointer)}
          <div className="p299-legend">
            <span><i className="p299-sw bull" /> bull</span>
            <span><i className="p299-sw cow" /> cow</span>
          </div>
        </div>
      )}

      {step?.result && (
        <div className="p299-result">
          <div className="p299-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p299-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p299-panel-state">
      <div className="p299-card">
        <div className="p299-section-label">Counters</div>
        <div className="p299-stat-grid">
          <div className="p299-stat highlight"><span className="p299-stat-key">bulls</span><span className="p299-stat-val">{step?.bulls ?? 0}</span></div>
          <div className="p299-stat highlight"><span className="p299-stat-key">cows</span><span className="p299-stat-val">{step?.cows ?? 0}</span></div>
          {step?.pointer !== undefined && (
            <div className="p299-stat"><span className="p299-stat-key">i</span><span className="p299-stat-val">{step.pointer}</span></div>
          )}
        </div>
      </div>

      {step?.counts && (
        <div className="p299-card">
          <div className="p299-section-label">Unmatched Secret Tally</div>
          <div className="p299-tally">
            {step.counts.map((c, d) => (
              <div key={d} className={`p299-tally-cell ${c > 0 ? 'active' : ''}`}>
                <div className="p299-tally-digit">{d}</div>
                <div className="p299-tally-count">{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p299-panel-code">
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
    <div className="p299-panel-status">
      <div className={`p299-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    []
  )

  return (
    <div className="p299-shell">
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
        document.body
      )}
    </div>
  )
}
