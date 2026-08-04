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
import './SumRootToLeafNumbersVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('sum-root-to-leaf-numbers', [
  { label: 'Example 1', root: [1, 2, 3] },
  { label: 'Example 2', root: [4, 9, 0, 5, 1] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def sumNumbers(root):' },
  { line: 2, text: '    total = 0' },
  { line: 3, text: '    def dfs(node, current_num):' },
  { line: 4, text: '        nonlocal total' },
  { line: 5, text: '        if not node: return' },
  { line: 6, text: '        current_num = current_num * 10 + node.val' },
  { line: 7, text: '        if not node.left and not node.right:' },
  { line: 8, text: '            total += current_num' },
  { line: 9, text: '            return' },
  { line: 10, text: '        dfs(node.left, current_num)' },
  { line: 11, text: '        dfs(node.right, current_num)' },
  { line: 12, text: '    dfs(root, 0)' },
  { line: 13, text: '    return total' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const root = { val: arr[0], left: null, right: null }
  const q = [root]
  let i = 1
  while (q.length && i < arr.length) {
    const node = q.shift()
    if (arr[i] !== null) {
      node.left = { val: arr[i], left: null, right: null }
      q.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i], left: null, right: null }
      q.push(node.right)
    }
    i++
  }
  return root
}

function generateSteps(root) {
  const steps = []
  const tree = buildTree(root)

  if (!tree) {
    steps.push({
      activeLine: 1,
      message: 'Empty tree',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: 'Initialize: sum all root-to-leaf numbers',
    relatedLines: [1],
  })

  let total = 0
  const paths = []

  const dfs = (node, currentNum, path) => {
    if (!node) return

    const newNum = currentNum * 10 + node.val
    const newPath = [...path, node.val]

    steps.push({
      activeLine: 6,
      currentNum: newNum,
      currentPath: newPath,
      message: `Visit node ${node.val}: current number = ${newNum}`,
      relatedLines: [6],
    })

    if (!node.left && !node.right) {
      total += newNum
      paths.push({ path: newPath, value: newNum })

      steps.push({
        activeLine: 8,
        currentNum: newNum,
        currentPath: newPath,
        leafNum: newNum,
        total,
        message: `✓ Leaf reached: ${newPath.join('')} → add ${newNum} to total = ${total}`,
        relatedLines: [8],
      })
      return
    }

    if (node.left) {
      dfs(node.left, newNum, newPath)
    }
    if (node.right) {
      dfs(node.right, newNum, newPath)
    }
  }

  dfs(tree, 0, [])

  steps.push({
    activeLine: 13,
    total,
    paths,
    done: true,
    message: `Total sum: ${total} (${paths.length} root-to-leaf paths)`,
    relatedLines: [13],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          DFS traversal: accumulate digit-by-digit, sum when reaching leaves.
        </div>
      </div>

      {step.currentPath && step.currentPath.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Current Path
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {step.currentPath.map((val, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 3,
                    backgroundColor: '#a5b4fc',
                    border: '2px solid #4f46e5',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#1e1b4b',
                  }}
                  animate={{ scale: 1 }}
                >
                  {val}
                </motion.div>
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0c4a6e' }}>= {step.currentNum}</span>
          </div>
        </motion.div>
      )}

      {step.paths && step.paths.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Paths Found ({step.paths.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
            {step.paths.map((p, idx) => (
              <div key={idx} style={{ fontSize: 11, color: '#5b21b6', fontFamily: 'monospace' }}>
                {p.path.join(' → ')} = {p.value}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.total !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Total Sum
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
            {step.total}
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

export default function SumRootToLeafNumbersVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.root || [1, 2, 3])
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.root); handleReset() }, [handleReset])
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
      {showPatternOverlay && <CodePatternAnnotations linePatternMap={{}} patterns={[]} />}
    </div>
  )

  const primaryPanel = (
    <div className="srln-panel">
      <VisualizationPanel step={step} />
    </div>
  )

  const statusPanel = (
    <div className="srln-status" style={{ padding: '8px 12px', fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span>Step {Math.max(0, stepIndex + 1)} / {steps.length}</span>
      {step?.message && <span>│ {step.message}</span>}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} linePatternMap={LINE_PATTERN_MAP} />}
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
      { id: 'primary', title: '🌳 Sum Numbers', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="srln-shell">
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
