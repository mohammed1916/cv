import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './ReconstructItineraryVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'from collections import defaultdict' },
  { line: 2, text: '' },
  { line: 3, text: 'def findItinerary(tickets):' },
  { line: 4, text: '    graph = defaultdict(list)' },
  { line: 5, text: '    for src, dst in sorted(tickets):' },
  { line: 6, text: '        graph[src].append(dst)   # sorted -> lexicographic' },
  { line: 7, text: '    route, stack = [], ["JFK"]' },
  { line: 8, text: '    while stack:' },
  { line: 9, text: '        airport = stack[-1]' },
  { line: 10, text: '        if graph[airport]:' },
  { line: 11, text: '            stack.append(graph[airport].pop(0))' },
  { line: 12, text: '        else:' },
  { line: 13, text: '            route.append(stack.pop())' },
  { line: 14, text: '    return route[::-1]   # reverse the walk' },
]

// Default + fallback examples (slug has no registry entry yet).
const DEFAULT_EXAMPLES = [
  {
    label: 'Classic (JFK loop)',
    tickets: [['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']],
  },
  {
    label: 'Linear path',
    tickets: [['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']],
  },
  {
    label: 'Tie-break',
    tickets: [['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']],
  },
]

const REGISTRY_EXAMPLES = getExamplesOr('reconstruct-itinerary', [])
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : DEFAULT_EXAMPLES

const cloneGraph = (g) => {
  const out = {}
  for (const k of Object.keys(g)) out[k] = [...g[k]]
  return out
}

/**
 * Trace Hierholzer's algorithm (iterative) on the given tickets.
 * Each step exposes: graph (remaining tickets), current airport, stack, route.
 */
function generateSteps(tickets) {
  const steps = []

  // 1. Sort tickets so each adjacency list ends up lexicographically ordered.
  const sorted = [...tickets].sort((a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1
    if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1
    return 0
  })
  const sortedTickets = sorted.map((t) => [...t])

  const graph = {}

  steps.push({
    phase: 'sort',
    activeLine: 5,
    relatedLines: [4, 5, 6],
    message: `Sort all ${tickets.length} tickets lexicographically so every destination list stays in order.`,
    graph: cloneGraph(graph),
    stack: [],
    route: [],
    current: null,
    sortedTickets,
  })

  // 2. Build the adjacency map one edge at a time.
  for (const [src, dst] of sorted) {
    if (!graph[src]) graph[src] = []
    graph[src].push(dst)
    steps.push({
      phase: 'build',
      activeLine: 6,
      relatedLines: [5, 6],
      message: `Add ticket ${src} -> ${dst} to the adjacency list of ${src}.`,
      graph: cloneGraph(graph),
      stack: [],
      route: [],
      current: null,
      edge: { from: src, to: dst },
      sortedTickets,
    })
  }

  // 3. Initialize the walk at JFK.
  const stack = ['JFK']
  const route = []
  steps.push({
    phase: 'init',
    activeLine: 7,
    relatedLines: [7, 8],
    message: 'Start the Eulerian walk at JFK: route = [], stack = [JFK].',
    graph: cloneGraph(graph),
    stack: [...stack],
    route: [...route],
    current: 'JFK',
  })

  // 4. Hierholzer main loop.
  let guard = 0
  const limit = tickets.length * 4 + 20
  while (stack.length && guard < limit) {
    guard += 1
    const airport = stack[stack.length - 1]

    steps.push({
      phase: 'peek',
      activeLine: 9,
      relatedLines: [8, 9],
      message: `Look at the top of the stack: current airport = ${airport}.`,
      graph: cloneGraph(graph),
      stack: [...stack],
      route: [...route],
      current: airport,
    })

    const dests = graph[airport]
    if (dests && dests.length) {
      const next = dests[0]
      steps.push({
        phase: 'advance',
        activeLine: 11,
        relatedLines: [10, 11],
        message: `${airport} still has tickets. Take the smallest -> ${next}; remove that ticket and push ${next}.`,
        graph: cloneGraph(graph),
        stack: [...stack, next],
        route: [...route],
        current: next,
        edge: { from: airport, to: next },
      })
      dests.shift()
      stack.push(next)
    } else {
      const done = stack.pop()
      route.push(done)
      steps.push({
        phase: 'backtrack',
        activeLine: 13,
        relatedLines: [10, 12, 13],
        message: `${done} has no tickets left (dead end). Pop it and prepend it to the itinerary.`,
        graph: cloneGraph(graph),
        stack: [...stack],
        route: [...route],
        current: stack.length ? stack[stack.length - 1] : null,
        appended: done,
      })
    }
  }

  const itinerary = [...route].reverse()
  steps.push({
    phase: 'done',
    activeLine: 14,
    relatedLines: [14],
    message: `Stack empty. Reverse the walk -> itinerary: ${itinerary.join(' -> ')}.`,
    graph: cloneGraph(graph),
    stack: [],
    route: [...route],
    itinerary,
    current: null,
    done: true,
  })

  return steps
}

const ACCENT = '#38bdf8'
const GREEN = '#22c55e'
const TEXT = 'var(--text)'
const MUTED = 'var(--text-muted)'

const chipBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'monospace',
  border: '1px solid var(--border)',
  background: 'var(--surface2)',
  color: TEXT,
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: MUTED,
  marginBottom: 8,
}

export default function ReconstructItineraryVisualizer() {
  const [inputValue, setInputValue] = useState(
    JSON.stringify(EXAMPLES[0].tickets || EXAMPLES[0].inputs || EXAMPLES[0]),
  )

  const parsed = useMemo(() => {
    try {
      return JSON.parse(inputValue)
    } catch {
      return undefined
    }
  }, [inputValue])

  const tickets = useMemo(() => {
    if (!Array.isArray(parsed)) return null
    const ok = parsed.every(
      (t) => Array.isArray(t) && t.length === 2 && typeof t[0] === 'string' && typeof t[1] === 'string',
    )
    return ok ? parsed : null
  }, [parsed])

  const inputError = useMemo(() => {
    try {
      JSON.parse(inputValue)
    } catch (e) {
      return e.message
    }
    if (!tickets) return 'Input must be an array of [from, to] string pairs, e.g. [["JFK","SFO"],["SFO","ATL"]].'
    if (tickets.length > 0 && !parsed.some(([from]) => from === 'JFK')) {
      return 'Tickets must include at least one flight departing from "JFK" (the fixed start airport).'
    }
    return ''
  }, [inputValue, tickets, parsed])

  const allAirports = useMemo(() => {
    if (!tickets) return []
    const set = new Set()
    tickets.forEach(([a, b]) => {
      set.add(a)
      set.add(b)
    })
    return [...set].sort()
  }, [tickets])

  const steps = useMemo(
    () => (tickets && !inputError ? generateSteps(tickets) : []),
    [tickets, inputError],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const displayItinerary = step ? [...(step.route || [])].reverse() : []
  const showSorted = step && Array.isArray(step.sortedTickets)

  return (
    <div className="reconstruct-itinerary-shell">
      <div className="reconstruct-itinerary-panel">
        <div className="reconstruct-itinerary-panel-head">Tickets (JSON list of [from, to] pairs)</div>
        <div className="reconstruct-itinerary-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="reconstruct-itinerary-textarea"
            placeholder='[["JFK","SFO"],["SFO","ATL"]]'
          />
          {inputError && <div className="reconstruct-itinerary-error">{inputError}</div>}
        </div>
      </div>

      <div className="reconstruct-itinerary-panel">
        <div className="reconstruct-itinerary-panel-head">Visualization</div>
        <div className="reconstruct-itinerary-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="reconstruct-itinerary-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="reconstruct-itinerary-step-info"
                style={{
                  borderLeftColor: step?.done ? GREEN : ACCENT,
                  background: step?.done
                    ? 'linear-gradient(135deg, #22c55e20, #22c55e10)'
                    : 'linear-gradient(135deg, #38bdf820, #38bdf810)',
                }}
              >
                <h3>
                  {step?.message
                    || (inputError
                      ? 'Fix the tickets input to run the algorithm.'
                      : 'Press Play (or step forward) to run Hierholzer\'s algorithm from JFK.')}
                </h3>
              </div>

              {showSorted && (
                <div>
                  <div style={labelStyle}>Sorted tickets</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {step.sortedTickets.map(([from, to], i) => {
                      const hot = step.edge && step.edge.from === from && step.edge.to === to
                      return (
                        <span
                          key={`${from}-${to}-${i}`}
                          style={{
                            ...chipBase,
                            borderColor: hot ? ACCENT : 'var(--border)',
                            background: hot ? '#38bdf822' : 'var(--surface2)',
                            color: hot ? ACCENT : TEXT,
                          }}
                        >
                          {from}&rarr;{to}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                  <div style={labelStyle}>Adjacency map — remaining tickets</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {allAirports.length === 0 && <span style={{ color: MUTED }}>—</span>}
                    {allAirports.map((ap) => {
                      const dests = (step?.graph && step.graph[ap]) || []
                      const isCurrent = step?.current === ap
                      return (
                        <div
                          key={ap}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: `1px solid ${isCurrent ? ACCENT : 'var(--surface2)'}`,
                            background: isCurrent ? '#38bdf814' : 'transparent',
                          }}
                        >
                          <span
                            style={{
                              ...chipBase,
                              minWidth: 44,
                              borderColor: isCurrent ? ACCENT : 'var(--text-muted)',
                              background: isCurrent ? ACCENT : 'var(--code-bg)',
                              color: isCurrent ? '#0b1120' : TEXT,
                            }}
                          >
                            {ap}
                          </span>
                          <span style={{ color: MUTED }}>&rarr;</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {dests.length === 0 ? (
                              <span style={{ color: MUTED, fontSize: 13, fontStyle: 'italic' }}>none</span>
                            ) : (
                              dests.map((d, i) => {
                                const used = step?.edge && step.edge.from === ap && step.edge.to === d && i === 0
                                return (
                                  <span
                                    key={`${ap}-${d}-${i}`}
                                    style={{
                                      ...chipBase,
                                      borderColor: used ? GREEN : 'var(--border)',
                                      background: used ? '#22c55e22' : 'var(--surface2)',
                                      color: used ? GREEN : TEXT,
                                    }}
                                  >
                                    {d}
                                  </span>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ flex: '0 0 150px' }}>
                  <div style={labelStyle}>DFS stack</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid var(--surface2)',
                      minHeight: 60,
                    }}
                  >
                    {(!step || !step.stack || step.stack.length === 0) && (
                      <span style={{ color: MUTED, fontSize: 13, fontStyle: 'italic' }}>empty</span>
                    )}
                    {step && step.stack && step.stack.slice().reverse().map((ap, idx) => {
                      const isTop = idx === 0
                      return (
                        <div
                          key={`${ap}-${idx}`}
                          style={{
                            ...chipBase,
                            justifyContent: 'space-between',
                            borderColor: isTop ? ACCENT : 'var(--border)',
                            background: isTop ? '#38bdf822' : 'var(--surface2)',
                            color: isTop ? ACCENT : TEXT,
                          }}
                        >
                          <span>{ap}</span>
                          {isTop && <span style={{ fontSize: 10, fontWeight: 700 }}>TOP</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div style={labelStyle}>
                  Itinerary {step?.done ? '(final)' : '(built from the end as we backtrack)'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  {displayItinerary.length === 0 ? (
                    <span style={{ color: MUTED, fontSize: 13 }}>—</span>
                  ) : (
                    displayItinerary.map((ap, i) => (
                      <span key={`itin-${ap}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <span style={{ color: step?.done ? GREEN : ACCENT }}>&rarr;</span>}
                        <span
                          style={{
                            ...chipBase,
                            borderColor: step?.done ? GREEN : ACCENT,
                            background: step?.done ? '#22c55e22' : '#38bdf818',
                            color: step?.done ? GREEN : TEXT,
                          }}
                        >
                          {ap}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="reconstruct-itinerary-panel">
        <div className="reconstruct-itinerary-panel-head">Code</div>
        <div className="reconstruct-itinerary-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="reconstruct-itinerary-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="reconstruct-itinerary-example-btn"
              onClick={() => {
                setInputValue(JSON.stringify(example.tickets || example.inputs || example))
                handleReset()
              }}
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
