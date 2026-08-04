import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem497Visualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('random-point-in-non-overlapping-rectangles')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  4: 'init',


  8: 'loop',


  9: 'loop',


  11: 'loop',


  12: 'loop',


  16: 'done',


}

const EXAMPLES = getExamplesOr('random-point-in-non-overlapping-rectangles', [
  { label: 'Example', rects: [[-2, -2, -1, -1], [1, 0, 3, 0]] },
])

// Deterministic PRNG so the traced samples are stable across re-renders.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rectArea = ([x1, y1, x2, y2]) => (x2 - x1 + 1) * (y2 - y1 + 1)

function bisectLeft(arr, target) {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

function generateSteps(rects) {
  const steps = []
  const prefix = []
  let total = 0
  const points = []

  steps.push({
    activeLine: 4,
    rects, prefix: [], total: 0, points: [],
    message: 'Build prefix-sum of rectangle areas for weighted selection',
  })

  for (let i = 0; i < rects.length; i++) {
    total += rectArea(rects[i])
    prefix.push(total)
    steps.push({
      activeLine: 8,
      rects, prefix: [...prefix], total, points: [],
      activeRect: i,
      message: `Rect ${i} area = ${rectArea(rects[i])} → running total ${total}`,
    })
  }

  steps.push({
    activeLine: 9,
    rects, prefix: [...prefix], total, points: [],
    message: `Total weighted area = ${total}. Ready to sample.`,
  })

  // Deterministic sample picks tracing the pick() method.
  const rng = mulberry32(0x4977)
  const SAMPLES = 6
  for (let s = 0; s < SAMPLES; s++) {
    const target = 1 + Math.floor(rng() * total)
    steps.push({
      activeLine: 11,
      rects, prefix: [...prefix], total, points: [...points],
      target,
      message: `Sample ${s + 1}: random target = ${target} in [1, ${total}]`,
    })

    const i = bisectLeft(prefix, target)
    steps.push({
      activeLine: 12,
      rects, prefix: [...prefix], total, points: [...points],
      target, activeRect: i,
      message: `bisect_left → rectangle ${i} (prefix=${prefix[i]})`,
    })

    const [x1, y1, x2, y2] = rects[i]
    const x = x1 + Math.floor(rng() * (x2 - x1 + 1))
    const y = y1 + Math.floor(rng() * (y2 - y1 + 1))
    points.push({ x, y, rect: i })
    steps.push({
      activeLine: 16,
      rects, prefix: [...prefix], total, points: [...points],
      target, activeRect: i, lastPoint: { x, y },
      message: `Pick point (${x}, ${y}) uniformly inside rectangle ${i}`,
    })
  }

  steps.push({
    activeLine: 16,
    rects, prefix: [...prefix], total, points: [...points],
    done: true,
    message: `Done — ${SAMPLES} points sampled, frequency ∝ area`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return <div style={{ padding: 16, color: '#581c87', fontSize: 13 }}>Press play to sample random points.</div>
  }
  const { rects, prefix = [], total, points = [], activeRect, lastPoint } = step

  // Compute bounding box for the coordinate plot
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  rects.forEach(([x1, y1, x2, y2]) => {
    minX = Math.min(minX, x1); minY = Math.min(minY, y1)
    maxX = Math.max(maxX, x2); maxY = Math.max(maxY, y2)
  })
  const pad = 1
  minX -= pad; minY -= pad; maxX += pad; maxY += pad
  const W = 260, H = 200
  const sx = (x) => ((x - minX) / (maxX - minX)) * W
  const sy = (y) => H - ((y - minY) / (maxY - minY)) * H

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#581c87', fontStyle: 'italic' }}>
          Pick a rectangle weighted by its area (via prefix-sum + binary search), then a uniform point inside it.
        </div>
      </div>

      {/* Prefix-sum weight bar */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#581c87', marginBottom: 6 }}>Weighted ranges (prefix sum, total {total})</div>
        <div style={{ display: 'flex', width: '100%', height: 26, borderRadius: 4, overflow: 'hidden', border: '1px solid #8b5cf6' }}>
          {rects.map((r, i) => {
            const w = (rectArea(r) / total) * 100
            const isActive = i === activeRect
            return (
              <div key={i} style={{
                width: `${w}%`,
                backgroundColor: isActive ? '#8b5cf6' : (i % 2 ? '#ddd6fe' : '#ede9fe'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: isActive ? '#fff' : '#581c87',
                borderRight: '1px solid #c4b5fd',
              }}>R{i}</div>
            )
          })}
        </div>
        {step.target != null && (
          <div style={{ fontSize: 11, color: '#581c87', marginTop: 4 }}>target = {step.target} → {prefix.join(', ')}</div>
        )}
      </div>

      {/* Coordinate plot */}
      <svg width={W} height={H} style={{ border: '1px solid #c4b5fd', borderRadius: 4, backgroundColor: '#faf5ff' }}>
        {rects.map((r, i) => {
          const [x1, y1, x2, y2] = r
          const isActive = i === activeRect
          return (
            <rect key={i}
              x={sx(x1)} y={sy(y2)} width={sx(x2) - sx(x1) || 4} height={sy(y1) - sy(y2) || 4}
              fill={isActive ? 'rgba(139,92,246,0.30)' : 'rgba(196,181,253,0.25)'}
              stroke={isActive ? '#7c3aed' : '#a78bfa'} strokeWidth={isActive ? 2 : 1}
            />
          )
        })}
        {points.map((p, idx) => {
          const isLast = lastPoint && p.x === lastPoint.x && p.y === lastPoint.y && idx === points.length - 1
          return (
            <motion.circle key={idx}
              cx={sx(p.x)} cy={sy(p.y)} r={isLast ? 6 : 4}
              fill={isLast ? '#dc2626' : '#8b5cf6'}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            />
          )
        })}
      </svg>

      <motion.div
        style={{ padding: 14, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #8b5cf6', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#581c87' }}>Points sampled: {points.length}</div>
        <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 6 }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem497Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.rects).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    { id: 'viz', title: '🎲 Random Point', content: (<VisualizationPanel step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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

