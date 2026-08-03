import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './SelfCrossingVisualizer.css'

// LeetCode 335. Self Crossing — classic O(n) three-case comparison.
const SOLUTION_CODE = [
  { line: 1, text: 'def isSelfCrossing(x):' },
  { line: 2, text: '    n = len(x)' },
  { line: 3, text: '    for i in range(3, n):' },
  { line: 4, text: '        # Case 1: line i crosses line i-3' },
  { line: 5, text: '        if x[i] >= x[i-2] and x[i-1] <= x[i-3]:' },
  { line: 6, text: '            return True' },
  { line: 7, text: '        # Case 2: line i touches line i-4' },
  { line: 8, text: '        if i >= 4 and x[i-1] == x[i-3] \\' },
  { line: 9, text: '                and x[i] + x[i-4] >= x[i-2]:' },
  { line: 10, text: '            return True' },
  { line: 11, text: '        # Case 3: line i crosses line i-5' },
  { line: 12, text: '        if i >= 5 and x[i-2] >= x[i-4] \\' },
  { line: 13, text: '                and x[i] + x[i-4] >= x[i-2] \\' },
  { line: 14, text: '                and x[i-1] <= x[i-3] \\' },
  { line: 15, text: '                and x[i-1] + x[i-5] >= x[i-3]:' },
  { line: 16, text: '            return True' },
  { line: 17, text: '    return False' },
]

// Counter-clockwise direction cycle in math coordinates (y up): N, W, S, E.
const DIRS = [
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
]
const DIR_NAMES = ['North', 'West', 'South', 'East']

function computePoints(x) {
  const pts = [{ x: 0, y: 0 }]
  for (let i = 0; i < x.length; i++) {
    const d = DIRS[i % 4]
    const prev = pts[pts.length - 1]
    pts.push({ x: prev.x + d.dx * x[i], y: prev.y + d.dy * x[i] })
  }
  return pts
}

function computeBounds(pts) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  if (!Number.isFinite(minX)) return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
  return { minX, maxX, minY, maxY }
}

// Intersection point of two axis-aligned segments a-b and c-d, or null.
function segIntersect(a, b, c, d) {
  const r = { x: b.x - a.x, y: b.y - a.y }
  const s = { x: d.x - c.x, y: d.y - c.y }
  const qp = { x: c.x - a.x, y: c.y - a.y }
  const denom = r.x * s.y - r.y * s.x
  if (denom === 0) {
    // Parallel — only meaningful when collinear and overlapping.
    if (qp.x * r.y - qp.y * r.x !== 0) return null
    if (a.x === b.x && a.x === c.x) {
      const lo = Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y))
      const hi = Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y))
      return lo <= hi ? { x: a.x, y: (lo + hi) / 2 } : null
    }
    if (a.y === b.y && a.y === c.y) {
      const lo = Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x))
      const hi = Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x))
      return lo <= hi ? { x: (lo + hi) / 2, y: a.y } : null
    }
    return null
  }
  const t = (qp.x * s.y - qp.y * s.x) / denom
  const u = (qp.x * r.y - qp.y * r.x) / denom
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: a.x + t * r.x, y: a.y + t * r.y }
  }
  return null
}

// Find where segment i (points[i] -> points[i+1]) meets an earlier, non-adjacent segment.
function findCrossingPoint(points, i) {
  const a = points[i]
  const b = points[i + 1]
  for (let j = 0; j <= i - 2; j++) {
    const hit = segIntersect(a, b, points[j], points[j + 1])
    if (hit) return hit
  }
  return null
}

function generateSteps(distances) {
  const x = distances
  const n = x.length
  const full = computePoints(x)
  const bounds = computeBounds(full)
  const steps = []

  let crossed = false
  let crossCase = null
  let crossPoint = null

  const snap = (upto, extra) => ({
    distances: x,
    points: full.slice(0, upto).map((p) => ({ x: p.x, y: p.y })),
    bounds,
    crossingDetected: crossed,
    crossingCase: crossCase,
    crossingPoint: crossPoint ? { ...crossPoint } : null,
    moveIndex: -1,
    refIndices: [],
    ...extra,
  })

  steps.push({
    phase: 'init',
    activeLine: 1,
    relatedLines: [1, 2],
    message: `Start at the origin (0, 0). The path has ${n} move(s); we head North, West, South, East and turn counter-clockwise after each.`,
    ...snap(1),
  })

  for (let i = 0; i < n && !crossed; i++) {
    const p = full[i + 1]
    steps.push({
      phase: 'move',
      activeLine: 3,
      relatedLines: [3],
      message: `Move ${i}: go ${DIR_NAMES[i % 4]} for x[${i}] = ${x[i]} unit(s), reaching (${p.x}, ${p.y}).`,
      ...snap(i + 2, { moveIndex: i, refIndices: [i] }),
    })

    if (i < 3) {
      steps.push({
        phase: 'note',
        activeLine: 3,
        relatedLines: [2, 3],
        message: `Only ${i + 1} segment(s) drawn — a self-crossing needs at least 4 segments, so no check yet.`,
        ...snap(i + 2, { moveIndex: i, refIndices: [i] }),
      })
      continue
    }

    // Case 1: current line crosses the line three steps back.
    const c1 = x[i] >= x[i - 2] && x[i - 1] <= x[i - 3]
    steps.push({
      phase: 'check',
      activeLine: 5,
      relatedLines: [4, 5],
      message: `Case 1: x[${i}]=${x[i]} >= x[${i - 2}]=${x[i - 2]} (${x[i] >= x[i - 2]}) and x[${i - 1}]=${x[i - 1]} <= x[${i - 3}]=${x[i - 3]} (${x[i - 1] <= x[i - 3]}) -> ${c1}.`,
      ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3] }),
    })
    if (c1) {
      crossed = true
      crossCase = 1
      crossPoint = findCrossingPoint(full, i)
      steps.push({
        phase: 'crossing',
        activeLine: 6,
        relatedLines: [5, 6],
        message: `Self-crossing detected by Case 1 at move ${i}. Return True.`,
        ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3] }),
      })
      break
    }

    // Case 2: current line just touches the line four steps back.
    if (i >= 4) {
      const c2 = x[i - 1] === x[i - 3] && x[i] + x[i - 4] >= x[i - 2]
      steps.push({
        phase: 'check',
        activeLine: 8,
        relatedLines: [7, 8, 9],
        message: `Case 2: x[${i - 1}]=${x[i - 1]} == x[${i - 3}]=${x[i - 3]} (${x[i - 1] === x[i - 3]}) and x[${i}]+x[${i - 4}]=${x[i] + x[i - 4]} >= x[${i - 2}]=${x[i - 2]} (${x[i] + x[i - 4] >= x[i - 2]}) -> ${c2}.`,
        ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3, i - 4] }),
      })
      if (c2) {
        crossed = true
        crossCase = 2
        crossPoint = findCrossingPoint(full, i)
        steps.push({
          phase: 'crossing',
          activeLine: 10,
          relatedLines: [8, 9, 10],
          message: `Self-crossing detected by Case 2 at move ${i}. Return True.`,
          ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3, i - 4] }),
        })
        break
      }
    }

    // Case 3: current line crosses the line five steps back.
    if (i >= 5) {
      const c3 =
        x[i - 2] >= x[i - 4] &&
        x[i] + x[i - 4] >= x[i - 2] &&
        x[i - 1] <= x[i - 3] &&
        x[i - 1] + x[i - 5] >= x[i - 3]
      steps.push({
        phase: 'check',
        activeLine: 12,
        relatedLines: [11, 12, 13, 14, 15],
        message: `Case 3: x[${i - 2}]>=x[${i - 4}] (${x[i - 2] >= x[i - 4]}), x[${i}]+x[${i - 4}]>=x[${i - 2}] (${x[i] + x[i - 4] >= x[i - 2]}), x[${i - 1}]<=x[${i - 3}] (${x[i - 1] <= x[i - 3]}), x[${i - 1}]+x[${i - 5}]>=x[${i - 3}] (${x[i - 1] + x[i - 5] >= x[i - 3]}) -> ${c3}.`,
        ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3, i - 4, i - 5] }),
      })
      if (c3) {
        crossed = true
        crossCase = 3
        crossPoint = findCrossingPoint(full, i)
        steps.push({
          phase: 'crossing',
          activeLine: 16,
          relatedLines: [12, 13, 14, 15, 16],
          message: `Self-crossing detected by Case 3 at move ${i}. Return True.`,
          ...snap(i + 2, { moveIndex: i, refIndices: [i, i - 1, i - 2, i - 3, i - 4, i - 5] }),
        })
        break
      }
    }
  }

  if (!crossed) {
    steps.push({
      phase: 'done',
      activeLine: 17,
      relatedLines: [17],
      message: 'No case ever triggered — the path never crosses itself. Return False.',
      ...snap(full.length, { moveIndex: n - 1 }),
    })
  }

  return steps
}

const DEFAULT_EXAMPLES = [
  { label: 'Crosses [2,1,1,2] (Case 1)', distances: [2, 1, 1, 2] },
  { label: 'No cross [1,2,3,4]', distances: [1, 2, 3, 4] },
  { label: 'Closed square [1,1,1,1]', distances: [1, 1, 1, 1] },
  { label: 'Touches [1,1,2,1,1] (Case 2)', distances: [1, 1, 2, 1, 1] },
  { label: 'Crosses [1,1,2,2,1,1] (Case 3)', distances: [1, 1, 2, 2, 1, 1] },
  { label: 'Growing spiral [1,2,3,4,5,6]', distances: [1, 2, 3, 4, 5, 6] },
]

function exampleToArray(ex) {
  if (Array.isArray(ex)) return ex
  if (Array.isArray(ex?.distances)) return ex.distances
  if (Array.isArray(ex?.value)) return ex.value
  if (Array.isArray(ex?.inputs)) return ex.inputs
  if (Array.isArray(ex?.inputs?.distances)) return ex.inputs.distances
  return []
}

const REGISTERED = getExamples('self-crossing') || []
const EXAMPLES = REGISTERED.length > 0 ? REGISTERED : DEFAULT_EXAMPLES

const W = 420
const H = 360
const PAD = 34

function PathCanvas({ points, bounds, moveIndex, crossingPoint, crossingDetected }) {
  if (!points || points.length === 0) {
    return <div className="self-crossing-empty">No path to display.</div>
  }
  const rangeX = Math.max(1, bounds.maxX - bounds.minX)
  const rangeY = Math.max(1, bounds.maxY - bounds.minY)
  const scale = Math.min((W - 2 * PAD) / rangeX, (H - 2 * PAD) / rangeY)
  const offX = (W - rangeX * scale) / 2
  const offY = (H - rangeY * scale) / 2
  const tx = (px) => offX + (px - bounds.minX) * scale
  const ty = (py) => H - (offY + (py - bounds.minY) * scale)

  const grid = []
  if (scale >= 10) {
    for (let gx = Math.ceil(bounds.minX); gx <= Math.floor(bounds.maxX); gx++) {
      grid.push(<line key={`gx${gx}`} x1={tx(gx)} y1={0} x2={tx(gx)} y2={H} className="self-crossing-grid" />)
    }
    for (let gy = Math.ceil(bounds.minY); gy <= Math.floor(bounds.maxY); gy++) {
      grid.push(<line key={`gy${gy}`} x1={0} y1={ty(gy)} x2={W} y2={ty(gy)} className="self-crossing-grid" />)
    }
  }

  const segments = []
  for (let k = 0; k < points.length - 1; k++) {
    segments.push({ k, a: points[k], b: points[k + 1] })
  }

  return (
    <svg
      className="self-crossing-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Self-crossing path on a grid"
    >
      {grid}
      {segments.map(({ k, a, b }) => {
        const isCurrent = k === moveIndex
        return (
          <motion.line
            key={k}
            x1={tx(a.x)}
            y1={ty(a.y)}
            x2={tx(b.x)}
            y2={ty(b.y)}
            className={`self-crossing-seg${isCurrent ? ' current' : ''}${isCurrent && crossingDetected ? ' crossing' : ''}`}
            initial={isCurrent ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        )
      })}
      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={tx(p.x)}
          cy={ty(p.y)}
          r={idx === 0 ? 5 : 3}
          className={`self-crossing-dot${idx === 0 ? ' origin' : ''}`}
        />
      ))}
      {crossingPoint && (
        <g>
          <circle cx={tx(crossingPoint.x)} cy={ty(crossingPoint.y)} r={10} className="self-crossing-cross-halo" />
          <circle cx={tx(crossingPoint.x)} cy={ty(crossingPoint.y)} r={5} className="self-crossing-cross-dot" />
        </g>
      )}
    </svg>
  )
}

export default function SelfCrossingVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(exampleToArray(EXAMPLES[0])))

  const { distances, inputError } = useMemo(() => {
    let parsed
    try {
      parsed = JSON.parse(inputValue)
    } catch (e) {
      return { distances: null, inputError: e.message }
    }
    if (!Array.isArray(parsed)) {
      return { distances: null, inputError: 'Input must be a JSON array of numbers, e.g. [2,1,1,2].' }
    }
    if (parsed.length === 0) {
      return { distances: null, inputError: 'Provide at least one distance.' }
    }
    if (!parsed.every((v) => typeof v === 'number' && Number.isFinite(v))) {
      return { distances: null, inputError: 'All elements must be finite numbers.' }
    }
    if (parsed.length > 40) {
      return { distances: null, inputError: 'Please use at most 40 moves.' }
    }
    return { distances: parsed, inputError: '' }
  }, [inputValue])

  const previewPoints = useMemo(() => (distances ? computePoints(distances) : []), [distances])
  const previewBounds = useMemo(() => computeBounds(previewPoints), [previewPoints])

  const steps = useMemo(() => (distances ? generateSteps(distances) : []), [distances])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const canvasPoints = step ? step.points : previewPoints
  const canvasBounds = step ? step.bounds : previewBounds
  const moveIndex = step ? step.moveIndex : -1
  const cells = step?.distances || distances || []
  const refSet = step?.refIndices || []

  let statusLabel = 'Ready'
  let statusKind = 'idle'
  if (step?.crossingDetected) {
    statusLabel = `Crosses — Case ${step.crossingCase}`
    statusKind = 'cross'
  } else if (step?.phase === 'done') {
    statusLabel = 'No self-crossing'
    statusKind = 'safe'
  } else if (step) {
    statusLabel = 'Scanning'
    statusKind = 'scan'
  }

  return (
    <div className="self-crossing-shell">
      <div className="self-crossing-panel">
        <div className="self-crossing-panel-head">Input — distances[]</div>
        <div className="self-crossing-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="self-crossing-textarea"
            placeholder="Enter a JSON array, e.g. [2,1,1,2]"
            spellCheck={false}
          />
          {inputError && <div className="self-crossing-error">{inputError}</div>}
        </div>
      </div>

      <div className="self-crossing-panel">
        <div className="self-crossing-panel-head">Visualization</div>
        <div className="self-crossing-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="self-crossing-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`self-crossing-step-info kind-${statusKind}`}>
                <h3>{step?.message || 'Press play to walk the path and check for self-crossings.'}</h3>
              </div>

              <div className="self-crossing-legend">
                <span className="self-crossing-chip">
                  Segment {moveIndex >= 0 ? moveIndex : '—'}
                  {cells.length > 0 ? ` / ${cells.length - 1}` : ''}
                </span>
                <span className="self-crossing-chip">
                  Direction: {moveIndex >= 0 ? DIR_NAMES[moveIndex % 4] : '—'}
                </span>
                <span className={`self-crossing-chip status-${statusKind}`}>{statusLabel}</span>
              </div>

              {cells.length > 0 && (
                <div className="self-crossing-array">
                  {cells.map((d, idx) => (
                    <div
                      key={idx}
                      className={`self-crossing-cell${idx === moveIndex ? ' current' : ''}${refSet.includes(idx) && idx !== moveIndex ? ' ref' : ''}`}
                    >
                      <span className="self-crossing-cell-i">{idx}</span>
                      <span className="self-crossing-cell-v">{d}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="self-crossing-stage">
                <PathCanvas
                  points={canvasPoints}
                  bounds={canvasBounds}
                  moveIndex={moveIndex}
                  crossingPoint={step?.crossingPoint || null}
                  crossingDetected={!!step?.crossingDetected}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="self-crossing-panel">
        <div className="self-crossing-panel-head">Code</div>
        <div className="self-crossing-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="self-crossing-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="self-crossing-example-btn"
              onClick={() => { setInputValue(JSON.stringify(exampleToArray(example))); handleReset() }}
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
