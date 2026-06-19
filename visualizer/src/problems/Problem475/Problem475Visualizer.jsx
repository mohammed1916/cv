import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem475Visualizer.css'

const EXAMPLES = getExamples('heaters')

function generateSteps(houses, heaters) {
  const steps = []

  steps.push({
    activeLine: 1,
    houses,
    heaters: [...heaters].sort((a, b) => a - b),
    index: 0,
    maxRadius: 0,
    message: 'Find minimum heater radius to cover all houses'
  })

  const sortedHeaters = [...heaters].sort((a, b) => a - b)

  for (let i = 0; i < Math.min(houses.length, 4); i++) {
    const house = houses[i]
    steps.push({
      activeLine: 2,
      houses,
      heaters: sortedHeaters,
      index: i,
      currentHouse: house,
      maxRadius: 0,
      message: `Find nearest heater for house at ${house}`
    })

    let minDist = Infinity
    for (let heater of sortedHeaters) {
      const dist = Math.abs(house - heater)
      if (dist < minDist) minDist = dist
    }

    steps.push({
      activeLine: 3,
      houses,
      heaters: sortedHeaters,
      index: i,
      currentHouse: house,
      maxRadius: minDist,
      message: `Minimum distance: ${minDist} to nearest heater`
    })
  }

  steps.push({
    activeLine: 4,
    houses,
    heaters: sortedHeaters,
    index: houses.length,
    maxRadius: 0,
    done: true,
    message: 'Minimum radius found'
  })

  return steps
}

function VisualizationPanel({ houses, heaters, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find minimum heater radius to cover all houses. Use binary search or distance calculation to find optimal placement."
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Number Line</div>
        <svg width="100%" height="80" style={{ border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <line x1="20" y1="40" x2="380" y2="40" stroke="#cbd5e1" strokeWidth="2" />
          {Math.min(...[...houses, ...heaters]) >= 0 && Math.max(...[...houses, ...heaters]) <= 50 && (
            <>
              {houses.map((h, idx) => (
                <circle
                  key={`house-${idx}`}
                  cx={20 + (h / 50) * 360}
                  cy="40"
                  r="6"
                  fill={step?.currentHouse === h ? '#fef08a' : '#3b82f6'}
                  stroke="#1f2937"
                  strokeWidth="2"
                />
              ))}
              {heaters.map((h, idx) => (
                <rect
                  key={`heater-${idx}`}
                  x={20 + (h / 50) * 360 - 6}
                  y="34"
                  width="12"
                  height="12"
                  fill="#f59e0b"
                  stroke="#1f2937"
                  strokeWidth="2"
                />
              ))}
            </>
          )}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current House</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>
            {step?.currentHouse ?? '-'}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Min Distance</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>
            {step?.maxRadius ?? 0}
          </div>
        </motion.div>
      </div>

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

export default function Problem475Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { houses: [1,2,3], heaters: [2] })
  const SOLUTION_CODE = useSolutionCode('heaters')

  const steps = useMemo(
    () =>
      generateSteps(ex.houses, ex.heaters).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

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
      title: '🔥 Heaters',
      content: (
        <VisualizationPanel
          houses={ex.houses}
          heaters={ex.heaters}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
