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
import './Problem375Visualizer.css'

const PATTERNS = ['init', 'new_interval', 'try_pivot', 'better', 'commit', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'new_interval',
  4: 'new_interval',
  5: 'init',
  6: 'try_pivot',
  7: 'try_pivot',
  8: 'better',
  9: 'commit',
  10: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def getMoneyAmount(n: int) -> int:' },
  { line: 2, text: '    dp = [[0] * (n + 2) for _ in range(n + 2)]' },
  { line: 3, text: '    for length in range(2, n + 1):' },
  { line: 4, text: '        for lo in range(1, n - length + 2):' },
  { line: 5, text: '            hi = lo + length - 1' },
  { line: 6, text: '            best = float("inf")' },
  { line: 7, text: '            for pivot in range(lo, hi):' },
  { line: 8, text: '                cost = pivot + max(dp[lo][pivot - 1],' },
  { line: 9, text: '                                   dp[pivot + 1][hi])' },
  { line: 10, text: '                best = min(best, cost)' },
  { line: 11, text: '            dp[lo][hi] = best' },
  { line: 12, text: '    return dp[1][n]' },
]

function generateSteps(nText) {
  const steps = []
  try {
    const n = Number(nText)
    if (!Number.isInteger(n) || n < 1) throw new Error('n must be a positive integer')
    if (n > 9) throw new Error('keep n at 9 or below so the DP table stays readable')

    // dp[lo][hi] via 1-based indices; size n+2 to allow dp[pivot+1][hi] with pivot+1 = hi+1
    const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0))

    const snapTable = () => dp.map((row) => [...row])

    steps.push({
      phase: 'init',
      activeLine: 2,
      n,
      dp: snapTable(),
      message: `n=${n}. dp[lo][hi] = minimum money guaranteeing a win when the target is in [lo, hi]. Single numbers cost 0.`,
    })

    for (let length = 2; length <= n; length++) {
      for (let lo = 1; lo + length - 1 <= n; lo++) {
        const hi = lo + length - 1
        let best = Infinity
        let bestPivot = null

        steps.push({
          phase: 'new_interval',
          activeLine: 5,
          n,
          dp: snapTable(),
          lo,
          hi,
          length,
          best: null,
          message: `Interval [${lo}, ${hi}] (length ${length}). Try every first guess (pivot) in [${lo}, ${hi - 1}].`,
        })

        for (let pivot = lo; pivot < hi; pivot++) {
          const left = dp[lo][pivot - 1]
          const right = dp[pivot + 1][hi]
          const cost = pivot + Math.max(left, right)

          steps.push({
            phase: 'try_pivot',
            activeLine: 8,
            n,
            dp: snapTable(),
            lo,
            hi,
            length,
            pivot,
            left,
            right,
            cost,
            best: best === Infinity ? null : best,
            bestPivot,
            message: `Guess ${pivot}: cost = ${pivot} + max(dp[${lo}][${pivot - 1}]=${left}, dp[${pivot + 1}][${hi}]=${right}) = ${cost}`,
          })

          if (cost < best) {
            best = cost
            bestPivot = pivot
            steps.push({
              phase: 'better',
              activeLine: 10,
              n,
              dp: snapTable(),
              lo,
              hi,
              length,
              pivot,
              left,
              right,
              cost,
              best,
              bestPivot,
              message: `New best for [${lo}, ${hi}]: ${best} (first guess ${pivot})`,
            })
          }
        }

        dp[lo][hi] = best === Infinity ? 0 : best
        steps.push({
          phase: 'commit',
          activeLine: 11,
          n,
          dp: snapTable(),
          lo,
          hi,
          length,
          best: dp[lo][hi],
          bestPivot,
          justSet: [lo, hi],
          message: `dp[${lo}][${hi}] = ${dp[lo][hi]} — worst-case cost with optimal first guess ${bestPivot}.`,
        })
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 12,
      n,
      dp: snapTable(),
      lo: 1,
      hi: n,
      result: dp[1][n],
      justSet: [1, n],
      message: `Answer: dp[1][${n}] = ${dp[1][n]} — the minimum amount guaranteeing a win.`,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, error: true, message: `Error: ${e.message}` })
  }
  return steps
}

const EXAMPLES = getExamplesOr('guess-number-higher-or-lower-ii', [
  { label: 'Example 1', n: '5' },
  { label: 'Example 2', n: '1' },
  { label: 'Example 3', n: '3' },
])

export default function Problem375Visualizer() {
  const [nText, setNText] = useState('5')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    const n = Number(nText)
    if (!Number.isInteger(n) || n < 1) return 'n must be a positive integer'
    if (n > 9) return 'keep n at 9 or below so the DP table stays readable'
    return ''
  }, [nText])

  const steps = useMemo(
    () => generateSteps(nText).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nText],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNText(ex.n)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const n = step?.n ?? 0
  const indices = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n])

  const primaryPanel = (
    <div className="p375-panel-primary">
      <div className="p375-card">
        <div className="p375-section-label">Input</div>
        <div className="p375-input-row">
          <div className="p375-field">
            <label className="p375-input-label" htmlFor="p375-n">n (guess range 1..n)</label>
            <input
              id="p375-n"
              className={`p375-input mono ${inputError ? 'has-error' : ''}`}
              value={nText}
              onChange={(e) => { setNText(e.target.value); handleReset() }}
              type="number"
              min="1"
              max="9"
            />
          </div>
        </div>
        <p className={`p375-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Guessing wrong at x costs x. Minimize the worst-case total — an adversary answers to hurt you most.'}
        </p>
        <div className="p375-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p375-example-btn ${nText === ex.n ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} (n={ex.n})
            </button>
          ))}
        </div>
      </div>

      {step && !step.error && n > 0 && (
        <div className="p375-card">
          <div className="p375-section-label">DP Table — dp[lo][hi]</div>
          <div className="p375-grid-wrap">
            <table className="p375-grid">
              <thead>
                <tr>
                  <th className="p375-corner">lo\hi</th>
                  {indices.map((hi) => (
                    <th key={hi} className={hi === step.hi ? 'hl' : ''}>{hi}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {indices.map((lo) => (
                  <tr key={lo}>
                    <th className={lo === step.lo ? 'hl' : ''}>{lo}</th>
                    {indices.map((hi) => {
                      if (hi < lo) return <td key={hi} className="void" />
                      const isCurrent = lo === step.lo && hi === step.hi
                      const isJustSet = step.justSet?.[0] === lo && step.justSet?.[1] === hi
                      const isSub =
                        step.pivot != null &&
                        ((lo === step.lo && hi === step.pivot - 1) ||
                          (lo === step.pivot + 1 && hi === step.hi))
                      return (
                        <td
                          key={hi}
                          className={`${isCurrent ? 'current' : ''} ${isJustSet ? 'just-set' : ''} ${isSub ? 'sub' : ''}`}
                        >
                          {step.dp[lo][hi]}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p375-legend">
            <span><i className="p375-sw current" /> current interval</span>
            <span><i className="p375-sw sub" /> subproblem read</span>
            <span><i className="p375-sw just-set" /> just written</span>
          </div>
        </div>
      )}

      {step && !step.error && step.pivot != null && (
        <div className="p375-card">
          <div className="p375-section-label">Pivot Breakdown</div>
          <div className="p375-split">
            <div className="p375-split-side">
              <div className="p375-split-label">left [{step.lo}, {step.pivot - 1}]</div>
              <div className="p375-split-val">{step.left}</div>
            </div>
            <div className="p375-split-pivot">
              <div className="p375-split-label">guess</div>
              <div className="p375-split-val big">{step.pivot}</div>
            </div>
            <div className="p375-split-side">
              <div className="p375-split-label">right [{step.pivot + 1}, {step.hi}]</div>
              <div className="p375-split-val">{step.right}</div>
            </div>
          </div>
          <p className="p375-hint">
            cost = {step.pivot} + max({step.left}, {step.right}) = <strong>{step.cost}</strong>
          </p>
        </div>
      )}

      {step?.result !== undefined && (
        <div className="p375-result">
          <div className="p375-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p375-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p375-panel-state">
      <div className="p375-card">
        <div className="p375-section-label">Loop State</div>
        <div className="p375-stat-grid">
          {step?.length !== undefined && (
            <div className="p375-stat"><span className="p375-stat-key">length</span><span className="p375-stat-val">{step.length}</span></div>
          )}
          {step?.lo !== undefined && (
            <div className="p375-stat"><span className="p375-stat-key">lo</span><span className="p375-stat-val">{step.lo}</span></div>
          )}
          {step?.hi !== undefined && (
            <div className="p375-stat"><span className="p375-stat-key">hi</span><span className="p375-stat-val">{step.hi}</span></div>
          )}
          {step?.pivot !== undefined && (
            <div className="p375-stat highlight"><span className="p375-stat-key">pivot</span><span className="p375-stat-val">{step.pivot}</span></div>
          )}
          {step?.cost !== undefined && (
            <div className="p375-stat"><span className="p375-stat-key">cost</span><span className="p375-stat-val">{step.cost}</span></div>
          )}
          {step?.best != null && (
            <div className="p375-stat highlight"><span className="p375-stat-key">best</span><span className="p375-stat-val">{step.best}</span></div>
          )}
          {step?.bestPivot != null && (
            <div className="p375-stat"><span className="p375-stat-key">best pivot</span><span className="p375-stat-val">{step.bestPivot}</span></div>
          )}
        </div>
      </div>

      <div className="p375-card">
        <div className="p375-section-label">Recurrence</div>
        <pre className="p375-formula">{'dp[lo][hi] = min over pivot of\n  pivot + max(dp[lo][pivot-1],\n              dp[pivot+1][hi])'}</pre>
        <p className="p375-hint">
          The <em>max</em> models the adversary steering you into the costlier half; the <em>min</em> is your best first guess.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p375-panel-code">
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
    <div className="p375-panel-status">
      <div className={`p375-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  return (
    <div className="p375-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
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
