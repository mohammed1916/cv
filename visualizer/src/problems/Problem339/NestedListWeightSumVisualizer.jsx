import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './NestedListWeightSumVisualizer.css'

const P = 'nested-list-weight-sum'

const SOLUTION_CODE = [
  { line: 1, text: 'def depthSum(nestedList):' },
  { line: 2, text: '    def dfs(items, depth):' },
  { line: 3, text: '        total = 0' },
  { line: 4, text: '        for item in items:' },
  { line: 5, text: '            if item.isInteger():' },
  { line: 6, text: '                total += item.getInteger() * depth' },
  { line: 7, text: '            else:' },
  { line: 8, text: '                total += dfs(item.getList(), depth + 1)' },
  { line: 9, text: '        return total' },
  { line: 10, text: '    return dfs(nestedList, 1)' },
]

// Build a tree of nodes with stable ids so steps and rendering stay in sync.
// depth is the level of the elements in `arr` (top-level integers are depth 1).
function buildTree(arr, prefix = 'n', depth = 1) {
  return arr.map((el, i) => {
    const id = `${prefix}-${i}`
    if (Array.isArray(el)) {
      return { id, type: 'list', depth, children: buildTree(el, id, depth + 1) }
    }
    return { id, type: 'int', depth, value: el }
  })
}

function generateSteps(nestedList) {
  if (!Array.isArray(nestedList)) return []

  const roots = buildTree(nestedList, 'n', 1)
  const steps = []
  const contributions = {}
  let total = 0

  steps.push({
    phase: 'init',
    activeLine: 10,
    relatedLines: [1, 10],
    message: 'Start: call dfs(nestedList, depth = 1).',
    currentId: null,
    depth: 1,
    contribution: null,
    value: null,
    total: 0,
    contributions: {},
  })

  const dfs = (nodes, depth) => {
    for (const node of nodes) {
      if (node.type === 'int') {
        steps.push({
          phase: 'visit',
          activeLine: 5,
          relatedLines: [4, 5],
          message: `Depth ${depth}: element ${node.value} is an integer.`,
          currentId: node.id,
          depth,
          contribution: null,
          value: node.value,
          total,
          contributions: { ...contributions },
        })

        const contribution = node.value * depth
        total += contribution
        contributions[node.id] = { depth, value: node.value, contribution }

        steps.push({
          phase: 'update',
          activeLine: 6,
          relatedLines: [5, 6],
          message: `Add ${node.value} × ${depth} = ${contribution}. Running total = ${total}.`,
          currentId: node.id,
          depth,
          contribution,
          value: node.value,
          total,
          contributions: { ...contributions },
        })
      } else {
        steps.push({
          phase: 'visit',
          activeLine: 5,
          relatedLines: [4, 5, 7],
          message: `Depth ${depth}: element is a nested list, not an integer.`,
          currentId: node.id,
          depth,
          contribution: null,
          value: null,
          total,
          contributions: { ...contributions },
        })

        steps.push({
          phase: 'recurse',
          activeLine: 8,
          relatedLines: [7, 8],
          message: `Recurse into the list — depth becomes ${depth + 1}.`,
          currentId: node.id,
          depth: depth + 1,
          contribution: null,
          value: null,
          total,
          contributions: { ...contributions },
        })

        dfs(node.children, depth + 1)
      }
    }
  }

  dfs(roots, 1)

  steps.push({
    phase: 'done',
    activeLine: 10,
    relatedLines: [9, 10],
    message: `Done. Weighted depth sum = ${total}.`,
    currentId: null,
    depth: 1,
    contribution: null,
    value: null,
    total,
    contributions: { ...contributions },
  })

  return steps
}

function renderNode(node, step) {
  const contrib = step?.contributions?.[node.id]
  const isCurrent = step?.currentId === node.id
  const done = !!contrib

  if (node.type === 'int') {
    const bg = isCurrent
      ? 'rgba(245,158,11,0.18)'
      : done
        ? 'rgba(34,197,94,0.15)'
        : 'rgba(148,163,184,0.08)'
    const border = isCurrent ? '#f59e0b' : done ? '#22c55e' : 'rgba(148,163,184,0.35)'
    return (
      <div
        key={node.id}
        className={`${P}-node ${P}-int`}
        style={{ background: bg, borderColor: border }}
      >
        <span className={`${P}-int-value`}>{node.value}</span>
        <span className={`${P}-int-depth`}>depth {node.depth}</span>
        {done && (
          <span className={`${P}-int-contrib`}>
            {contrib.value} × {contrib.depth} = {contrib.contribution}
          </span>
        )}
      </div>
    )
  }

  const listBorder = isCurrent ? '#f59e0b' : 'rgba(148,163,184,0.3)'
  const listBg = isCurrent ? 'rgba(245,158,11,0.1)' : 'transparent'
  return (
    <div
      key={node.id}
      className={`${P}-node ${P}-list`}
      style={{ borderColor: listBorder, background: listBg }}
    >
      <div className={`${P}-list-label`}>
        <span className={`${P}-bracket`}>[</span>
        <span className={`${P}-list-tag`}>list</span>
      </div>
      <div className={`${P}-children`}>
        {node.children.map((c) => renderNode(c, step))}
      </div>
      <span className={`${P}-bracket`}>]</span>
    </div>
  )
}

const REGISTRY_EXAMPLES = getExamplesOr('nested-list-weight-sum', [])
const FALLBACK_EXAMPLES = [
  { label: '[[1,1],2,[1,1]]  → 10', inputs: [[1, 1], 2, [1, 1]] },
  { label: '[1,[4,[6]]]  → 27', inputs: [1, [4, [6]]] },
  { label: '[[[3]],2,1]  → 12', inputs: [[[3]], 2, 1] },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : FALLBACK_EXAMPLES

function isNestedNumberList(value) {
  return Array.isArray(value)
    && value.every((item) => Number.isFinite(item) || isNestedNumberList(item))
}

export default function NestedListWeightSumVisualizer() {
  const [inputValue, setInputValue] = useState(
    EXAMPLES.length > 0 ? JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]) : '[[1,1],2,[1,1]]',
  )

  const parsed = useMemo(() => {
    try {
      const v = JSON.parse(inputValue)
      return isNestedNumberList(v) ? v : null
    } catch {
      return null
    }
  }, [inputValue])

  const inputError = useMemo(() => {
    try {
      const v = JSON.parse(inputValue)
      if (!isNestedNumberList(v)) return 'Input must be a nested list of finite numbers, e.g. [[1,1],2,[1,1]]'
      return ''
    } catch (e) {
      return e.message
    }
  }, [inputValue])

  const tree = useMemo(() => (parsed ? buildTree(parsed, 'n', 1) : []), [parsed])
  const steps = useMemo(() => generateSteps(parsed), [parsed])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  return (
    <div className="nested-list-weight-sum-shell">
      <div className="nested-list-weight-sum-panel">
        <div className="nested-list-weight-sum-panel-head">Input (nested list as JSON)</div>
        <div className="nested-list-weight-sum-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="nested-list-weight-sum-textarea"
            placeholder="e.g. [[1,1],2,[1,1]]"
          />
          {inputError && <div className="nested-list-weight-sum-error">{inputError}</div>}
        </div>
      </div>

      <div className="nested-list-weight-sum-panel">
        <div className="nested-list-weight-sum-panel-head">Visualization</div>
        <div className="nested-list-weight-sum-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="nested-list-weight-sum-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="nested-list-weight-sum-step-info">
                <h3>{step?.message || 'Press play to begin the DFS traversal.'}</h3>
              </div>

              <div className="nested-list-weight-sum-stats">
                <div className="nested-list-weight-sum-stat">
                  <span className="nested-list-weight-sum-stat-label">Current depth</span>
                  <span className="nested-list-weight-sum-stat-value">{step?.depth ?? '—'}</span>
                </div>
                <div className="nested-list-weight-sum-stat">
                  <span className="nested-list-weight-sum-stat-label">Contribution</span>
                  <span className="nested-list-weight-sum-stat-value">
                    {step?.contribution != null
                      ? `${step.value} × ${step.depth} = ${step.contribution}`
                      : '—'}
                  </span>
                </div>
                <div className="nested-list-weight-sum-stat nested-list-weight-sum-total">
                  <span className="nested-list-weight-sum-stat-label">Running total</span>
                  <span className="nested-list-weight-sum-stat-value">{step?.total ?? 0}</span>
                </div>
              </div>

              <div className="nested-list-weight-sum-tree">
                {tree.length > 0
                  ? tree.map((node) => renderNode(node, step))
                  : (
                    <div className="nested-list-weight-sum-empty">
                      Enter a valid nested list, e.g. [[1,1],2,[1,1]]
                    </div>
                  )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="nested-list-weight-sum-panel">
        <div className="nested-list-weight-sum-panel-head">Code</div>
        <div className="nested-list-weight-sum-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="nested-list-weight-sum-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="nested-list-weight-sum-example-btn"
              onClick={() => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}

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
        />
      </FloatingPanel>
    </div>
  )
}
