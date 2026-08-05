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
import './SplitArrayEqualSumVisualizer.css'

const PATTERNS = [
  'init', 'prefix', 'pick_j', 'reset_set', 'pick_i', 'left_match',
  'record', 'pick_k', 'right_match', 'found', 'done', 'error',
]

const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'prefix',
  8: 'pick_j',
  9: 'reset_set',
  10: 'pick_i',
  11: 'left_match',
  12: 'record',
  13: 'pick_k',
  14: 'right_match',
  15: 'found',
  16: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def splitArray(nums):' },
  { line: 2, text: '    n = len(nums)' },
  { line: 3, text: '    if n < 7: return False' },
  { line: 4, text: '    pre = [0] * (n + 1)                  # prefix sums' },
  { line: 5, text: '    for x in range(n):' },
  { line: 6, text: '        pre[x + 1] = pre[x] + nums[x]' },
  { line: 7, text: '' },
  { line: 8, text: '    for j in range(3, n - 3):            # middle cut' },
  { line: 9, text: '        seen = set()' },
  { line: 10, text: '        for i in range(1, j - 1):        # left cut' },
  { line: 11, text: '            if pre[i] == pre[j] - pre[i + 1]:' },
  { line: 12, text: '                seen.add(pre[i])         # equal left pair' },
  { line: 13, text: '        for k in range(j + 2, n - 1):    # right cut' },
  { line: 14, text: '            if pre[n] - pre[k + 1] == pre[k] - pre[j + 1]:' },
  { line: 15, text: '                if pre[k] - pre[j + 1] in seen:' },
  { line: 16, text: '                    return True' },
  { line: 17, text: '    return False' },
]

function parseNums(text) {
  const cleaned = String(text).replace(/[[\]]/g, ' ').trim()
  if (!cleaned) throw new Error('Enter a comma-separated list of integers')
  const parts = cleaned.split(/[\s,]+/).filter(Boolean)
  const nums = parts.map((p) => {
    const v = Number(p)
    if (!Number.isFinite(v)) throw new Error(`"${p}" is not a number`)
    return v
  })
  if (nums.length > 24) throw new Error('Keep the array to 24 numbers or fewer')
  return nums
}

/**
 * LC 548 — Split Array with Equal Sum.
 *
 * Pick a middle cut j, collect every left cut i whose two sub-sums agree into a
 * set, then scan right cuts k for a matching sum. That makes it O(n^2) rather
 * than the O(n^3) you get from nesting i, j and k directly.
 */
function generateSteps(input) {
  const steps = []

  try {
    const nums = parseNums(input)
    const n = nums.length

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `n = ${n}. Need three cuts (i, j, k) carving four equal-sum parts.`,
      nums,
    })

    if (n < 7) {
      steps.push({
        phase: 'done',
        activeLine: 3,
        message: `n = ${n} < 7 — impossible to make four non-empty parts plus three cut elements. Answer: false`,
        nums,
        result: false,
      })
      return steps
    }

    // pre[x] = sum of nums[0..x-1]
    const pre = new Array(n + 1).fill(0)
    for (let x = 0; x < n; x += 1) pre[x + 1] = pre[x] + nums[x]

    steps.push({
      phase: 'prefix',
      activeLine: 4,
      message: `Prefix sums built: [${pre.join(', ')}]. Any range sum is now one subtraction.`,
      nums,
      pre,
    })

    for (let j = 3; j < n - 3; j += 1) {
      steps.push({
        phase: 'pick_j',
        activeLine: 8,
        message: `Middle cut j = ${j} (nums[${j}] = ${nums[j]} is excluded).`,
        nums,
        pre,
        j,
      })

      const seen = new Set()

      steps.push({
        phase: 'reset_set',
        activeLine: 9,
        message: 'Clear the set of left-half sums — it only applies to this j.',
        nums,
        pre,
        j,
        seen: [],
      })

      for (let i = 1; i < j - 1; i += 1) {
        const left = pre[i]
        const right = pre[j] - pre[i + 1]

        steps.push({
          phase: 'pick_i',
          activeLine: 11,
          message: `i = ${i}: part1 = ${left}, part2 = ${right}. Equal? ${left === right ? 'yes' : 'no'}`,
          nums,
          pre,
          i,
          j,
          seen: [...seen],
          parts: [left, right, null, null],
          leftMatch: left === right,
        })

        if (left === right) {
          seen.add(left)
          steps.push({
            phase: 'record',
            activeLine: 12,
            message: `Record sum ${left} — a valid left split exists for j = ${j}.`,
            nums,
            pre,
            i,
            j,
            seen: [...seen],
            parts: [left, right, null, null],
            leftMatch: true,
            recorded: left,
          })
        }
      }

      if (seen.size === 0) {
        steps.push({
          phase: 'pick_j',
          activeLine: 8,
          message: `No equal left split for j = ${j}. Advance the middle cut.`,
          nums,
          pre,
          j,
          seen: [],
        })
        continue
      }

      for (let k = j + 2; k < n - 1; k += 1) {
        const part3 = pre[k] - pre[j + 1]
        const part4 = pre[n] - pre[k + 1]

        steps.push({
          phase: 'pick_k',
          activeLine: 14,
          message: `k = ${k}: part3 = ${part3}, part4 = ${part4}. Equal? ${part3 === part4 ? 'yes' : 'no'}`,
          nums,
          pre,
          j,
          k,
          seen: [...seen],
          parts: [null, null, part3, part4],
          rightMatch: part3 === part4,
        })

        if (part3 !== part4) continue

        const hit = seen.has(part3)

        steps.push({
          phase: hit ? 'right_match' : 'pick_k',
          activeLine: 15,
          message: hit
            ? `Right halves both sum to ${part3}, and ${part3} is in the set — all four parts agree!`
            : `Right halves sum to ${part3}, but no left split produced ${part3}. Keep scanning k.`,
          nums,
          pre,
          j,
          k,
          seen: [...seen],
          parts: [null, null, part3, part4],
          rightMatch: true,
          setHit: hit ? part3 : null,
        })

        if (hit) {
          // Recover the concrete i so the four parts can be shown together.
          let foundI = null
          for (let i = 1; i < j - 1; i += 1) {
            if (pre[i] === part3 && pre[j] - pre[i + 1] === part3) { foundI = i; break }
          }

          steps.push({
            phase: 'found',
            activeLine: 16,
            message: `Cuts i=${foundI}, j=${j}, k=${k} split nums into four parts summing ${part3} each. Answer: true`,
            nums,
            pre,
            i: foundI,
            j,
            k,
            seen: [...seen],
            parts: [part3, part3, part3, part3],
            setHit: part3,
            result: true,
          })

          steps.push({
            phase: 'done',
            activeLine: 16,
            message: 'Result: true',
            nums,
            pre,
            i: foundI,
            j,
            k,
            parts: [part3, part3, part3, part3],
            result: true,
          })

          return steps
        }
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 17,
      message: 'Every middle cut exhausted with no matching quadruple split. Answer: false',
      nums,
      pre,
      result: false,
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

const EXAMPLES = getExamplesOr('split-array-with-equal-sum', [
  { label: 'Example 1', nums: '1,2,1,2,1,2,1' },
  { label: 'Example 2', nums: '1,2,1,2,1,2,1,2' },
  { label: 'No split', nums: '3,1,4,1,5,9,2,6' },
])

const PART_NAMES = ['part 1', 'part 2', 'part 3', 'part 4']

export default function SplitArrayEqualSumVisualizer() {
  const [numsInput, setNumsInput] = useState('1,2,1,2,1,2,1')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseNums(numsInput)
      return ''
    } catch (e) {
      return e.message
    }
  }, [numsInput])

  const steps = useMemo(
    () => generateSteps(numsInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [numsInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(ex.nums)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Which of the four parts (if any) an index belongs to, given the live cuts.
  const partOf = useCallback((idx) => {
    if (!step) return null
    const { i, j, k } = step
    if (idx === i || idx === j || idx === k) return 'cut'
    if (i != null && idx < i) return 0
    if (i != null && j != null && idx > i && idx < j) return 1
    if (j != null && k != null && idx > j && idx < k) return 2
    if (k != null && idx > k) return 3
    if (i == null && j != null && idx < j) return 0
    if (i == null && j != null && k != null && idx > j && idx < k) return 2
    return null
  }, [step])

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <div className="p548-panel-primary">
      <div className="p548-card">
        <div className="p548-section-label">Input</div>
        <input
          id="p548-nums"
          className={`p548-input mono ${inputError ? 'has-error' : ''}`}
          value={numsInput}
          onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
          placeholder="1,2,1,2,1,2,1"
        />
        <p className={`p548-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Find cuts i < j < k so the four remaining parts have equal sums (n ≥ 7 required).'}
        </p>
        <div className="p548-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p548-example-btn ${numsInput === ex.nums ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p548-card">
        <div className="p548-section-label">Array &amp; Cuts</div>
        <div className="p548-array">
          {(step?.nums ?? []).map((v, idx) => {
            const part = partOf(idx)
            const cls = [
              'p548-cell',
              part === 'cut' ? 'cut' : part != null ? `part${part}` : '',
              idx === step?.i ? 'pointer-i' : '',
              idx === step?.j ? 'pointer-j' : '',
              idx === step?.k ? 'pointer-k' : '',
            ].filter(Boolean).join(' ')
            return (
              <div key={idx} className={cls}>
                <span className="p548-cell-idx">{idx}</span>
                <span>{v}</span>
              </div>
            )
          })}
        </div>
        <p className="p548-hint">
          Struck-through cells are the excluded cut elements nums[i], nums[j], nums[k].
        </p>
      </div>

      {step?.parts && (
        <div className="p548-card">
          <div className="p548-section-label">Part Sums</div>
          <div className="p548-parts">
            {step.parts.map((sum, idx) => {
              const allEqual = step.parts.every((s) => s != null && s === step.parts[0])
              const pairEqual = idx < 2
                ? step.leftMatch
                : step.rightMatch
              const cls = sum == null ? '' : allEqual || pairEqual ? 'match' : 'mismatch'
              return (
                <div key={idx} className={`p548-part ${cls}`}>
                  <div className="p548-part-name">{PART_NAMES[idx]}</div>
                  <div className="p548-part-sum">{sum == null ? '—' : sum}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div className={`p548-result ${step.result ? 'yes' : 'no'}`}>
          <div className="p548-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p548-result-val">{String(step.result)}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p548-panel-state">
      <div className="p548-card">
        <div className="p548-section-label">Cuts</div>
        <div className="p548-stat-grid">
          <div className="p548-stat"><span className="p548-stat-key">i</span><span className="p548-stat-val">{step?.i ?? '—'}</span></div>
          <div className="p548-stat highlight"><span className="p548-stat-key">j</span><span className="p548-stat-val">{step?.j ?? '—'}</span></div>
          <div className="p548-stat"><span className="p548-stat-key">k</span><span className="p548-stat-val">{step?.k ?? '—'}</span></div>
        </div>
      </div>

      <div className="p548-card">
        <div className="p548-section-label">Left-Half Sums Seen (for this j)</div>
        {step?.seen?.length ? (
          <div className="p548-set">
            {step.seen.map((s) => (
              <span key={s} className={`p548-chip ${step.setHit === s ? 'hit' : ''}`}>{s}</span>
            ))}
          </div>
        ) : (
          <div className="p548-empty">empty</div>
        )}
      </div>

      {step?.pre && (
        <div className="p548-card">
          <div className="p548-section-label">Prefix Sums</div>
          <div className="p548-array">
            {step.pre.map((s, idx) => (
              <div key={idx} className="p548-cell">
                <span className="p548-cell-idx">{idx}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p548-panel-code">
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
    <div className="p548-panel-status">
      <div className={`p548-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    <div className="p548-shell">
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
