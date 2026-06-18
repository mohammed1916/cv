import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './CarFleet.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def carFleet(target: int, position: List[int], speed: List[int]) -> int:' },
  { line: 2, text: '    if not position: return 0' },
  { line: 3, text: '    cars = sorted(zip(position, speed), reverse=True)' },
  { line: 4, text: '    stack = []' },
  { line: 5, text: '    for pos, spd in cars:' },
  { line: 6, text: '        time = (target - pos) / spd' },
  { line: 7, text: '        if not stack or time > stack[-1]:' },
  { line: 8, text: '            stack.append(time)' },
  { line: 9, text: '    return len(stack)' },
]

function generateSteps(target, positions, speeds) {
  const steps = []

  if (!positions || positions.length === 0) {
    steps.push({
      activeLine: 2,
      message: 'No cars provided',
      stack: [],
      fleets: 0,
      sortedCars: [],
    })
    return steps
  }

  const cars = positions.map((pos, idx) => ({
    position: pos,
    speed: speeds[idx],
    originalIndex: idx,
  }))

  steps.push({
    activeLine: 1,
    message: `Initialize with target=${target}, ${cars.length} cars`,
    cars,
    sortedCars: null,
    stack: [],
    fleets: 0,
    currentCarIdx: null,
  })

  const sortedCars = [...cars].sort((a, b) => b.position - a.position)

  steps.push({
    activeLine: 3,
    message: `Sort cars by position (descending)`,
    cars,
    sortedCars,
    stack: [],
    fleets: 0,
    currentCarIdx: null,
  })

  steps.push({
    activeLine: 4,
    message: `Initialize empty stack to track fleets`,
    cars,
    sortedCars,
    stack: [],
    fleets: 0,
    currentCarIdx: null,
  })

  const stack = []

  for (let i = 0; i < sortedCars.length; i++) {
    const { position: pos, speed: spd } = sortedCars[i]

    steps.push({
      activeLine: 5,
      message: `Process car at position ${pos} with speed ${spd}`,
      cars,
      sortedCars,
      stack: [...stack],
      currentCarIdx: i,
      currentPos: pos,
      currentSpd: spd,
      fleets: stack.length,
    })

    const time = (target - pos) / spd

    steps.push({
      activeLine: 6,
      message: `Calculate arrival time: (${target} - ${pos}) / ${spd} = ${time.toFixed(2)}`,
      cars,
      sortedCars,
      stack: [...stack],
      currentCarIdx: i,
      currentPos: pos,
      currentSpd: spd,
      currentTime: time,
      fleets: stack.length,
    })

    steps.push({
      activeLine: 7,
      message: `Check if stack is empty or ${time.toFixed(2)} > ${stack.length > 0 ? stack[stack.length - 1].toFixed(2) : 'N/A'}`,
      cars,
      sortedCars,
      stack: [...stack],
      currentCarIdx: i,
      currentPos: pos,
      currentSpd: spd,
      currentTime: time,
      fleets: stack.length,
    })

    if (!stack.length || time > stack[stack.length - 1]) {
      stack.push(time)

      steps.push({
        activeLine: 8,
        message: `New fleet formed! Add ${time.toFixed(2)} to stack (fleet count: ${stack.length})`,
        cars,
        sortedCars,
        stack: [...stack],
        currentCarIdx: i,
        currentPos: pos,
        currentSpd: spd,
        currentTime: time,
        fleets: stack.length,
      })
    } else {
      steps.push({
        activeLine: 7,
        message: `Car merges with previous fleet (${time.toFixed(2)} <= ${stack[stack.length - 1].toFixed(2)})`,
        cars,
        sortedCars,
        stack: [...stack],
        currentCarIdx: i,
        currentPos: pos,
        currentSpd: spd,
        currentTime: time,
        fleets: stack.length,
      })
    }
  }

  steps.push({
    activeLine: 9,
    message: `Final fleet count: ${stack.length}`,
    cars,
    sortedCars,
    stack: [...stack],
    currentCarIdx: null,
    fleets: stack.length,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    target: 12,
    positions: [10, 8, 0, 5, 3],
    speeds: [2, 4, 1, 1, 3],
  },
  {
    label: 'Single Car',
    target: 10,
    positions: [3],
    speeds: [3],
  },
  {
    label: 'All Same Speed',
    target: 10,
    positions: [5, 2, 0],
    speeds: [2, 2, 2],
  },
  {
    label: 'Close Positions',
    target: 15,
    positions: [14, 13, 12, 11],
    speeds: [1, 2, 3, 4],
  },
]

export default function CarFleetVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const SOLUTION_CODE_HOOK = useSolutionCode('car-fleet')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.target, ex.positions, ex.speeds), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
      title: '🚗 Car Fleet Visualization',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #0ea5e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Track (Target: {ex.target})</div>
                <div style={{ position: 'relative', height: 60, backgroundColor: '#fff', borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                  {/* Target marker */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: '#ef4444',
                      zIndex: 10,
                    }}
                    title="Target"
                  />

                  {/* Cars */}
                  {step.sortedCars && step.sortedCars.map((car, idx) => (
                    <motion.div
                      key={`car-${idx}`}
                      animate={{
                        left: `${(car.position / (ex.target + 5)) * 100}%`,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        backgroundColor: step.currentCarIdx === idx ? '#3b82f6' : '#60a5fa',
                        border: step.currentCarIdx === idx ? '2px solid #1e40af' : '1px solid #1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      title={`Car ${idx}: pos=${car.position}, speed=${car.speed}`}
                    >
                      {car.speed}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Fleet Stack */}
              <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '1px solid #22c55e' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#166534' }}>Fleet Stack (Arrival Times)</div>
                {step.stack && step.stack.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {step.stack.map((time, idx) => (
                      <motion.div
                        key={`fleet-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#bbf7d0',
                          border: '2px solid #22c55e',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#166534',
                        }}
                      >
                        <div>Fleet {idx + 1}</div>
                        <div style={{ fontSize: 10, color: '#15803d' }}>{time.toFixed(2)}h</div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#15803d', fontSize: 11 }}>Stack is empty</div>
                )}
              </div>

              {/* Current step details */}
              {step.currentTime !== undefined && (
                <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11, border: '1px solid #fcd34d' }}>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Current Processing:</div>
                  <div style={{ color: '#78350f' }}>Position: {step.currentPos} | Speed: {step.currentSpd} km/h | Arrival Time: {step.currentTime.toFixed(2)}h</div>
                </div>
              )}

              {step.fleets !== undefined && (
                <div style={{ padding: 8, backgroundColor: '#e0e7ff', borderRadius: 6, fontSize: 11, border: '1px solid #818cf8' }}>
                  <span style={{ fontWeight: 600, color: '#3730a3' }}>Total Fleets: </span>
                  <span style={{ color: '#3730a3' }}>{step.fleets}</span>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex])

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
