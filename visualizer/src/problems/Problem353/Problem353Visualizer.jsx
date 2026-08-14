import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem353.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class UndergroundSystem:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.checkins = {}  # pid -> (station, t)' },
  { line: 4, text: '        self.routes = {}   # (s1, s2) -> [times]' },
  { line: 5, text: '    def checkIn(self, id, stationName, t):' },
  { line: 6, text: '        self.checkins[id] = (stationName, t)' },
  { line: 7, text: '    def checkOut(self, id, stationName, t):' },
  { line: 8, text: '        start, start_t = self.checkins[id]' },
  { line: 9, text: '        route = (start, stationName)' },
  { line: 10, text: '        time = t - start_t' },
  { line: 11, text: '        if route not in self.routes:' },
  { line: 12, text: '            self.routes[route] = []' },
  { line: 13, text: '        self.routes[route].append(time)' },
  { line: 14, text: '    def getAverageTime(self, s1, s2):' },
  { line: 15, text: '        times = self.routes[(s1, s2)]' },
  { line: 16, text: '        return sum(times) / len(times)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(events) {
  const steps = []
  const checkins = {}
  const routes = {}
  const passengers = []

  // Initialize
  steps.push({
    activeLine: 2,
    checkins: { ...checkins },
    routes: { ...routes },
    passengers: [...passengers],
    selectedRoute: null,
    message: 'Initialize empty tracking structure: checkins and routes.',
  })

  // Process each event
  events.forEach((event, idx) => {
    if (event.type === 'checkIn') {
      const { id, stationName, t } = event
      checkins[id] = { station: stationName, time: t }
      passengers.push({
        id,
        status: 'transit',
        checkInStation: stationName,
        checkInTime: t,
        checkOutStation: null,
        checkOutTime: null,
      })

      steps.push({
        activeLine: 6,
        checkins: { ...checkins },
        routes: { ...routes },
        passengers: passengers.map(p => ({ ...p })),
        selectedRoute: null,
        activePassenger: id,
        message: `Passenger ${id} checks in at "${stationName}" at time ${t}.`,
      })
    } else if (event.type === 'checkOut') {
      const { id, stationName, t } = event
      const checkInData = checkins[id]

      if (checkInData) {
        const startStation = checkInData.station
        const startTime = checkInData.time
        const travelTime = t - startTime
        const route = `${startStation} → ${stationName}`

        if (!routes[route]) {
          routes[route] = []
        }
        routes[route].push(travelTime)

        // Update passenger status
        const passengerIdx = passengers.findIndex(p => p.id === id)
        if (passengerIdx >= 0) {
          passengers[passengerIdx] = {
            ...passengers[passengerIdx],
            status: 'completed',
            checkOutStation: stationName,
            checkOutTime: t,
          }
        }

        steps.push({
          activeLine: 8,
          checkins: { ...checkins },
          routes: { ...routes },
          passengers: passengers.map(p => ({ ...p })),
          selectedRoute: route,
          activePassenger: id,
          message: `Passenger ${id} checks out at "${stationName}" at time ${t}. Travel time: ${travelTime}.`,
        })

        steps.push({
          activeLine: 13,
          checkins: { ...checkins },
          routes: { ...routes },
          passengers: passengers.map(p => ({ ...p })),
          selectedRoute: route,
          activePassenger: id,
          message: `Record route "${route}" with time ${travelTime}. Total times: [${routes[route].join(', ')}].`,
        })

        // Calculate average
        const times = routes[route]
        const avg = times.reduce((a, b) => a + b, 0) / times.length
        steps.push({
          activeLine: 16,
          checkins: { ...checkins },
          routes: { ...routes },
          passengers: passengers.map(p => ({ ...p })),
          selectedRoute: route,
          routeStats: { times, avg, min: Math.min(...times), max: Math.max(...times) },
          message: `Average time for "${route}": ${avg.toFixed(2)} (min: ${Math.min(...times)}, max: ${Math.max(...times)}).`,
        })
      }
    }
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Simple Route',
    events: [
      { type: 'checkIn', id: 1, stationName: 'A', t: 0 },
      { type: 'checkOut', id: 1, stationName: 'B', t: 5 },
      { type: 'checkIn', id: 2, stationName: 'A', t: 1 },
      { type: 'checkOut', id: 2, stationName: 'B', t: 9 },
    ],
  },
  {
    label: 'Example 2: Multiple Routes',
    events: [
      { type: 'checkIn', id: 1, stationName: 'A', t: 0 },
      { type: 'checkOut', id: 1, stationName: 'B', t: 5 },
      { type: 'checkIn', id: 2, stationName: 'B', t: 10 },
      { type: 'checkOut', id: 2, stationName: 'C', t: 20 },
      { type: 'checkIn', id: 3, stationName: 'A', t: 15 },
      { type: 'checkOut', id: 3, stationName: 'B', t: 30 },
    ],
  },
  {
    label: 'Example 3: Complex Network',
    events: [
      { type: 'checkIn', id: 1, stationName: 'A', t: 0 },
      { type: 'checkOut', id: 1, stationName: 'B', t: 6 },
      { type: 'checkIn', id: 2, stationName: 'B', t: 5 },
      { type: 'checkOut', id: 2, stationName: 'C', t: 15 },
      { type: 'checkIn', id: 3, stationName: 'A', t: 10 },
      { type: 'checkOut', id: 3, stationName: 'C', t: 18 },
      { type: 'checkIn', id: 1, stationName: 'C', t: 20 },
      { type: 'checkOut', id: 1, stationName: 'A', t: 28 },
    ],
  },
]

export default function Problem353Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [eventsInput, setEventsInput] = useState(JSON.stringify(EXAMPLES[0]?.events ?? []));
  const { events, inputError } = useMemo(() => {
    try {
      const parsedEvents = JSON.parse(eventsInput); if (!Array.isArray(parsedEvents)) throw new Error('events must be an array');
      return { events: parsedEvents, inputError: '' };
    } catch (e) {
      return { events: EXAMPLES[exIdx]?.events ?? '', inputError: e.message };
    }
  }, [eventsInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(events), [events])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setEventsInput(JSON.stringify(EXAMPLES[i].events)); handleReset(); }, [handleReset]);

  // Extract unique stations
  const stations = useMemo(() => {
    const stationSet = new Set()
    if (step) {
      step.passengers.forEach(p => {
        stationSet.add(p.checkInStation)
        if (p.checkOutStation) stationSet.add(p.checkOutStation)
      })
    }
    return Array.from(stationSet).sort()
  }, [step])

  // Calculate station positions in circular layout
  const stationPositions = useMemo(() => {
    const positions = {}
    const radius = 150
    const centerX = 200
    const centerY = 180

    stations.forEach((station, idx) => {
      const angle = (idx / stations.length) * 2 * Math.PI - Math.PI / 2
      positions[station] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })
    return positions
  }, [stations])

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
      title: '🚇 Underground System',
      content: (
        <>
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
                  backgroundColor: exIdx === i ? '#e9d5ff' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Station Network Visualization */}
              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                backgroundColor: '#f9fafb',
                padding: 12,
                position: 'relative',
                height: 400,
              }}>
                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* Draw routes */}
                  {Object.entries(step.routes).map(([route, times]) => {
                    const [start, end] = route.split(' → ')
                    if (!stationPositions[start] || !stationPositions[end]) return null
                    const pos1 = stationPositions[start]
                    const pos2 = stationPositions[end]
                    return (
                      <line
                        key={`route-${route}`}
                        x1={pos1.x}
                        y1={pos1.y}
                        x2={pos2.x}
                        y2={pos2.y}
                        stroke={step.selectedRoute === route ? '#8b5cf6' : '#cbd5e1'}
                        strokeWidth={step.selectedRoute === route ? 3 : 1}
                        opacity={step.selectedRoute === route ? 0.9 : 0.5}
                      />
                    )
                  })}
                </svg>

                {/* Station circles */}
                {stations.map(station => (
                  <div
                    key={station}
                    style={{
                      position: 'absolute',
                      left: `${(stationPositions[station].x / 400) * 100}%`,
                      top: `${(stationPositions[station].y / 360) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: step.passengers.some(p => p.checkInStation === station && p.status === 'transit') ? 1.15 : 1,
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: '#e9d5ff',
                        border: '2px solid #8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#6b21a8',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      {station}
                    </motion.div>
                  </div>
                ))}

                {/* Passengers in transit */}
                <AnimatePresence>
                  {step.passengers.filter(p => p.status === 'transit').map(passenger => {
                    const startPos = stationPositions[passenger.checkInStation]
                    if (!startPos) return null
                    return (
                      <motion.div
                        key={`passenger-${passenger.id}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{
                          position: 'absolute',
                          left: `${(startPos.x / 400) * 100}%`,
                          top: `${(startPos.y / 360) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <motion.div
                          animate={{
                            y: passenger.id % 2 === 0 ? [-5, 5, -5] : [5, -5, 5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: '#fbbf24',
                            border: '2px solid #f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#92400e',
                            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
                          }}
                        >
                          P{passenger.id}
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Status message */}
              <div style={{
                padding: 12,
                backgroundColor: '#f0f4f8',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: '#334155',
                borderLeft: '4px solid #8b5cf6',
              }}>
                {step.message}
              </div>

              {/* Current passengers */}
              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>Current Passengers:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {step.passengers.map(p => (
                    <motion.div
                      key={p.id}
                      animate={{
                        scale: p.id === step.activePassenger ? 1.1 : 1,
                        backgroundColor: p.id === step.activePassenger ? '#fbbf24' : '#fef3c7',
                      }}
                      style={{
                        padding: 6,
                        borderRadius: 4,
                        border: '1px solid #f59e0b',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#92400e',
                      }}
                    >
                      P{p.id}: {p.checkInStation}
                      {p.checkOutStation && ` → ${p.checkOutStation}`}
                      {p.status === 'completed' && ` (${p.checkOutTime - p.checkInTime}s)`}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Routes and statistics */}
              {Object.keys(step.routes).length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#ddd6fe', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#5b21b6' }}>Routes & Statistics:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(step.routes).map(([route, times]) => {
                      const avg = times.reduce((a, b) => a + b, 0) / times.length
                      const min = Math.min(...times)
                      const max = Math.max(...times)
                      return (
                        <motion.div
                          key={route}
                          animate={{
                            backgroundColor: step.selectedRoute === route ? '#8b5cf6' : '#ddd6fe',
                            color: step.selectedRoute === route ? '#fff' : '#5b21b6',
                          }}
                          style={{
                            padding: 6,
                            borderRadius: 4,
                            border: step.selectedRoute === route ? '2px solid #7c3aed' : '1px solid #c4b5fd',
                            fontWeight: 600,
                          }}
                        >
                          <div>{route}</div>
                          <div style={{ fontSize: 10, marginTop: 4 }}>
                            Times: [{times.join(', ')}] | Avg: {avg.toFixed(2)} | Min: {min} | Max: {max}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, stations, stationPositions])

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
