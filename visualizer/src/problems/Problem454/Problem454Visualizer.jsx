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
import { getExamplesOr } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['building_map', 'checking', 'done', 'found', 'map_complete', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  6: 'building_map',
  7: 'map_complete',
  11: 'checking',
  12: 'found',
  13: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def fourSumCount(nums1, nums2, nums3, nums4) -> int:' },
  { line: 2, text: '    sum_map = {}' },
  { line: 3, text: '    for n1 in nums1:' },
  { line: 4, text: '        for n2 in nums2:' },
  { line: 5, text: '            s = n1 + n2' },
  { line: 6, text: '            sum_map[s] = sum_map.get(s, 0) + 1' },
  { line: 7, text: '    count = 0' },
  { line: 8, text: '    for n3 in nums3:' },
  { line: 9, text: '        for n4 in nums4:' },
  { line: 10, text: '            target = -(n3 + n4)' },
  { line: 11, text: '            if target in sum_map:' },
  { line: 12, text: '                count += sum_map[target]' },
  { line: 13, text: '    return count' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('4sum-ii', [
  { label: 'Example 1', nums1: [1, 2], nums2: [-2, -1], nums3: [-1, 2], nums4: [0, 2], expected: 2 },
  { label: 'Example 2', nums1: [0], nums2: [0], nums3: [0], nums4: [0], expected: 1 },
  { label: 'Example 3', nums1: [1, 0], nums2: [1, 0], nums3: [-1, 0], nums4: [0, 1], expected: 5 },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2] },
  { id: 'build', label: 'Build Pair Map', lines: [3, 4, 5, 6] },
  { id: 'count', label: 'Count Matches', lines: [7, 8, 9, 10, 11, 12] },
  { id: 'return', label: 'Return', lines: [13] },
]

function generateSteps(nums1, nums2, nums3, nums4) {
  const steps = []

  if (!Array.isArray(nums1) || !Array.isArray(nums2) || !Array.isArray(nums3) || !Array.isArray(nums4)) {
    return [{
      phase: 'done',
      activeLine: 1,
      sumMap: {},
      count: 0,
      stepNum: 0,
      message: 'Invalid input arrays.',
    }]
  }

  if (nums1.length === 0 || nums2.length === 0 || nums3.length === 0 || nums4.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      sumMap: {},
      count: 0,
      stepNum: 0,
      message: 'Empty array detected.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    sumMap: {},
    count: 0,
    stepNum: 0,
    message: `Building pair sum map from nums1 (${nums1.length}), nums2 (${nums2.length})`,
  })

  const sumMap = {}
  let stepNum = 1

  for (const n1 of nums1) {
    for (const n2 of nums2) {
      const s = n1 + n2
      sumMap[s] = (sumMap[s] || 0) + 1

      steps.push({
        phase: 'building_map',
        activeLine: 6,
        sumMap: { ...sumMap },
        count: 0,
        n1,
        n2,
        sum: s,
        stepNum,
        message: `nums1=${n1}, nums2=${n2}: sum=${s}. Map[${s}]=${sumMap[s]}`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'map_complete',
    activeLine: 7,
    sumMap: { ...sumMap },
    count: 0,
    stepNum,
    message: `Pair sum map built with ${Object.keys(sumMap).length} unique sums`,
  })
  stepNum++

  let count = 0

  for (const n3 of nums3) {
    for (const n4 of nums4) {
      const target = -(n3 + n4)

      steps.push({
        phase: 'checking',
        activeLine: 11,
        sumMap: { ...sumMap },
        count,
        n3,
        n4,
        target,
        n3n4Sum: n3 + n4,
        stepNum,
        message: `nums3=${n3}, nums4=${n4}: need sum=${target} (from -(${n3 + n4}))`,
      })
      stepNum++

      if (target in sumMap) {
        const added = sumMap[target]
        count += added

        steps.push({
          phase: 'found',
          activeLine: 12,
          sumMap: { ...sumMap },
          count,
          n3,
          n4,
          target,
          added,
          stepNum,
          message: `Found ${added} pairs! count+=${added} -> ${count}`,
        })
        stepNum++
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 13,
    sumMap: { ...sumMap },
    count,
    stepNum,
    message: `Total quadruples: ${count}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'building_map' || phase === 'map_complete') return 'build'
  if (phase === 'checking' || phase === 'found') return 'count'
  if (phase === 'done') return 'return'
  return 'init'
}

function ArrayInput({ label, arr, highlight }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {arr.map((val, idx) => {
          const isHighlight = val === highlight
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isHighlight ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isHighlight ? '#fef08a' : '#e0e7ff',
                border: `2px solid ${isHighlight ? '#eab308' : '#818cf8'}`,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isHighlight ? '#713f12' : '#3730a3',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SumMapDisplay({ sumMap }) {
  const entries = Object.entries(sumMap)
    .map(([sum, count]) => [Number(sum), count])
    .sort((a, b) => a[0] - b[0])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Pair Sum Map ({entries.length} entries)
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
        {entries.map(([sum, count]) => (
          <motion.div
            key={sum}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: '#e0f2fe',
              border: '1px solid #0ea5e9',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#0c4a6e' }}>{sum}</span>
            <span style={{ color: '#0c4a6e' }}>{count}x</span>
          </motion.div>
        ))}
        {entries.length === 0 && (
          <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Empty</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, nums1, nums2, nums3, nums4, EXAMPLES, handleExampleClick, input1, input2, input3, input4, setInput1, setInput2, setInput3, setInput4, handleReset }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'nums1', val: input1, set: setInput1, nums: nums1 },
          { label: 'nums2', val: input2, set: setInput2, nums: nums2 },
          { label: 'nums3', val: input3, set: setInput3, nums: nums3 },
          { label: 'nums4', val: input4, set: setInput4, nums: nums4 },
        ].map(({ label, val, set, nums }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
              {label}
            </label>
            <input
              value={val}
              onChange={(e) => { set(e.target.value); handleReset() }}
              placeholder="e.g., 1,2"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ArrayInput label="nums1" arr={step?.nums1 || nums1} highlight={step?.n1} />
          <ArrayInput label="nums2" arr={step?.nums2 || nums2} highlight={step?.n2} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ArrayInput label="nums3" arr={step?.nums3 || nums3} highlight={step?.n3} />
          <ArrayInput label="nums4" arr={step?.nums4 || nums4} highlight={step?.n4} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <SumMapDisplay sumMap={step?.sumMap || {}} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
            Count of Quadruples
          </header>
          <div style={{
            padding: 16,
            backgroundColor: '#dcfce7',
            borderRadius: 4,
            border: '2px solid #22c55e',
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#15803d',
            }}>
              {step?.count ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Quadruple Matching
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Build map of sums from two arrays, then check if complement exists from the other two.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem454Visualizer() {
  const [input1, setInput1] = useState('1,2')
  const [input2, setInput2] = useState('-2,-1')
  const [input3, setInput3] = useState('-1,2')
  const [input4, setInput4] = useState('0,2')

  const { nums1, nums2, nums3, nums4 } = useMemo(() => {
    const parse = (str) => {
      if (!str || str.trim() === '') return []
      return str.split(',').map(s => {
        const n = parseInt(s.trim())
        return isNaN(n) ? 0 : n
      })
    }
    return {
      nums1: parse(input1),
      nums2: parse(input2),
      nums3: parse(input3),
      nums4: parse(input4),
    }
  }, [input1, input2, input3, input4])

  const steps = useMemo(
    () => generateSteps(nums1, nums2, nums3, nums4).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums1, nums2, nums3, nums4],
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
    setInput1(ex.nums1.join(','))
    setInput2(ex.nums2.join(','))
    setInput3(ex.nums3.join(','))
    setInput4(ex.nums4.join(','))
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
          nums3={nums3}
          nums4={nums4}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          input1={input1}
          input2={input2}
          input3={input3}
          input4={input4}
          setInput1={setInput1}
          setInput2={setInput2}
          setInput3={setInput3}
          setInput4={setInput4}
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
    nums3,
    nums4,
    input1,
    input2,
    input3,
    input4,
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
