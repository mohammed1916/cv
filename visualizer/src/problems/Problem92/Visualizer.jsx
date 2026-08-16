import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'locate_prev', 'reverse', 'done']

const LINE_PATTERN_MAP = {
  3: 'init',        // dummy = ListNode(0, head)
  4: 'init',        // prev = dummy
  5: 'locate_prev', // for _ in range(left - 1):
  6: 'locate_prev', //     prev = prev.next
  7: 'reverse',     // curr = prev.next
  8: 'reverse',     // for _ in range(right - left):
  9: 'reverse',     //     moved = curr.next
  10: 'reverse',    //     curr.next = moved.next
  11: 'reverse',    //     moved.next = prev.next
  12: 'reverse',    //     prev.next = moved
  13: 'done',       // return dummy.next
}

const EXAMPLES = [
  { label: 'Example 1', list: [1, 2, 3, 4, 5], left: 2, right: 4 },
  { label: 'Example 2', list: [3, 5], left: 1, right: 2 },
]

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def reverseBetween(self, head, left, right):' },
  { line: 3, text: '        dummy = ListNode(0, head)' },
  { line: 4, text: '        prev = dummy' },
  { line: 5, text: '        for _ in range(left - 1):' },
  { line: 6, text: '            prev = prev.next' },
  { line: 7, text: '        curr = prev.next' },
  { line: 8, text: '        for _ in range(right - left):' },
  { line: 9, text: '            moved = curr.next' },
  { line: 10, text: '            curr.next = moved.next' },
  { line: 11, text: '            moved.next = prev.next' },
  { line: 12, text: '            prev.next = moved' },
  { line: 13, text: '        return dummy.next' },
]

let __nid = 0

function generateSteps(list, left, right) {
  const steps = []

  // Build node objects with stable ids. Index 0 is the dummy node.
  __nid = 0
  const dummy = { id: `n${__nid++}`, val: null, isDummy: true }
  const nodes = [dummy, ...list.map((v) => ({ id: `n${__nid++}`, val: v }))]

  // Order is an array of node ids representing the current linked-list order,
  // starting from the dummy. We mutate `order` as head-insertions happen.
  const order = nodes.map((n) => n.id)
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  // In `order`, list position p (1-indexed original) sits at array index p
  // because index 0 is the dummy.
  const leftBound = left
  const rightBound = right

  const snap = (extra) => {
    // Produce the displayable node array (exclude dummy) in current order.
    const displayIds = order.slice(1)
    return {
      nodes: displayIds.map((id) => ({ id, val: byId[id].val })),
      left: leftBound,
      right: rightBound,
      ...extra,
    }
  }

  steps.push(
    snap({
      phase: 'init',
      activeLine: 3,
      prevId: dummy.id,
      currId: null,
      movedId: null,
      message: `Create dummy node before head. Reverse window is positions ${left}..${right}.`,
    })
  )

  // Advance prev to the node before position `left`.
  // prevIndex is an index into `order` (0 = dummy).
  let prevIndex = 0
  steps.push(
    snap({
      phase: 'locate_prev',
      activeLine: 4,
      prevId: order[prevIndex],
      currId: null,
      movedId: null,
      message: 'prev starts at the dummy node.',
    })
  )

  for (let i = 0; i < left - 1; i++) {
    prevIndex++
    steps.push(
      snap({
        phase: 'locate_prev',
        activeLine: 6,
        prevId: order[prevIndex],
        currId: null,
        movedId: null,
        message: `Advance prev to node with value ${byId[order[prevIndex]].val} (position ${prevIndex}).`,
      })
    )
  }

  // curr is the first node of the sublist: order[prevIndex + 1].
  const currId = order[prevIndex + 1]
  steps.push(
    snap({
      phase: 'reverse',
      activeLine: 7,
      prevId: order[prevIndex],
      currId,
      movedId: null,
      message: `curr = node after prev (value ${byId[currId].val}, position ${left}). This node stays put; nodes after it get moved in front.`,
    })
  )

  // Head-insertion: (right - left) times, take the node after curr and move it
  // to just after prev.
  for (let i = 0; i < right - left; i++) {
    // moved is the node right after curr. curr's array position drifts back as
    // earlier iterations insert nodes ahead of it, so locate it by id.
    const currArrIdx = order.indexOf(currId)
    const movedArrIdx = currArrIdx + 1
    const movedId = order[movedArrIdx]

    steps.push(
      snap({
        phase: 'reverse',
        activeLine: 9,
        prevId: order[prevIndex],
        currId,
        movedId,
        message: `moved = curr.next (value ${byId[movedId].val}). It will be spliced out and re-inserted right after prev.`,
      })
    )

    // Splice `moved` out: order becomes [...prev, curr, (rest without moved)]
    // then insert moved at prevIndex + 1.
    order.splice(movedArrIdx, 1) // remove moved
    order.splice(prevIndex + 1, 0, movedId) // insert right after prev

    steps.push(
      snap({
        phase: 'reverse',
        activeLine: 12,
        prevId: order[prevIndex],
        currId,
        movedId,
        message: `Insert value ${byId[movedId].val} right after prev. curr (value ${byId[currId].val}) shifts back one.`,
      })
    )
  }

  steps.push(
    snap({
      phase: 'done',
      activeLine: 13,
      prevId: null,
      currId: null,
      movedId: null,
      message: `Done. Sublist [${left}..${right}] reversed. Result: [${order.slice(1).map((id) => byId[id].val).join(', ')}]`,
    })
  )

  return steps
}

function Node({ node, pos, step, isLast }) {
  const inWindow = pos >= step.left && pos <= step.right
  const isPrev = node.id === step.prevId
  const isCurr = node.id === step.currId
  const isMoved = node.id === step.movedId

  let border = '2px solid var(--border)'
  let bg = inWindow ? '#0e2a3f' : 'var(--surface2)'
  let glow = 'none'
  if (isMoved) {
    border = '3px solid #f59e0b'
    bg = '#3b2708'
    glow = '0 0 0 3px rgba(245,158,11,0.35)'
  } else if (isCurr) {
    border = '3px solid #38bdf8'
    bg = '#08344a'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* pointer labels above */}
      <div style={{ height: 18, display: 'flex', gap: 4, fontSize: 10, fontWeight: 700 }}>
        {isPrev && <span style={{ color: '#7e56f8' }}>prev</span>}
        {isCurr && <span style={{ color: '#067db1' }}>curr</span>}
        {isMoved && <span style={{ color: '#a36907' }}>moved</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          animate={{ scale: isMoved ? 1.12 : isCurr ? 1.06 : 1 }}
          style={{
            minWidth: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            border,
            background: bg,
            boxShadow: glow,
            color: '#5577a4',
            fontWeight: 700,
            fontSize: 15,
            padding: '0 8px',
          }}
        >
          {node.val}
        </motion.div>
        {!isLast && (
          <span style={{ color: 'var(--text-muted)', fontSize: 20, fontWeight: 700 }}>→</span>
        )}
      </div>
      <div style={{ fontSize: 10, color: inWindow ? '#38bdf8' : 'var(--text-muted)' }}>pos {pos}</div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#627794', fontSize: 13 }}>
        Press play to reverse the sublist.
      </div>
    )
  }

  const { nodes = [] } = step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 4,
          flexWrap: 'wrap',
          padding: '12px 8px',
          borderRadius: 10,
          background: 'var(--code-bg)',
          border: '1px solid var(--surface2)',
          minHeight: 96,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ height: 18 }} />
          <div
            style={{
              minWidth: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              border: '2px dashed var(--text-muted)',
              color: 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            dummy
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>head</div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 20, fontWeight: 700, alignSelf: 'center' }}>→</span>
        {nodes.map((node, i) => (
          <Node
            key={node.id}
            node={node}
            pos={i + 1}
            step={step}
            isLast={i === nodes.length - 1}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: '#627794' }}>
        <span style={{ color: '#7e56f8' }}>prev = node before window</span>
        <span style={{ color: '#067db1' }}>curr = first sublist node (stays)</span>
        <span style={{ color: '#a36907' }}>moved = node re-inserted after prev</span>
        <span>
          window shaded: [{step.left}..{step.right}]
        </span>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: '#0e2a3f',
          border: '1px solid #1e3a52',
          color: 'var(--border)',
          fontSize: 13,
        }}
      >
        {step.message}
      </div>
    </div>
  )
}

export default function Problem92Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [listInput, setListInput] = useState("[1,2,3,4,5]");
  const [leftInput, setLeftInput] = useState(2);
  const [rightInput, setRightInput] = useState(4);
  const { list, left, right, inputError } = useMemo(() => {
    try {
      const parsedList = JSON.parse(listInput); if (!Array.isArray(parsedList)) throw new Error('list must be an array');
      const parsedLeft = Number(leftInput); if (isNaN(parsedLeft)) throw new Error('left must be a number');
      const parsedRight = Number(rightInput); if (isNaN(parsedRight)) throw new Error('right must be a number');
      return { list: parsedList, left: parsedLeft, right: parsedRight, inputError: '' };
    } catch (e) {
      return { list: "[1,2,3,4,5]", left: 2, right: 4, inputError: e.message };
    }
  }, [listInput, leftInput, rightInput]);
  const steps = useMemo(
    () =>
      generateSteps(list, left, right).map((c) => ({
        ...c,
        relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
      })),
    [list, left, right]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setListInput(JSON.stringify(e.list)); setLeftInput(String(e.left)); setRightInput(String(e.right)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 3: Extract panels into consts
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
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"list","label":"list","type":"array"},{"key":"left","label":"left","type":"number"},{"key":"right","label":"right","type":"number"}]}
        values={{ list: listInput, left: leftInput, right: rightInput }}
        onChange={(k, v) => { if (k === 'list') setListInput(v); if (k === 'left') setLeftInput(v); if (k === 'right') setRightInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="problem92-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem92-status">
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', flexWrap: 'wrap' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
              border: ex.label === e.label ? '2px solid #38bdf8' : '1px solid var(--border)',
              background: ex.label === e.label ? '#08344a' : 'var(--surface2)',
              color: '#5577a4',
            }}
          >
            {e.label}: [{e.list.join(',')}] left={e.left} right={e.right}
          </button>
        ))}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
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
    </>
  )

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🔗 Reverse List II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="problem92-shell">
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
    </div>
  )
}
