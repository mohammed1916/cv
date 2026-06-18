import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import VisualizationControls from '../../components/VisualizationControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

let nodeIdCounter = 0

function generateAllBSTs(n) {
  if (n === 0) return [null]
  if (n === 1) return [{ id: nodeIdCounter++, val: 1, left: null, right: null }]

  const trees = []

  for (let rootVal = 1; rootVal <= n; rootVal++) {
    const leftTrees = generateAllBSTs(rootVal - 1)
    const rightTrees = generateAllBSTs(n - rootVal)

    for (const leftTree of leftTrees) {
      for (const rightTree of rightTrees) {
        trees.push({
          id: nodeIdCounter++,
          val: rootVal,
          left: leftTree,
          right: rightTree,
        })
      }
    }
  }

  return trees
}

function countNodes(node) {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

function generateSteps(n) {
  const steps = []
  nodeIdCounter = 0

  if (n <= 0) {
    steps.push({
      phase: 'done',
      activeLine: 1,
      n,
      message: 'Input n must be positive.',
      allTrees: [],
      currentTreeIndex: null,
      recursionDepth: 0,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 1,
    n,
    message: `Generate all structurally unique BSTs with values 1 to ${n}`,
    allTrees: [],
    currentTreeIndex: null,
    recursionDepth: 0,
  })

  nodeIdCounter = 0
  const allTrees = generateAllBSTs(n)

  steps.push({
    phase: 'generated',
    activeLine: 10,
    n,
    message: `Generated ${allTrees.length} unique BSTs`,
    allTrees,
    currentTreeIndex: null,
    recursionDepth: 0,
  })

  allTrees.forEach((tree, idx) => {
    steps.push({
      phase: 'showing_tree',
      activeLine: 10,
      n,
      message: `Tree ${idx + 1}/${allTrees.length}: ${countNodes(tree)} nodes`,
      allTrees,
      currentTreeIndex: idx,
      currentTree: tree,
      recursionDepth: 0,
    })
  })

  steps.push({
    phase: 'done',
    activeLine: 10,
    n,
    message: `Complete! Generated ${allTrees.length} unique BSTs`,
    allTrees,
    currentTreeIndex: null,
    recursionDepth: 0,
  })

  return steps
}

function layoutTree(root) {
  if (!root) return new Map()
  const map = new Map()
  const levelCounts = {}

  function countDepth(node, depth) {
    if (!node) return
    levelCounts[depth] = (levelCounts[depth] || 0) + 1
    countDepth(node.left, depth + 1)
    countDepth(node.right, depth + 1)
  }

  countDepth(root, 0)

  const W = 300
  const LH = 80
  const levelX = {}

  function assign(node, depth) {
    if (!node) return
    assign(node.left, depth + 1)
    levelX[depth] = (levelX[depth] || 0) + 1
    const cnt = levelCounts[depth]
    const x = (levelX[depth] / (cnt + 1)) * W
    map.set(node.id, { x, y: depth * LH + 40 })
    assign(node.right, depth + 1)
  }

  assign(root, 0)
  return map
}

function drawEdges(root, posMap) {
  if (!root) return []
  const edges = []

  function collect(node) {
    if (!node) return
    const pos = posMap.get(node.id)
    if (node.left) {
      const leftPos = posMap.get(node.left.id)
      edges.push({ from: pos, to: leftPos })
      collect(node.left)
    }
    if (node.right) {
      const rightPos = posMap.get(node.right.id)
      edges.push({ from: pos, to: rightPos })
      collect(node.right)
    }
  }

  collect(node)
  return edges
}

function TreeVisualization({ tree, posMap, edges }) {
  if (!tree) {
    return (
      <div style={{ padding: 20, color: '#64748b' }}>
        No tree to display
      </div>
    )
  }

  const allNodes = []
  function collect(node) {
    if (!node) return
    allNodes.push(node)
    collect(node.left)
    collect(node.right)
  }
  collect(tree)

  const minX = Math.min(...Array.from(posMap.values()).map(p => p.x), 0)
  const maxX = Math.max(...Array.from(posMap.values()).map(p => p.x), 100)
  const maxY = Math.max(...Array.from(posMap.values()).map(p => p.y), 100)

  const padding = 40
  const width = Math.max(300, maxX - minX + padding * 2)
  const height = maxY + padding * 2

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
      <svg width={width} height={height} style={{ border: '1px solid #cbd5e1', borderRadius: 6 }}>
        <g transform={`translate(${padding - minX}, ${padding})`}>
          {/* Draw edges */}
          {edges.map((edge, idx) => (
            <line
              key={`edge-${idx}`}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          ))}

          {/* Draw nodes */}
          {allNodes.map((node) => {
            const pos = posMap.get(node.id)
            return (
              <g key={node.id}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="24"
                  fill="#dbeafe"
                  stroke="#0284c7"
                  strokeWidth="2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#0c4a6e"
                >
                  {node.val}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

const EXAMPLES = getExamples('unique-binary-search-trees-ii') || [
  { label: 'n = 1', n: 1 },
  { label: 'n = 2', n: 2 },
  { label: 'n = 3', n: 3 },
  { label: 'n = 4', n: 4 },
]

function VisualizationPanel({
  n,
  nInput,
  setNInput,
  inputError,
  handleReset,
  allTrees,
  currentTreeIndex,
  applyExample,
}) {
  return (
    <div className="ubst-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-panel-head">
        Unique BSTs
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="ubst-panel-body" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Examples */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                className="ubst-example-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>n =</span>
            <input
              type="number"
              value={nInput}
              onChange={(e) => {
                setNInput(e.target.value)
                handleReset()
              }}
              min="1"
              max="5"
              className="ubst-input"
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                width: '80px',
              }}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Results ({allTrees.length} unique BSTs)
          </div>
          {allTrees.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No BSTs generated</div>
          ) : (
            <div style={{ fontSize: 12, color: '#475569' }}>
              <div>Total: {allTrees.length} structurally unique BSTs</div>
              {currentTreeIndex !== null && (
                <div style={{ marginTop: 8, color: '#0284c7', fontWeight: 600 }}>
                  Showing tree {currentTreeIndex + 1} of {allTrees.length}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TreesGridPanel({ allTrees }) {
  return (
    <div className="ubst-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-panel-head">Tree Preview ({allTrees.length} total)</div>
      <div className="ubst-panel-body" style={{
        flex: 1,
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
        padding: 16,
      }}>
        {allTrees.map((tree, idx) => (
          <div
            key={idx}
            style={{
              padding: 12,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', marginBottom: 4 }}>
              Tree {idx + 1}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {countNodes(tree)} nodes
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VariablesPanel({ step, n }) {
  return (
    <div className="ubst-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-panel-head">Info</div>
      <div className="ubst-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 4 }}>Input</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#166534' }}>n = {n}</div>
        </div>

        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600, marginBottom: 4 }}>Generated Trees</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0c4a6e' }}>
            {step?.allTrees?.length || 0}
          </div>
        </div>

        {step?.currentTree && (
          <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Current Tree Nodes</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#b45309' }}>
              {countNodes(step.currentTree)}
            </div>
          </div>
        )}

        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 600, marginBottom: 4 }}>Phase</div>
          <div style={{ fontSize: 12, color: '#7c3aed' }}>
            {step?.phase === 'init' && 'Initializing'}
            {step?.phase === 'generated' && 'Generated all trees'}
            {step?.phase === 'showing_tree' && `Viewing tree ${(step.currentTreeIndex || 0) + 1}`}
            {step?.phase === 'done' && 'Complete'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UniqueBinarySearchTreesIIVisualizer() {
  const [nInput, setNInput] = useState('3')

  const SOLUTION_CODE = useSolutionCode('unique-binary-search-trees-ii') || [
    { line: 1, text: 'def generateTrees(n):' },
    { line: 2, text: '    def generate(start, end):' },
    { line: 3, text: '        if start > end: return [None]' },
    { line: 4, text: '        trees = []' },
    { line: 5, text: '        for root_val in range(start, end+1):' },
    { line: 6, text: '            left_trees = generate(start, root_val-1)' },
    { line: 7, text: '            right_trees = generate(root_val+1, end)' },
    { line: 8, text: '            for l in left_trees:' },
    { line: 9, text: '                for r in right_trees:' },
    { line: 10, text: '                    node = TreeNode(root_val)' },
    { line: 11, text: '                    node.left = l' },
    { line: 12, text: '                    node.right = r' },
    { line: 13, text: '                    trees.append(node)' },
    { line: 14, text: '        return trees' },
    { line: 15, text: '    return generate(1, n)' },
  ]

  const { n, inputError } = useMemo(() => {
    try {
      const num = parseInt(nInput, 10)
      if (isNaN(num) || num < 1 || num > 5) throw new Error('n must be between 1 and 5')
      return { n: num, inputError: '' }
    } catch (e) {
      return { n: 3, inputError: e.message || 'Invalid input' }
    }
  }, [nInput])

  const steps = useMemo(
    () => generateSteps(n).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [n],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const vizFeatureDefs = getVisualizationFeatures('unique-binary-search-trees-ii') || []
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(String(ex.n))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const currentTree = step?.currentTree || null
  const posMap = currentTree ? layoutTree(currentTree) : new Map()
  const edges = currentTree ? drawEdges(currentTree, posMap) : []

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'tree',
      title: 'Tree Visualization',
      content: currentTree ? (
        <TreeVisualization tree={currentTree} posMap={posMap} edges={edges} />
      ) : (
        <div style={{ padding: 20, color: '#64748b' }}>
          Step through to view trees
        </div>
      ),
    },
    {
      id: 'viz',
      title: 'Generate Trees',
      content: (
        <VisualizationPanel
          n={n}
          nInput={nInput}
          setNInput={setNInput}
          inputError={inputError}
          handleReset={handleReset}
          allTrees={step?.allTrees || []}
          currentTreeIndex={step?.currentTreeIndex}
          applyExample={applyExample}
        />
      ),
    },
    {
      id: 'trees',
      title: 'All Trees',
      content: <TreesGridPanel allTrees={step?.allTrees || []} />,
    },
    {
      id: 'vars',
      title: 'Info',
      content: <VariablesPanel step={step} n={n} />,
    },
  ], [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, autoScrollCode, n, nInput, setNInput, inputError, handleReset, applyExample, setActiveLineDom, currentTree, posMap, edges])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'tree', 'viz'], ['trees', 'vars']], minimized: [] }}
      />
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
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
        />
        {vizFeatures.length > 0 && (
          <VisualizationControls features={vizFeatures} onToggle={toggleVizFeature} />
        )}
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
