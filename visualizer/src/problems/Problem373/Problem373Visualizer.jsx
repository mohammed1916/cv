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
import './Problem373Visualizer.css'

const PATTERNS = ['init', 'seed', 'pop', 'emit', 'push', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'seed',
  5: 'seed',
  9: 'pop',
  10: 'emit',
  12: 'push',
  13: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'import heapq' },
  { line: 2, text: 'def kSmallestPairs(nums1, nums2, k):' },
  { line: 3, text: '    if not nums1 or not nums2: return []' },
  { line: 4, text: '    heap = [(nums1[i] + nums2[0], i, 0)' },
  { line: 5, text: '            for i in range(min(k, len(nums1)))]' },
  { line: 6, text: '    heapq.heapify(heap)' },
  { line: 7, text: '    result = []' },
  { line: 8, text: '    while heap and len(result) < k:' },
  { line: 9, text: '        s, i, j = heapq.heappop(heap)' },
  { line: 10, text: '        result.append([nums1[i], nums2[j]])' },
  { line: 11, text: '        if j + 1 < len(nums2):' },
  { line: 12, text: '            heapq.heappush(heap,' },
  { line: 13, text: '                (nums1[i] + nums2[j + 1], i, j + 1))' },
  { line: 14, text: '    return result' },
]

function parseArr(text) {
  const cleaned = (text ?? '').replace(/[[\]]/g, '').trim()
  if (!cleaned) return []
  return cleaned.split(/[\s,]+/).map((t) => {
    const v = Number(t)
    if (Number.isNaN(v)) throw new Error(`"${t}" is not a number`)
    return v
  })
}

// Simple sorted-array min-heap stand-in: keeps entries sorted by sum for display.
function heapSorted(entries) {
  return [...entries].sort((a, b) => a.sum - b.sum || a.i - b.i || a.j - b.j)
}

function generateSteps(t1, t2, kText) {
  const steps = []
  try {
    const nums1 = parseArr(t1)
    const nums2 = parseArr(t2)
    const k = Number(kText)
    if (!nums1.length || !nums2.length) throw new Error('both arrays must be non-empty')
    if (!Number.isInteger(k) || k < 1) throw new Error('k must be a positive integer')
    if (nums1.length > 12 || nums2.length > 12) throw new Error('keep arrays to 12 elements or fewer')

    let heap = []
    const result = []
    const emitted = [] // [i, j] index pairs already output

    const snap = (extra) => ({
      nums1,
      nums2,
      k,
      heap: heapSorted(heap),
      result: result.map((p) => [...p]),
      emitted: emitted.map((p) => [...p]),
      ...extra,
    })

    steps.push(snap({
      phase: 'init',
      activeLine: 2,
      message: `nums1=[${nums1}], nums2=[${nums2}], k=${k}. Each nums1[i] paired with nums2 in ascending order.`,
    }))

    const seedCount = Math.min(k, nums1.length)
    for (let i = 0; i < seedCount; i++) {
      heap.push({ sum: nums1[i] + nums2[0], i, j: 0 })
      steps.push(snap({
        phase: 'seed',
        activeLine: 4,
        highlightI: i,
        highlightJ: 0,
        message: `Seed heap with (nums1[${i}]=${nums1[i]}) + (nums2[0]=${nums2[0]}) = ${nums1[i] + nums2[0]}`,
      }))
    }

    while (heap.length && result.length < k) {
      heap = heapSorted(heap)
      const top = heap.shift()
      steps.push(snap({
        phase: 'pop',
        activeLine: 9,
        highlightI: top.i,
        highlightJ: top.j,
        popped: top,
        message: `Pop smallest sum ${top.sum} → pair (${nums1[top.i]}, ${nums2[top.j]})`,
      }))

      result.push([nums1[top.i], nums2[top.j]])
      emitted.push([top.i, top.j])
      steps.push(snap({
        phase: 'emit',
        activeLine: 10,
        highlightI: top.i,
        highlightJ: top.j,
        popped: top,
        message: `Emit pair #${result.length}: [${nums1[top.i]}, ${nums2[top.j]}]`,
      }))

      if (result.length >= k) break

      if (top.j + 1 < nums2.length) {
        const nj = top.j + 1
        heap.push({ sum: nums1[top.i] + nums2[nj], i: top.i, j: nj })
        steps.push(snap({
          phase: 'push',
          activeLine: 12,
          highlightI: top.i,
          highlightJ: nj,
          message: `Advance row ${top.i}: push (nums1[${top.i}]=${nums1[top.i]}) + (nums2[${nj}]=${nums2[nj]}) = ${nums1[top.i] + nums2[nj]}`,
        }))
      } else {
        steps.push(snap({
          phase: 'push',
          activeLine: 11,
          highlightI: top.i,
          message: `Row ${top.i} exhausted — nothing to push.`,
        }))
      }
    }

    steps.push(snap({
      phase: 'done',
      activeLine: 14,
      finished: true,
      message: `Done — ${result.length} pair(s): ${result.map((p) => `[${p[0]},${p[1]}]`).join(', ')}`,
    }))
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 2, error: true, message: `Error: ${e.message}` })
  }
  return steps
}

const EXAMPLES = getExamplesOr('find-k-pairs-with-smallest-sums', [
  { label: 'Example 1', nums1: '1,7,11', nums2: '2,4,6', k: '3' },
  { label: 'Example 2', nums1: '1,1,2', nums2: '1,2,3', k: '2' },
  { label: 'Example 3', nums1: '1,2', nums2: '3', k: '3' },
])

export default function Problem373Visualizer() {
  const [t1, setT1] = useState('1,7,11')
  const [t2, setT2] = useState('2,4,6')
  const [kText, setKText] = useState('3')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      const a = parseArr(t1)
      const b = parseArr(t2)
      if (!a.length || !b.length) return 'both arrays must be non-empty'
      if (a.length > 12 || b.length > 12) return 'keep arrays to 12 elements or fewer'
      const k = Number(kText)
      if (!Number.isInteger(k) || k < 1) return 'k must be a positive integer'
      return ''
    } catch (e) {
      return e.message
    }
  }, [t1, t2, kText])

  const steps = useMemo(
    () => generateSteps(t1, t2, kText).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [t1, t2, kText],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setT1(ex.nums1)
    setT2(ex.nums2)
    setKText(ex.k)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const primaryPanel = (
    <div className="p373-panel-primary">
      <div className="p373-card">
        <div className="p373-section-label">Input</div>
        <div className="p373-input-row">
          <div className="p373-field">
            <label className="p373-input-label" htmlFor="p373-n1">nums1 (sorted)</label>
            <input
              id="p373-n1"
              className={`p373-input mono ${inputError ? 'has-error' : ''}`}
              value={t1}
              onChange={(e) => { setT1(e.target.value); handleReset() }}
              placeholder="1,7,11"
            />
          </div>
          <div className="p373-field">
            <label className="p373-input-label" htmlFor="p373-n2">nums2 (sorted)</label>
            <input
              id="p373-n2"
              className={`p373-input mono ${inputError ? 'has-error' : ''}`}
              value={t2}
              onChange={(e) => { setT2(e.target.value); handleReset() }}
              placeholder="2,4,6"
            />
          </div>
          <div className="p373-field">
            <label className="p373-input-label" htmlFor="p373-k">k</label>
            <input
              id="p373-k"
              className={`p373-input narrow mono ${inputError ? 'has-error' : ''}`}
              value={kText}
              onChange={(e) => { setKText(e.target.value); handleReset() }}
              type="number"
              min="1"
            />
          </div>
        </div>
        <p className={`p373-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'A min-heap holds one candidate per nums1 row; popping it yields pairs in ascending sum order.'}
        </p>
        <div className="p373-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p373-example-btn ${t1 === ex.nums1 && t2 === ex.nums2 && kText === ex.k ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {step && !step.error && (
        <div className="p373-card">
          <div className="p373-section-label">Pair Sum Grid (nums1 × nums2)</div>
          <div className="p373-grid-wrap">
            <table className="p373-grid">
              <thead>
                <tr>
                  <th className="p373-corner" />
                  {step.nums2.map((v, j) => (
                    <th key={j} className={j === step.highlightJ ? 'hl' : ''}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.nums1.map((a, i) => (
                  <tr key={i}>
                    <th className={i === step.highlightI ? 'hl' : ''}>{a}</th>
                    {step.nums2.map((b, j) => {
                      const inHeap = step.heap.some((h) => h.i === i && h.j === j)
                      const isEmitted = step.emitted?.some(([ei, ej]) => ei === i && ej === j)
                      const isCursor = i === step.highlightI && j === step.highlightJ
                      return (
                        <td
                          key={j}
                          className={`${inHeap ? 'in-heap' : ''} ${isEmitted ? 'emitted' : ''} ${isCursor ? 'cursor' : ''}`}
                        >
                          {a + b}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p373-legend">
            <span><i className="p373-sw in-heap" /> in heap</span>
            <span><i className="p373-sw emitted" /> emitted</span>
            <span><i className="p373-sw cursor" /> current</span>
          </div>
        </div>
      )}

      {step?.result?.length > 0 && (
        <div className="p373-card">
          <div className="p373-section-label">Result Pairs ({step.result.length}/{step.k})</div>
          <div className="p373-pairs">
            {step.result.map((p, idx) => (
              <motion.div
                key={idx}
                className={`p373-pair ${step.finished ? 'final' : ''}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                [{p[0]}, {p[1]}]
                <span className="p373-pair-sum">= {p[0] + p[1]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p373-panel-state">
      <div className="p373-card">
        <div className="p373-section-label">Min-Heap (sum, i, j)</div>
        {step?.heap?.length ? (
          <div className="p373-heap">
            {step.heap.map((h, idx) => (
              <div key={`${h.i}-${h.j}`} className={`p373-heap-entry ${idx === 0 ? 'top' : ''}`}>
                <span className="p373-heap-sum">{h.sum}</span>
                <span className="p373-heap-idx">i={h.i}, j={h.j}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p373-hint">Heap is empty.</p>
        )}
      </div>

      <div className="p373-card">
        <div className="p373-section-label">Counters</div>
        <div className="p373-stat-grid">
          <div className="p373-stat highlight"><span className="p373-stat-key">emitted</span><span className="p373-stat-val">{step?.result?.length ?? 0}</span></div>
          <div className="p373-stat"><span className="p373-stat-key">k</span><span className="p373-stat-val">{step?.k ?? '-'}</span></div>
          <div className="p373-stat"><span className="p373-stat-key">heap size</span><span className="p373-stat-val">{step?.heap?.length ?? 0}</span></div>
          {step?.popped && (
            <div className="p373-stat highlight"><span className="p373-stat-key">popped sum</span><span className="p373-stat-val">{step.popped.sum}</span></div>
          )}
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p373-panel-code">
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
    <div className="p373-panel-status">
      <div className={`p373-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    <div className="p373-shell">
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
