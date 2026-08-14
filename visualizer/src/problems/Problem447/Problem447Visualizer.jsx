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

import ManualInputPanel from '../../components/shared/ManualInputPanel'
const PATTERNS = ['boomerang_found', 'checking', 'done', 'outer_loop', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  4: 'outer_loop',
  9: 'checking',
  11: 'boomerang_found',
  13: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def numberOfBoomerangs(points: list) -> int:' },
  { line: 2, text: '    count = 0' },
  { line: 3, text: '    for i in range(len(points)):' },
  { line: 4, text: '        dist_map = {}' },
  { line: 5, text: '        for j in range(len(points)):' },
  { line: 6, text: '            if i == j: continue' },
  { line: 7, text: '            dx = points[i][0] - points[j][0]' },
  { line: 8, text: '            dy = points[i][1] - points[j][1]' },
  { line: 9, text: '            dist_sq = dx*dx + dy*dy' },
  { line: 10, text: '            if dist_sq in dist_map:' },
  { line: 11, text: '                count += 2 * dist_map[dist_sq]' },
  { line: 12, text: '            dist_map[dist_sq] = dist_map.get(dist_sq, 0) + 1' },
  { line: 13, text: '    return count' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('number-of-boomerangs', [
  { label: 'Example 1', points: [[0, 0], [1, 0], [2, 0]], expected: 2 },
  { label: 'Example 2', points: [[1, 1], [2, 2], [3, 3]], expected: 2 },
  { label: 'Example 3', points: [[0, 0], [1, 1], [1, 1]], expected: 2 },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2] },
  { id: 'outer', label: 'Outer Loop', lines: [3, 4] },
  { id: 'inner', label: 'Inner Loop', lines: [5, 6, 7, 8, 9] },
  { id: 'count', label: 'Count Boomerangs', lines: [10, 11, 12] },
  { id: 'return', label: 'Return', lines: [13] },
]

function generateSteps(points) {
  const steps = []

  if (!Array.isArray(points) || points.length < 3) {
    return [{
      phase: 'done',
      activeLine: 1,
      points: points || [],
      count: 0,
      stepNum: 0,
      message: 'Need at least 3 points.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    points: [...points],
    count: 0,
    stepNum: 0,
    message: `Starting with ${points.length} points`,
  })

  let count = 0
  let stepNum = 1

  for (let i = 0; i < points.length; i++) {
    steps.push({
      phase: 'outer_loop',
      activeLine: 4,
      points: [...points],
      count,
      centerIdx: i,
      distMap: {},
      stepNum,
      message: `Iteration i=${i} (center point)`,
    })
    stepNum++

    let distMap = {}

    for (let j = 0; j < points.length; j++) {
      if (i === j) continue

      const dx = points[i][0] - points[j][0]
      const dy = points[i][1] - points[j][1]
      const distSq = dx * dx + dy * dy

      steps.push({
        phase: 'checking',
        activeLine: 9,
        points: [...points],
        count,
        centerIdx: i,
        otherIdx: j,
        distMap: { ...distMap },
        distSq,
        stepNum,
        message: `j=${j}: distance²=${distSq}`,
      })
      stepNum++

      if (distSq in distMap) {
        const added = 2 * distMap[distSq]
        count += added

        steps.push({
          phase: 'boomerang_found',
          activeLine: 11,
          points: [...points],
          count,
          centerIdx: i,
          otherIdx: j,
          distMap: { ...distMap },
          distSq,
          added,
          stepNum,
          message: `Found ${distMap[distSq]} point(s) at same distance! Added ${added}. Count=${count}`,
        })
        stepNum++
      }

      distMap[distSq] = (distMap[distSq] || 0) + 1
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 13,
    points: [...points],
    count,
    stepNum,
    message: `Total boomerangs: ${count}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'outer_loop') return 'outer'
  if (phase === 'checking') return 'inner'
  if (phase === 'boomerang_found') return 'count'
  if (phase === 'done') return 'return'
  return 'init'
}

function PointsVisualizer({ points, centerIdx, otherIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Points (2D Plot)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {points.map((point, idx) => {
          const isCenter = idx === centerIdx
          const isOther = idx === otherIdx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isCenter ? 1.2 : isOther ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 60,
                padding: '8px',
                backgroundColor: isCenter ? '#fecaca' : isOther ? '#fef08a' : '#dbeafe',
                border: `2px solid ${isCenter ? '#dc2626' : isOther ? '#eab308' : '#3b82f6'}`,
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: isCenter ? '#7f1d1d' : isOther ? '#713f12' : '#1e40af',
                textAlign: 'center',
              }}
            >
              ({point[0]}, {point[1]})
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function DistanceMap({ distMap }) {
  const entries = Object.entries(distMap).sort((a, b) => Number(a[0]) - Number(b[0]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Distance Map (center iteration)
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Empty</div>
        ) : (
          entries.map(([distSq, count]) => (
            <motion.div
              key={distSq}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e0f2fe',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#1e40af',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>d² = {distSq}</span>
              <span>{count} point{count !== 1 ? 's' : ''}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, points, EXAMPLES, handleExampleClick, pointsInput, setPointsInput, handleReset }) {
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
          Points (format: [x,y] separated by spaces, e.g., [0,0] [1,0] [2,0])
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={pointsInput}
            onChange={(e) => { setPointsInput(e.target.value); handleReset() }}
            placeholder="[0,0] [1,0] [2,0]"
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
        <PointsVisualizer
          points={step?.points || []}
          centerIdx={step?.centerIdx}
          otherIdx={step?.otherIdx}
        />
        <DistanceMap distMap={step?.distMap || {}} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Count: {step?.count ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          A boomerang is 3 points where the distance from A to B equals the distance from A to C.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem447Visualizer() {
  const [pointsInput, setPointsInput] = useState('[0,0] [1,0] [2,0]')

  const points = useMemo(() => {
    try {
      const regex = /\[(\d+),(\d+)\]/g
      const matches = []
      let match
      while ((match = regex.exec(pointsInput)) !== null) {
        matches.push([parseInt(match[1]), parseInt(match[2])])
      }
      return matches
    } catch {
      return []
    }
  }, [pointsInput])

  const steps = useMemo(
    () => generateSteps(points).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [points],
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
    const str = ex.points.map(p => `[${p[0]},${p[1]}]`).join(' ')
    setPointsInput(str)
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
          points={points}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          pointsInput={pointsInput}
          setPointsInput={setPointsInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    points,
    pointsInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"points","label":"points","type":"string"}]}
        values={{ points: pointsInput }}
        onChange={(k, v) => { if (k === 'points') setPointsInput(v); handleReset() }}
        showExamples={false}
      />

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
