import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem364Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['calculate-weight', 'complete', 'max-depth', 'parse', 'traverse-nested']
const LINE_PATTERN_MAP = {
  1: 'parse',
  9: 'max-depth',
  13: 'traverse-nested',
  16: 'calculate-weight'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def depthSumInverse(nestedList):' },
  { line: 2, text: '    max_depth = 0' },
  { line: 3, text: '    def getMaxDepth(lst, depth):' },
  { line: 4, text: '        nonlocal max_depth' },
  { line: 5, text: '        for item in lst:' },
  { line: 6, text: '            if isinstance(item, list):' },
  { line: 7, text: '                max_depth = max(max_depth, depth)' },
  { line: 8, text: '                getMaxDepth(item, depth + 1)' },
  { line: 9, text: '    getMaxDepth(nestedList, 1)' },
  { line: 10, text: '    total = 0' },
  { line: 11, text: '    def dfs(lst, depth):' },
  { line: 12, text: '        nonlocal total' },
  { line: 13, text: '        for item in lst:' },
  { line: 14, text: '            if isinstance(item, int):' },
  { line: 15, text: '                weight = max_depth - depth + 1' },
  { line: 16, text: '                total += item * weight' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nestedList) {
  const steps = []

  // Step 1: Parse nested structure
  steps.push({
    activeLine: 1,
    phase: 'parse',
    nestedList: JSON.parse(JSON.stringify(nestedList)),
    maxDepth: null,
    currentElements: [],
    depthLevels: [],
    currentDepth: 0,
    weights: new Map(),
    subtotals: new Map(),
    runningSum: 0,
    message: 'Starting: Parse the nested list structure.',
    details: `Input: ${JSON.stringify(nestedList)}`,
  })

  // Step 2: Calculate max depth
  let maxDepth = 0
  function findMaxDepth(lst, depth) {
    for (const item of lst) {
      if (Array.isArray(item)) {
        maxDepth = Math.max(maxDepth, depth + 1)
        findMaxDepth(item, depth + 1)
      }
    }
  }
  findMaxDepth(nestedList, 1)

  steps.push({
    activeLine: 9,
    phase: 'max-depth',
    nestedList: JSON.parse(JSON.stringify(nestedList)),
    maxDepth,
    currentElements: [],
    depthLevels: [],
    currentDepth: 0,
    weights: new Map(),
    subtotals: new Map(),
    runningSum: 0,
    message: `Calculate max depth: ${maxDepth}`,
    details: `Maximum nesting depth found: ${maxDepth}`,
  })

  // Step 3: DFS traversal and weight calculation
  let runningSum = 0
  const allWeights = new Map()
  const allSubtotals = new Map()
  const depthLevelMap = new Map()

  function dfs(lst, depth) {
    if (!depthLevelMap.has(depth)) {
      depthLevelMap.set(depth, [])
    }

    for (const item of lst) {
      if (typeof item === 'number') {
        const weight = maxDepth - depth + 1
        const subtotal = item * weight
        runningSum += subtotal
        allWeights.set(`${item}-d${depth}`, weight)
        allSubtotals.set(`${item}-d${depth}`, subtotal)
        depthLevelMap.get(depth).push({ value: item, weight, subtotal })

        steps.push({
          activeLine: 16,
          phase: 'calculate-weight',
          nestedList: JSON.parse(JSON.stringify(nestedList)),
          maxDepth,
          currentElements: [{ value: item, depth }],
          depthLevels: Array.from(depthLevelMap.entries()).map(([d, items]) => ({ depth: d, items })),
          currentDepth: depth,
          weights: new Map(allWeights),
          subtotals: new Map(allSubtotals),
          runningSum,
          message: `Element ${item} at depth ${depth}: weight = ${maxDepth} - ${depth} + 1 = ${weight}`,
          details: `Contribution: ${item} × ${weight} = ${subtotal}, Running sum: ${runningSum}`,
        })
      } else if (Array.isArray(item)) {
        steps.push({
          activeLine: 13,
          phase: 'traverse-nested',
          nestedList: JSON.parse(JSON.stringify(nestedList)),
          maxDepth,
          currentElements: [],
          depthLevels: Array.from(depthLevelMap.entries()).map(([d, items]) => ({ depth: d, items })),
          currentDepth: depth + 1,
          weights: new Map(allWeights),
          subtotals: new Map(allSubtotals),
          runningSum,
          message: `Traverse into nested list at depth ${depth + 1}`,
          details: `Going deeper: ${JSON.stringify(item)}`,
        })
        dfs(item, depth + 1)
      }
    }
  }

  dfs(nestedList, 1)

  // Final step: Sum complete
  steps.push({
    activeLine: 16,
    phase: 'complete',
    nestedList: JSON.parse(JSON.stringify(nestedList)),
    maxDepth,
    currentElements: [],
    depthLevels: Array.from(depthLevelMap.entries()).map(([d, items]) => ({ depth: d, items })),
    currentDepth: 0,
    weights: new Map(allWeights),
    subtotals: new Map(allSubtotals),
    runningSum,
    message: `Traversal complete: Final sum = ${runningSum}`,
    details: `All elements processed. Total: ${runningSum}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Simple Nesting',
    list: [[1, 1], 2, [1, 1]],
    description: 'Mixed integers and single nesting',
  },
  {
    label: 'Example 2: Deep Nesting',
    list: [1, [4, [6]]],
    description: 'Progressive depth increase',
  },
  {
    label: 'Example 3: Complex',
    list: [[1], [[2]], [[[3]]], [[[[4]]]]],
    description: 'Increasing nesting depths',
  },
]

export default function Problem364Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [listInput, setListInput] = useState(JSON.stringify(EXAMPLES[0]?.list ?? []));
  const { list, inputError } = useMemo(() => {
    try {
      const parsedList = JSON.parse(listInput); if (!Array.isArray(parsedList)) throw new Error('list must be an array');
      return { list: parsedList, inputError: '' };
    } catch (e) {
      return { list: EXAMPLES[exIdx]?.list ?? '', inputError: e.message };
    }
  }, [listInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(list), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setListInput(JSON.stringify(EXAMPLES[i].list)); handleReset(); }, [handleReset]);

  // Render tree structure visualization
  const treeVisualization = step ? (
    <div className="nlws-tree-container">
      {step.depthLevels.length > 0 ? (
        step.depthLevels.map(({ depth, items }) => (
          <motion.div
            key={`depth-${depth}`}
            className="nlws-tree-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="nlws-depth-label">Depth {depth}</div>
            {items.map((item, idx) => (
              <motion.div
                key={`item-${depth}-${idx}`}
                className={`nlws-element ${step.currentElements.some(e => e.value === item.value && e.depth === depth) ? 'active' : 'visited'}`}
                animate={{
                  scale: step.currentElements.some(e => e.value === item.value && e.depth === depth) ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="nlws-element-value">{item.value}</div>
                <div className="nlws-element-info">
                  <div className="nlws-element-weight">W:{item.weight}</div>
                  <div className="nlws-element-subtotal">S:{item.subtotal}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))
      ) : (
        <div style={{ color: 'var(--nlws-overlay0)', fontSize: 12 }}>Waiting to process elements...</div>
      )}
    </div>
  ) : null

  // Render metrics
  const metricsDisplay = step ? (
    <div className="nlws-metrics">
      <div className="nlws-metric">
        <div className="nlws-metric-label">Max Depth</div>
        <motion.div
          className="nlws-metric-value"
          key={`maxdepth-${step.maxDepth}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.maxDepth || '—'}
        </motion.div>
      </div>
      <div className="nlws-metric">
        <div className="nlws-metric-label">Current Depth</div>
        <motion.div
          className="nlws-metric-value"
          key={`depth-${step.currentDepth}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.currentDepth || '—'}
        </motion.div>
      </div>
      <div className="nlws-metric">
        <div className="nlws-metric-label">Elements Processed</div>
        <motion.div
          className="nlws-metric-value"
          key={`count-${step.weights.size}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.weights.size}
        </motion.div>
      </div>
    </div>
  ) : null

  // Render accumulator
  const accumulatorDisplay = step ? (
    <motion.div
      className="nlws-accumulator"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
    >
      <div className="nlws-accumulator-label">Running Sum (Inverse Weight)</div>
      <motion.div
        className="nlws-accumulator-value"
        key={`sum-${step.runningSum}`}
        initial={{ scale: 0.8, y: -5 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {step.runningSum}
      </motion.div>
    </motion.div>
  ) : null

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>
      ),
    },
    {
      id: 'viz',
      title: '🌳 Tree Traversal',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div className="nlws-examples">
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                className={`nlws-example-btn ${exIdx === i ? 'active' : ''}`}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
              <div className="nlws-step-info">
                <div className="nlws-step-message">{step.message}</div>
                <div className="nlws-step-details">{step.details}</div>
              </div>

              {treeVisualization}
              {metricsDisplay}
              {accumulatorDisplay}

              <div className="nlws-legend">
                <div className="nlws-legend-item">
                  <div className="nlws-legend-dot active" />
                  Current Element
                </div>
                <div className="nlws-legend-item">
                  <div className="nlws-legend-dot visited" />
                  Processed
                </div>
                <div className="nlws-legend-item">
                  <div className="nlws-legend-dot normal" />
                  Unprocessed
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
