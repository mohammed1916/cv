import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem469Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('convex-polygon')

const PATTERNS = []

const EXAMPLES = getExamples('convex-polygon')

function isConvex(points) {
  if (points.length < 3) return false
  let prevCross = 0
  for (let i = 0; i < points.length; i++) {
    const o = points[i]
    const a = points[(i + 1) % points.length]
    const b = points[(i + 2) % points.length]
    const cross = (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    if (cross !== 0) {
      if (prevCross === 0) prevCross = cross
      else if ((prevCross > 0) !== (cross > 0)) return false
    }
  }
  return true
}

function generateSteps(points) {
  const steps = []
  const result = isConvex(points)

  steps.push({
    activeLine: 1,
    points,
    index: 0,
    crossProduct: 0,
    prevCross: 0,
    message: 'Initialize: Check cross product sign consistency for all vertices'
  })

  let prevCross = 0
  for (let i = 0; i < Math.min(points.length, 4); i++) {
    const o = points[i]
    const a = points[(i + 1) % points.length]
    const b = points[(i + 2) % points.length]
    const cross = (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    steps.push({
      activeLine: 2,
      points,
      index: i,
      crossProduct: cross,
      prevCross,
      message: `Vertex ${i}: cross product = ${cross}`
    })

    if (cross !== 0) {
      if (prevCross === 0) prevCross = cross
      const consistent = (prevCross > 0) === (cross > 0)
      steps.push({
        activeLine: 3,
        points,
        index: i,
        crossProduct: cross,
        prevCross,
        message: `Cross product sign ${consistent ? 'matches' : 'conflicts'} with previous`
      })
    }
  }

  steps.push({
    activeLine: 4,
    points,
    index: points.length,
    crossProduct: 0,
    prevCross,
    done: true,
    message: `Result: Polygon is ${result ? 'CONVEX' : 'NOT CONVEX'}`
  })

  return steps
}

function VisualizationPanel({ points, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Determine if a polygon is convex by checking if all cross products have consistent sign. A convex polygon has all vertices turning the same direction."
        </div>
      </div>

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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Points: {JSON.stringify(points)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {points.map((pt, idx) => {
            const isActive = step && idx === step.index && !step.done
            const isProcessed = step && idx < step.index
            return (
              <motion.div
                key={`pt-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fef08a' : isProcessed ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#eab308' : isProcessed ? '#10b981' : '#cbd5e1',
                  color: isActive ? '#854d0e' : isProcessed ? '#047857' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                [{pt[0]},{pt[1]}]
              </motion.div>
            )
          })}
        </div>
      </div>

      <svg
        width="300"
        height="300"
        style={{
          border: '2px solid #cbd5e1',
          borderRadius: 8,
          backgroundColor: '#f9fafb'
        }}
        viewBox="0 0 400 400"
      >
        {points.length > 1 && (
          <>
            <polyline
              points={points.map(p => `${(p[0] % 100) * 3 + 50},${(p[1] % 100) * 3 + 50}`).join(' ')}
              fill="rgba(139, 92, 246, 0.2)"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
          </>
        )}
        {points.map((pt, idx) => (
          <circle
            key={`circle-${idx}`}
            cx={(pt[0] % 100) * 3 + 50}
            cy={(pt[1] % 100) * 3 + 50}
            r="5"
            fill={step?.index === idx ? '#fef08a' : '#8b5cf6'}
            stroke="#6b7280"
            strokeWidth="2"
          />
        ))}
      </svg>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Cross Product</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0c865d' }}>
          {step?.crossProduct ?? 0}
        </div>
      </motion.div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem469Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [pointsInput, setPointsInput] = useState("[[0,0],[0,1],[1,1],[1,0]]");
  const { points, inputError } = useMemo(() => {
    try {
      const parsedPoints = JSON.parse(pointsInput); if (!Array.isArray(parsedPoints)) throw new Error('points must be an array');
      return { points: parsedPoints, inputError: '' };
    } catch (e) {
      return { points: "[[0,0],[0,1],[1,1],[1,0]]", inputError: e.message };
    }
  }, [pointsInput]);

  const steps = useMemo(
    () =>
      generateSteps(points).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [points]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setPointsInput(JSON.stringify(e.points)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔺 Convex Polygon', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          points={points}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"points","label":"points","type":"array"}]}
          values={{ points: pointsInput }}
          onChange={(k, v) => { if (k === 'points') setPointsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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
