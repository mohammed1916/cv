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
import './InsertionSortListVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('insertion-sort-list', [
  { label: 'Example 1', head: [4, 2, 1, 3] },
  { label: 'Example 2', head: [-1, 5, 3, 4, 0] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def insertionSortList(head):' },
  { line: 2, text: '    if not head or not head.next: return head' },
  { line: 3, text: '    dummy = ListNode(0)' },
  { line: 4, text: '    dummy.next = head' },
  { line: 5, text: '    cur = head.next' },
  { line: 6, text: '    prev = head' },
  { line: 7, text: '    while cur:' },
  { line: 8, text: '        if cur.val >= prev.val:' },
  { line: 9, text: '            prev = cur' },
  { line: 10, text: '        else:' },
  { line: 11, text: '            pos = dummy' },
  { line: 12, text: '            while pos.next.val < cur.val:' },
  { line: 13, text: '                pos = pos.next' },
  { line: 14, text: '            prev.next = cur.next' },
  { line: 15, text: '            cur.next = pos.next' },
  { line: 16, text: '            pos.next = cur' },
  { line: 17, text: '        cur = prev.next' },
  { line: 18, text: '    return dummy.next' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildList(arr) {
  if (!arr || arr.length === 0) return null
  const head = { val: arr[0], next: null, id: 0 }
  let current = head
  for (let i = 1; i < arr.length; i++) {
    current.next = { val: arr[i], next: null, id: i }
    current = current.next
  }
  return head
}

function generateSteps(arr) {
  const steps = []

  if (!arr || arr.length === 0) {
    steps.push({
      activeLine: 2,
      message: 'Empty list',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: 'Insertion sort on linked list',
    relatedLines: [1],
  })

  const dummy = { val: 0, next: buildList(arr), id: -1 }

  steps.push({
    activeLine: 3,
    dummy: true,
    unsorted: arr,
    sorted: [arr[0]],
    message: 'Create dummy node and start with first element as sorted',
    relatedLines: [3, 4],
  })

  let cur = dummy.next.next
  let prev = dummy.next
  const sorted = [arr[0]]
  const sortedList = []

  while (cur) {
    const curVal = cur.val

    steps.push({
      activeLine: 7,
      currentVal: curVal,
      sorted,
      message: `Process element: ${curVal}`,
      relatedLines: [7],
    })

    if (curVal >= prev.val) {
      steps.push({
        activeLine: 8,
        currentVal: curVal,
        prevVal: prev.val,
        sorted,
        message: `${curVal} >= ${prev.val}: already in order, move forward`,
        relatedLines: [8, 9],
      })

      sorted.push(curVal)
      prev = cur
    } else {
      steps.push({
        activeLine: 10,
        currentVal: curVal,
        prevVal: prev.val,
        sorted,
        message: `${curVal} < ${prev.val}: need to insert in correct position`,
        relatedLines: [10],
      })

      // Find position to insert
      let insertPos = 0
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] < curVal) {
          insertPos = i + 1
        }
      }

      steps.push({
        activeLine: 12,
        currentVal: curVal,
        insertPos,
        sorted: [...sorted],
        message: `Find insertion position: index ${insertPos}`,
        relatedLines: [12],
      })

      // Remove from current position and insert
      sorted.splice(sorted.indexOf(curVal), 1)
      sorted.splice(insertPos, 0, curVal)

      steps.push({
        activeLine: 16,
        currentVal: curVal,
        insertPos,
        sorted: [...sorted],
        message: `Insert ${curVal} at position ${insertPos}`,
        relatedLines: [16],
      })
    }

    cur = cur.next
  }

  steps.push({
    activeLine: 18,
    sorted,
    done: true,
    message: `Sorted: ${sorted.join(' → ')}`,
    relatedLines: [18],
  })

  return steps
}

function ListVisualization({ values }) {
  if (!values || values.length === 0) return null

  const nodeWidth = 50
  const nodeHeight = 40
  const gap = 20
  const totalWidth = values.length * (nodeWidth + gap) + gap

  return (
    <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', paddingY: 16 }}>
      <svg width={Math.max(totalWidth, 300)} height={120}>
        {values.map((val, idx) => {
          const x = gap + idx * (nodeWidth + gap)
          const y = 40

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                rx={4}
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth={2}
              />
              <text
                x={x + nodeWidth / 2}
                y={y + nodeHeight / 2}
                textAnchor="middle"
                dy="0.3em"
                fontSize={14}
                fontWeight={600}
                fill="#0f172a"
              >
                {val}
              </text>
              {idx < values.length - 1 && (
                  <line
                    x1={x + nodeWidth}
                    y1={y + nodeHeight / 2}
                    x2={x + nodeWidth + gap}
                    y2={y + nodeHeight / 2}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                </>
              )}
            </g>
          )
        })}

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

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Insertion sort: find correct position, insert element, advance.
        </div>
      </div>

      {step.sorted && step.sorted.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Sorted So Far
          </div>
          <ListVisualization values={step.sorted} />
        </motion.div>
      )}

      {step.currentVal !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
            Current Element
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#92400e', fontWeight: 600 }}>
            {step.currentVal}
          </div>
        </motion.div>
      )}

      {step.insertPos !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Insert Position
          </div>
          <div style={{ fontSize: 13, color: '#065f46' }}>
            Index: {step.insertPos}
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

export default function InsertionSortListVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","head":[4,2,1,3]});
  const [arrInput, setArrInput] = useState("");
  const { arr, inputError } = useMemo(() => {
    try {
      const parsedArr = arrInput;
      return { arr: parsedArr, inputError: '' };
    } catch (e) {
      return { arr: "", inputError: e.message };
    }
  }, [arrInput]);  const steps = useMemo(
    () =>
      generateSteps(arr).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [arr]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setArrInput(String(e.arr)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels for Lumino DockPanel
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} />}
    </div>
  )

  const vizPanel = (
    <div className="isl-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="isl-status">
      {step?.message && (
        <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 12px' }}>
          {step.message}
        </div>
      )}
    </div>
  )

  const playbackPanel = (
      {showPatternOverlay && <PatternLegend />}
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

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🔗 Insertion Sort', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="isl-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
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
