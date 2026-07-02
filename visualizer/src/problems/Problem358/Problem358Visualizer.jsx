import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Problem358.css'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['cooldown_ready', 'cooldown_set', 'done', 'fill_gap', 'impossible', 'init', 'placement', 'ready']
const LINE_PATTERN_MAP = {
  1: 'done',
  3: 'done',
  4: 'init',
  5: 'init',
  7: 'impossible',
  9: 'ready',
  13: 'cooldown_set',
  14: 'cooldown_ready',
  15: 'fill_gap'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def rearrangeString(s: str, k: int) -> str:' },
  { line: 2, text: '    from collections import Counter' },
  { line: 3, text: '    if k == 0: return s' },
  { line: 4, text: '    freq = Counter(s)' },
  { line: 5, text: '    max_freq = max(freq.values())' },
  { line: 6, text: '    if (max_freq - 1) * k + 1 > len(s):' },
  { line: 7, text: '        return ""  # impossible' },
  { line: 8, text: '    queue = [(-f, ch) for ch, f in freq.items()]' },
  { line: 9, text: '    heapq.heapify(queue)' },
  { line: 10, text: '    result, cooldown = [], []' },
  { line: 11, text: '    while queue or cooldown:' },
  { line: 12, text: '        if cooldown and cooldown[0][1] == len(result):' },
  { line: 13, text: '            freq, ch = heapq.heappop(cooldown)' },
  { line: 14, text: '            heapq.heappush(queue, (freq, ch))' },
  { line: 15, text: '        if not queue: return ""' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('rearrange-string-k-distance-apart') || [
  { label: 'Example 1', s: 'ABABAB', k: 2 },
  { label: 'Example 2', s: 'AAABBBCCD', k: 2 },
  { label: 'Example 3', s: 'A', k: 0 },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 'process', label: 'Main Loop', lines: [11, 12, 13, 14] },
  { id: 'placement', label: 'Place Character', lines: [15] },
]

function generateSteps(s, k) {
  const steps = []

  if (!s || s.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      s,
      k,
      freq: {},
      maxFreq: 0,
      queue: [],
      cooldown: [],
      result: '',
      stepNum: 0,
      message: 'Empty string.',
    }]
  }

  if (k === 0) {
    return [{
      phase: 'done',
      activeLine: 3,
      s,
      k,
      freq: {},
      maxFreq: 0,
      queue: [],
      cooldown: [],
      result: s,
      stepNum: 0,
      message: 'k=0: return string as-is.',
    }]
  }

  const freq = {}
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1
  }
  const maxFreq = Math.max(...Object.values(freq))

  steps.push({
    phase: 'init',
    activeLine: 4,
    s,
    k,
    freq: { ...freq },
    maxFreq,
    queue: [],
    cooldown: [],
    result: '',
    stepNum: 0,
    message: `Counted frequencies. Max freq: ${maxFreq}`,
  })

  const minLen = (maxFreq - 1) * k + 1
  if (minLen > s.length) {
    steps.push({
      phase: 'impossible',
      activeLine: 7,
      s,
      k,
      freq: { ...freq },
      maxFreq,
      queue: [],
      cooldown: [],
      result: '',
      stepNum: 1,
      message: `Impossible: (${maxFreq}-1)*${k}+1=${minLen} > ${s.length}`,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 5,
    s,
    k,
    freq: { ...freq },
    maxFreq,
    queue: [],
    cooldown: [],
    result: '',
    stepNum: 1,
    message: `Valid arrangement possible. Building min-heap.`,
  })

  const queue = Object.entries(freq).map(([ch, f]) => ({ ch, freq: f }))
  queue.sort((a, b) => b.freq - a.freq)

  steps.push({
    phase: 'ready',
    activeLine: 9,
    s,
    k,
    freq: { ...freq },
    maxFreq,
    queue: queue.map(q => ({ ...q })),
    cooldown: [],
    result: '',
    stepNum: 2,
    message: `Heap ready. Starting placement cycle.`,
  })

  let result = ''
  let cooldownList = []
  let stepNum = 3

  while (queue.length > 0 || cooldownList.length > 0) {
    if (cooldownList.length > 0 && cooldownList[0].availableAt === result.length) {
      const item = cooldownList.shift()
      queue.push(item)
      queue.sort((a, b) => b.freq - a.freq)

      steps.push({
        phase: 'cooldown_ready',
        activeLine: 14,
        s,
        k,
        freq: { ...freq },
        maxFreq,
        queue: queue.map(q => ({ ...q })),
        cooldown: cooldownList.map(c => ({ ...c })),
        result,
        stepNum,
        message: `${item.ch} cooldown expired at position ${result.length}. Requeued.`,
      })
      stepNum++
    }

    if (queue.length === 0) {
      steps.push({
        phase: 'fill_gap',
        activeLine: 15,
        s,
        k,
        freq: { ...freq },
        maxFreq,
        queue: [],
        cooldown: cooldownList.map(c => ({ ...c })),
        result,
        stepNum,
        message: `Gap found - impossible to arrange (queue empty with cooldowns active).`,
      })
      break
    }

    const item = queue.shift()
    result += item.ch

    steps.push({
      phase: 'placement',
      activeLine: 15,
      s,
      k,
      freq: { ...freq },
      maxFreq,
      queue: queue.map(q => ({ ...q })),
      cooldown: cooldownList.map(c => ({ ...c })),
      result,
      stepNum,
      message: `Placed '${item.ch}' at position ${result.length - 1}. Freq: ${item.freq} -> ${item.freq - 1}`,
    })
    stepNum++

    if (item.freq > 1) {
      item.freq--
      const availableAt = result.length + k
      cooldownList.push({
        ...item,
        availableAt,
        placedAt: result.length - 1,
      })
      cooldownList.sort((a, b) => a.availableAt - b.availableAt)

      steps.push({
        phase: 'cooldown_set',
        activeLine: 13,
        s,
        k,
        freq: { ...freq },
        maxFreq,
        queue: queue.map(q => ({ ...q })),
        cooldown: cooldownList.map(c => ({ ...c })),
        result,
        stepNum,
        message: `'${item.ch}' on cooldown. Available again at position ${availableAt}.`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 15,
    s,
    k,
    freq: { ...freq },
    maxFreq,
    queue: [],
    cooldown: [],
    result,
    stepNum,
    message: result.length === s.length ? `Success: "${result}"` : `Failed to arrange.`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'init' || phase === 'ready') return 'init'
  if (phase === 'placement' || phase === 'cooldown_set' || phase === 'cooldown_ready') return 'placement'
  if (phase === 'fill_gap') return 'process'
  return 'init'
}

function FrequencyHistogram({ step }) {
  if (!step) return null
  const entries = Object.entries(step.freq || {}).sort((a, b) => b[1] - a[1])
  const maxVal = Math.max(...Object.values(step.freq || {}), 1)

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Character Frequency
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {entries.map(([ch, freq]) => {
          const barWidth = (freq / maxVal) * 100
          return (
            <motion.div
              key={ch}
              style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{ch}</span>
                <span style={{ color: '#64748b' }}>{freq}</span>
              </div>
              <motion.div
                style={{
                  height: 24,
                  backgroundColor: '#e0e7ff',
                  borderRadius: 4,
                  border: '1px solid #c7d2fe',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${barWidth}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  {barWidth > 20 && freq}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function QueueAndCooldown({ step }) {
  if (!step) return null

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Queue & Cooldown
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Available ({(step.queue || []).length})
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40 }}>
            <AnimatePresence>
              {(step.queue || []).map((item, idx) => (
                <motion.div
                  key={`${item.ch}-queue-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#dcfce7',
                    border: '2px solid #22c55e',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#15803d',
                  }}
                >
                  {item.ch}({item.freq})
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Cooldown ({(step.cooldown || []).length})
          </div>
          <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
            <AnimatePresence>
              {(step.cooldown || []).map((item, idx) => (
                <motion.div
                  key={`${item.ch}-cooldown-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#fee2e2',
                    border: '2px solid #ef4444',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#991b1b',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{item.ch}(f:{item.freq})</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>ready@{item.availableAt}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultBuilder({ step, k }) {
  if (!step) return null
  const result = step.result || ''

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Result: {result.length} chars
      </header>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
        <AnimatePresence>
          {result.split('').map((ch, i) => {
            const nextSameIdx = result.indexOf(ch, i + 1)
            const distance = nextSameIdx >= 0 ? nextSameIdx - i : -1
            const isValid = distance < 0 || distance > k
            const bgColor = isValid ? '#dcfce7' : '#fecaca'
            const borderColor = isValid ? '#22c55e' : '#ef4444'

            return (
              <motion.div
                key={`${ch}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1e293b',
                  position: 'relative',
                }}
              >
                {ch}
                <span style={{
                  position: 'absolute',
                  bottom: -20,
                  fontSize: 10,
                  color: '#64748b',
                  fontWeight: 500,
                }}>
                  {i}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #0ea5e9' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>
          Distance Validation (k={k})
        </div>
        <div style={{ fontSize: 12, color: '#0369a1', fontFamily: 'monospace' }}>
          All same chars must be {k}+ positions apart
        </div>
      </div>
    </section>
  )
}

function VisualizationPanel({ step, s, k, EXAMPLES, handleExampleClick, sInput, setSInput, kInput, setKInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                transition: 'all 0.2s',
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            String (s)
          </label>
          <input
            value={sInput}
            onChange={(e) => { setSInput(e.target.value); handleReset() }}
            placeholder="e.g., ABABAB"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
              Distance (k)
            </label>
            <input
              type="number"
              value={kInput}
              onChange={(e) => { setKInput(Math.max(0, parseInt(e.target.value) || 0)); handleReset() }}
              min="0"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <FrequencyHistogram step={step} />
        <QueueAndCooldown step={step} />
      </div>

      <ResultBuilder step={step} k={k} />
    </section>
  )
}

export default function Problem358Visualizer() {
  const [sInput, setSInput] = useState('ABABAB')
  const [kInput, setKInput] = useState(2)

  const { s, k } = useMemo(() => ({
    s: sInput ?? '',
    k: Math.max(0, kInput ?? 0),
  }), [sInput, kInput])

  const steps = useMemo(
    () => generateSteps(s, k).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, k],
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


  const handleExampleClick = useCallback((ex) => {
    setSInput(ex.s)
    setKInput(ex.k)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          step={step}
          s={s}
          k={k}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          sInput={sInput}
          setSInput={setSInput}
          kInput={kInput}
          setKInput={setKInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    s,
    k,
    sInput,
    kInput,
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

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
