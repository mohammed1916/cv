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
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['building', 'counted', 'counting', 'done', 'sorted', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  4: 'counting',
  5: 'counted',
  8: 'building',
  9: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def frequencySort(s: str) -> str:' },
  { line: 2, text: '    freq = {}' },
  { line: 3, text: '    for char in s:' },
  { line: 4, text: '        freq[char] = freq.get(char, 0) + 1' },
  { line: 5, text: '    sorted_chars = sorted(freq.items(), key=lambda x: x[1], reverse=True)' },
  { line: 6, text: '    result = ""' },
  { line: 7, text: '    for char, count in sorted_chars:' },
  { line: 8, text: '        result += char * count' },
  { line: 9, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('sort-characters-by-frequency') || [
  { label: 'Example 1', s: 'tree', expected: 'eert' },
  { label: 'Example 2', s: 'cccaabb', expected: 'cccaabb' },
  { label: 'Example 3', s: 'aabbccdd', expected: 'aabbccdd' },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2] },
  { id: 'count', label: 'Count Frequencies', lines: [3, 4] },
  { id: 'sort', label: 'Sort & Build', lines: [5, 6, 7, 8] },
  { id: 'return', label: 'Return', lines: [9] },
]

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      freq: {},
      result: '',
      stepNum: 0,
      message: 'Empty string.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    s,
    freq: {},
    result: '',
    stepNum: 0,
    message: `Input: "${s}"`,
  })

  const freq = {}
  let stepNum = 1

  for (const char of s) {
    freq[char] = (freq[char] || 0) + 1

    steps.push({
      phase: 'counting',
      activeLine: 4,
      s,
      freq: { ...freq },
      result: '',
      currentChar: char,
      stepNum,
      message: `Counted '${char}': ${freq[char]}`,
    })
    stepNum++
  }

  steps.push({
    phase: 'counted',
    activeLine: 5,
    s,
    freq: { ...freq },
    result: '',
    stepNum,
    message: `Frequency map: ${JSON.stringify(freq)}`,
  })
  stepNum++

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])

  steps.push({
    phase: 'sorted',
    activeLine: 5,
    s,
    freq: { ...freq },
    sorted,
    result: '',
    stepNum,
    message: `Sorted by frequency: ${sorted.map(([c, f]) => `'${c}'(${f})`).join(', ')}`,
  })
  stepNum++

  let result = ''

  for (const [char, count] of sorted) {
    const added = char.repeat(count)
    result += added

    steps.push({
      phase: 'building',
      activeLine: 8,
      s,
      freq: { ...freq },
      sorted,
      result,
      currentChar: char,
      currentCount: count,
      stepNum,
      message: `Added '${char}' × ${count}. Result: "${result}"`,
    })
    stepNum++
  }

  steps.push({
    phase: 'done',
    activeLine: 9,
    s,
    freq: { ...freq },
    sorted,
    result,
    stepNum,
    message: `Final result: "${result}"`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'counting' || phase === 'counted') return 'count'
  if (phase === 'sorted' || phase === 'building') return 'sort'
  if (phase === 'done') return 'return'
  return 'init'
}

function CharacterFrequency({ freq, currentChar }) {
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Character Frequencies
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map(([char, count]) => {
          const isCurrent = char === currentChar
          return (
            <motion.div
              key={char}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: isCurrent ? 5 : 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: isCurrent ? '#fef08a' : '#e0f2fe',
                border: `2px solid ${isCurrent ? '#eab308' : '#0ea5e9'}`,
                borderRadius: 4,
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: isCurrent ? '#713f12' : '#0c4a6e',
                fontFamily: 'monospace',
              }}>
                '{char}'
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: isCurrent ? '#713f12' : '#0c4a6e',
              }}>
                {count}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SortedCharacters({ sorted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Sorted by Frequency (descending)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {sorted.map(([char, count], i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#dcfce7',
              border: '2px solid #22c55e',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: '#15803d',
              textAlign: 'center',
            }}
          >
            '{char}' × {count}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ResultString({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Result String
      </header>
      <div style={{
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 4,
        border: '1px solid #86efac',
        fontSize: 12,
        fontFamily: 'monospace',
        fontWeight: 600,
        color: '#15803d',
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
      }}>
        "{result}"
      </div>
    </div>
  )
}

function VisualizationPanel({ step, s, EXAMPLES, handleExampleClick, input, setInput, handleReset }) {
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
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          String
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); handleReset() }}
            placeholder="e.g., tree"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleReset}
            style={{
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CharacterFrequency freq={step?.freq || {}} currentChar={step?.currentChar} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {step?.sorted && step.sorted.length > 0 && (
            <SortedCharacters sorted={step.sorted} />
          )}
        </div>
      </div>

      <ResultString result={step?.result || ''} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Ranking Characters by Popularity
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Count how often each character appears, then arrange them in order of popularity.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem451Visualizer() {
  const [input, setInput] = useState('tree')

  const steps = useMemo(
    () => generateSteps(input).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [input],
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
    setInput(ex.s)
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
          s={input}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          input={input}
          setInput={setInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    input,
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
