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
import './ConvertSortedListToBinarySearchTreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('convert-sorted-list-to-binary-search-tree', [
  { label: 'Example 1', list: [1, 2, 3, 4, 5, 6] },
  { label: 'Example 2', list: [-10, -3, 0, 5, 9] },
  { label: 'Example 3', list: [] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def sortedListToBST(head):' },
  { line: 2, text: '    def build(nodes):' },
  { line: 3, text: '        if not nodes: return None' },
  { line: 4, text: '        mid = len(nodes) // 2' },
  { line: 5, text: '        node = TreeNode(nodes[mid])' },
  { line: 6, text: '        node.left = build(nodes[:mid])' },
  { line: 7, text: '        node.right = build(nodes[mid+1:])' },
  { line: 8, text: '        return node' },
  { line: 9, text: '    nodes = []' },
  { line: 10, text: '    curr = head' },
  { line: 11, text: '    while curr:' },
  { line: 12, text: '        nodes.append(curr.val)' },
  { line: 13, text: '        curr = curr.next' },
  { line: 14, text: '    return build(nodes)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(list) {
  const steps = []

  if (!list || list.length === 0) {
    steps.push({
      activeLine: 3,
      list: [],
      nodes: [],
      message: 'Empty list → return None',
      relatedLines: [3],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    list,
    nodes: [],
    message: `Convert list ${JSON.stringify(list)} to balanced BST`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 9,
    list,
    nodes: [...list],
    message: 'Extract list values into array',
    relatedLines: [9, 10, 11, 12, 13],
  })

  const buildTree = (nodes, depth = 0) => {
    if (!nodes || nodes.length === 0) return null

    const mid = Math.floor(nodes.length / 2)
    const val = nodes[mid]

    steps.push({
      activeLine: 4,
      list,
      nodes,
      mid,
      midVal: val,
      depth,
      message: `Mid index: ${mid}, value: ${val} (from ${nodes.length} elements)`,
      relatedLines: [4, 5],
    })

    const left = nodes.slice(0, mid)
    const right = nodes.slice(mid + 1)

    if (left.length > 0) {
      steps.push({
        activeLine: 6,
        list,
        nodes,
        mid,
        midVal: val,
        left,
        depth,
        message: `Left subtree: [${left.join(', ')}]`,
        relatedLines: [6],
      })
      buildTree(left, depth + 1)
    }

    if (right.length > 0) {
      steps.push({
        activeLine: 7,
        list,
        nodes,
        mid,
        midVal: val,
        right,
        depth,
        message: `Right subtree: [${right.join(', ')}]`,
        relatedLines: [7],
      })
      buildTree(right, depth + 1)
    }

    return { val, left: null, right: null }
  }

  buildTree(list)

  steps.push({
    activeLine: 14,
    list,
    nodes: list,
    done: true,
    message: 'Balanced BST construction complete',
    relatedLines: [14],
  })

  return steps
}

function VisualizationPanel({ step, listInput, setListInput, inputError, EXAMPLES, applyExample, handleReset }) {
  if (!step) return <div style={{ padding: 16, color: '#627794' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <input
          value={listInput}
          onChange={(e) => { setListInput(e.target.value); handleReset() }}
          placeholder="[1, 2, 3, 4, 5, 6]"
          style={{
            padding: '8px 12px',
            fontSize: 12,
            borderRadius: 4,
            border: '1px solid #cbd5e1',
            fontFamily: 'monospace',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {inputError && <div style={{ fontSize: 11, color: '#dc2626' }}>{inputError}</div>}
      </div>

      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          Use middle element as root to balance the tree recursively.
        </div>
      </div>

      {step.list && step.list.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>
            Sorted List
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
            {step.list.map((val, idx) => (
              <motion.span
                key={idx}
                style={{
                  padding: '4px 8px',
                  borderRadius: 3,
                  backgroundColor: step.midVal === val ? '#c7d2fe' : '#e0e7ff',
                  border: step.midVal === val ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                  fontWeight: step.midVal === val ? 700 : 500,
                }}
                animate={{ scale: step.midVal === val ? 1.15 : 1 }}
              >
                {val}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {(step.left || step.right) && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Subtrees</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step.left && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Left: [{step.left.join(', ')}]</div>
              </div>
            )}
            {step.right && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Right: [{step.right.join(', ')}]</div>
              </div>
            )}
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

export default function ConvertSortedListToBinarySearchTreeVisualizer() {
  const [listInput, setListInput] = useState('[1, 2, 3, 4, 5, 6]')

  const { list, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(listInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be an array')
      const nums = parsed.map(v => typeof v === 'number' ? v : Number(v))
      if (nums.some(isNaN)) throw new Error('All elements must be numbers')
      if (nums.length > 20) throw new Error('Max 20 elements for clarity')
      return { list: nums, inputError: '' }
    } catch (e) {
      return { list: [1, 2, 3, 4, 5, 6], inputError: e.message }
    }
  }, [listInput])

  const steps = useMemo(
    () =>
      generateSteps(list).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [list]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setListInput(JSON.stringify(ex.list))
    handleReset()
  }, [handleReset])

  // Extract panel consts
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
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"list","label":"list","type":"array"}]}
        values={{ list: listInput }}
        onChange={(k, v) => { if (k === 'list') setListInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <VisualizationPanel
      step={step}
      listInput={listInput}
      setListInput={setListInput}
      inputError={inputError}
      EXAMPLES={EXAMPLES}
      applyExample={applyExample}
      handleReset={handleReset}
    />
  
    </>)

  const statusPanel = (
    <div className="cslbtbst-status">
      <div style={{ fontSize: 11, color: '#627794', padding: '4px 8px' }}>
        Step {stepIndex >= 0 ? stepIndex + 1 : 0} / {steps.length}
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

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🌳 List to BST', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="cslbtbst-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
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
