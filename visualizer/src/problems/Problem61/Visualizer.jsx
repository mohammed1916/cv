import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import "./Visualizer.css"

const PATTERNS = ['init', 'measure', 'form_ring', 'locate', 'break_ring', 'done']

const SOLUTION_CODE = [
  { line: 1, text: 'def rotateRight(head, k):' },
  { line: 2, text: '    if not head or not head.next: return head' },
  { line: 3, text: '    n, tail = 1, head' },
  { line: 4, text: '    while tail.next:' },
  { line: 5, text: '        tail = tail.next; n += 1' },
  { line: 6, text: '    tail.next = head            # form a ring' },
  { line: 7, text: '    k = k % n' },
  { line: 8, text: '    steps = n - k - 1' },
  { line: 9, text: '    newTail = head' },
  { line: 10, text: '    for _ in range(steps):' },
  { line: 11, text: '        newTail = newTail.next' },
  { line: 12, text: '    newHead = newTail.next' },
  { line: 13, text: '    newTail.next = None         # break the ring' },
  { line: 14, text: '    return newHead' },
]

// Every value below is one of PATTERNS
const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'measure',
  4: 'measure',
  5: 'measure',
  6: 'form_ring',
  7: 'locate',
  8: 'locate',
  9: 'locate',
  10: 'locate',
  11: 'locate',
  12: 'break_ring',
  13: 'break_ring',
  14: 'done',
}

const EXAMPLES = [
  { label: 'Example 1', list: [1, 2, 3, 4, 5], k: 2 },
  { label: 'Example 2', list: [0, 1, 2], k: 4 },
]

function generateSteps(list, k) {
  const steps = []
  if (!list || list.length === 0) {
    steps.push({
      activeLine: 2,
      phase: 'init',
      nodes: [],
      ring: false,
      pointer: -1,
      tail: -1,
      newTail: -1,
      newHead: -1,
      k,
      effectiveK: 0,
      message: 'Empty list. Nothing to rotate.',
    })
    return steps
  }

  // Build node objects with stable ids so React keys survive rotation.
  const nodes = list.map((val, i) => ({ id: i, val }))
  const n = nodes.length

  if (n === 1) {
    steps.push({
      activeLine: 2,
      phase: 'init',
      nodes: [...nodes],
      ring: false,
      pointer: -1,
      tail: -1,
      newTail: -1,
      newHead: -1,
      k,
      effectiveK: 0,
      message: 'Single node (or empty next). Return head unchanged.',
    })
    return steps
  }

  steps.push({
    activeLine: 2,
    phase: 'init',
    nodes: [...nodes],
    ring: false,
    pointer: -1,
    tail: -1,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK: null,
    message: `Head exists. Rotate list of ${n} nodes right by k=${k}.`,
  })

  // Measure length + find tail.
  steps.push({
    activeLine: 3,
    phase: 'measure',
    nodes: [...nodes],
    ring: false,
    pointer: 0,
    tail: -1,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK: null,
    message: 'Start: n = 1, tail = head (index 0).',
  })

  for (let i = 1; i < n; i++) {
    steps.push({
      activeLine: 5,
      phase: 'measure',
      nodes: [...nodes],
      ring: false,
      pointer: i,
      tail: i,
      newTail: -1,
      newHead: -1,
      k,
      effectiveK: null,
      message: `Advance tail to index ${i} (val ${nodes[i].val}); n = ${i + 1}.`,
    })
  }

  const tailIdx = n - 1

  // Form the ring: tail.next -> head.
  steps.push({
    activeLine: 6,
    phase: 'form_ring',
    nodes: [...nodes],
    ring: true,
    pointer: tailIdx,
    tail: tailIdx,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK: null,
    message: `Connect tail (index ${tailIdx}) -> head to form a ring. Length n = ${n}.`,
  })

  // Effective rotation.
  const effectiveK = ((k % n) + n) % n
  steps.push({
    activeLine: 7,
    phase: 'locate',
    nodes: [...nodes],
    ring: true,
    pointer: -1,
    tail: tailIdx,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK,
    message: `k = k % n = ${k} % ${n} = ${effectiveK}.`,
  })

  if (effectiveK === 0) {
    steps.push({
      activeLine: 13,
      phase: 'break_ring',
      nodes: [...nodes],
      ring: false,
      pointer: tailIdx,
      tail: tailIdx,
      newTail: tailIdx,
      newHead: 0,
      k,
      effectiveK,
      message: 'k % n == 0: break ring at original tail. List is unchanged.',
    })
    steps.push({
      activeLine: 14,
      phase: 'done',
      nodes: [...nodes],
      ring: false,
      pointer: -1,
      tail: tailIdx,
      newTail: tailIdx,
      newHead: 0,
      k,
      effectiveK,
      result: nodes.map((nd) => nd.val),
      message: `Done. Result: [${nodes.map((nd) => nd.val).join(', ')}].`,
    })
    return steps
  }

  const walk = n - effectiveK - 1

  steps.push({
    activeLine: 8,
    phase: 'locate',
    nodes: [...nodes],
    ring: true,
    pointer: -1,
    tail: tailIdx,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK,
    message: `New tail sits at position n - k - 1 = ${n} - ${effectiveK} - 1 = ${walk}. Walk ${walk} step(s).`,
  })

  // Walk to the new tail from head.
  let pos = 0
  steps.push({
    activeLine: 9,
    phase: 'locate',
    nodes: [...nodes],
    ring: true,
    pointer: pos,
    tail: tailIdx,
    newTail: -1,
    newHead: -1,
    k,
    effectiveK,
    message: 'newTail = head (index 0).',
  })

  for (let i = 0; i < walk; i++) {
    pos = i + 1
    steps.push({
      activeLine: 11,
      phase: 'locate',
      nodes: [...nodes],
      ring: true,
      pointer: pos,
      tail: tailIdx,
      newTail: -1,
      newHead: -1,
      k,
      effectiveK,
      message: `Advance newTail to index ${pos} (val ${nodes[pos].val}).`,
    })
  }

  const newTailIdx = walk
  const newHeadIdx = walk + 1

  steps.push({
    activeLine: 12,
    phase: 'break_ring',
    nodes: [...nodes],
    ring: true,
    pointer: newTailIdx,
    tail: tailIdx,
    newTail: newTailIdx,
    newHead: newHeadIdx,
    k,
    effectiveK,
    message: `newHead = newTail.next -> index ${newHeadIdx} (val ${nodes[newHeadIdx].val}).`,
  })

  steps.push({
    activeLine: 13,
    phase: 'break_ring',
    nodes: [...nodes],
    ring: false,
    pointer: newTailIdx,
    tail: tailIdx,
    newTail: newTailIdx,
    newHead: newHeadIdx,
    k,
    effectiveK,
    message: `Break the ring: newTail.next = None (cut after index ${newTailIdx}).`,
  })

  // Result ordering: from newHead around the (former) ring back to newTail.
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(nodes[(newHeadIdx + i) % n])
  }

  steps.push({
    activeLine: 14,
    phase: 'done',
    nodes: result,
    ring: false,
    pointer: -1,
    tail: -1,
    newTail: -1,
    newHead: 0,
    k,
    effectiveK,
    result: result.map((nd) => nd.val),
    message: `Done. Result: [${result.map((nd) => nd.val).join(', ')}].`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play (or step) to rotate the linked list.
      </div>
    )
  }

  const nodes = step.nodes || []
  const isDoneOrResult = step.phase === 'done'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 16 }}>
      <div
        style={{
          padding: 12,
          background: '#fff7ed',
          borderRadius: 8,
          borderLeft: '4px solid #f97316',
          fontSize: 12,
          color: '#7c2d12',
          fontStyle: 'italic',
        }}
      >
        Measure length &amp; tail, connect tail-&gt;head into a ring, walk to the new tail at
        position n - k - 1, then break the ring so newTail.next = null.
      </div>

      {/* State summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: '#e0f2fe',
            color: '#075985',
            fontWeight: 600,
          }}
        >
          k = {String(step.k)}
        </span>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: '#ede9fe',
            color: '#5b21b6',
            fontWeight: 600,
          }}
        >
          effective k = {step.effectiveK == null ? '?' : step.effectiveK}
        </span>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: step.ring ? '#fef3c7' : '#f1f5f9',
            color: step.ring ? '#92400e' : '#475569',
            fontWeight: 600,
          }}
        >
          ring: {step.ring ? 'formed' : 'broken'}
        </span>
      </div>

      {/* Linked list as boxes with arrows */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
          padding: '12px 4px',
          rowGap: 28,
        }}
      >
        {nodes.length === 0 && (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>null (empty list)</div>
        )}
        {nodes.map((node, idx) => {
          const isPointer = idx === step.pointer
          const isTail = idx === step.tail
          const isNewTail = idx === step.newTail
          const isNewHead = !isDoneOrResult && idx === step.newHead
          const isFirstAfterRotate = isDoneOrResult && idx === 0

          let bg = '#dbeafe'
          let border = '2px solid #93c5fd'
          if (isNewHead || isFirstAfterRotate) {
            bg = '#dcfce7'
            border = '3px solid #16a34a'
          } else if (isNewTail) {
            bg = '#fee2e2'
            border = '3px solid #dc2626'
          } else if (isTail) {
            bg = '#fef3c7'
            border = '3px solid #d97706'
          }
          if (isPointer) {
            border = '3px solid #0ea5e9'
          }

          const isLast = idx === nodes.length - 1

          return (
            <div
              key={node.id}
              style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* labels above */}
                <div
                  style={{
                    height: 16,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  {isPointer && <span style={{ color: '#0ea5e9' }}>ptr</span>}
                  {(isNewHead || isFirstAfterRotate) && (
                    <span style={{ color: '#16a34a' }}>newHead</span>
                  )}
                  {isNewTail && <span style={{ color: '#dc2626' }}>newTail</span>}
                  {isTail && !isNewTail && <span style={{ color: '#d97706' }}>tail</span>}
                </div>
                <motion.div
                  animate={{ scale: isPointer ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    minWidth: 40,
                    height: 40,
                    padding: '0 10px',
                    background: bg,
                    border,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  {node.val}
                </motion.div>
              </div>

              {/* forward arrow to next node */}
              {!isLast && (
                <span style={{ margin: '0 4px', color: '#64748b', fontSize: 20, marginTop: 18 }}>
                  →
                </span>
              )}
              {/* tail's next: ring back to head, or null */}
              {isLast && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    color: step.ring ? '#d97706' : '#94a3b8',
                    fontWeight: 600,
                    marginTop: 18,
                  }}
                >
                  {step.ring ? '↩ head (ring)' : '→ null'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {step.result && (
        <div
          style={{
            padding: 10,
            background: '#f0fdf4',
            borderRadius: 8,
            border: '1px solid #86efac',
            fontSize: 13,
            color: '#166534',
            fontWeight: 600,
          }}
        >
          Result: [{step.result.join(', ')}]
        </div>
      )}

      <motion.div
        key={step.message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: 12,
          background: '#fff7ed',
          borderRadius: 8,
          border: '2px solid #f97316',
          fontSize: 12,
          color: '#7c2d12',
        }}
      >
        {step.message}
      </motion.div>
    </div>
  )
}

export default function Problem61Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.list, ex.k).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
              activeLine={step?.activeLine}
            />
          )}
        </div>
      ),
    },
    { id: 'viz', title: '🔄 Rotate List', content: (<VisualizationPanel step={step} />) },
  ], [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom])

  return (
    <div className="problem-shell">
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '8px 12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Examples:</span>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            className="problem61-button"
            onClick={() => applyEx(e)}
            style={{
              fontWeight: ex.label === e.label ? 700 : 500,
              outline: ex.label === e.label ? '2px solid #f97316' : 'none',
            }}
          >
            {e.label}: [{e.list.join(',')}] k={e.k}
          </button>
        ))}
      </div>
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
    </div>
  )
}
