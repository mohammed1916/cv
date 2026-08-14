import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FindBottomLeftTreeValueVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('find-bottom-left-tree-value')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'loop',


  7: 'loop',


  8: 'done',


}

const EXAMPLES = getExamples('find-bottom-left-tree-value')

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const nodes = arr.map((val, idx) => val !== null ? { val, idx, left: null, right: null } : null)
  nodes.forEach((node, idx) => {
    if (node) {
      const leftIdx = 2 * idx + 1
      const rightIdx = 2 * idx + 2
      if (leftIdx < nodes.length) node.left = nodes[leftIdx]
      if (rightIdx < nodes.length) node.right = nodes[rightIdx]
    }
  })
  return nodes[0]
}

function generateSteps(arr) {
  const steps = []

  const tree = arr && arr.length > 0 ? buildTree(arr) : null

  steps.push({
    activeLine: 1,
    tree,
    queue: [],
    visited: new Set(),
    level: 0,
    message: 'Initialize BFS with queue',
    relatedLines: [1]
  })

  if (!tree) {
    steps.push({
      activeLine: 2,
      tree,
      queue: [],
      visited: new Set(),
      level: 0,
      done: true,
      message: 'Empty tree',
      relatedLines: [2]
    })
    return steps
  }

  const queue = [tree]
  let level = 0
  let levelNodes = [tree]
  let bottomLeft = tree.val

  steps.push({
    activeLine: 3,
    tree,
    queue,
    visited: new Set([tree.val]),
    level,
    levelNodes,
    message: 'Add root to queue',
    relatedLines: [3]
  })

  while (queue.length > 0) {
    const levelSize = queue.length
    levelNodes = []

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      levelNodes.push(node.val)

      steps.push({
        activeLine: 4,
        tree,
        queue,
        visited: new Set(queue.map(n => n.val)),
        level,
        currentNode: node.val,
        levelNodes,
        message: `Process node ${node.val} at level ${level}`,
        relatedLines: [4]
      })

      if (node.left) {
        queue.push(node.left)
        steps.push({
          activeLine: 5,
          tree,
          queue,
          visited: new Set(queue.map(n => n.val)),
          level,
          currentNode: node.val,
          levelNodes,
          message: `Add left child ${node.left.val}`,
          relatedLines: [5]
        })
      }

      if (node.right) {
        queue.push(node.right)
        steps.push({
          activeLine: 6,
          tree,
          queue,
          visited: new Set(queue.map(n => n.val)),
          level,
          currentNode: node.val,
          levelNodes,
          message: `Add right child ${node.right.val}`,
          relatedLines: [6]
        })
      }
    }

    bottomLeft = levelNodes[0]
    level++

    steps.push({
      activeLine: 7,
      tree,
      queue,
      visited: new Set(queue.map(n => n.val)),
      level,
      levelNodes,
      bottomLeft,
      message: `Level ${level - 1} bottomLeft: ${bottomLeft}`,
      relatedLines: [7]
    })
  }

  steps.push({
    activeLine: 8,
    tree,
    queue: [],
    visited: new Set(),
    level,
    done: true,
    result: bottomLeft,
    message: `Bottom left value: ${bottomLeft}`,
    relatedLines: [8]
  })

  return steps
}

function TreeNode({ node, x, y, offset, step, highlightVal }) {
  if (!node) return null

  const isActive = step && step.currentNode === node.val
  const isResult = step && step.result === node.val
  const inQueue = step && step.queue?.some(n => n.val === node.val)

  return (
    <g key={`tree-${node.val}-${x}-${y}`}>
      {node.left && (
        <>
          <line x1={x} y1={y} x2={x - offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.left} x={x - offset} y={y + 80} offset={offset / 2} step={step} highlightVal={highlightVal} />
        </>
      )}
      {node.right && (
        <>
          <line x1={x} y1={y} x2={x + offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.right} x={x + offset} y={y + 80} offset={offset / 2} step={step} highlightVal={highlightVal} />
        </>
      )}
      <motion.circle
        cx={x}
        cy={y}
        r="28"
        fill={isResult ? '#cffafe' : isActive ? '#dbeafe' : inQueue ? '#d1fae5' : '#f1f5f9'}
        stroke={isResult ? '#06b6d4' : isActive ? '#0284c7' : inQueue ? '#10b981' : '#cbd5e1'}
        strokeWidth={isResult ? '3' : '2'}
        animate={{ scale: isActive || isResult ? 1.2 : 1 }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dy="0.3em"
        fontFamily="monospace"
        fontSize="14"
        fontWeight="600"
        fill={isResult ? '#164e63' : isActive ? '#0c4a6e' : inQueue ? '#047857' : '#334155'}
      >
        {node.val}
      </text>
    </g>
  )
}

function VisualizationPanel({ arr, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find the leftmost value in the bottom row. Use BFS to traverse level by level."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tree */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Binary Tree</div>
        <svg width="100%" height="400" viewBox="0 0 500 400" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <TreeNode node={step?.tree || (arr && arr.length > 0 ? buildTree(arr) : null)} x={250} y={40} offset={100} step={step} />
        </svg>
      </div>

      {/* Level Info */}
      {step?.levelNodes && step.levelNodes.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Level {step.level - 1} Nodes
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.levelNodes.map((val, idx) => (
              <div key={idx} style={{
                padding: '6px 12px',
                backgroundColor: idx === 0 ? '#bfdbfe' : '#dbeafe',
                borderRadius: 4,
                border: `1px solid ${idx === 0 ? '#0284c7' : '#7dd3fc'}`,
                fontSize: 12,
                fontWeight: 600,
                color: '#0c4a6e'
              }}>
                {val} {idx === 0 && '👈'}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Bottom Left Value</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function FindBottomLeftTreeValueVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [arrInput, setArrInput] = useState("[2,1,3]");
  const { arr, inputError } = useMemo(() => {
    try {
      const parsedArr = JSON.parse(arrInput); if (!Array.isArray(parsedArr)) throw new Error('arr must be an array');
      return { arr: parsedArr, inputError: '' };
    } catch (e) {
      return { arr: "[2,1,3]", inputError: e.message };
    }
  }, [arrInput]);

  const steps = useMemo(
    () =>
      generateSteps(arr).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [arr]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setArrInput(JSON.stringify(e.arr)); handleReset(); }, [handleReset]);

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
      title: '🌳 Bottom Left Tree Value',
      content: (
        <VisualizationPanel
          arr={arr}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

