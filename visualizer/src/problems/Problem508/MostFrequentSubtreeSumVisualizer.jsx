import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MostFrequentSubtreeSumVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('most-frequent-subtree-sum')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamples('most-frequent-subtree-sum')

function generateSteps(arr) {
  const steps = []

  const tree = arr && arr.length > 0 ? buildTree(arr) : null

  // Initialize
  steps.push({
    activeLine: 1,
    tree,
    visited: new Set(),
    sumMap: new Map(),
    currentNode: null,
    message: 'Initialize tree and prepare for DFS traversal',
    relatedLines: [1]
  })

  if (!tree) {
    steps.push({
      activeLine: 2,
      tree,
      visited: new Set(),
      sumMap: new Map(),
      currentNode: null,
      done: true,
      message: 'Empty tree',
      relatedLines: [2]
    })
    return steps
  }

  const sumMap = new Map()
  const visited = new Set()

  function dfs(node) {
    if (!node) return 0

    visited.add(node.val)

    steps.push({
      activeLine: 3,
      tree,
      visited: new Set(visited),
      sumMap: new Map(sumMap),
      currentNode: node.val,
      message: `Visit node ${node.val}`,
      relatedLines: [3]
    })

    let left = node.left ? dfs(node.left) : 0
    let right = node.right ? dfs(node.right) : 0
    let subtreeSum = node.val + left + right

    sumMap.set(subtreeSum, (sumMap.get(subtreeSum) || 0) + 1)

    steps.push({
      activeLine: 4,
      tree,
      visited: new Set(visited),
      sumMap: new Map(sumMap),
      currentNode: node.val,
      message: `Subtree sum at ${node.val}: ${subtreeSum} (count: ${sumMap.get(subtreeSum)})`,
      relatedLines: [4]
    })

    return subtreeSum
  }

  dfs(tree)

  const maxFreq = Math.max(...sumMap.values())
  const result = []
  for (const [sum, freq] of sumMap) {
    if (freq === maxFreq) {
      result.push(sum)
    }
  }

  steps.push({
    activeLine: 5,
    tree,
    visited: new Set(visited),
    sumMap,
    currentNode: null,
    done: true,
    result,
    message: `Most frequent sums: ${result.join(', ')} with frequency ${maxFreq}`,
    relatedLines: [5]
  })

  return steps
}

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

function TreeNode({ node, x, y, offset, step }) {
  if (!node) return null

  const isActive = step && step.currentNode === node.val
  const isVisited = step && step.visited.has(node.val)

  return (
    <g key={`tree-${node.val}-${x}-${y}`}>
      {node.left && (
        <>
          <line x1={x} y1={y} x2={x - offset} y2={y + 80} stroke="var(--border)" strokeWidth="2" />
          <TreeNode node={node.left} x={x - offset} y={y + 80} offset={offset / 2} step={step} />
        </>
      )}
      {node.right && (
        <>
          <line x1={x} y1={y} x2={x + offset} y2={y + 80} stroke="var(--border)" strokeWidth="2" />
          <TreeNode node={node.right} x={x + offset} y={y + 80} offset={offset / 2} step={step} />
        </>
      )}
      <motion.circle
        cx={x}
        cy={y}
        r="28"
        fill={isActive ? '#dbeafe' : isVisited ? '#d1fae5' : 'var(--surface2)'}
        stroke={isActive ? '#0284c7' : isVisited ? '#10b981' : 'var(--border)'}
        strokeWidth="2"
        animate={{ scale: isActive ? 1.2 : 1 }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dy="0.3em"
        fontFamily="monospace"
        fontSize="14"
        fontWeight="600"
        fill={isActive ? '#0c4a6e' : isVisited ? '#047857' : 'var(--border)'}
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
          "Given a binary tree, find the most frequent subtree sum. A subtree is a complete binary tree starting from any node."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tree Visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Binary Tree</div>
        <svg width="100%" height="400" viewBox="0 0 500 400" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <TreeNode node={step?.tree || (arr && arr.length > 0 ? buildTree(arr) : null)} x={250} y={40} offset={100} step={step} />
        </svg>
      </div>

      {/* Sum Map */}
      {step?.sumMap && step.sumMap.size > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 12 }}>
            Subtree Sum Frequencies
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {Array.from(step.sumMap.entries()).map(([sum, freq], idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#dcfce7',
                borderRadius: 4,
                border: '1px solid #10b981',
                fontSize: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 600, color: '#065f46' }}>{sum}</div>
                <div style={{ fontSize: 11, color: '#04865e' }}>freq: {freq}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#027bba' }}>
          {step?.result ? `[${step.result.join(', ')}]` : 'Computing...'}
        </div>
        <div style={{ fontSize: 12, color: '#027bba', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function MostFrequentSubtreeSumVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [arrInput, setArrInput] = useState("[5,2,-3]");
  const { arr, inputError } = useMemo(() => {
    try {
      const parsedArr = JSON.parse(arrInput); if (!Array.isArray(parsedArr)) throw new Error('arr must be an array');
      return { arr: parsedArr, inputError: '' };
    } catch (e) {
      return { arr: "[5,2,-3]", inputError: e.message };
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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Most Frequent Subtree Sum', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          arr={arr}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"arr","label":"arr","type":"string"}]}
          values={{ arr: arrInput }}
          onChange={(k, v) => { if (k === 'arr') setArrInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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

