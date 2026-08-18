import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { GraphCanvas3D } from '../../components/viz3d'
import { getExamples } from '../../config/examplesRegistry'
import './CourseScheduleIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findOrder(self, numCourses, prerequisites):' },
  { line: 3, text: '        adj = {i: [] for i in range(numCourses)}' },
  { line: 4, text: '        indegree = [0] * numCourses' },
  { line: 5, text: '        for course, pre in prerequisites:' },
  { line: 6, text: '            adj[pre].append(course)' },
  { line: 7, text: '            indegree[course] += 1' },
  { line: 8, text: '        queue = [i for i in range(numCourses) if indegree[i] == 0]' },
  { line: 9, text: '        order = []' },
  { line: 10, text: '        while queue:' },
  { line: 11, text: '            node = queue.pop(0)' },
  { line: 12, text: '            order.append(node)' },
  { line: 13, text: '            for nxt in adj[node]:' },
  { line: 14, text: '                indegree[nxt] -= 1' },
  { line: 15, text: '                if indegree[nxt] == 0:' },
  { line: 16, text: '                    queue.append(nxt)' },
  { line: 17, text: '        return order if len(order) == numCourses else []' },
]

function nodePos(count, width = 400, height = 260) {
  const cX = width / 2
  const cY = height / 2
  const r = Math.min(width, height) * 0.34
  const out = {}
  for (let i = 0; i < count; i++) {
    const a = (i / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2
    out[i] = { x: cX + r * Math.cos(a), y: cY + r * Math.sin(a) }
  }
  return out
}

// ─── Visualization Panel Component ────────────────────────────────────────
function VisualizationPanel({ numCourses, step, positions, edges, EXAMPLES, applyExample, inputError }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <section className="cs2-panel graph" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="cs2-head">
          <span>Graph & Topological Flow</span>
          {inputError && <span className="cs2-error">{inputError}</span>}
        </header>
        <div className="cs2-body" style={{ flex: 1 }}>
          <div className="cs2-examples">
            {EXAMPLES.map((ex) => (
              <button key={ex.label} className="cs2-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
            ))}
          </div>
          <div className="cs2-canvas" style={{ flex: 1 }}>
            <GraphCanvas3D
              nodes={Array.from({ length: numCourses }, (_, i) => ({
                id: i,
                label: String(i),
                x: positions[i]?.x ?? 200,
                y: positions[i]?.y ?? 130,
              }))}
              edges={edges.map(([u, v]) => ({ fromId: u, toId: v }))}
              visitedSet={new Set(step?.order ?? [])}
              activeNode={step?.node ?? null}
              activeNeighbor={step?.nxt ?? null}
              cloneEdgeSet={new Set()}
              width={400}
              height={260}
              isClone={false}
              nodeRadius={16}
            />
          </div>
        </div>
      </section>

      <section className="cs2-panel side" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="cs2-head"><span>Queue / Order</span></header>
        <div className="cs2-body" style={{ flex: 1 }}>
          <div>
            <div className="cs2-label">Queue</div>
            <div className="cs2-list">
              <AnimatePresence>
                {(step?.queue || []).map((v) => (
                  <motion.span key={`q-${v}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {v}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <div className="cs2-label">Topological Order</div>
            <div className="cs2-list order">
              {(step?.order || []).map((v, idx) => <span key={`o-${v}-${idx}`}>{v}</span>)}
            </div>
          </div>
          <div className={`cs2-result ${step?.phase === 'done' ? (step?.ok ? 'ok' : 'bad') : ''}`}>
            {step?.phase === 'done' ? (step.ok ? `Return [${step.order.join(', ')}]` : 'Return []') : 'Running Kahn BFS'}
          </div>
        </div>
      </section>

      <div className={`cs2-status ${step?.phase === 'done' ? (step?.ok ? 'ok' : 'bad') : ''}`} style={{ padding: '8px 0' }}>
        {step?.message || 'Press Play to start.'}
      </div>
    </div>
  )
}

function generateSteps(numCourses, prerequisites) {
  const steps = []
  if (numCourses <= 0) {
    return [{ phase: 'done', activeLine: 17, queue: [], indegree: [], order: [], adj: {}, ok: false, message: 'Invalid input.' }]
  }

  const adj = Object.fromEntries(Array.from({ length: numCourses }, (_, i) => [i, []]))
  const indegree = Array(numCourses).fill(0)

  steps.push({ phase: 'init', activeLine: 4, queue: [], indegree: [...indegree], order: [], adj, message: 'Initialize graph and indegree.' })
  for (const [course, pre] of prerequisites) {
    if (course < 0 || pre < 0 || course >= numCourses || pre >= numCourses) continue
    adj[pre].push(course)
    indegree[course] += 1
    steps.push({
      phase: 'build',
      activeLine: 7,
      edge: [pre, course],
      queue: [],
      indegree: [...indegree],
      order: [],
      adj,
      message: `Add edge ${pre} -> ${course}, indegree[${course}] = ${indegree[course]}.`,
    })
  }

  const queue = []
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i)
  const order = []
  steps.push({ phase: 'queue_init', activeLine: 8, queue: [...queue], indegree: [...indegree], order: [...order], adj, message: `Seed queue with indegree 0 nodes: [${queue.join(', ')}].` })

  while (queue.length) {
    const node = queue.shift()
    steps.push({ phase: 'pop', activeLine: 11, node, queue: [...queue], indegree: [...indegree], order: [...order], adj, message: `Pop ${node} from queue.` })
    order.push(node)
    steps.push({ phase: 'append', activeLine: 12, node, queue: [...queue], indegree: [...indegree], order: [...order], adj, message: `Append ${node} to topological order.` })

    for (const nxt of adj[node]) {
      indegree[nxt] -= 1
      steps.push({ phase: 'relax', activeLine: 14, node, nxt, queue: [...queue], indegree: [...indegree], order: [...order], adj, message: `Decrement indegree[${nxt}] to ${indegree[nxt]}.` })
      if (indegree[nxt] === 0) {
        queue.push(nxt)
        steps.push({ phase: 'enqueue', activeLine: 16, node, nxt, queue: [...queue], indegree: [...indegree], order: [...order], adj, message: `${nxt} is unlocked, enqueue.` })
      }
    }
  }

  const ok = order.length === numCourses
  steps.push({
    phase: 'done',
    activeLine: 17,
    queue: [...queue],
    indegree: [...indegree],
    order: [...order],
    adj,
    ok,
    message: ok ? `Topological order found: [${order.join(', ')}].` : 'Cycle detected. Return [].',
  })

  return steps
}

const EXAMPLES = getExamples('course-schedule-ii')

export default function CourseScheduleIIVisualizer() {
  const [numInput, setNumInput] = useState('4')
  const [preInput, setPreInput] = useState('[[1,0],[2,0],[3,1],[3,2]]')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { numCourses, prerequisites, inputError } = useMemo(() => {
    try {
      const n = Number(numInput)
      const p = JSON.parse(preInput)
      if (!Number.isInteger(n) || n < 1 || n > 14) throw new Error('numCourses must be 1-14')
      if (!Array.isArray(p)) throw new Error('prerequisites must be a 2D array')
      return { numCourses: n, prerequisites: p, inputError: '' }
    } catch (e) {
      return { numCourses: 2, prerequisites: [[1, 0]], inputError: e.message || 'Invalid input' }
    }
  }, [numInput, preInput])

  const steps = useMemo(() => generateSteps(numCourses, prerequisites), [numCourses, prerequisites])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const positions = useMemo(() => nodePos(numCourses), [numCourses])

  const edges = useMemo(() => {
    if (!step) return []
    const out = []
    Object.entries(step.adj).forEach(([u, list]) => list.forEach((v) => out.push([Number(u), v])))
    return out
  }, [step])

  const applyExample = useCallback((ex) => {
    setNumInput(String(ex.n))
    setPreInput(JSON.stringify(ex.p))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: '📊 Course Schedule - Topological Sort', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])

  const panelContents = useMemo(() => ({
    code: (
      <div style={{ position: 'relative' }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          onActiveLineDomChange={setActiveLineDom}
        />
        {step && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step.phase}
            activeLineDom={activeLineDom}
            activeLine={step.activeLine}
          />
        )}
      </div>
    ),
    viz: (
      <VisualizationPanel
        numCourses={numCourses}
        step={step}
        positions={positions}
        edges={edges}
        EXAMPLES={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />
    ),
  }), [step, positions, edges, numCourses, inputError, applyExample, activeLineDom])

  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="cs2-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.input && createPortal(
              <ManualInputPanel
                fields={[
                  { key: 'num', label: 'numCourses', type: 'number' },
                  { key: 'pre', label: 'prerequisites', type: 'array' }
                ]}
                values={{ num: numInput, pre: preInput }}
                onChange={(k, v) => {
                  if (k === 'num') setNumInput(v)
                  if (k === 'pre') setPreInput(v)
                  handleReset()
                }}
                examples={EXAMPLES}
                applyExample={applyExample}
                inputError={inputError}
              />,
              panelDivs.input
            )}
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
