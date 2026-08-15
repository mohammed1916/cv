import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem404Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('sum-of-left-leaves')

const PATTERNS = []
const LINE_PATTERN_MAP = {}

const EXAMPLES = [
  { label: 'Ex1', tree: { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } }, expected: 24 },
  { label: 'Single', tree: { val: 1 }, expected: 0 },
  { label: 'Left Only', tree: { val: 1, left: { val: 2 } }, expected: 2 },
]

function generateSteps(tree) {
  const steps = []

  if (!tree) {
    steps.push({
      activeLine: 1,
      message: 'Tree is null. Return 0.',
      phase: 'done',
      sum: 0,
      currentNode: null,
      leftLeaves: [],
    })
    return steps
  }

  let sum = 0
  const leftLeaves = []
  let stepCount = 0

  function dfs(node, isLeft) {
    if (!node) return

    const isLeaf = !node.left && !node.right

    steps.push({
      activeLine: 3,
      message: `Visit node ${node.val}. IsLeft: ${isLeft}, IsLeaf: ${isLeaf}`,
      phase: 'visit',
      sum,
      currentNode: node.val,
      isLeft,
      isLeaf,
      leftLeaves: [...leftLeaves],
    })

    if (isLeaf && isLeft) {
      sum += node.val
      leftLeaves.push(node.val)

      steps.push({
        activeLine: 4,
        message: `Found left leaf: ${node.val}. Add to sum. New sum: ${sum}`,
        phase: 'add_left_leaf',
        sum,
        currentNode: node.val,
        isLeft,
        isLeaf,
        leftLeaves: [...leftLeaves],
      })
    }

    if (node.left) {
      steps.push({
        activeLine: 6,
        message: `Traverse to left child of ${node.val}`,
        phase: 'traverse_left',
        sum,
        currentNode: node.val,
        leftLeaves: [...leftLeaves],
      })
      dfs(node.left, true)
    }

    if (node.right) {
      steps.push({
        activeLine: 8,
        message: `Traverse to right child of ${node.val}`,
        phase: 'traverse_right',
        sum,
        currentNode: node.val,
        leftLeaves: [...leftLeaves],
      })
      dfs(node.right, false)
    }
  }

  dfs(tree, false)

  steps.push({
    activeLine: 10,
    message: `DFS complete. Left leaves: [${leftLeaves.join(', ')}]. Total sum: ${sum}`,
    phase: 'done',
    sum,
    currentNode: null,
    leftLeaves,
  })

  return steps
}

function buildTreeLayout(node, x = 0, y = 0, offset = 50) {
  if (!node) return []
  const nodes = [{ val: node.val, x, y }]
  if (node.left) {
    nodes.push(...buildTreeLayout(node.left, x - offset, y + 60, offset / 2))
  }
  if (node.right) {
    nodes.push(...buildTreeLayout(node.right, x + offset, y + 60, offset / 2))
  }
  return nodes
}

function TreeVisualization({ tree, step }) {
  const treeNodes = useMemo(() => buildTreeLayout(tree), [tree])

  const getNodeStatus = (nodeVal) => {
    if (!step) return 'default'
    if (step.currentNode === nodeVal) return 'current'
    if (step.leftLeaves.includes(nodeVal)) return 'left_leaf'
    return 'default'
  }

  const maxX = Math.max(...treeNodes.map(n => n.x), 0)
  const minX = Math.min(...treeNodes.map(n => n.x), 0)
  const maxY = Math.max(...treeNodes.map(n => n.y), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Tree Structure</div>

      <div style={{
        position: 'relative',
        height: Math.max(300, maxY + 80),
        width: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        overflow: 'auto',
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {tree?.left && buildTreeLayout(tree).length > 1 && (
            <>
              {tree.left && (
                <line
                  x1={200 + 0}
                  y1={20}
                  x2={200 + (buildTreeLayout(tree.left)[0]?.x ?? -50)}
                  y2={20 + 60}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
              )}
              {tree.right && (
                <line
                  x1={200 + 0}
                  y1={20}
                  x2={200 + (buildTreeLayout(tree.right)[0]?.x ?? 50)}
                  y2={20 + 60}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
              )}
            </>
          )}
        </svg>

        <div style={{ position: 'relative', width: '100%', height: '100%', paddingTop: 20, paddingLeft: 200 }}>
          {treeNodes.map((node, idx) => {
            const status = getNodeStatus(node.val)
            const isLeaf = !tree || (tree.val === node.val ? (!tree.left && !tree.right) : true)

            return (
              <motion.div
                key={idx}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    borderColor: status === 'current' ? '#dc2626' : status === 'left_leaf' ? '#10b981' : '#cbd5e1',
                    backgroundColor: status === 'current' ? '#fee2e2' : status === 'left_leaf' ? '#d1fae5' : '#f1f5f9',
                    color: status === 'current' ? '#7f1d1d' : status === 'left_leaf' ? '#065f46' : '#334155',
                  }}
                  animate={{ scale: status === 'current' ? 1.2 : 1 }}
                >
                  {node.val}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#7f1d1d', fontWeight: 600 }}>Current</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#991b1b' }}>{step?.currentNode ?? '—'}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>Left Leaves</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{step?.leftLeaves?.join(', ') || '—'}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Sum</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0284c7' }}>{step?.sum ?? 0}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem404Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [treeInput, setTreeInput] = useState(JSON.stringify(EXAMPLES[0]?.tree ?? []));
  const { tree, inputError } = useMemo(() => {
    try {
      const parsedTree = JSON.parse(treeInput); if (!Array.isArray(parsedTree)) throw new Error('tree must be an array');
      return { tree: parsedTree, inputError: '' };
    } catch (e) {
      return { tree: EXAMPLES[exIdx]?.tree ?? '', inputError: e.message };
    }
  }, [treeInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(tree).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setTreeInput(JSON.stringify(EXAMPLES[i].tree)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Sum of Left Leaves', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #10b981' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#d1fae5' : '#f1f5f9',
                    color: exIdx === idx ? '#065f46' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <TreeVisualization tree={tree} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"tree","label":"tree","type":"string"}]}
          values={{ tree: treeInput }}
          onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
