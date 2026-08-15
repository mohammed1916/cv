import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './LongestSubstringwithAtMostKDistinctCharactersVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'def length_of_longest_substring_k_distinct(s, k):' },
  { line: 2, text: '    if k == 0:' },
  { line: 3, text: '        return 0' },
  { line: 4, text: '    counts = {}          # char -> count in window' },
  { line: 5, text: '    left = 0' },
  { line: 6, text: '    best = 0' },
  { line: 7, text: '    for right in range(len(s)):' },
  { line: 8, text: '        counts[s[right]] = counts.get(s[right], 0) + 1' },
  { line: 9, text: '        while len(counts) > k:' },
  { line: 10, text: '            counts[s[left]] -= 1' },
  { line: 11, text: '            if counts[s[left]] == 0:' },
  { line: 12, text: '                del counts[s[left]]' },
  { line: 13, text: '            left += 1' },
  { line: 14, text: '        best = max(best, right - left + 1)' },
  { line: 15, text: '    return best' },
]

function generateSteps(s, k) {
  const steps = []
  const counts = {}
  let left = 0
  let best = 0
  let bestL = 0
  let bestR = -1

  const make = (phase, activeLine, relatedLines, message, right) => {
    const distinct = Object.keys(counts).length
    return {
      phase,
      activeLine,
      relatedLines,
      message,
      s,
      k,
      left,
      right,
      counts: { ...counts },
      distinct,
      window: right >= left ? s.slice(left, right + 1) : '',
      bestLen: best,
      bestL,
      bestR,
      bestWindow: bestR >= bestL ? s.slice(bestL, bestR + 1) : '',
    }
  }

  // Guard: k == 0 means no characters allowed.
  if (k === 0) {
    steps.push(make('init', 2, [2, 3], 'k = 0: at most 0 distinct characters allowed, so the answer is 0.', -1))
    return steps
  }

  steps.push(make('init', 6, [4, 5, 6], `Initialize an empty count map, left = 0, best = 0 (k = ${k}).`, -1))

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    counts[ch] = (counts[ch] || 0) + 1
    steps.push(
      make(
        'expand',
        8,
        [7, 8],
        `Expand: include s[${right}] = '${ch}'. Window now has ${Object.keys(counts).length} distinct char(s).`,
        right,
      ),
    )

    while (Object.keys(counts).length > k) {
      const drop = s[left]
      steps.push(
        make(
          'shrink',
          9,
          [9, 10, 11, 12, 13],
          `Distinct = ${Object.keys(counts).length} > k = ${k}. Shrink from the left: drop s[${left}] = '${drop}'.`,
          right,
        ),
      )
      counts[drop] -= 1
      if (counts[drop] === 0) delete counts[drop]
      left += 1
      steps.push(
        make(
          'shrink',
          13,
          [10, 11, 12, 13],
          `Moved left to ${left}. Distinct now ${Object.keys(counts).length}.`,
          right,
        ),
      )
    }

    const windowLen = right - left + 1
    if (windowLen > best) {
      best = windowLen
      bestL = left
      bestR = right
      steps.push(
        make(
          'best',
          14,
          [14],
          `New best length ${best}: window "${s.slice(bestL, bestR + 1)}" [${bestL}, ${bestR}].`,
          right,
        ),
      )
    } else {
      steps.push(
        make(
          'best',
          14,
          [14],
          `Window length ${windowLen} does not beat best ${best}. Keep current best.`,
          right,
        ),
      )
    }
  }

  steps.push(
    make(
      'done',
      15,
      [15],
      best > 0
        ? `Done. Longest substring with at most ${k} distinct char(s) has length ${best}: "${s.slice(bestL, bestR + 1)}".`
        : `Done. Result is ${best}.`,
      s.length - 1,
    ),
  )
  return steps
}

const REGISTRY_EXAMPLES = getExamplesOr('longest-substring-k-distinct', [])
const EXAMPLES =
  REGISTRY_EXAMPLES.length > 0
    ? REGISTRY_EXAMPLES
    : [
        { label: 'eceba, k=2', s: 'eceba', k: 2 },
        { label: 'aa, k=1', s: 'aa', k: 1 },
        { label: 'abcadcacacaca, k=3', s: 'abcadcacacaca', k: 3 },
        { label: 'k=0 edge', s: 'abc', k: 0 },
      ]

const COL = { text: '#e2e8f0', muted: '#64748b', window: '#38bdf8', best: '#22c55e', over: '#ef4444' }

export default function LongestSubstringwithAtMostKDistinctCharactersVisualizer() {
  const [sInput, setSInput] = useState('eceba')
  const [kInput, setKInput] = useState('2')

  const inputError = useMemo(() => {
    const trimmed = kInput.trim()
    if (trimmed === '') return 'k is required.'
    if (!/^\d+$/.test(trimmed)) return 'k must be a non-negative integer.'
    return ''
  }, [kInput])

  const s = sInput
  const k = inputError ? 0 : Number.parseInt(kInput, 10)

  const steps = useMemo(() => (inputError ? [] : generateSteps(s, k)), [s, k, inputError])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const view = step ?? {
    left: 0, right: -1, counts: {}, distinct: 0, window: '', bestLen: 0, bestL: -1, bestR: -1, bestWindow: '',
  }
  const chars = s.split('')
  const overLimit = view.distinct > k && k > 0

  return (
    <div className="longest-substringwith-at-most-k-distinct-characters-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"},{"key":"k","label":"k","type":"string"}]}
          values={{ s: sInput, k: kInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 'k') setKInput(v); handleReset() }}
          showExamples={false}
          inputError={inputError}
        />
      <div className="longest-substringwith-at-most-k-distinct-characters-panel">
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-head">Input</div>
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 12, color: COL.muted }}>String s</span>
              <input
                value={sInput}
                onChange={(e) => { setSInput(e.target.value); handleReset() }}
                className="longest-substringwith-at-most-k-distinct-characters-textarea"
                style={{ flex: 'none', minHeight: 0, height: 36 }}
                placeholder="e.g. eceba"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 90 }}>
              <span style={{ fontSize: 12, color: COL.muted }}>k</span>
              <input
                value={kInput}
                onChange={(e) => { setKInput(e.target.value); handleReset() }}
                className="longest-substringwith-at-most-k-distinct-characters-textarea"
                style={{ flex: 'none', minHeight: 0, height: 36 }}
                placeholder="2"
              />
            </label>
          </div>
          {inputError && <div className="longest-substringwith-at-most-k-distinct-characters-error">{inputError}</div>}
        </div>
      </div>

      <div className="longest-substringwith-at-most-k-distinct-characters-panel">
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-head">Visualization</div>
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="longest-substringwith-at-most-k-distinct-characters-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="longest-substringwith-at-most-k-distinct-characters-step-info">
                <h3>{step?.message || 'Press play to begin'}</h3>
              </div>

              {!inputError && (
                <>
                  {/* String boxes with window shading + pointers */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {chars.length === 0 && (
                      <span style={{ color: COL.muted, fontStyle: 'italic' }}>(empty string)</span>
                    )}
                    {chars.map((ch, i) => {
                      const inWindow = i >= view.left && i <= view.right
                      const isLeft = i === view.left && view.right >= view.left
                      const isRight = i === view.right
                      const inBest = view.bestR >= view.bestL && i >= view.bestL && i <= view.bestR
                      const border = inBest
                        ? `2px solid ${COL.best}`
                        : inWindow
                          ? `2px solid ${COL.window}`
                          : '1px solid #334155'
                      const marker = isLeft && isRight ? 'L,R' : isLeft ? 'L' : isRight ? 'R' : ''
                      return (
                        <div key={`${ch}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <div style={{ height: 16, fontSize: 11, fontWeight: 700, color: '#a36907' }}>{marker}</div>
                          <div
                            style={{
                              width: 34,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              border,
                              background: inWindow ? `${COL.window}22` : '#1e293b',
                              color: COL.text,
                              fontFamily: 'monospace',
                              fontSize: 18,
                              fontWeight: 600,
                            }}
                          >
                            {ch}
                          </div>
                          <div style={{ fontSize: 10, color: COL.muted }}>{i}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Metrics */}
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: COL.text, fontSize: 13 }}>
                    <span>left = <strong>{view.left}</strong></span>
                    <span>right = <strong>{view.right}</strong></span>
                    <span>window = <strong style={{ color: COL.window }}>"{view.window}"</strong></span>
                  </div>

                  {/* Char -> count map */}
                  <div>
                    <div style={{ fontSize: 12, color: COL.muted, marginBottom: 6 }}>
                      count map — distinct = <strong style={{ color: overLimit ? COL.over : COL.text }}>{view.distinct}</strong> / k = {k}
                      {overLimit && <span style={{ color: COL.over }}> (over limit, shrinking)</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.keys(view.counts).length === 0 && (
                        <span style={{ color: COL.muted, fontStyle: 'italic' }}>empty</span>
                      )}
                      {Object.entries(view.counts).map(([ch, c]) => (
                        <div
                          key={ch}
                          style={{
                            display: 'flex',
                            gap: 6,
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: `1px solid ${overLimit ? COL.over : '#334155'}`,
                            background: '#1e293b',
                            color: COL.text,
                            fontFamily: 'monospace',
                            fontSize: 13,
                          }}
                        >
                          <span>'{ch}'</span>
                          <strong style={{ color: COL.window }}>{c}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best window */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1px solid ${COL.best}`,
                      background: `${COL.best}18`,
                      color: COL.text,
                      fontSize: 13,
                    }}
                  >
                    best length = <strong style={{ color: COL.best }}>{view.bestLen}</strong>
                    {view.bestWindow ? (
                      <> — window <strong style={{ color: COL.best }}>"{view.bestWindow}"</strong> [{view.bestL}, {view.bestR}]</>
                    ) : (
                      <> — no window yet</>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="longest-substringwith-at-most-k-distinct-characters-panel">
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-head">Code</div>
        <div className="longest-substringwith-at-most-k-distinct-characters-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="longest-substringwith-at-most-k-distinct-characters-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="longest-substringwith-at-most-k-distinct-characters-example-btn"
              onClick={() => {
                setSInput(String(example.s ?? ''))
                setKInput(String(example.k ?? 0))
                handleReset()
              }}
            >
              {example.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <FloatingPanel title="Playback Controls">
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
        />
      </FloatingPanel>
    </div>
  )
}
