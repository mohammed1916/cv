import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import "./Visualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'scan', 'append_less', 'append_ge', 'join', 'done']

const LINE_PATTERN_MAP = {
  2: 'init',   // lessDummy / geDummy setup
  3: 'init',   // less / ge tails
  4: 'scan',   // while curr
  5: 'append_less', // if curr.val < x
  6: 'append_less', // less.next = curr
  7: 'append_ge',   // else
  8: 'append_ge',   // ge.next = curr
  9: 'scan',        // curr = curr.next
  10: 'join',       // ge.next = None
  11: 'join',       // less.next = geDummy.next
  12: 'done',       // return lessDummy.next
}

const EXAMPLES = [
  { label: 'Example 1', list: [1, 4, 3, 2, 5, 2], x: 3 },
  { label: 'Example 2', list: [2, 1], x: 2 },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def partition(head, x):' },
  { line: 2, text: '    lessDummy, geDummy = ListNode(), ListNode()' },
  { line: 3, text: '    less, ge = lessDummy, geDummy' },
  { line: 4, text: '    while head:' },
  { line: 5, text: '        if head.val < x:' },
  { line: 6, text: '            less.next = head; less = less.next' },
  { line: 7, text: '        else:' },
  { line: 8, text: '            ge.next = head; ge = ge.next' },
  { line: 9, text: '        head = head.next' },
  { line: 10, text: '    ge.next = None' },
  { line: 11, text: '    less.next = geDummy.next' },
  { line: 12, text: '    return lessDummy.next' },
]

function generateSteps(list, x) {
  const steps = []

  // Give every original node a stable id so we can track it across lists.
  const original = list.map((val, i) => ({ id: i, val }))

  const less = []
  const ge = []

  steps.push({
    activeLine: 3,
    phase: 'init',
    original: original.map((n) => ({ ...n })),
    currentId: null,
    less: [],
    ge: [],
    x,
    joined: false,
    message: `Create two lists: "less than ${x}" and "≥ ${x}". Both start empty.`,
  })

  for (let i = 0; i < original.length; i++) {
    const node = original[i]

    // Step: examine the current node (comparison).
    steps.push({
      activeLine: 5,
      phase: 'scan',
      original: original.map((n) => ({ ...n })),
      currentId: node.id,
      less: less.map((n) => ({ ...n })),
      ge: ge.map((n) => ({ ...n })),
      x,
      joined: false,
      message: `Examine node ${node.val}: is ${node.val} < ${x}? ${node.val < x ? 'Yes' : 'No'}.`,
    })

    if (node.val < x) {
      less.push({ ...node })
      steps.push({
        activeLine: 6,
        phase: 'append_less',
        original: original.map((n) => ({ ...n })),
        currentId: node.id,
        less: less.map((n) => ({ ...n })),
        ge: ge.map((n) => ({ ...n })),
        x,
        joined: false,
        message: `${node.val} < ${x} → append to the "less" list.`,
      })
    } else {
      ge.push({ ...node })
      steps.push({
        activeLine: 8,
        phase: 'append_ge',
        original: original.map((n) => ({ ...n })),
        currentId: node.id,
        less: less.map((n) => ({ ...n })),
        ge: ge.map((n) => ({ ...n })),
        x,
        joined: false,
        message: `${node.val} ≥ ${x} → append to the "≥ ${x}" list.`,
      })
    }
  }

  // Final join: connect less.tail → ge.head.
  const merged = [...less, ...ge]
  steps.push({
    activeLine: 11,
    phase: 'join',
    original: original.map((n) => ({ ...n })),
    currentId: null,
    less: less.map((n) => ({ ...n })),
    ge: ge.map((n) => ({ ...n })),
    x,
    joined: true,
    merged: merged.map((n) => ({ ...n })),
    message: 'All nodes placed. Connect tail of "less" list to head of "≥ x" list.',
  })

  steps.push({
    activeLine: 12,
    phase: 'done',
    original: original.map((n) => ({ ...n })),
    currentId: null,
    less: less.map((n) => ({ ...n })),
    ge: ge.map((n) => ({ ...n })),
    x,
    joined: true,
    merged: merged.map((n) => ({ ...n })),
    message: `Done. Result: [${merged.map((n) => n.val).join(', ')}]`,
  })

  return steps
}

function NodeRow({ nodes, currentId, accent, emptyLabel }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ fontSize: 12, color: '#627794', fontStyle: 'italic', padding: '8px 4px' }}>
        {emptyLabel}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {nodes.map((node, idx) => {
        const isCurrent = node.id === currentId
        return (
          <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.div
              layout
              animate={{ scale: isCurrent ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={{
                minWidth: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                color: isCurrent ? 'var(--code-bg)' : 'var(--text)',
                background: isCurrent ? '#fde047' : accent,
                border: isCurrent ? '3px solid #f59e0b' : `2px solid ${accent}`,
                boxShadow: isCurrent ? '0 0 12px rgba(253,224,71,0.6)' : 'none',
              }}
            >
              {node.val}
            </motion.div>
            {idx < nodes.length - 1 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 700 }}>→</span>
            )}
          </div>
        )
      })}
      <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 4 }}>→ ∅</span>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#627794', fontSize: 13 }}>
        Press play or step to partition the list.
      </div>
    )
  }

  const { original = [], currentId, less = [], ge = [], x, joined, merged = [] } = step

  const sectionLabel = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#627794',
    marginBottom: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 16 }}>
      <div
        style={{
          padding: 10,
          background: 'var(--surface2)',
          borderRadius: 8,
          borderLeft: '4px solid #3b82f6',
          fontSize: 13,
          color: 'var(--text)',
        }}
      >
        {step.message}
      </div>

      <div>
        <div style={sectionLabel}>Original List (x = {x})</div>
        <NodeRow nodes={original} currentId={currentId} accent="var(--border)" emptyLabel="empty" />
      </div>

      <div>
        <div style={{ ...sectionLabel, color: '#1d855f' }}>Less than {x}</div>
        <NodeRow nodes={less} currentId={currentId} accent="#065f46" emptyLabel="(none yet)" />
      </div>

      <div>
        <div style={{ ...sectionLabel, color: '#ea0c0c' }}>Greater or equal to {x}</div>
        <NodeRow nodes={ge} currentId={currentId} accent="#7f1d1d" emptyLabel="(none yet)" />
      </div>

      {joined && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ ...sectionLabel, color: '#0870f0' }}>Result (less → ≥ x)</div>
          <NodeRow nodes={merged} currentId={null} accent="#1d4ed8" emptyLabel="empty" />
        </motion.div>
      )}
    </div>
  )
}

export default function Problem86Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [listInput, setListInput] = useState("[1,4,3,2,5,2]");
  const [xInput, setXInput] = useState(3);
  const { list, x, inputError } = useMemo(() => {
    try {
      const parsedList = JSON.parse(listInput); if (!Array.isArray(parsedList)) throw new Error('list must be an array');
      const parsedX = Number(xInput); if (isNaN(parsedX)) throw new Error('x must be a number');
      return { list: parsedList, x: parsedX, inputError: '' };
    } catch (e) {
      return { list: "[1,4,3,2,5,2]", x: 3, inputError: e.message };
    }
  }, [listInput, xInput]);
  const steps = useMemo(
    () => generateSteps(list, x).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [list, x]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setListInput(JSON.stringify(e.list)); setXInput(String(e.x)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Panel divs state for Lumino
  const [panelDivs, setPanelDivs] = useState(null)

  // Extract primary panel
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

  // Extract visualization panel
  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"list","label":"list","type":"array"},{"key":"x","label":"x","type":"number"}]}
        values={{ list: listInput, x: xInput }}
        onChange={(k, v) => { if (k === 'list') setListInput(v); if (k === 'x') setXInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="problem86-panel">
      <div className="problem86-panel-head">✂️ Partition List</div>
      <div className="problem86-panel-body">
        <VisualizationPanel step={step} />
      </div>
    </div>
  
    </>)

  // Status panel with example selector
  const statusPanel = (
    <div className="problem86-status">
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
              background: e.label === ex.label ? '#3b82f6' : 'var(--surface2)',
              color: e.label === ex.label ? '#fff' : 'var(--border)',
              border: '1px solid #3b82f660',
            }}
          >
            {e.label}: [{e.list.join(',')}], x={e.x}
          </button>
        ))}
      </div>
    </div>
  )

  // Playback panel with controls
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

  // Panel configs for Lumino layout
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '✂️ Partition List', dockMode: 'split-right' },
      { id: 'status', title: 'Examples', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem86-shell">
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
