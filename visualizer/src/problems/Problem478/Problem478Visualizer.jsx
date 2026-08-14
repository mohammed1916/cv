import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem478Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const EXAMPLES = getExamplesOr('generate-random-point-in-a-circle', [
  { label: 'Example 1', radius: 1 },
  { label: 'Example 2', radius: 2.5 },
])
const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def __init__(self, radius, x_center, y_center):' },
  { line: 2, text: '    self.radius = radius' },
  { line: 3, text: '    self.x = x_center' },
  { line: 4, text: '    self.y = y_center' },
  { line: 5, text: 'def randPoint(self):' },
  { line: 6, text: '    angle = random() * 2 * pi' },
  { line: 7, text: '    r = sqrt(random()) * self.radius' },
  { line: 8, text: '    x = self.x + r * cos(angle)' },
  { line: 9, text: '    y = self.y + r * sin(angle)' },
  { line: 10, text: '    return [x, y]' },
  { line: 11, text: '    ' },
]

function generateSteps(radius) {
  const steps = []

  steps.push({ activeLine: 1, message: `Initialize: circle center=(0,0), radius=${radius}`, radius })

  steps.push({ activeLine: 2, message: `Method: use polar coordinates with sqrt(random)×radius for uniform distribution` })

  const points = []

  for (let i = 0; i < 5; i++) {
    steps.push({ activeLine: 3, message: `Sample ${i + 1}: generate random angle [0, 2π]` })

    const angle = Math.random() * 2 * Math.PI
    steps.push({ activeLine: 4, message: `angle = ${angle.toFixed(4)} rad (${(angle * 180 / Math.PI).toFixed(1)}°)` })

    steps.push({ activeLine: 5, message: `Generate random distance using sqrt(random)×radius` })

    const randVal = Math.random()
    const r = Math.sqrt(randVal) * radius
    steps.push({ activeLine: 6, message: `random = ${randVal.toFixed(4)}, sqrt(random) = ${Math.sqrt(randVal).toFixed(4)}, r = ${r.toFixed(4)}` })

    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    const distance = Math.sqrt(x * x + y * y)

    steps.push({ activeLine: 7, message: `Convert to cartesian: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}` })

    steps.push({ activeLine: 8, message: `Verify distance ≤ radius: ${distance.toFixed(4)} ≤ ${radius}`, x, y, distance, inCircle: distance <= radius })

    points.push({ x, y, distance, angle, r })
    steps.push({ activeLine: 9, message: `Point ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}) [distance=${distance.toFixed(3)}]`, x, y, distance, points: [...points], sampleNum: i + 1 })

    if (i < 4) {
      steps.push({ activeLine: 10, message: `Continue to next sample` })
    }
  }

  steps.push({ activeLine: 11, message: `Generated ${points.length} points uniformly in circle`, points, done: true })
  return steps
}

function CircleVisualization({ radius, points, currentPoint }) {
  const scale = 80
  const width = radius * scale * 2 + 40
  const height = radius * scale * 2 + 40
  const cx = width / 2
  const cy = height / 2

  return (
    <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid #cbd5e1', borderRadius: 4, backgroundColor: '#f9fafb' }}>
      {/* Circle */}
      <circle cx={cx} cy={cy} r={radius * scale} fill="rgba(139, 92, 246, 0.05)" stroke="#8b5cf6" strokeWidth="2" />

      {/* Radii guides */}
      <line x1={cx} y1={cy} x2={cx + radius * scale} y2={cy} stroke="#d8b4fe" strokeWidth="1" strokeDasharray="4,4" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - radius * scale} stroke="#d8b4fe" strokeWidth="1" strokeDasharray="4,4" />

      {/* All points */}
      {points && points.map((p, i) => (
        <circle
          key={i}
          cx={cx + p.x * scale}
          cy={cy - p.y * scale}
          r="3"
          fill={currentPoint?.sampleNum === i + 1 ? '#fef08a' : '#a78bfa'}
          stroke={currentPoint?.sampleNum === i + 1 ? '#f59e0b' : '#8b5cf6'}
          strokeWidth="2"
          opacity={currentPoint?.sampleNum === i + 1 ? 1 : 0.6}
        />
      ))}

      {/* Current point */}
      {currentPoint && (
        <circle
          cx={cx + currentPoint.x * scale}
          cy={cy - currentPoint.y * scale}
          r="5"
          fill="none"
          stroke="#fef08a"
          strokeWidth="2"
        />
      )}

      {/* Center */}
      <circle cx={cx} cy={cy} r="2" fill="#1f2937" />
    </svg>
  )
}

function VisualizationPanel({ radius, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Algorithm</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Polar coordinates: (1) generate angle uniformly [0, 2π], (2) generate distance with sqrt(random)×radius to ensure uniform area distribution
        </div>
      </div>

      <CircleVisualization radius={radius} points={step?.points || []} currentPoint={step} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #10b981' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#166534' }}>X Coord</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>
            {step?.x !== undefined ? step.x.toFixed(3) : '—'}
          </div>
        </div>

        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 6, border: '1px solid #dc2626' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#991b1b' }}>Y Coord</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
            {step?.y !== undefined ? step.y.toFixed(3) : '—'}
          </div>
        </div>

        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Distance</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
            {step?.distance !== undefined ? step.distance.toFixed(3) : '—'}
          </div>
        </div>
      </div>

      {step?.angle !== undefined && (
        <div style={{ padding: 10, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8', marginBottom: 4 }}>Angle</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#7c3aed' }}>
            {step.angle.toFixed(4)} rad = {(step.angle * 180 / Math.PI).toFixed(1)}°
          </div>
        </div>
      )}

      {step?.points && step.points.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Generated Points ({step.points.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {step.points.slice(0, 5).map((p, i) => (
              <div key={i} style={{ fontSize: 10, fontFamily: 'monospace', color: '#047857' }}>
                P{i + 1}: ({p.x.toFixed(3)}, {p.y.toFixed(3)}) d={p.distance.toFixed(3)}
              </div>
            ))}
            {step.points.length > 5 && (
              <div style={{ fontSize: 10, color: '#94a3b8' }}>... and {step.points.length - 5} more</div>
            )}
          </div>
        </div>
      )}

      {step?.inCircle !== undefined && (
        <div style={{ padding: 10, backgroundColor: step.inCircle ? '#dcfce7' : '#fee2e2', borderRadius: 6, border: `2px solid ${step.inCircle ? '#22c55e' : '#ef4444'}`, fontSize: 11, fontWeight: 600, color: step.inCircle ? '#166534' : '#991b1b' }}>
          {step.inCircle ? '✓ Point is inside circle' : '✗ Point is outside circle'}
        </div>
      )}
    </div>
  )
}

export default function Problem478Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [radiusInput, setRadiusInput] = useState(1);
  const [x_centerInput, setX_centerInput] = useState(0);
  const [y_centerInput, setY_centerInput] = useState(0);
  const { radius, x_center, y_center, inputError } = useMemo(() => {
    try {
      const parsedRadius = Number(radiusInput); if (isNaN(parsedRadius)) throw new Error('radius must be a number');
      const parsedX_center = Number(x_centerInput); if (isNaN(parsedX_center)) throw new Error('x_center must be a number');
      const parsedY_center = Number(y_centerInput); if (isNaN(parsedY_center)) throw new Error('y_center must be a number');
      return { radius: parsedRadius, x_center: parsedX_center, y_center: parsedY_center, inputError: '' };
    } catch (e) {
      return { radius: 1, x_center: 0, y_center: 0, inputError: e.message };
    }
  }, [radiusInput, x_centerInput, y_centerInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(radius).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [radius]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setRadiusInput(String(e.radius)); setX_centerInput(String(e.x_center)); setY_centerInput(String(e.y_center)); handleReset(); }, [handleReset]);

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
    {
      id: 'viz',
      title: '🔵 Random Point in Circle',
      content: <VisualizationPanel radius={radius} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

  return (
    <div className="problem-shell">
      
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
