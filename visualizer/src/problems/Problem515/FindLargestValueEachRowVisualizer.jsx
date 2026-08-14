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
import './FindLargestValueEachRowVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('find-largest-value-each-row')

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


  6: 'done',


}

const EXAMPLES = getExamples('find-largest-value-each-row')

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
    maxValues: [],
    currentLevel: 0,
    levelValues: [],
    message: 'Initialize BFS for level-wise maximum',
    relatedLines: [1]
  })

  if (!tree) {
    steps.push({
      activeLine: 2,
      tree,
      maxValues: [],
      done: true,
      message: 'Empty tree',
      relatedLines: [2]
    })
    return steps
  }

  const queue = [tree]
  const maxValues = []

  for (let level = 0; queue.length > 0; level++) {
    const levelSize = queue.length
    let levelMax = -Infinity
    const levelValues = []

    steps.push({
      activeLine: 3,
      tree,
      queue,
      maxValues: [...maxValues],
      currentLevel: level,
      levelValues: [],
      levelSize,
      message: `Process level ${level} with ${levelSize} nodes`,
      relatedLines: [3]
    })

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      levelValues.push(node.val)
      levelMax = Math.max(levelMax, node.val)

      steps.push({
        activeLine: 4,
        tree,
        queue,
        maxValues: [...maxValues],
        currentLevel: level,
        levelValues,
        currentNode: node.val,
        levelMax,
        message: `Node ${node.val}: current level max = ${levelMax}`,
        relatedLines: [4]
      })

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    maxValues.push(levelMax)

    steps.push({
      activeLine: 5,
      tree,
      queue,
      maxValues: [...maxValues],
      currentLevel: level,
      levelValues,
      levelMax,
      message: `Level ${level} maximum: ${levelMax}`,
      relatedLines: [5]
    })
  }

  steps.push({
    activeLine: 6,
    tree,
    maxValues,
    done: true,
    result: maxValues,
    message: `Result: ${JSON.stringify(maxValues)}`,
    relatedLines: [6]
  })

  return steps
}

function TreeNode({ node, x, y, offset, step }) {
  if (!node) return null

  const isCurrent = step && step.currentNode === node.val
  const inLevel = step && step.levelValues?.includes(node.val)

  return (
    <g key={`tree-${node.val}-${x}-${y}`}>
      {node.left && (
        <>
          <line x1={x} y1={y} x2={x - offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.left} x={x - offset} y={y + 80} offset={offset / 2} step={step} />
        </>
      )}
      {node.right && (
        <>
          <line x1={x} y1={y} x2={x + offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.right} x={x + offset} y={y + 80} offset={offset / 2} step={step} />
        </>
      )}
      <motion.circle
        cx={x}
        cy={y}
        r="28"
        fill={isCurrent ? '#fbcfe8' : inLevel ? '#fbcfe8' : '#f1f5f9'}
        stroke={isCurrent ? '#ec4899' : inLevel ? '#f472b6' : '#cbd5e1'}
        strokeWidth={isCurrent ? '3' : '2'}
        animate={{ scale: isCurrent ? 1.2 : 1 }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dy="0.3em"
        fontFamily="monospace"
        fontSize="14"
        fontWeight="600"
        fill={isCurrent || inLevel ? '#be185d' : '#334155'}
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
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          "Find the largest value in each row level. Use BFS to traverse row by row."
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

      {/* Level Values */}
      {step?.levelValues && step.levelValues.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fbcfe8',
            borderRadius: 6,
            border: '1px solid #ec4899'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#be185d', marginBottom: 8 }}>
            Level {step.currentLevel} Values
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.levelValues.map((val, idx) => (
              <div key={idx} style={{
                padding: '6px 12px',
                backgroundColor: val === step.levelMax ? '#f472b6' : '#fbcfe8',
                borderRadius: 4,
                border: `1px solid ${val === step.levelMax ? '#ec4899' : '#f472b6'}`,
                fontSize: 12,
                fontWeight: 600,
                color: val === step.levelMax ? '#fff' : '#be185d'
              }}>
                {val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Max Values */}
      {step?.maxValues && step.maxValues.length > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fce7f3',
            borderRadius: 6,
            border: '2px solid #ec4899'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 12 }}>
            Maximum Values per Level
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
            {step.maxValues.map((val, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                backgroundColor: '#f472b6',
                borderRadius: 4,
                border: '1px solid #ec4899',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                textAlign: 'center'
              }}>
                Lvl {idx}: {val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fce7f3',
          borderRadius: 6,
          border: '2px solid #ec4899',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ec4899' }}>
          {step?.result ? `[${step.result.join(', ')}]` : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#ec4899', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function FindLargestValueEachRowVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [arrInput, setArrInput] = useState("[1,3,2,5,3,null,9]");
  const { arr, inputError } = useMemo(() => {
    try {
      const parsedArr = JSON.parse(arrInput); if (!Array.isArray(parsedArr)) throw new Error('arr must be an array');
      return { arr: parsedArr, inputError: '' };
    } catch (e) {
      return { arr: "[1,3,2,5,3,null,9]", inputError: e.message };
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
      title: '🌳 Largest Value per Row',
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

