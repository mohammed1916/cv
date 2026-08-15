import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem356.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def isReflected(points):' },
  { line: 2, text: '    if not points: return True' },
  { line: 3, text: '    xs = [x for x, y in points]' },
  { line: 4, text: '    min_x, max_x = min(xs), max(xs)' },
  { line: 5, text: '    sum_line = min_x + max_x' },
  { line: 6, text: '    point_set = set(points)' },
  { line: 7, text: '    for x, y in points:' },
  { line: 8, text: '        reflected_x = sum_line - x' },
  { line: 9, text: '        if (reflected_x, y) not in point_set:' },
  { line: 10, text: '            return False' },
  { line: 11, text: '    return True' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(points) {
  const steps = []

  if (!points || points.length === 0) {
    return [{
      activeLine: 2,
      message: 'Empty points: valid reflection.',
      xs: [],
      minX: null,
      maxX: null,
      sumLine: null,
      pointSet: new Set(),
      checkedPoints: [],
      validPairs: [],
      invalidPoint: null,
      isValid: true,
    }]
  }

  // Step 1: Extract x-coordinates
  const xs = points.map(([x, y]) => x)
  steps.push({
    activeLine: 3,
    message: `Extract x-coordinates: [${xs.join(', ')}]`,
    xs,
    minX: null,
    maxX: null,
    sumLine: null,
    pointSet: new Set(),
    checkedPoints: [],
    validPairs: [],
    invalidPoint: null,
    isValid: null,
  })

  // Step 2: Find min and max x
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  steps.push({
    activeLine: 4,
    message: `Min x: ${minX}, Max x: ${maxX}`,
    xs,
    minX,
    maxX,
    sumLine: null,
    pointSet: new Set(),
    checkedPoints: [],
    validPairs: [],
    invalidPoint: null,
    isValid: null,
  })

  // Step 3: Calculate reflection line (sum_line = min_x + max_x)
  const sumLine = minX + maxX
  const reflectionLine = sumLine / 2
  steps.push({
    activeLine: 5,
    message: `Reflection line at x = ${reflectionLine.toFixed(1)} (sum = ${sumLine})`,
    xs,
    minX,
    maxX,
    sumLine,
    reflectionLine,
    pointSet: new Set(),
    checkedPoints: [],
    validPairs: [],
    invalidPoint: null,
    isValid: null,
  })

  // Step 4: Build point set
  const pointSet = new Set(points.map(p => JSON.stringify(p)))
  steps.push({
    activeLine: 6,
    message: `Built set with ${points.length} points for O(1) lookup.`,
    xs,
    minX,
    maxX,
    sumLine,
    reflectionLine,
    pointSet,
    checkedPoints: [],
    validPairs: [],
    invalidPoint: null,
    isValid: null,
  })

  // Step 5: Check each point's reflection
  let isValid = true
  const checkedPoints = []
  const validPairs = []
  let invalidPoint = null

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i]
    const reflectedX = sumLine - x
    const reflectedPoint = [reflectedX, y]
    const reflectedKey = JSON.stringify(reflectedPoint)

    checkedPoints.push([x, y])

    if (pointSet.has(reflectedKey)) {
      validPairs.push({
        original: [x, y],
        reflected: reflectedPoint,
      })
      steps.push({
        activeLine: 7,
        message: `✓ Point (${x}, ${y}): reflected at (${reflectedX}, ${y}) exists.`,
        xs,
        minX,
        maxX,
        sumLine,
        reflectionLine,
        pointSet,
        checkedPoints: [...checkedPoints],
        validPairs: [...validPairs],
        invalidPoint: null,
        isValid: null,
      })
    } else {
      isValid = false
      invalidPoint = [x, y]
      steps.push({
        activeLine: 9,
        message: `✗ Point (${x}, ${y}): reflected at (${reflectedX}, ${y}) NOT found!`,
        xs,
        minX,
        maxX,
        sumLine,
        reflectionLine,
        pointSet,
        checkedPoints: [...checkedPoints],
        validPairs: [...validPairs],
        invalidPoint: [x, y],
        isValid: false,
      })
      break
    }
  }

  // Final result
  steps.push({
    activeLine: isValid ? 11 : 10,
    message: isValid ? `✓ All points have reflections! Valid reflection.` : `✗ Invalid reflection.`,
    xs,
    minX,
    maxX,
    sumLine,
    reflectionLine,
    pointSet,
    checkedPoints,
    validPairs,
    invalidPoint,
    isValid,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Valid',
    points: [[1, 1], [1, -1], [-1, -1], [-1, 1]],
    description: 'Square reflected across y-axis',
  },
  {
    label: 'Example 2: Valid',
    points: [[0, 0], [1, 1], [1, -1], [2, 0], [2, 2]],
    description: 'Points symmetric across vertical line',
  },
  {
    label: 'Example 3: Invalid',
    points: [[0, 0], [1, 1], [1, -1], [2, 0]],
    description: 'Missing reflected pair',
  },
]

export default function Problem356Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [pointsInput, setPointsInput] = useState(JSON.stringify(EXAMPLES[0]?.points ?? []));
  const { points, inputError } = useMemo(() => {
    try {
      const parsedPoints = JSON.parse(pointsInput); if (!Array.isArray(parsedPoints)) throw new Error('points must be an array');
      return { points: parsedPoints, inputError: '' };
    } catch (e) {
      return { points: EXAMPLES[exIdx]?.points ?? '', inputError: e.message };
    }
  }, [pointsInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(points), [points])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setPointsInput(JSON.stringify(EXAMPLES[i].points)); handleReset(); }, [handleReset]);

  // Calculate grid dimensions for visualization
  const allPoints = step ? points : []
  const getGridDimensions = () => {
    if (allPoints.length === 0) return { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    const xs = allPoints.map(p => p[0])
    const ys = allPoints.map(p => p[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const padding = 1
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    }
  }

  const grid = getGridDimensions()
  const gridWidth = 500
  const gridHeight = 400
  const scaleX = gridWidth / (grid.maxX - grid.minX)
  const scaleY = gridHeight / (grid.maxY - grid.minY)

  const screenX = (x) => (x - grid.minX) * scaleX
  const screenY = (y) => gridHeight - (y - grid.minY) * scaleY

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
    {
      id: 'viz',
      title: '📐 Line Reflection Visualization',
      content: (
        <>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example Selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {ex.description}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                {step.message}
              </div>

              {/* Grid Visualization */}
              <svg
                width={gridWidth}
                height={gridHeight}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  backgroundColor: '#fff',
                }}
              >
                {/* Grid lines */}
                {Array.from({ length: Math.ceil((grid.maxX - grid.minX) / 0.5) + 1 }).map((_, i) => {
                  const x = grid.minX + i * 0.5
                  return (
                    <line
                      key={`vline-${i}`}
                      x1={screenX(x)}
                      y1={0}
                      x2={screenX(x)}
                      y2={gridHeight}
                      stroke="#e2e8f0"
                      strokeWidth="0.5"
                    />
                  )
                })}
                {Array.from({ length: Math.ceil((grid.maxY - grid.minY) / 0.5) + 1 }).map((_, i) => {
                  const y = grid.minY + i * 0.5
                  return (
                    <line
                      key={`hline-${i}`}
                      x1={0}
                      y1={screenY(y)}
                      x2={gridWidth}
                      y2={screenY(y)}
                      stroke="#e2e8f0"
                      strokeWidth="0.5"
                    />
                  )
                })}

                {/* Axes */}
                <line x1={screenX(0)} y1={0} x2={screenX(0)} y2={gridHeight} stroke="#94a3b8" strokeWidth="1" />
                <line x1={0} y1={screenY(0)} x2={gridWidth} y2={screenY(0)} stroke="#94a3b8" strokeWidth="1" />

                {/* Reflection line */}
                {step.reflectionLine !== null && (
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    x1={screenX(step.reflectionLine)}
                    y1={0}
                    x2={screenX(step.reflectionLine)}
                    y2={gridHeight}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}

                {/* Valid pair connections */}
                <AnimatePresence>
                  {step.validPairs.map((pair, i) => {
                    const [ox, oy] = pair.original
                    const [rx, ry] = pair.reflected
                    return (
                      <motion.line
                        key={`pair-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        x1={screenX(ox)}
                        y1={screenY(oy)}
                        x2={screenX(rx)}
                        y2={screenY(ry)}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.6"
                      />
                    )
                  })}
                </AnimatePresence>

                {/* Points */}
                <AnimatePresence>
                  {allPoints.map((point, i) => {
                    const [x, y] = point
                    const sx = screenX(x)
                    const sy = screenY(y)
                    const isChecked = step.checkedPoints.some(p => p[0] === x && p[1] === y)
                    const isInvalid = step.invalidPoint && step.invalidPoint[0] === x && step.invalidPoint[1] === y
                    const isValidPairStart = step.validPairs.some(p => p.original[0] === x && p.original[1] === y)

                    return (
                      <motion.g
                        key={`point-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: isInvalid ? 1.3 : 1,
                          opacity: 1,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 20,
                        }}
                      >
                        {/* Point circle */}
                        <circle
                          cx={sx}
                          cy={sy}
                          r="5"
                          fill={isInvalid ? '#ef4444' : isValidPairStart ? '#3b82f6' : '#64748b'}
                          opacity={isInvalid ? 1 : isChecked ? 0.9 : 0.6}
                        />
                        {/* Point label */}
                        <text
                          x={sx}
                          y={sy - 12}
                          textAnchor="middle"
                          fontSize="10"
                          fill={isInvalid ? '#ef4444' : '#1e293b'}
                          fontWeight="600"
                        >
                          ({x}, {y})
                        </text>
                      </motion.g>
                    )
                  })}
                </AnimatePresence>
              </svg>

              {/* Info Section */}
              {step.minX !== null && (
                <div style={{ padding: 8, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>Analysis:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>Min X:</span> {step.minX}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Max X:</span> {step.maxX}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Reflection Line:</span> x = {step.reflectionLine?.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* Result */}
              {step.isValid !== null && (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    backgroundColor: step.isValid ? '#dcfce7' : '#fee2e2',
                    border: `2px solid ${step.isValid ? '#10b981' : '#ef4444'}`,
                    fontSize: 12,
                    fontWeight: 600,
                    color: step.isValid ? '#065f46' : '#7f1d1d',
                  }}
                >
                  {step.isValid ? '✓ Valid Reflection' : '✗ Invalid Reflection'}
                </div>
              )}
            </>
          )}
        </div>
        </>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex, grid, gridWidth, gridHeight, screenX, screenY, allPoints])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"points","label":"points","type":"array"}]}
          values={{ points: pointsInput }}
          onChange={(k, v) => { if (k === 'points') setPointsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
