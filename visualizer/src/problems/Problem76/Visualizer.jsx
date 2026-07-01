import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './MinimumWindowSubstring.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def minWindow(s: str, t: str) -> str:' },
  { line: 2, text: '    if not s or not t:' },
  { line: 3, text: '        return ""' },
  { line: 4, text: '    need = {}' },
  { line: 5, text: '    for ch in t:' },
  { line: 6, text: '        need[ch] = need.get(ch, 0) + 1' },
  { line: 7, text: '    required = len(need)' },
  { line: 8, text: '    have = {}' },
  { line: 9, text: '    formed = 0' },
  { line: 10, text: '    left = 0' },
  { line: 11, text: '    for right in range(len(s)):' },
  { line: 12, text: '        ch = s[right]' },
  { line: 13, text: '        have[ch] = have.get(ch, 0) + 1' },
  { line: 14, text: '        if ch in need and have[ch] == need[ch]:' },
  { line: 15, text: '            formed += 1' },
  { line: 16, text: '        while left <= right and formed == required:' },
  { line: 17, text: '            if not best or right - left + 1 < best[2]:' },
  { line: 18, text: '                best = (left, right, right - left + 1)' },
  { line: 19, text: '            drop = s[left]' },
  { line: 20, text: '            have[drop] -= 1' },
  { line: 21, text: '            if drop in need and have[drop] < need[drop]:' },
  { line: 22, text: '                formed -= 1' },
  { line: 23, text: '            left += 1' },
  { line: 24, text: '    return s[best[0]:best[1]+1] if best else ""' },
]

const EXAMPLES = getExamples('minimum-window-substring') || [
  { label: 'Example 1', s: 'ADOBECODEBANC', t: 'ABC' },
  { label: 'Example 2', s: 'a', t: 'a' },
  { label: 'Example 3', s: 'a', t: 'aa' },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [4, 5, 6, 7, 8, 9, 10] },
  { id: 'expand', label: 'Expand Window', lines: [11, 12, 13, 14, 15] },
  { id: 'shrink', label: 'Shrink Window', lines: [16, 17, 18, 19, 20, 21, 22, 23] },
  { id: 'return', label: 'Return Result', lines: [24] },
]

function buildNeed(t) {
  const out = {}
  for (const ch of t) out[ch] = (out[ch] || 0) + 1
  return out
}

function generateSteps(s, t) {
  const steps = []
  if (!s || !t) {
    return [{
      phase: 'done', activeLine: 3, s, t, left: 0, right: -1,
      need: buildNeed(t), have: {}, formed: 0, required: Object.keys(buildNeed(t)).length,
      best: null, message: 'Empty input. Return "".',
    }]
  }

  const need = buildNeed(t)
  const have = {}
  const required = Object.keys(need).length
  let formed = 0
  let left = 0
  let best = null

  steps.push({
    phase: 'init', activeLine: 7, s, t, left, right: -1,
    need: { ...need }, have: { ...have }, formed, required, best,
    message: `Need ${required} unique char(s) from t.`,
  })

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    have[ch] = (have[ch] || 0) + 1
    if (need[ch] && have[ch] === need[ch]) formed++

    steps.push({
      phase: 'expand', activeLine: 13, s, t, left, right,
      need: { ...need }, have: { ...have }, formed, required, best,
      message: `Expand right to ${right} ('${ch}'). formed=${formed}/${required}.`,
    })

    while (left <= right && formed === required) {
      const len = right - left + 1
      if (!best || len < best.len) {
        best = { len, l: left, r: right, value: s.slice(left, right + 1) }
        steps.push({
          phase: 'best', activeLine: 18, s, t, left, right,
          need: { ...need }, have: { ...have }, formed, required, best: { ...best },
          message: `New best window "${best.value}" [${best.l}, ${best.r}].`,
        })
      }

      const drop = s[left]
      have[drop] -= 1
      if (need[drop] && have[drop] < need[drop]) formed--
      left++

      steps.push({
        phase: 'shrink', activeLine: 23, s, t, left, right,
        need: { ...need }, have: { ...have }, formed, required, best: best ? { ...best } : null,
        message: `Shrink left, removed '${drop}', formed=${formed}/${required}.`,
      })
    }
  }

  steps.push({
    phase: 'done', activeLine: 24, s, t, left, right: s.length - 1,
    need: { ...need }, have: { ...have }, formed, required, best,
    message: best ? `Return "${best.value}".` : 'No valid window found. Return "".',
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'init') return 'init'
  if (phase === 'expand') return 'expand'
  if (phase === 'best' || phase === 'shrink') return 'shrink'
  if (phase === 'done') return 'return'
  return 'expand'
}

function SlidingWindowViz({ step, s, EXAMPLES, sInput, setSInput, tInput, setTInput, handleReset }) {
  const handleExampleClick = useCallback((ex) => {
    setSInput(ex.s)
    setTInput(ex.t)
    handleReset()
  }, [setSInput, setTInput, handleReset])

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Sliding Window
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => handleExampleClick(ex)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <input
          value={sInput}
          onChange={(e) => { setSInput(e.target.value); handleReset() }}
          placeholder="Enter string s"
          style={{
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        />
        <input
          value={tInput}
          onChange={(e) => { setTInput(e.target.value); handleReset() }}
          placeholder="Enter string t"
          style={{
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 200 }}>
        <div style={{ display: 'flex', gap: 4, padding: 8, flexWrap: 'wrap', alignContent: 'flex-start' }}>
          {s.split('').map((ch, i) => {
            const inWindow = i >= (step?.left ?? 0) && i <= (step?.right ?? -1)
            const isLeft = i === step?.left
            const isRight = i === step?.right
            const inBest = step?.best && i >= step.best.l && i <= step.best.r

            let bgColor = '#f1f5f9'
            let borderColor = '#cbd5e1'
            let textColor = '#475569'

            if (inBest) {
              bgColor = '#fef08a'
              borderColor = '#eab308'
              textColor = '#92400e'
            } else if (inWindow) {
              bgColor = '#dbeafe'
              borderColor = '#0ea5e9'
              textColor = '#0c4a6e'
            }
            if (isLeft || isRight) {
              bgColor = '#e9d5ff'
              borderColor = '#a855f7'
              textColor = '#5b21b6'
            }

            return (
              <motion.div
                key={`${ch}-${i}`}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: textColor,
                  cursor: 'pointer',
                  position: 'relative',
                }}
                animate={{
                  scale: isLeft || isRight || inBest ? 1.15 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {ch}
                {isLeft && <span style={{ position: 'absolute', top: -18, fontSize: 10, color: '#a855f7', fontWeight: 'bold' }}>L</span>}
                {isRight && <span style={{ position: 'absolute', top: -18, fontSize: 10, color: '#a855f7', fontWeight: 'bold' }}>R</span>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FrequencyState({ step }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Frequency State
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>formed</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{step?.formed ?? 0}</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>required</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{step?.required ?? 0}</div>
          </div>
        </div>

        <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>best window</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
            {step?.best?.value ?? 'None'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <header style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
          Character Frequencies
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: 6 }}>
          {Object.entries(step?.need || {}).map(([ch, req]) => {
            const hv = step?.have?.[ch] || 0
            const satisfied = hv >= req

            return (
              <motion.div
                key={ch}
                style={{
                  padding: 8,
                  backgroundColor: satisfied ? '#dcfce7' : '#fecaca',
                  border: satisfied ? '2px solid #10b981' : '2px solid #ef4444',
                  borderRadius: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                animate={{
                  scale: satisfied ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {ch}
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                  {hv}/{req}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function MinimumWindowSubstringVisualizer() {
  const [sInput, setSInput] = useState('ADOBECODEBANC')
  const [tInput, setTInput] = useState('ABC')

  const { s, t } = useMemo(() => ({
    s: sInput ?? '',
    t: tInput ?? '',
  }), [sInput, tInput])

  const steps = useMemo(
    () => generateSteps(s, t).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, t],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
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
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
          <SlidingWindowViz
            step={step}
            s={s}
            t={t}
            EXAMPLES={EXAMPLES}
            sInput={sInput}
            setSInput={setSInput}
            tInput={tInput}
            setTInput={setTInput}
            handleReset={handleReset}
          />
          <FrequencyState step={step} />
        </div>
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    s,
    t,
    sInput,
    tInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>

    </div>
  )
}
