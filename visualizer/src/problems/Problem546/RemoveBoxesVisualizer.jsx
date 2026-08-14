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
import './RemoveBoxesVisualizer.css'

const PATTERNS = ['init', 'enter', 'memo_hit', 'absorb', 'base', 'take', 'split', 'best', 'done', 'error']

const LINE_PATTERN_MAP = {
  4: 'memo_hit',
  6: 'base',
  10: 'absorb',
  12: 'take',
  15: 'split',
  17: 'best',
  20: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def removeBoxes(boxes):' },
  { line: 2, text: '    @lru_cache(None)' },
  { line: 3, text: '    def dp(i, j, k):' },
  { line: 4, text: '        # k = boxes left of i with the same colour as boxes[i]' },
  { line: 5, text: '        if i > j:' },
  { line: 6, text: '            return 0' },
  { line: 7, text: '' },
  { line: 8, text: '        # Absorb equal colours adjacent to i into k' },
  { line: 9, text: '        while i < j and boxes[i + 1] == boxes[i]:' },
  { line: 10, text: '            i, k = i + 1, k + 1' },
  { line: 11, text: '' },
  { line: 12, text: '        best = (k + 1) * (k + 1) + dp(i + 1, j, 0)' },
  { line: 13, text: '' },
  { line: 14, text: '        # Or hold the group and merge with a later match' },
  { line: 15, text: '        for m in range(i + 1, j + 1):' },
  { line: 16, text: '            if boxes[m] == boxes[i]:' },
  { line: 17, text: '                best = max(best,' },
  { line: 18, text: '                    dp(i + 1, m - 1, 0) + dp(m, j, k + 1))' },
  { line: 19, text: '        return best' },
  { line: 20, text: '' },
  { line: 21, text: '    return dp(0, len(boxes) - 1, 0)' },
]

const EXAMPLES = getExamplesOr('remove-boxes', [
  { label: 'Example 1', text: '1,3,2,2,2,3,4,3,1' },
  { label: 'Example 2', text: '1,1,1' },
  { label: 'Merge pays', text: '1,2,1,2,1' },
]).map((ex) => ({
  label: ex.label,
  text: ex.text ?? (ex.boxes ?? []).join(','),
}))

function parseBoxes(text) {
  const parts = text.split(/[,\s[\]]+/).filter((s) => s !== '')
  if (parts.length === 0) throw new Error('Enter box colours, e.g. 1,3,2,2,2,3,4,3,1')
  const boxes = parts.map(Number)
  if (boxes.some((b) => Number.isNaN(b) || b < 1)) throw new Error('Colours must be positive integers')
  if (boxes.length > 12) throw new Error('Keep it to 12 boxes or fewer (the DP is O(n^4))')
  return boxes
}

function generateSteps(text) {
  const steps = []
  const MAX_STEPS = 900

  try {
    const boxes = parseBoxes(text)
    const n = boxes.length
    const memo = new Map()
    // Recorded separately from `memo` so the State panel can list entries in
    // the order they were solved rather than Map insertion order alone.
    const solved = []
    let truncated = false

    const push = (s) => {
      if (steps.length < MAX_STEPS) steps.push(s)
      else truncated = true
    }

    push({
      phase: 'init',
      activeLine: 21,
      message: `${n} boxes. dp(i, j, k) = best points for boxes[i..j] with k identical boxes already attached to the left of i.`,
      boxes,
      memoSize: 0,
      memoList: [],
    })

    const dp = (i, j, k, depth) => {
      const key = `${i},${j},${k}`

      if (i > j) {
        push({
          phase: 'base',
          activeLine: 6,
          message: `dp(${i}, ${j}, ${k}): empty range → 0 points.`,
          boxes,
          range: [i, j],
          k,
          depth,
          memoSize: memo.size,
          memoList: [...solved],
        })
        return 0
      }

      if (memo.has(key)) {
        push({
          phase: 'memo_hit',
          activeLine: 4,
          message: `dp(${i}, ${j}, ${k}) is memoised → ${memo.get(key)} points. Reuse it.`,
          boxes,
          range: [i, j],
          k,
          depth,
          memoHit: key,
          memoSize: memo.size,
          memoList: [...solved],
        })
        return memo.get(key)
      }

      push({
        phase: 'enter',
        activeLine: 3,
        message: `dp(${i}, ${j}, ${k}): solve boxes[${i}..${j}] (colours ${boxes.slice(i, j + 1).join(',')}) with k=${k}.`,
        boxes,
        range: [i, j],
        k,
        depth,
        memoSize: memo.size,
        memoList: [...solved],
      })

      // Absorb a run of equal colours at the left edge into k.
      let ii = i
      let kk = k
      while (ii < j && boxes[ii + 1] === boxes[ii]) {
        ii += 1
        kk += 1
        push({
          phase: 'absorb',
          activeLine: 10,
          message: `boxes[${ii}] matches boxes[${ii - 1}] — absorb it: i=${ii}, k=${kk}.`,
          boxes,
          range: [ii, j],
          k: kk,
          depth,
          memoSize: memo.size,
          memoList: [...solved],
        })
      }

      // Option A: remove the whole group of k+1 boxes now.
      const takeNow = (kk + 1) * (kk + 1)
      push({
        phase: 'take',
        activeLine: 12,
        message: `Option A: remove the group of ${kk + 1} now for ${kk + 1}² = ${takeNow} points, then solve boxes[${ii + 1}..${j}].`,
        boxes,
        range: [ii, j],
        k: kk,
        depth,
        candidate: takeNow,
        memoSize: memo.size,
        memoList: [...solved],
      })

      let best = takeNow + dp(ii + 1, j, 0, depth + 1)

      // Option B: keep the group and merge it with a later same-coloured box.
      for (let m = ii + 1; m <= j; m += 1) {
        if (boxes[m] !== boxes[ii]) continue

        push({
          phase: 'split',
          activeLine: 16,
          message: `Option B: boxes[${m}] is also colour ${boxes[ii]} — clear boxes[${ii + 1}..${m - 1}] first, then merge.`,
          boxes,
          range: [ii, j],
          k: kk,
          depth,
          splitAt: m,
          memoSize: memo.size,
          memoList: [...solved],
        })

        const alt = dp(ii + 1, m - 1, 0, depth + 1) + dp(m, j, kk + 1, depth + 1)
        if (alt > best) {
          best = alt
          push({
            phase: 'best',
            activeLine: 17,
            message: `Merging at ${m} scores ${alt} — better. New best for dp(${i}, ${j}, ${k}).`,
            boxes,
            range: [ii, j],
            k: kk,
            depth,
            splitAt: m,
            candidate: alt,
            memoSize: memo.size,
            memoList: [...solved],
          })
        }
      }

      memo.set(key, best)
      solved.push({ key, value: best })

      push({
        phase: 'best',
        activeLine: 19,
        message: `dp(${i}, ${j}, ${k}) = ${best}. Memoised.`,
        boxes,
        range: [i, j],
        k,
        depth,
        candidate: best,
        memoSize: memo.size,
        memoList: [...solved],
      })

      return best
    }

    const result = n === 0 ? 0 : dp(0, n - 1, 0, 0)

    steps.push({
      phase: 'done',
      activeLine: 21,
      message: `Maximum points: ${result}${truncated ? ' (trace truncated — the full recursion is large)' : ''}`,
      boxes,
      result,
      memoSize: memo.size,
      memoList: [...solved],
      done: true,
      truncated,
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

export default function RemoveBoxesVisualizer() {
  const [text, setText] = useState(EXAMPLES[0]?.text || '1,3,2,2,2,3,4,3,1')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseBoxes(text)
      return ''
    } catch (e) {
      return e.message
    }
  }, [text])

  const steps = useMemo(
    () => generateSteps(text).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [text],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setText(ex.text)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Stable colour per box value, taken from the theme-neutral accent ramp.
  const colourFor = (v) => {
    const ramp = [
      'rgba(56,189,248,0.28)',
      'rgba(16,185,129,0.28)',
      'rgba(249,115,22,0.28)',
      'rgba(167,139,250,0.28)',
      'rgba(244,114,182,0.28)',
      'rgba(250,204,21,0.28)',
    ]
    return ramp[(v - 1) % ramp.length]
  }

  const primaryPanel = (
    <div className="p546-panel-primary">
      <div className="p546-card">
        <div className="p546-section-label">Boxes</div>
        <input
          className={`p546-input mono ${inputError ? 'has-error' : ''}`}
          value={text}
          onChange={(e) => { setText(e.target.value); handleReset() }}
          placeholder="1,3,2,2,2,3,4,3,1"
        />
        <p className={`p546-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Remove a run of k same-coloured boxes for k² points. Maximise the total.'}
        </p>
        <div className="p546-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p546-example-btn ${text === ex.text ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p546-card">
        <div className="p546-section-label">
          Current Subproblem {step?.range ? `dp(${step.range[0]}, ${step.range[1]}, ${step.k})` : ''}
        </div>
        <div className="p546-row">
          {(step?.boxes ?? []).map((v, idx) => {
            const inRange = step?.range && idx >= step.range[0] && idx <= step.range[1]
            const isLeftEdge = step?.range && idx === step.range[0]
            const isSplit = step?.splitAt === idx
            return (
              <motion.div
                key={idx}
                className={[
                  'p546-box',
                  inRange ? 'in-range' : 'out-range',
                  isLeftEdge ? 'edge' : '',
                  isSplit ? 'split' : '',
                ].filter(Boolean).join(' ')}
                style={{ background: inRange ? colourFor(v) : 'var(--surface2)' }}
                animate={{ scale: isLeftEdge || isSplit ? 1.14 : 1 }}
              >
                <span className="p546-box-idx">{idx}</span>
                <span className="p546-box-val">{v}</span>
              </motion.div>
            )
          })}
        </div>
        <div className="p546-legend">
          <span><i className="p546-swatch edge" /> left edge (i)</span>
          <span><i className="p546-swatch split" /> merge candidate (m)</span>
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p546-result">
          <div className="p546-section-label" style={{ marginBottom: '0.3rem' }}>Maximum Points</div>
          <div className="p546-result-val">{step.result}</div>
          {step.truncated && (
            <p className="p546-hint">Trace was truncated; the score is still exact.</p>
          )}
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p546-panel-state">
      <div className="p546-card">
        <div className="p546-section-label">Recursion State</div>
        <div className="p546-stat-grid">
          <div className="p546-stat">
            <span className="p546-stat-key">i</span>
            <span className="p546-stat-val">{step?.range?.[0] ?? '—'}</span>
          </div>
          <div className="p546-stat">
            <span className="p546-stat-key">j</span>
            <span className="p546-stat-val">{step?.range?.[1] ?? '—'}</span>
          </div>
          <div className="p546-stat highlight">
            <span className="p546-stat-key">k</span>
            <span className="p546-stat-val">{step?.k ?? '—'}</span>
          </div>
          <div className="p546-stat">
            <span className="p546-stat-key">depth</span>
            <span className="p546-stat-val">{step?.depth ?? '—'}</span>
          </div>
          <div className="p546-stat">
            <span className="p546-stat-key">candidate</span>
            <span className="p546-stat-val">{step?.candidate ?? '—'}</span>
          </div>
          <div className="p546-stat">
            <span className="p546-stat-key">memo size</span>
            <span className="p546-stat-val">{step?.memoSize ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="p546-card">
        <div className="p546-section-label">Memo Table (i, j, k) → points</div>
        {step?.memoList?.length ? (
          <ul className="p546-list">
            {step.memoList.slice(-14).reverse().map((e) => (
              <li
                key={e.key}
                className={`p546-list-item mono ${step.memoHit === e.key ? 'hit' : ''}`}
              >
                <span>dp({e.key})</span>
                <span className="p546-list-val">{e.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p546-hint">No subproblems solved yet.</p>
        )}
        {step?.memoList?.length > 14 && (
          <p className="p546-hint" style={{ marginTop: '0.5rem' }}>
            Showing the 14 most recent of {step.memoList.length}.
          </p>
        )}
      </div>

      <div className="p546-card">
        <div className="p546-section-label">Complexity</div>
        <p className="p546-hint">
          O(n⁴) states across (i, j, k) with O(n) work each — memoisation is what makes it tractable.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p546-panel-code">
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
    <div className="p546-panel-status">
      <div className={`p546-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    <div className="p546-shell">
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
