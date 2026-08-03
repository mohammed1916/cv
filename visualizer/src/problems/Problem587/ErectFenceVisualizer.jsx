import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ErectFenceVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def outerTrees(self, points: List[List[int]]) -> List[List[int]]:' },
  { line: 3, text: '        if len(points) <= 2: return points' },
  { line: 4, text: '        ' },
  { line: 5, text: '        # Find the bottom-most point (or left if tie)' },
  { line: 6, text: '        start = min(points, key=lambda p: (p[1], p[0]))' },
  { line: 7, text: '        ' },
  { line: 8, text: '        # Sort by polar angle with respect to start point' },
  { line: 9, text: '        def polar_angle(p):' },
  { line: 10, text: '            dx, dy = p[0] - start[0], p[1] - start[1]' },
  { line: 11, text: '            return (atan2(dy, dx), dx*dx + dy*dy)' },
  { line: 12, text: '        ' },
  { line: 13, text: '        sorted_points = sorted(points, key=polar_angle)' },
  { line: 14, text: '        ' },
  { line: 15, text: '        hull = []' },
  { line: 16, text: '        for point in sorted_points:' },
  { line: 17, text: '            while (len(hull) >= 2 and' },
  { line: 18, text: '                   cross_product(hull[-2], hull[-1], point) < 0):' },
  { line: 19, text: '                hull.pop()' },
  { line: 20, text: '            hull.append(point)' },
  { line: 21, text: '        ' },
  { line: 22, text: '        return hull' },
]

const PATTERNS = ['find_start', 'sort_angle', 'build_hull', 'remove_concave', 'add_point', 'done']
const LINE_PATTERN_MAP = {
  6: 'find_start',
  13: 'sort_angle',
  15: 'build_hull',
  19: 'remove_concave',
  20: 'add_point',
  22: 'done',
}

// Helper function for cross product
function crossProduct(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

// Helper function for distance squared
function distanceSquared(p1, p2) {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2
}

// Helper function for angle in degrees
function getAngle(start, point) {
  const dx = point[0] - start[0]
  const dy = point[1] - start[1]
  return Math.atan2(dy, dx) * (180 / Math.PI)
}

// Graham scan algorithm
function grahamScan(points) {
  const steps = []

  if (!Array.isArray(points) || points.length <= 2) {
    steps.push({
      phase: 'done',
      activeLine: 22,
      relatedLines: [22],
      message: points.length <= 2 ? 'Input size <= 2, return as-is.' : 'Empty input.',
      hull: points || [],
      pointSet: points || [],
      done: true,
    })
    return steps
  }

  // Find starting point (bottom-most, then left-most)
  const startIdx = points.reduce((minIdx, p, idx) => {
    const minP = points[minIdx]
    return p[1] < minP[1] || (p[1] === minP[1] && p[0] < minP[0]) ? idx : minIdx
  }, 0)

  const start = points[startIdx]

  steps.push({
    phase: 'find_start',
    activeLine: 6,
    relatedLines: [5, 6],
    message: `Find starting point: [${start[0]}, ${start[1]}]`,
    hull: [start],
    pointSet: points,
    startIdx,
    done: false,
  })

  // Sort points by polar angle
  const sortedPoints = points
    .map((p, idx) => ({
      point: p,
      idx,
      angle: getAngle(start, p),
      dist: p === start ? 0 : distanceSquared(start, p),
    }))
    .sort((a, b) => {
      if (Math.abs(a.angle - b.angle) < 0.001) {
        return a.dist - b.dist
      }
      return a.angle - b.angle
    })
    .map(p => p.point)

  steps.push({
    phase: 'sort_angle',
    activeLine: 13,
    relatedLines: [8, 9, 10, 11, 13],
    message: 'Sort points by polar angle',
    hull: [start],
    pointSet: points,
    sortedPoints,
    done: false,
  })

  // Build hull using Graham scan
  const hull = [sortedPoints[0]]

  steps.push({
    phase: 'build_hull',
    activeLine: 15,
    relatedLines: [15],
    message: 'Initialize hull',
    hull: [...hull],
    pointSet: points,
    sortedPoints,
    done: false,
  })

  for (let i = 1; i < sortedPoints.length; i++) {
    const point = sortedPoints[i]

    steps.push({
      phase: 'add_point',
      activeLine: 20,
      relatedLines: [16, 20],
      message: `Process point [${point[0]}, ${point[1]}]`,
      hull: [...hull],
      currentPoint: point,
      pointSet: points,
      sortedPoints,
      processingIdx: i,
      done: false,
    })

    // Remove points that make a right turn
    while (hull.length >= 2) {
      const cross = crossProduct(hull[hull.length - 2], hull[hull.length - 1], point)
      if (cross < 0) {
        const removed = hull.pop()
        steps.push({
          phase: 'remove_concave',
          activeLine: 19,
          relatedLines: [17, 18, 19],
          message: `Remove [${removed[0]}, ${removed[1]}] (right turn detected)`,
          hull: [...hull],
          currentPoint: point,
          removed,
          pointSet: points,
          sortedPoints,
          processingIdx: i,
          done: false,
        })
      } else {
        break
      }
    }

    hull.push(point)
    steps.push({
      phase: 'add_point',
      activeLine: 20,
      relatedLines: [20],
      message: `Added [${point[0]}, ${point[1]}] to hull`,
      hull: [...hull],
      currentPoint: point,
      pointSet: points,
      sortedPoints,
      processingIdx: i,
      done: false,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 22,
    relatedLines: [22],
    message: `Convex hull complete. Points: ${hull.length}`,
    hull: [...hull],
    pointSet: points,
    done: true,
  })

  return steps
}

function VisualizationCanvas({ points, hull, step, width = 400, height = 400 }) {
  const padding = 40
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  if (!points || points.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: 12 }}>No points to display</div>
      </div>
    )
  }

  // Find bounds
  const minX = Math.min(...points.map(p => p[0]))
  const maxX = Math.max(...points.map(p => p[0]))
  const minY = Math.min(...points.map(p => p[1]))
  const maxY = Math.max(...points.map(p => p[1]))

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const scaleX = innerWidth / rangeX
  const scaleY = innerHeight / rangeY

  // Convert point to SVG coordinates
  const toSVG = (p) => ({
    x: padding + (p[0] - minX) * scaleX,
    y: height - padding - (p[1] - minY) * scaleY,
  })

  const currentPoint = step?.currentPoint
  const removed = step?.removed
  const hullSet = new Set(hull?.map(p => JSON.stringify(p)))

  return (
    <svg width={width} height={height} className="fence-svg" viewBox={`0 0 ${width} ${height}`}>
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid)" />

      {/* Hull edges */}
      {hull && hull.length > 1 && (
        <g>
          {Array.from({ length: hull.length }).map((_, i) => {
            const p1 = toSVG(hull[i])
            const p2 = toSVG(hull[(i + 1) % hull.length])
            return (
              <line
                key={`hull-edge-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#a78bfa"
                strokeWidth="2"
                opacity="0.7"
                className="fence-hull-edge"
              />
            )
          })}
        </g>
      )}

      {/* Hull points */}
      {hull &&
        hull.map((p, i) => {
          const svg = toSVG(p)
          const isCurrentEnd = currentPoint && currentPoint[0] === p[0] && currentPoint[1] === p[1]
          return (
            <g key={`hull-point-${i}`}>
              <circle
                cx={svg.x}
                cy={svg.y}
                r={isCurrentEnd ? 7 : 5}
                fill="#a78bfa"
                opacity={isCurrentEnd ? 1 : 0.8}
                className="fence-point"
              />
            </g>
          )
        })}

      {/* All points */}
      {points.map((p, i) => {
        const svg = toSVG(p)
        const isInHull = hullSet.has(JSON.stringify(p))
        const isCurrent = currentPoint && currentPoint[0] === p[0] && currentPoint[1] === p[1]
        const isRemoved = removed && removed[0] === p[0] && removed[1] === p[1]

        if (isInHull) return null // Already drawn above

        return (
          <circle
            key={`point-${i}`}
            cx={svg.x}
            cy={svg.y}
            r={isCurrent ? 6 : isRemoved ? 4 : 3}
            fill={isRemoved ? '#ef4444' : isCurrent ? '#60a5fa' : '#94a3b8'}
            opacity={isRemoved ? 0.6 : isCurrent ? 1 : 0.6}
            className="fence-point"
          />
        )
      })}
    </svg>
  )
}

function VisualizationPanel({ points, hull, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fence-canvas">
        <VisualizationCanvas points={points} hull={hull} step={step} width={400} height={400} />
      </div>

      <div className="fence-legend">
        <div className="fence-legend-item">
          <div className="fence-legend-dot" style={{ backgroundColor: '#a78bfa' }}></div>
          <span>Hull Points</span>
        </div>
        <div className="fence-legend-item">
          <div className="fence-legend-dot" style={{ backgroundColor: '#60a5fa' }}></div>
          <span>Current</span>
        </div>
        <div className="fence-legend-item">
          <div className="fence-legend-dot" style={{ backgroundColor: '#94a3b8' }}></div>
          <span>Interior</span>
        </div>
        <div className="fence-legend-item">
          <div className="fence-legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Removed</span>
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '1px solid #475569',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Status</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>{step.message}</div>
        </motion.div>
      )}

      {step?.hull && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '1px solid #a78bfa',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Convex Hull</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>
            {step.hull.map((p, i) => `[${p[0]},${p[1]}]`).join(' → ')}
          </div>
        </motion.div>
      )}

      {step?.hull && (
        <div className="fence-stats">
          <div className="fence-stat-item">
            <div className="fence-stat-label">Total Points</div>
            <div className="fence-stat-value">{points?.length || 0}</div>
          </div>
          <div className="fence-stat-item">
            <div className="fence-stat-label">Hull Points</div>
            <div className="fence-stat-value">{step.hull.length}</div>
          </div>
          <div className="fence-stat-item">
            <div className="fence-stat-label">Interior</div>
            <div className="fence-stat-value">{(points?.length || 0) - step.hull.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ErectFenceVisualizer() {
  const examples = useMemo(() => getExamples('erect-fence') || [], [])
  const [pointsInput, setPointsInput] = useState('[[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]]')

  // Parse points from input
  const points = useMemo(() => {
    try {
      const parsed = JSON.parse(pointsInput)
      if (Array.isArray(parsed) && parsed.every(p => Array.isArray(p) && p.length === 2)) {
        return parsed
      }
    } catch {
      // Invalid input
    }
    return []
  }, [pointsInput])

  const steps = useMemo(() => grahamScan(points), [points])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setPointsInput(JSON.stringify(ex.points || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
        ),
      },
      {
        id: 'viz',
        title: '⬠ Convex Hull',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                Points (GeoJSON format)
              </div>
              <textarea
                value={pointsInput}
                onChange={(e) => {
                  setPointsInput(e.target.value)
                  handleReset()
                }}
                placeholder='[[1,1],[2,2],[2,0]]'
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  resize: 'vertical',
                }}
              />
            </div>

            <VisualizationPanel points={points} hull={step?.hull || []} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, showPatternOverlay, activeLineDom, pointsInput, points, examples, applyExample, handleReset]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        defaultLayout={{ code: 0.4, viz: 0.6 }}
        panelMinSize={0.2}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>Graham Scan Visualization</h3>
            <button
              onClick={() => setShowPatternOverlay(!showPatternOverlay)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #475569',
                backgroundColor: showPatternOverlay ? '#a78bfa' : '#1e293b',
                color: showPatternOverlay ? '#0c0a1d' : '#e2e8f0',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {showPatternOverlay ? 'Hide Patterns' : 'Show Patterns'}
            </button>
          </div>

          <PlaybackControls
            isPlaying={isPlaying}
            isDone={isDone}
            speed={speed}
            stepIndex={stepIndex}
            totalSteps={steps.length}
            onPlayToggle={togglePlay}
            onStepForward={stepForward}
            onStepBack={stepBack}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onStepJump={setStepIndex}
          />

          {step?.done && (
            <motion.div
              style={{
                padding: 16,
                backgroundColor: '#1e293b',
                borderRadius: 6,
                border: '2px solid #a78bfa',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Complete</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#a78bfa' }}>
                Convex Hull: {step.hull.length} points from {points.length} total
              </div>
            </motion.div>
          )}
        </div>
      </DockableWorkspace>
    </div>
  )
}
