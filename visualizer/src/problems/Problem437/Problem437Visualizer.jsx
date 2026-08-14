import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem437Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('path-sum-iii')

const PATTERNS = ['complete', 'found', 'init', 'visit']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'visit',
  3: 'found',
  4: 'complete'
}


const EXAMPLES = getExamples('path-sum-iii')

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const nodes = arr.map((val, idx) => (val !== null ? { val, idx, left: null, right: null } : null))
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]) {
      const leftIdx = 2 * i + 1
      const rightIdx = 2 * i + 2
      if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx]
      if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx]
    }
  }
  return nodes[0]
}

function generateSteps(treeArr, target) {
  const steps = []
  const tree = buildTree(treeArr)

  if (!tree) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      tree,
      target,
      paths: [],
      pathStack: [],
      count: 0,
      message: 'Empty tree',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    tree,
    target,
    paths: [],
    pathStack: [],
    count: 0,
    message: `Find paths with sum = ${target}`,
  })

  let count = 0
  let paths = []
  let pathStack = []

  function dfs(node, currentPath, currentSum) {
    if (!node) return

    currentPath.push(node.val)
    currentSum += node.val

    steps.push({
      activeLine: 2,
      phase: 'visit',
      tree,
      target,
      paths: [...paths],
      pathStack: [...currentPath],
      count,
      currentNode: node,
      message: `Visit node ${node.val}, path sum = ${currentSum}`,
    })

    let tempCount = 0
    let tempSum = 0
    for (let i = currentPath.length - 1; i >= 0; i--) {
      tempSum += currentPath[i]
      if (tempSum === target) {
        tempCount++
        const pathStr = `[${currentPath.slice(i).join(', ')}]`
        if (!paths.find(p => p === pathStr)) {
          paths.push(pathStr)
        }

        steps.push({
          activeLine: 3,
          phase: 'found',
          tree,
          target,
          paths: [...paths],
          pathStack: [...currentPath],
          count: count + tempCount,
          currentNode: node,
          foundPath: pathStr,
          message: `Found path: ${pathStr}`,
        })
      }
    }

    count += tempCount

    if (node.left) dfs(node.left, currentPath, currentSum)
    if (node.right) dfs(node.right, currentPath, currentSum)

    currentPath.pop()
  }

  dfs(tree, [], 0)

  steps.push({
    activeLine: 4,
    phase: 'complete',
    tree,
    target,
    paths: [...paths],
    pathStack: [],
    count,
    isComplete: true,
    message: `Found ${count} path(s)`,
  })

  return steps
}

function TreeVisualization({ tree, currentNode }) {
  const renderNode = (node, x, y, offsetX) => {
    if (!node) return null

    const isActive = currentNode && currentNode.val === node.val

    return (
      <g key={`${node.idx}-${x}-${y}`}>
        {node.left && (
          <>
            <line
              x1={x}
              y1={y}
              x2={x - offsetX}
              y2={y + 60}
              stroke={isActive ? '#dc2626' : '#cbd5e1'}
              strokeWidth={2}
            />
            {renderNode(node.left, x - offsetX, y + 60, offsetX / 2)}
          </>
        )}
        {node.right && (
          <>
            <line
              x1={x}
              y1={y}
              x2={x + offsetX}
              y2={y + 60}
              stroke={isActive ? '#dc2626' : '#cbd5e1'}
              strokeWidth={2}
            />
            {renderNode(node.right, x + offsetX, y + 60, offsetX / 2)}
          </>
        )}
        <motion.circle
          cx={x}
          cy={y}
          r={20}
          fill={isActive ? '#dc2626' : '#0284c7'}
          stroke={isActive ? '#991b1b' : '#0c4a6e'}
          strokeWidth={2}
          animate={{ r: isActive ? 24 : 20 }}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="14"
          fontWeight="600"
        >
          {node.val}
        </text>
      </g>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Tree Structure</div>
      <svg
        style={{
          width: '100%',
          height: 300,
          backgroundColor: '#f1f5f9',
          borderRadius: 8,
          border: '2px solid #cbd5e1',
        }}
        viewBox="0 0 300 300"
      >
        {tree && renderNode(tree, 150, 20, 60)}
      </svg>
    </div>
  )
}

function PathsVisualization({ paths, count, target }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Found Paths (Sum = {target})</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        {paths.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paths.map((path, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: 6,
                  border: '2px solid #10b981',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#047857',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {path}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Searching...</div>
        )}
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#dbeafe',
        borderRadius: 6,
        border: '2px solid #0284c7',
      }}>
        <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Total Paths Found</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
          {count}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <TreeVisualization
        tree={step?.tree}
        currentNode={step?.currentNode}
      />

      <PathsVisualization
        paths={step?.paths || []}
        count={step?.count || 0}
        target={step?.target || 0}
      />
    </div>
  )
}

export default function Problem437Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [treeInput, setTreeInput] = useState("[10,5,-3,3,2,null,11,3,-2,null,1]");
  const [targetInput, setTargetInput] = useState(8);
  const { tree, target, inputError } = useMemo(() => {
    try {
      const parsedTree = JSON.parse(treeInput); if (!Array.isArray(parsedTree)) throw new Error('tree must be an array');
      const parsedTarget = Number(targetInput); if (isNaN(parsedTarget)) throw new Error('target must be a number');
      return { tree: parsedTree, target: parsedTarget, inputError: '' };
    } catch (e) {
      return { tree: "[10,5,-3,3,2,null,11,3,-2,null,1]", target: 8, inputError: e.message };
    }
  }, [treeInput, targetInput]);

  const steps = useMemo(
    () =>
      generateSteps(tree, target).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [tree, target]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setTreeInput(JSON.stringify(e.tree)); setTargetInput(String(e.target)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
        />
      ),
    },
    {
      id: 'viz',
      title: '🌳 Path Sum',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
