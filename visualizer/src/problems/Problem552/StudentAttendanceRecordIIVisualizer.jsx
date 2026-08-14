import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import './StudentAttendanceRecordIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const MOD = 1000000007

const PATTERNS = ['init', 'day', 'present', 'absent', 'late', 'commit', 'sum', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'day',
  8: 'present',
  11: 'absent',
  14: 'late',
  17: 'commit',
  19: 'sum',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def checkRecord(n):' },
  { line: 2, text: '    MOD = 10**9 + 7' },
  { line: 3, text: '    # dp[a][l] = ways with a absences so far and a trailing run of l lates' },
  { line: 4, text: '    dp = [[0] * 3 for _ in range(2)]' },
  { line: 5, text: '    dp[0][0] = 1                      # empty record' },
  { line: 6, text: '' },
  { line: 7, text: '    for _ in range(n):' },
  { line: 8, text: '        nxt = [[0] * 3 for _ in range(2)]' },
  { line: 9, text: '        for a in range(2):' },
  { line: 10, text: '            for l in range(3):' },
  { line: 11, text: '                ways = dp[a][l]' },
  { line: 12, text: '                if not ways: continue' },
  { line: 13, text: '                # append P: late run resets' },
  { line: 14, text: '                nxt[a][0] = (nxt[a][0] + ways) % MOD' },
  { line: 15, text: '                # append A: only if no absence yet' },
  { line: 16, text: '                if a == 0:' },
  { line: 17, text: '                    nxt[1][0] = (nxt[1][0] + ways) % MOD' },
  { line: 18, text: '                # append L: only if run < 2' },
  { line: 19, text: '                if l < 2:' },
  { line: 20, text: '                    nxt[a][l + 1] = (nxt[a][l + 1] + ways) % MOD' },
  { line: 21, text: '        dp = nxt' },
  { line: 22, text: '' },
  { line: 23, text: '    return sum(dp[a][l] for a in range(2) for l in range(3)) % MOD' },
]

const cloneDp = (dp) => dp.map((row) => [...row])

/**
 * LC 552 — count length-n records over {P, A, L} with at most one 'A' and no
 * three consecutive 'L'. State is (absences used, current trailing L run), so
 * six states carry forward day by day.
 */
function generateSteps(nStr) {
  const steps = []

  try {
    const n = Number(nStr)
    if (!Number.isInteger(n) || n < 1) throw new Error('n must be a positive integer')
    if (n > 40) throw new Error('Keep n at 40 or below so the walkthrough stays readable')

    let dp = [[0, 0, 0], [0, 0, 0]]
    dp[0][0] = 1

    steps.push({
      phase: 'init',
      activeLine: 5,
      message: `n = ${n}. dp[0][0] = 1 — one way to have an empty record.`,
      n,
      day: 0,
      dp: cloneDp(dp),
      changed: [[0, 0]],
    })

    for (let day = 1; day <= n; day += 1) {
      const nxt = [[0, 0, 0], [0, 0, 0]]

      steps.push({
        phase: 'day',
        activeLine: 8,
        message: `Day ${day} of ${n}: build the next table from the current one.`,
        n,
        day,
        dp: cloneDp(dp),
        next: cloneDp(nxt),
      })

      const transitions = []

      for (let a = 0; a < 2; a += 1) {
        for (let l = 0; l < 3; l += 1) {
          const ways = dp[a][l]
          if (!ways) continue

          nxt[a][0] = (nxt[a][0] + ways) % MOD
          transitions.push({ letter: 'P', from: [a, l], to: [a, 0], ways })

          if (a === 0) {
            nxt[1][0] = (nxt[1][0] + ways) % MOD
            transitions.push({ letter: 'A', from: [a, l], to: [1, 0], ways })
          }

          if (l < 2) {
            nxt[a][l + 1] = (nxt[a][l + 1] + ways) % MOD
            transitions.push({ letter: 'L', from: [a, l], to: [a, l + 1], ways })
          }
        }
      }

      steps.push({
        phase: 'present',
        activeLine: 14,
        message: `Appending P sends every state (a, l) to (a, 0) — the late run resets.`,
        n,
        day,
        dp: cloneDp(dp),
        next: cloneDp(nxt),
        transitions: transitions.filter((t) => t.letter === 'P'),
      })

      const aTrans = transitions.filter((t) => t.letter === 'A')
      steps.push({
        phase: 'absent',
        activeLine: 17,
        message: aTrans.length
          ? 'Appending A is allowed only from a = 0, and lands in a = 1 with the run reset.'
          : 'No state has a = 0 with ways left, so no A can be appended.',
        n,
        day,
        dp: cloneDp(dp),
        next: cloneDp(nxt),
        transitions: aTrans,
      })

      const lTrans = transitions.filter((t) => t.letter === 'L')
      steps.push({
        phase: 'late',
        activeLine: 20,
        message: 'Appending L extends the run, but only from l < 2 — three in a row is banned.',
        n,
        day,
        dp: cloneDp(dp),
        next: cloneDp(nxt),
        transitions: lTrans,
      })

      dp = nxt

      const changed = []
      for (let a = 0; a < 2; a += 1) {
        for (let l = 0; l < 3; l += 1) if (dp[a][l]) changed.push([a, l])
      }

      steps.push({
        phase: 'commit',
        activeLine: 21,
        message: `Day ${day} complete. Total so far: ${dp.flat().reduce((s, v) => (s + v) % MOD, 0)} records of length ${day}.`,
        n,
        day,
        dp: cloneDp(dp),
        changed,
      })
    }

    const total = dp.flat().reduce((s, v) => (s + v) % MOD, 0)

    steps.push({
      phase: 'sum',
      activeLine: 23,
      message: `Sum all six states: ${total}.`,
      n,
      day: n,
      dp: cloneDp(dp),
      total,
    })

    steps.push({
      phase: 'done',
      activeLine: 23,
      message: `There are ${total} rewardable attendance records of length ${n} (mod 1e9+7).`,
      n,
      day: n,
      dp: cloneDp(dp),
      total,
      result: total,
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

const EXAMPLES = getExamplesOr('student-attendance-record-ii', [
  { label: 'Example 1', n: '2' },
  { label: 'Example 2', n: '1' },
  { label: 'Example 3', n: '10' },
])

const RUN_LABELS = ['l=0', 'l=1', 'l=2']

export default function StudentAttendanceRecordIIVisualizer() {
  const [nInput, setNInput] = useState('2')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    const val = Number(nInput)
    if (nInput.trim() === '' || !Number.isInteger(val) || val < 1) {
      return 'n must be a positive integer'
    }
    if (val > 40) return 'Keep n at 40 or below so the walkthrough stays readable'
    return ''
  }, [nInput])

  const steps = useMemo(
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
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const renderDp = (table, changed) => (
    <div className="p552-dp">
      <div />
      {RUN_LABELS.map((label) => (
        <div key={label} className="p552-dp-head">{label}</div>
      ))}
      {[0, 1].map((a) => (
        <div key={`row-${a}`} style={{ display: 'contents' }}>
          <div className="p552-dp-rowhead">a={a}</div>
          {[0, 1, 2].map((l) => {
            const v = table[a][l]
            const isChanged = changed?.some(([ca, cl]) => ca === a && cl === l)
            return (
              <div
                key={`${a}-${l}`}
                className={`p552-dp-cell ${v === 0 ? 'zero' : ''} ${isChanged ? 'changed' : ''}`}
              >
                {v}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

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

    <div className="p552-panel-primary">
      <div className="p552-card">
        <div className="p552-section-label">Input</div>
        <label className="p552-input-label" htmlFor="p552-n">Record length (n)</label>
        <input
          id="p552-n"
          className={`p552-input mono ${inputError ? 'has-error' : ''}`}
          value={nInput}
          onChange={(e) => { setNInput(e.target.value); handleReset() }}
          placeholder="2"
          type="number"
          min="1"
        />
        <p className={`p552-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Rewardable: at most one A in total, and never three L in a row.'}
        </p>
        <div className="p552-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p552-example-btn ${nInput === ex.n ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} (n={ex.n})
            </button>
          ))}
        </div>
      </div>

      <div className="p552-card">
        <div className="p552-section-label">Days Processed</div>
        <div className="p552-days">
          {Array.from({ length: step?.n ?? 0 }, (_, idx) => {
            const dayNo = idx + 1
            const cls = dayNo === step?.day ? 'current' : dayNo < (step?.day ?? 0) ? 'past' : ''
            return <div key={idx} className={`p552-day ${cls}`}>{dayNo}</div>
          })}
        </div>
      </div>

      <div className="p552-card">
        <div className="p552-section-label">
          {step?.next ? 'dp (current day)' : 'dp'}
        </div>
        {step?.dp ? renderDp(step.dp, step.next ? null : step.changed) : <p className="p552-hint">—</p>}
      </div>

      {step?.next && (
        <div className="p552-card">
          <div className="p552-section-label">nxt (being built)</div>
          {renderDp(step.next, step.transitions?.map((t) => t.to))}
        </div>
      )}

      {step?.result !== undefined && (
        <div className="p552-result">
          <div className="p552-section-label" style={{ marginBottom: '0.3rem' }}>Rewardable Records</div>
          <div className="p552-result-val">{step.result}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p552-panel-state">
      <div className="p552-card">
        <div className="p552-section-label">Progress</div>
        <div className="p552-stat-grid">
          <div className="p552-stat"><span className="p552-stat-key">n</span><span className="p552-stat-val">{step?.n ?? '—'}</span></div>
          <div className="p552-stat highlight"><span className="p552-stat-key">day</span><span className="p552-stat-val">{step?.day ?? '—'}</span></div>
          <div className="p552-stat"><span className="p552-stat-key">total</span><span className="p552-stat-val">{step?.dp ? step.dp.flat().reduce((s, v) => (s + v) % MOD, 0) : '—'}</span></div>
          <div className="p552-stat"><span className="p552-stat-key">mod</span><span className="p552-stat-val">1e9+7</span></div>
        </div>
      </div>

      <div className="p552-card">
        <div className="p552-section-label">Transitions This Step</div>
        {step?.transitions?.length ? (
          <div className="p552-trans">
            {step.transitions.map((t, idx) => (
              <div key={idx} className="p552-trans-row">
                <span className={`p552-trans-tag ${t.letter}`}>{t.letter}</span>
                <span>
                  ({t.from[0]},{t.from[1]}) → ({t.to[0]},{t.to[1]}) &nbsp;+{t.ways}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p552-hint">No transitions on this step.</p>
        )}
      </div>

      <div className="p552-card">
        <div className="p552-section-label">State Meaning</div>
        <p className="p552-hint" style={{ marginTop: 0 }}>
          <strong>a</strong> — absences used so far (0 or 1).<br />
          <strong>l</strong> — length of the trailing run of L (0, 1 or 2).<br />
          A record is rewardable exactly when it never needs a = 2 or l = 3.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p552-panel-code">
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
    <div className="p552-panel-status">
      <div className={`p552-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
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
    <div className="p552-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
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
