import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './LinkedListCycleIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('linked-list-cycle-ii', [
  { label: 'Example 1', nodes: [3, 2, 0, -4], pos: 1 },
  { label: 'Example 2', nodes: [1, 2], pos: 0 },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def detectCycle(head):' },
  { line: 2, text: '    slow = fast = head' },
  { line: 3, text: '    while fast and fast.next:' },
  { line: 4, text: '        slow = slow.next' },
  { line: 5, text: '        fast = fast.next.next' },
  { line: 6, text: '        if slow == fast:' },
  { line: 7, text: '            slow = head' },
  { line: 8, text: '            while slow != fast:' },
  { line: 9, text: '                slow = slow.next' },
  { line: 10, text: '                fast = fast.next' },
  { line: 11, text: '            return slow' },
  { line: 12, text: '    return None' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildList(nodes, cyclePos) {
  if (nodes.length === 0) return null
  const list = nodes.map((val, idx) => ({ val, idx, next: null }))
  for (let i = 0; i < list.length - 1; i++) {
    list[i].next = list[i + 1]
  }
  if (cyclePos >= 0 && cyclePos < list.length) {
    list[list.length - 1].next = list[cyclePos]
  }
  return { head: list[0], cycleStart: cyclePos >= 0 ? cyclePos : -1, totalNodes: nodes.length }
}

function generateSteps(nodes, cyclePos) {
const applyInput = useCallback((e) => { setInput(e); setNodesInput(JSON.stringify(e.nodes)); setPosInput(String(e.pos)); handleReset(); }, [handleReset]);
    const steps = []

  const list = buildList(nodes, cyclePos)
  if (!list.head) {
    steps.push({
      activeLine: 1,
      message: 'Empty list',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Detect cycle using Floyd's algorithm`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    slowPos: 0,
    fastPos: 0,
    visitedSlow: [0],
    visitedFast: [0],
    message: 'Initialize slow and fast pointers at head',
    relatedLines: [2],
  })

  let slowPos = 0
  let fastPos = 0
  let step_count = 0
  const slowVisited = [0]
  const fastVisited = [0]
  let slowFastMet = false
  let meetPos = -1

  // Phase 1: Find meeting point
  while (step_count < 100) {
    step_count++

    // Move slow
    if (slowPos < list.totalNodes - 1 || list.cycleStart >= 0) {
      slowPos = (slowPos + 1) % (list.cycleStart >= 0 ? list.totalNodes : list.totalNodes)
      if (slowPos === 0 && list.cycleStart >= 0) slowPos = list.cycleStart
      slowVisited.push(slowPos)
    }

    // Move fast
    if (fastPos < list.totalNodes - 1 || list.cycleStart >= 0) {
      fastPos = (fastPos + 1) % (list.cycleStart >= 0 ? list.totalNodes : list.totalNodes)
      if (fastPos === 0 && list.cycleStart >= 0) fastPos = list.cycleStart
      fastPos = (fastPos + 1) % (list.cycleStart >= 0 ? list.totalNodes : list.totalNodes)
      if (fastPos === 0 && list.cycleStart >= 0) fastPos = list.cycleStart
      fastVisited.push(fastPos)
    }

    steps.push({
      activeLine: 3,
      slowPos,
      fastPos,
      visitedSlow: [...slowVisited],
      visitedFast: [...fastVisited],
      message: `Slow → ${slowPos}, Fast → ${fastPos}`,
      relatedLines: [3, 4, 5],
    })

    if (slowPos === fastPos && slowVisited.length > 1) {
      slowFastMet = true
      meetPos = slowPos
      steps.push({
        activeLine: 6,
        slowPos,
        fastPos,
        visitedSlow: [...slowVisited],
        visitedFast: [...fastVisited],
        message: `🔄 Meeting point found at position ${slowPos}!`,
        relatedLines: [6],
      })
      break
    }
  }

  if (!slowFastMet) {
    steps.push({
      activeLine: 12,
      done: true,
      message: 'No cycle detected',
      relatedLines: [12],
    })
    return steps
  }

  // Phase 2: Find cycle start
  steps.push({
    activeLine: 7,
    message: 'Reset slow to head, keep fast at meeting point',
    relatedLines: [7],
  })

  slowPos = 0
  const cycleStart = list.cycleStart

  steps.push({
    activeLine: 8,
    slowPos,
    fastPos: meetPos,
    cycleStart,
    message: `Move both pointers one step until they meet at cycle start`,
    relatedLines: [8],
  })

  const slowPhase2 = [0]
  const fastPhase2 = [meetPos]

  while (slowPos !== fastPos && slowPos !== cycleStart) {
    slowPos = slowPos + 1
    fastPos = fastPos + 1
    slowPhase2.push(slowPos)
    fastPhase2.push(fastPos)

    steps.push({
      activeLine: 9,
      slowPos,
      fastPos,
      cycleStart,
      phase2Slow: slowPhase2,
      phase2Fast: fastPhase2,
      message: `Slow → ${slowPos}, Fast → ${fastPos}`,
      relatedLines: [9, 10],
    })

    if (slowPos === fastPos) {
      steps.push({
        activeLine: 11,
        slowPos,
        fastPos,
        cycleStart,
        result: slowPos,
        done: true,
        message: `✓ Cycle starts at position ${slowPos}!`,
        relatedLines: [11],
      })
      return steps
    }
  }

  steps.push({
    activeLine: 12,
    result: -1,
    done: true,
    message: 'No cycle found',
    relatedLines: [12],
  })

  return steps
}

function ListVisualization({ nodes, slowPos, fastPos, cycleStart, phase2Slow, phase2Fast }) {
  const radius = 200
  const nodeRadius = 30

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
      <svg width={500} height={320} style={{ overflow: 'visible' }}>
        {/* Nodes in circle if there's a cycle */}
        {cycleStart >= 0 ? (
          <>
          // Draw cycle
            {nodes.map((val, idx) => {
              const angle = (idx / nodes.length) * 2 * Math.PI
              const x = 250 + radius * Math.cos(angle)
              const y = 160 + radius * Math.sin(angle)

              const isInCycle = idx >= cycleStart
              const isSlow = idx === slowPos
              const isFast = idx === fastPos

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius}
                    fill={isSlow ? '#fbbf24' : isFast ? '#f87171' : isInCycle ? '#c7d2fe' : '#e2e8f0'}
                    stroke={isSlow || isFast ? '#000' : isInCycle ? '#4f46e5' : '#94a3b8'}
                    strokeWidth={isSlow || isFast ? 3 : 2}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize={14}
                    fontWeight="600"
                    fill="#0f172a"
                  >
                    {val}
                  </text>
                </g>
              )
            })}
            {/* Draw edges */}
            {nodes.map((_, idx) => {
              const angle1 = (idx / nodes.length) * 2 * Math.PI
              const x1 = 250 + radius * Math.cos(angle1)
              const y1 = 160 + radius * Math.sin(angle1)

              const nextIdx = idx + 1 < nodes.length ? idx + 1 : (cycleStart >= 0 ? cycleStart : -1)
              if (nextIdx === -1) return null

              const angle2 = (nextIdx / nodes.length) * 2 * Math.PI
              const x2 = 250 + radius * Math.cos(angle2)
              const y2 = 160 + radius * Math.sin(angle2)

              return (
                <line
                  key={`edge-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
              )
            })}
          </>
        ) : (
          <>
          // Draw linear list
            {nodes.map((val, idx) => {
              const x = 50 + idx * 70
              const y = 160

              const isSlow = idx === slowPos
              const isFast = idx === fastPos

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius}
                    fill={isSlow ? '#fbbf24' : isFast ? '#f87171' : '#e2e8f0'}
                    stroke={isSlow || isFast ? '#000' : '#94a3b8'}
                    strokeWidth={isSlow || isFast ? 3 : 2}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize={14}
                    fontWeight="600"
                    fill="#0f172a"
                  >
                    {val}
                  </text>
                </g>
              )
            })}
          </>
        )}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

function VisualizationPanel({ step, nodes, cycleStart }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>
          Floyd's cycle detection: slow (1 step), fast (2 steps) pointers meet → find cycle start.
        </div>
      </div>

      <ListVisualization
        nodes={nodes}
        slowPos={step.slowPos}
        fastPos={step.fastPos}
        cycleStart={cycleStart}
      />

      {step.slowPos !== undefined && step.fastPos !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Pointer Positions
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#5b21b6' }}>
              🐢 Slow: {step.slowPos}
            </div>
            <div style={{ fontSize: 11, color: '#5b21b6' }}>
              🐇 Fast: {step.fastPos}
            </div>
          </div>
        </motion.div>
      )}

      {step.result !== undefined && step.result >= 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Cycle Start Position
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
            {step.result}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function LinkedListCycleIIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [nodesInput, setNodesInput] = useState("[3,2,0,-4]");
  const [posInput, setPosInput] = useState(1);
  const { nodes, pos, inputError } = useMemo(() => {
    try {
      const parsedNodes = JSON.parse(nodesInput); if (!Array.isArray(parsedNodes)) throw new Error('nodes must be an array');
      const parsedPos = Number(posInput); if (isNaN(parsedPos)) throw new Error('pos must be a number');
      return { nodes: parsedNodes, pos: parsedPos, inputError: '' };
    } catch (e) {
      return { nodes: "[3,2,0,-4]", pos: 1, inputError: e.message };
    }
  }, [nodesInput, posInput]);
  const steps = useMemo(
    () =>
      generateSteps(nodes, pos).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [nodes, pos]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panel components
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} step={step} activeLineDom={activeLineDom} />}
    </div>
  )

  const vizPanel = (
    <>
    <div className="llc2-panel">
      <VisualizationPanel step={step} nodes={nodes} cycleStart={pos} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="llc2-status">
      <div style={{ fontSize: 12, padding: '4px 8px', color: '#64748b' }}>
        {step ? `Step ${stepIndex + 1} / ${steps.length}` : 'Ready'}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
    </>
  )

  // Lumino panel config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'viz', title: '🔗 Cycle II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="llc2-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
