import { createPortal } from 'react-dom'
import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { TreeCanvas3D } from '../../components/viz3d'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: 'def minDepth(root):' },
  { line: 2, text: '    # base case: empty subtree' },
  { line: 3, text: '    if not root:' },
  { line: 4, text: '        return 0' },
  { line: 5, text: '    # leaf node' },
  { line: 6, text: '    if not root.left and not root.right:' },
  { line: 7, text: '        return 1' },
  { line: 8, text: '    # only one child: recurse into the non-empty side' },
  { line: 9, text: '    if not root.left:' },
  { line: 10, text: '        return 1 + minDepth(root.right)' },
  { line: 11, text: '    if not root.right:' },
  { line: 12, text: '        return 1 + minDepth(root.left)' },
  { line: 13, text: '    # two children: take the smaller depth' },
  { line: 14, text: '    return 1 + min(minDepth(root.left), minDepth(root.right))' },
]
const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

function generateSteps(arr) {
  const root = buildTree(arr)
  const positions = computeLayout(root, CANVAS_W, 80)
  const edges = buildEdges(root)
  const allNodes = collectNodes(root)
  const steps = []

  if (!root) {
    return [{
      phase: 'done',
      activeLine: 3,
      activeIds: new Set(),
      visitedIds: new Set(),
      currentDepth: 0,
      minDepth: 0,
      positions,
      edges,
      allNodes,
      message: 'Empty tree → return 0'
    }]
  }

  const visitedIds = new Set()
  let minDepth = Infinity

  steps.push({
    phase: 'init',
    activeLine: 4,
    activeIds: new Set([root.id]),
    visitedIds: new Set(),
    currentDepth: 0,
    minDepth: Infinity,
    positions,
    edges,
    allNodes,
    message: 'Initialize DFS starting at root with depth 0.'
  })

  // DFS traversal
  function dfs(node, depth) {
    if (!node) return

    visitedIds.add(node.id)

    steps.push({
      phase: 'visit',
      activeLine: 6,
      activeIds: new Set([node.id]),
      visitedIds: new Set(visitedIds),
      currentDepth: depth,
      minDepth,
      positions,
      edges,
      allNodes,
      message: `Visit node ${node.val} at depth ${depth}.`
    })

    // Check if leaf node (no left and no right)
    const isLeaf = !node.left && !node.right

    if (isLeaf) {
      steps.push({
        phase: 'leaf-found',
        activeLine: 9,
        activeIds: new Set([node.id]),
        visitedIds: new Set(visitedIds),
        currentDepth: depth,
        minDepth: Math.min(minDepth, depth),
        positions,
        edges,
        allNodes,
        message: `Leaf node found at depth ${depth}. Update minDepth = ${Math.min(minDepth, depth)}.`
      })

      minDepth = Math.min(minDepth, depth)
      return
    }

    // Traverse left subtree
    if (node.left) {
      steps.push({
        phase: 'go-left',
        activeLine: 11,
        activeIds: new Set([node.id, node.left.id]),
        visitedIds: new Set(visitedIds),
        currentDepth: depth,
        minDepth,
        positions,
        edges,
        allNodes,
        message: `Traverse left child of node ${node.val}.`
      })

      dfs(node.left, depth + 1)
    }

    // Traverse right subtree
    if (node.right) {
      steps.push({
        phase: 'go-right',
        activeLine: 12,
        activeIds: new Set([node.id, node.right.id]),
        visitedIds: new Set(visitedIds),
        currentDepth: depth,
        minDepth,
        positions,
        edges,
        allNodes,
        message: `Traverse right child of node ${node.val}.`
      })

      dfs(node.right, depth + 1)
    }
  }

  dfs(root, 1)

  steps.push({
    phase: 'done',
    activeLine: 14,
    activeIds: new Set(),
    visitedIds: new Set(visitedIds),
    currentDepth: 0,
    minDepth,
    positions,
    edges,
    allNodes,
    message: `DFS complete. Minimum depth = ${minDepth}`
  })

  return steps
}

const EXAMPLES = getExamples('minimum-depth-of-binary-tree')

function VisualizationPanel({
  EXAMPLES,
  arrInput,
  setArrInput,
  positions,
  edges,
  allNodes,
  step,
  applyExample,
  handleReset,
  CANVAS_W,
  CANVAS_H,
  NODE_R,
}) {
  return (
    <div className="mdbt-viz-panel">
      <div className="mdbt-examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            className="mdbt-chip"
            onClick={() => applyExample(ex)}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <input
        className="mdbt-input"
        value={arrInput}
        onChange={(e) => {
          setArrInput(e.target.value)
          handleReset()
        }}
        placeholder="[3,9,20,null,null,15,7]"
      />
      <div className="mdbt-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
        <TreeCanvas3D
          positions={positions}
          edges={edges}
          allNodes={allNodes}
          activeIds={step?.activeIds ?? new Set()}
          visitedIds={step?.visitedIds ?? new Set()}
          queueIds={new Set()}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
          nodeRadius={NODE_R}
        />
      </div>
    </div>
  )
}

function ResultPanel({
  step,
  inputError,
}) {
  return (
    <div className="mdbt-result-panel">
      <div className="mdbt-section">
        <div className="mdbt-section-title">Current Traversal</div>
        <div className="mdbt-info-box">
          <span className="mdbt-label">Current Depth:</span>
          <span className="mdbt-value">{step?.currentDepth ?? 0}</span>
        </div>
        <div className="mdbt-info-box">
          <span className="mdbt-label">Phase:</span>
          <span className="mdbt-value">{step?.phase ?? 'init'}</span>
        </div>
      </div>

      <div className="mdbt-section">
        <div className="mdbt-section-title">Result</div>
        <div className="mdbt-info-box">
          <span className="mdbt-label">Minimum Depth:</span>
          <span className={`mdbt-value ${step?.minDepth === Infinity ? 'infinite' : 'finite'}`}>
            {step?.minDepth === Infinity ? '∞' : step?.minDepth}
          </span>
        </div>
        <div className={`mdbt-result ${step?.phase === 'done' ? 'ok' : ''}`}>
          {step?.phase === 'done'
            ? `Result: Minimum depth = ${step.minDepth}`
            : 'Running DFS…'
          }
        </div>
      </div>

      {inputError && <div className="mdbt-error-box">{inputError}</div>}
    </div>
  )
}

export default function MinimumDepthOfBinaryTreeVisualizer() {
  const [arrInput, setArrInput] = useState('[3,9,20,null,null,15,7]')
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Load solution code from registry

  const { arr, inputError } = useMemo(() => {
    try {
      return { arr: parseTreeInput(arrInput), inputError: '' }
    } catch (e) {
      return { arr: [3, 9, 20, null, null, 15, 7], inputError: e.message || 'Invalid input' }
    }
  }, [arrInput])

  const steps = useMemo(() => generateSteps(arr), [arr])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setArrInput(JSON.stringify(ex.arr))
    handleReset()
  }, [handleReset])

  const positions = step?.positions ?? new Map()
  const edges = step?.edges ?? []
  const allNodes = step?.allNodes ?? []

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Extract panel JSX into consts
  const primaryPanel = (
    <div className="mdbt-panel">
      <div className="mdbt-header">
        <h2>Minimum Depth of Binary Tree</h2>
        <p className={`mdbt-message ${step?.phase === 'done' ? 'ok' : ''}`}>
          {step?.message || 'Press Play to begin.'}
        </p>
      </div>
      <VisualizationPanel
        EXAMPLES={EXAMPLES}
        arrInput={arrInput}
        setArrInput={setArrInput}
        positions={positions}
        edges={edges}
        allNodes={allNodes}
        step={step}
        applyExample={applyExample}
        handleReset={handleReset}
        CANVAS_W={CANVAS_W}
        CANVAS_H={CANVAS_H}
        NODE_R={NODE_R}
      />
    </div>
  )

  const statePanel = (
    <div className="mdbt-panel">
      <ResultPanel
        step={step}
        inputError={inputError}
      />
    </div>
  )

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
      {showPatternOverlay && <CodePatternAnnotations lines={SOLUTION_CODE} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="mdbt-status">
      <span>Step {stepIndex + 1} / {steps.length}</span>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={steps.length === 0}
        prevDisabled={stepIndex <= 0}
        nextDisabled={steps.length === 0 || isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        speedIndicator={`${speed}ms`}
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        autoScrollLabel="Auto-scroll code"
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  // Add state + config for Lumino
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Tree Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'Traversal Info', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="mdbt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
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
