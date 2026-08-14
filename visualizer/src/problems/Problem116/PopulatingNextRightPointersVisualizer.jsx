import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './PopulatingNextRightPointersVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('populating-next-right-pointers-in-each-node', [
  { label: 'Example 1', root: [1, 2, 3, 4, 5, 6, 7] },
  { label: 'Example 2', root: [] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def connect(root):' },
  { line: 2, text: '    if not root: return root' },
  { line: 3, text: '    queue = deque([root])' },
  { line: 4, text: '    while queue:' },
  { line: 5, text: '        size = len(queue)' },
  { line: 6, text: '        prev = None' },
  { line: 7, text: '        for i in range(size):' },
  { line: 8, text: '            node = queue.popleft()' },
  { line: 9, text: '            if prev: prev.next = node' },
  { line: 10, text: '            queue.append(node.left)' },
  { line: 11, text: '            queue.append(node.right)' },
  { line: 12, text: '            prev = node' },
  { line: 13, text: '    return root' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const root = { val: arr[0], left: null, right: null, level: 0 }
  const q = [root]
  let i = 1
  while (q.length && i < arr.length) {
    const node = q.shift()
    if (arr[i] !== null) {
      node.left = { val: arr[i], left: null, right: null, level: node.level + 1 }
      q.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i], left: null, right: null, level: node.level + 1 }
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
      activeLine: 2,
      message: 'Empty tree',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: 'Initialize queue with root',
    relatedLines: [1],
  })

  const levels = []
  const q = [tree]
  let levelNum = 0

  while (q.length > 0) {
    const size = q.length
    const currentLevel = []

    for (let i = 0; i < size; i++) {
      const node = q.shift()
      currentLevel.push(node.val)

      steps.push({
        activeLine: 8,
        levelNum,
        currentNode: node.val,
        currentLevel,
        message: `Process node ${node.val} at level ${levelNum}`,
        relatedLines: [8],
      })

      if (node.left) q.push(node.left)
      if (node.right) q.push(node.right)
    }

    steps.push({
      activeLine: 9,
      levelNum,
      currentLevel: [...currentLevel],
      connectedLevel: true,
      message: `Connect level ${levelNum} nodes: [${currentLevel.join(' → ')}]`,
      relatedLines: [9],
    })

    levels.push([...currentLevel])
    levelNum++
  }

  steps.push({
    activeLine: 13,
    message: `✓ All levels connected: ${levels.map((l) => `[${l.join(',')}]`).join(' → ')}`,
    relatedLines: [13],
    done: true,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Connect nodes at each level with next pointers using level-order traversal.
        </div>
      </div>

      {step.currentLevel && step.currentLevel.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>
            Level {step.levelNum}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.currentLevel.map((val, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: step.currentNode === val ? '#a5b4fc' : '#c7d2fe',
                  borderRadius: 4,
                  border: step.currentNode === val ? '2px solid #4f46e5' : '1px solid #818cf8',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1e1b4b',
                }}
                animate={{ scale: step.currentNode === val ? 1.15 : 1 }}
              >
                {val}
              </motion.div>
            ))}
          </div>
          {step.connectedLevel && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#3730a3', fontStyle: 'italic' }}>
              ✓ All nodes at this level connected
            </div>
          )}
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

export default function PopulatingNextRightPointersVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","root":[1,2,3,4,5,6,7]});
  const [rootInput, setRootInput] = useState("[1,2,3,4,5,6,7]");
  const { root, inputError } = useMemo(() => {
    try {
      const parsedRoot = JSON.parse(rootInput); if (!Array.isArray(parsedRoot)) throw new Error('root must be an array');
      return { root: parsedRoot, inputError: '' };
    } catch (e) {
      return { root: [1,2,3,4,5,6,7], inputError: e.message };
    }
  }, [rootInput]);  const steps = useMemo(
    () =>
      generateSteps(root).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [root]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setRootInput(JSON.stringify(e.root)); handleReset(); }, [handleReset]);
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} />}
    </div>
  )

  const vizPanel = (
    <div className="problem116-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem116-status">
      {step?.message ? step.message : 'Press play'}
    </div>
  )

  const playbackPanel = (
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

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🌳 Next Pointers', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="problem116-shell">
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
