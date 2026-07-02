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

const PATTERNS = ['checking', 'done', 'init_pointers', 'matched', 'skip_cookie', 'sorted', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  4: 'sorted',
  5: 'checking',
  6: 'matched',
  8: 'skip_cookie',
  9: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findContentChildren(g, s):' },
  { line: 2, text: '    g.sort()' },
  { line: 3, text: '    s.sort()' },
  { line: 4, text: '    i, j = 0, 0' },
  { line: 5, text: '    while i < len(g) and j < len(s):' },
  { line: 6, text: '        if s[j] >= g[i]:' },
  { line: 7, text: '            i += 1' },
  { line: 8, text: '        j += 1' },
  { line: 9, text: '    return i' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('assign-cookies') || [
  { label: 'Example 1', greed: [1, 2, 3], size: [1, 1], expected: 1 },
  { label: 'Example 2', greed: [1, 2], size: [1, 2, 3], expected: 2 },
  { label: 'Example 3', greed: [10, 9, 8, 7], size: [5, 6, 7, 8], expected: 2 },
]

const SNIPPETS = [
  { id: 'sort', label: 'Sort', lines: [2, 3] },
  { id: 'init', label: 'Initialize', lines: [4] },
  { id: 'loop', label: 'Match Loop', lines: [5, 6, 7, 8] },
  { id: 'return', label: 'Return Result', lines: [9] },
]

function generateSteps(greed, size) {
  const steps = []

  if (!Array.isArray(greed) || greed.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      greed: [],
      size: [],
      matched: 0,
      stepNum: 0,
      message: 'No children.',
    }]
  }

  const g = [...greed].sort((a, b) => a - b)
  const s = [...size].sort((a, b) => a - b)

  steps.push({
    phase: 'start',
    activeLine: 2,
    greed: g,
    size: s,
    matched: 0,
    stepNum: 0,
    message: `Sorting greed factors and cookie sizes`,
  })

  steps.push({
    phase: 'sorted',
    activeLine: 4,
    greed: g,
    size: s,
    matched: 0,
    stepNum: 1,
    message: `Greed: ${JSON.stringify(g)}, Sizes: ${JSON.stringify(s)}`,
  })

  steps.push({
    phase: 'init_pointers',
    activeLine: 4,
    greed: g,
    size: s,
    i: 0,
    j: 0,
    matched: 0,
    stepNum: 2,
    message: `Two pointers initialized. Starting to match cookies.`,
  })

  let i = 0, j = 0, matched = 0, stepNum = 3

  while (i < g.length && j < s.length) {
    steps.push({
      phase: 'checking',
      activeLine: 5,
      greed: g,
      size: s,
      i,
      j,
      matched,
      stepNum,
      message: `Child needs ${g[i]}, cookie size is ${s[j]}`,
    })
    stepNum++

    if (s[j] >= g[i]) {
      steps.push({
        phase: 'matched',
        activeLine: 6,
        greed: g,
        size: s,
        i,
        j,
        matched: matched + 1,
        stepNum,
        message: `Cookie ${s[j]} satisfies child with greed ${g[i]} ✓`,
      })
      stepNum++

      matched++
      i++
    } else {
      steps.push({
        phase: 'skip_cookie',
        activeLine: 8,
        greed: g,
        size: s,
        i,
        j,
        matched,
        stepNum,
        message: `Cookie ${s[j]} too small for child needing ${g[i]}, skip`,
      })
      stepNum++
    }

    j++
  }

  steps.push({
    phase: 'done',
    activeLine: 9,
    greed: g,
    size: s,
    matched,
    stepNum,
    message: `Done! Matched ${matched} children with cookies.`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'sorted') return 'sort'
  if (phase === 'init_pointers') return 'init'
  if (phase === 'checking' || phase === 'matched' || phase === 'skip_cookie') return 'loop'
  if (phase === 'done') return 'return'
  return 'sort'
}

function CookieVisualization({ step }) {
  const greed = step?.greed || []
  const size = step?.size || []
  const i = step?.i ?? -1
  const j = step?.j ?? -1
  const matched = step?.matched ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Children Greed Factors
        </header>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
          {greed.map((val, idx) => {
            const isMatched = idx < matched
            const isCurrent = idx === i
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isCurrent ? 1.15 : 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                style={{
                  minWidth: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isMatched ? '#d1fae5' : isCurrent ? '#fef08a' : '#dbeafe',
                  border: `2px solid ${isMatched ? '#10b981' : isCurrent ? '#eab308' : '#3b82f6'}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isMatched ? '#047857' : isCurrent ? '#713f12' : '#1e40af',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Cookie Sizes
        </header>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
          {size.map((val, idx) => {
            const isUsed = idx < j
            const isCurrent = idx === j
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isCurrent ? 1.15 : 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                style={{
                  minWidth: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isUsed ? '#d1fae5' : isCurrent ? '#fef08a' : '#fecdd3',
                  border: `2px solid ${isUsed ? '#10b981' : isCurrent ? '#eab308' : '#f87171'}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isUsed ? '#047857' : isCurrent ? '#713f12' : '#dc2626',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 4,
        border: '1px solid #86efac',
        fontSize: 12,
        color: '#166534',
      }}>
        Matched: <span style={{ fontWeight: 600 }}>{matched}</span>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, greed, size, EXAMPLES, handleExampleClick, greedInput, sizeInput, setGreedInput, setSizeInput, handleReset }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            Greed Factors (comma-separated)
          </label>
          <input
            value={greedInput}
            onChange={(e) => { setGreedInput(e.target.value); handleReset() }}
            placeholder="e.g., 1,2,3"
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

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            Cookie Sizes (comma-separated)
          </label>
          <input
            value={sizeInput}
            onChange={(e) => { setSizeInput(e.target.value); handleReset() }}
            placeholder="e.g., 1,1"
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
      </div>

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

      <CookieVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 4, border: '1px solid #fcd34d' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 2 }}>
          Greedy Strategy
        </div>
        <div style={{ fontSize: 12, color: '#b45309', lineHeight: 1.4 }}>
          Sort both arrays. Match smallest greed with smallest cookies to maximize satisfied children.
        </div>
      </div>
    </section>
  )
}

export default function Problem455Visualizer() {
  const [greedInput, setGreedInput] = useState('1,2,3')
  const [sizeInput, setSizeInput] = useState('1,1')

  const { greed, size } = useMemo(() => {
    const parseArray = (str) => {
      if (!str || str.trim() === '') return []
      return str.split(',').map(s => {
        const n = parseInt(s.trim())
        return isNaN(n) ? 0 : n
      }).filter(n => n > 0)
    }

    return {
      greed: parseArray(greedInput),
      size: parseArray(sizeInput),
    }
  }, [greedInput, sizeInput])

  const steps = useMemo(
    () => generateSteps(greed, size).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [greed, size],
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
    setGreedInput(ex.greed.join(','))
    setSizeInput(ex.size.join(','))
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
          greed={greed}
          size={size}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          greedInput={greedInput}
          sizeInput={sizeInput}
          setGreedInput={setGreedInput}
          setSizeInput={setSizeInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    greed,
    size,
    greedInput,
    sizeInput,
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
