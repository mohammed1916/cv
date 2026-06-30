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
import './Problem350.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['checking', 'counting', 'done', 'match_found', 'no_match', 'ready_to_match', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  4: 'counting',
  6: 'ready_to_match',
  7: 'checking',
  9: 'match_found',
  10: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def intersect(nums1: list, nums2: list) -> list:' },
  { line: 2, text: '    freq = {}' },
  { line: 3, text: '    for num in nums1:' },
  { line: 4, text: '        freq[num] = freq.get(num, 0) + 1' },
  { line: 5, text: '    result = []' },
  { line: 6, text: '    for num in nums2:' },
  { line: 7, text: '        if num in freq and freq[num] > 0:' },
  { line: 8, text: '            result.append(num)' },
  { line: 9, text: '            freq[num] -= 1' },
  { line: 10, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('intersection-of-two-arrays-ii') || [
  { label: 'Example 1: Overlap', nums1: [1, 2, 2, 1], nums2: [2, 2] },
  { label: 'Example 2: No overlap', nums1: [4, 9, 5], nums2: [9, 4, 9, 8, 4] },
  { label: 'Example 3: Duplicates', nums1: [1, 2, 2, 1, 2, 2], nums2: [2] },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2] },
  { id: 'count', label: 'Count Frequencies', lines: [3, 4] },
  { id: 'match', label: 'Find Matches', lines: [6, 7, 8, 9] },
  { id: 'return', label: 'Return', lines: [10] },
]

function generateSteps(nums1, nums2) {
  const steps = []

  if (!Array.isArray(nums1) || !Array.isArray(nums2)) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums1: [],
      nums2: [],
      freq: {},
      result: [],
      currentIdx: -1,
      stepNum: 0,
      message: 'Invalid input arrays.',
    }]
  }

  if (nums1.length === 0 || nums2.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums1,
      nums2,
      freq: {},
      result: [],
      currentIdx: -1,
      stepNum: 0,
      message: 'Empty array - result is empty.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    nums1: [...nums1],
    nums2: [...nums2],
    freq: {},
    result: [],
    currentIdx: -1,
    stepNum: 0,
    message: `Starting: nums1=${JSON.stringify(nums1)}, nums2=${JSON.stringify(nums2)}`,
  })

  const freq = {}
  for (const num of nums1) {
    freq[num] = (freq[num] || 0) + 1
  }

  steps.push({
    phase: 'counting',
    activeLine: 4,
    nums1: [...nums1],
    nums2: [...nums2],
    freq: { ...freq },
    result: [],
    currentIdx: -1,
    stepNum: 1,
    message: `Built frequency map from nums1: ${JSON.stringify(freq)}`,
  })

  steps.push({
    phase: 'ready_to_match',
    activeLine: 6,
    nums1: [...nums1],
    nums2: [...nums2],
    freq: { ...freq },
    result: [],
    currentIdx: -1,
    stepNum: 2,
    message: `Now matching elements from nums2...`,
  })

  let result = []
  let stepNum = 3
  let currentIdx = -1

  for (let i = 0; i < nums2.length; i++) {
    const num = nums2[i]
    currentIdx = i

    steps.push({
      phase: 'checking',
      activeLine: 7,
      nums1: [...nums1],
      nums2: [...nums2],
      freq: { ...freq },
      result: [...result],
      currentIdx: i,
      stepNum,
      message: `Checking nums2[${i}]=${num}. In map? ${num in freq}, Count > 0? ${freq[num] > 0}`,
    })
    stepNum++

    if (num in freq && freq[num] > 0) {
      result.push(num)
      freq[num]--

      steps.push({
        phase: 'match_found',
        activeLine: 9,
        nums1: [...nums1],
        nums2: [...nums2],
        freq: { ...freq },
        result: [...result],
        currentIdx: i,
        stepNum,
        message: `Match found! Added ${num} to result. Frequency: ${freq[num] + 1} -> ${freq[num]}`,
      })
      stepNum++
    } else {
      steps.push({
        phase: 'no_match',
        activeLine: 7,
        nums1: [...nums1],
        nums2: [...nums2],
        freq: { ...freq },
        result: [...result],
        currentIdx: i,
        stepNum,
        message: `No match for ${num}.`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 10,
    nums1: [...nums1],
    nums2: [...nums2],
    freq: { ...freq },
    result: [...result],
    currentIdx: -1,
    stepNum,
    message: `Intersection found: ${JSON.stringify(result)}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'counting') return 'count'
  if (phase === 'ready_to_match' || phase === 'checking' || phase === 'match_found' || phase === 'no_match') return 'match'
  if (phase === 'done') return 'return'
  return 'init'
}

function FrequencyMap({ step }) {
  if (!step) return null
  const entries = Object.entries(step.freq || {}).sort((a, b) => a[0] - b[0])

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Frequency Map (from nums1)
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            No elements yet
          </div>
        ) : (
          entries.map(([key, count]) => (
            <motion.div
              key={key}
              style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                  {key}
                </span>
                <span style={{ color: '#64748b', fontWeight: 500 }}>
                  count: {count}
                </span>
              </div>
              <motion.div
                style={{
                  height: 28,
                  backgroundColor: '#e0f2fe',
                  borderRadius: 4,
                  border: '2px solid #0ea5e9',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  ■ ■ ■ ■ ■ ■
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  )
}

function InputArrays({ step }) {
  if (!step) return null

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Input Arrays
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            nums1
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 50 }}>
            {step.nums1.map((num, idx) => (
              <motion.div
                key={`nums1-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  minWidth: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#dbeafe',
                  border: '2px solid #3b82f6',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1e40af',
                }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            nums2
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 50 }}>
            <AnimatePresence>
              {step.nums2.map((num, idx) => {
                const isCurrentIdx = step.currentIdx === idx
                const bgColor = isCurrentIdx ? '#fef08a' : '#f3e8ff'
                const borderColor = isCurrentIdx ? '#eab308' : '#d8b4fe'

                return (
                  <motion.div
                    key={`nums2-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: isCurrentIdx ? 1.1 : 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      minWidth: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isCurrentIdx ? '#713f12' : '#6b21a8',
                      boxShadow: isCurrentIdx ? '0 0 12px rgba(234, 179, 8, 0.3)' : 'none',
                    }}
                  >
                    {num}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultBuilder({ step }) {
  if (!step) return null
  const result = step.result || []

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Result: [{result.length} element{result.length !== 1 ? 's' : ''}]
      </header>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
        <AnimatePresence>
          {result.map((num, i) => (
            <motion.div
              key={`result-${i}`}
              initial={{ opacity: 0, scale: 0.6, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                color: '#15803d',
              }}
            >
              {num}
              <span style={{
                position: 'absolute',
                top: -20,
                fontSize: 10,
                color: '#64748b',
                fontWeight: 500,
              }}>
                [{i}]
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Finding Common Members
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Like a roster check: count all members in Group 1, then see which from Group 2 are also in Group 1 (respecting duplicates).
        </div>
      </div>
    </section>
  )
}

function VisualizationPanel({ step, nums1, nums2, EXAMPLES, handleExampleClick, nums1Input, setNums1Input, nums2Input, setNums2Input, handleReset }) {
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
            nums1 (comma-separated)
          </label>
          <input
            value={nums1Input}
            onChange={(e) => { setNums1Input(e.target.value); handleReset() }}
            placeholder="e.g., 1,2,2,1"
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
            nums2 (comma-separated)
          </label>
          <input
            value={nums2Input}
            onChange={(e) => { setNums2Input(e.target.value); handleReset() }}
            placeholder="e.g., 2,2"
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <FrequencyMap step={step} />
        <InputArrays step={step} />
      </div>

      <ResultBuilder step={step} />
    </section>
  )
}

export default function Problem350Visualizer() {
  const [nums1Input, setNums1Input] = useState('1,2,2,1')
  const [nums2Input, setNums2Input] = useState('2,2')

  const { nums1, nums2 } = useMemo(() => {
    const parse = (str) => {
      if (!str || str.trim() === '') return []
      return str.split(',').map(s => {
        const n = parseInt(s.trim())
        return isNaN(n) ? 0 : n
      })
    }
    return {
      nums1: parse(nums1Input),
      nums2: parse(nums2Input),
    }
  }, [nums1Input, nums2Input])

  const steps = useMemo(
    () => generateSteps(nums1, nums2).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums1, nums2],
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
    setNums1Input(ex.nums1.join(','))
    setNums2Input(ex.nums2.join(','))
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
          nums1={nums1}
          nums2={nums2}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          nums1Input={nums1Input}
          setNums1Input={setNums1Input}
          nums2Input={nums2Input}
          setNums2Input={setNums2Input}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    nums1,
    nums2,
    nums1Input,
    nums2Input,
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
