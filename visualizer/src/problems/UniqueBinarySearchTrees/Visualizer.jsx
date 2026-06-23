import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

// Generate steps for the dynamic programming approach to count unique BSTs
function generateSteps(n) {
  const steps = []

  if (n <= 0) {
    steps.push({
      phase: 'init',
      n: 0,
      i: null,
      j: null,
      dpValue: null,
      message: 'n = 0. Base case: one way to create an empty tree.',
      activeLine: 3,
      dpTable: [1],
    })
    return steps
  }

  // Build DP table step by step
  const dp = [1, 1] // dp[0] = 1, dp[1] = 1

  steps.push({
    phase: 'init',
    n,
    i: null,
    j: null,
    dpValue: null,
    message: 'Initialize: dp[0] = 1 (empty tree), dp[1] = 1 (single node).',
    activeLine: 3,
    dpTable: [...dp],
  })

  // Fill the DP table for lengths 2 to n
  for (let len = 2; len <= n; len++) {
    steps.push({
      phase: 'outer_loop',
      n,
      len,
      i: null,
      j: null,
      dpValue: null,
      message: `Computing dp[${len}]: number of unique BSTs with ${len} nodes.`,
      activeLine: 5,
      dpTable: [...dp],
    })

    let count = 0

    for (let root = 1; root <= len; root++) {
      const left = root - 1
      const right = len - root

      steps.push({
        phase: 'inner_loop',
        n,
        len,
        root,
        left,
        right,
        dpValue: null,
        message: `Try root = ${root}. Left subtree: ${left} nodes, Right subtree: ${right} nodes.`,
        activeLine: 6,
        dpTable: [...dp],
      })

      const contribution = dp[left] * dp[right]

      steps.push({
        phase: 'calc_contribution',
        n,
        len,
        root,
        left,
        right,
        dpValue: contribution,
        message: `Ways to arrange: dp[${left}] × dp[${right}] = ${dp[left]} × ${dp[right]} = ${contribution}.`,
        activeLine: 7,
        dpTable: [...dp],
      })

      count += contribution
    }

    dp.push(count)

    steps.push({
      phase: 'update_dp',
      n,
      len,
      i: null,
      j: null,
      dpValue: count,
      message: `dp[${len}] = ${count}. Total ways for ${len} nodes.`,
      activeLine: 8,
      dpTable: [...dp],
    })
  }

  steps.push({
    phase: 'done',
    n,
    i: null,
    j: null,
    dpValue: dp[n],
    message: `Complete! Number of unique BSTs with ${n} nodes: ${dp[n]}.`,
    activeLine: 10,
    dpTable: [...dp],
  })

  return steps
}

const EXAMPLES = getExamples('unique-binary-search-trees') || [
  { label: 'n=1', n: 1 },
  { label: 'n=2', n: 2 },
  { label: 'n=3', n: 3 },
  { label: 'n=4', n: 4 },
]

function DPTablePanel({ step, n }) {
  const dpTable = step?.dpTable || [1]

  return (
    <div className="ubst-dp-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-dp-panel-head">DP Table</div>
      <div className="ubst-dp-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="ubst-dp-table-container">
          <div className="ubst-dp-table-title">dp[i] = Number of Unique BSTs with i nodes</div>
          <div className="ubst-dp-table">
            {dpTable.map((value, idx) => {
              const isActive = step?.len === idx || step?.n === idx
              const isComputed = idx <= n

              return (
                <motion.div
                  key={idx}
                  className={`ubst-dp-cell ${isActive ? 'active' : ''} ${isComputed ? 'computed' : ''}`}
                  animate={isActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ubst-dp-cell-index">i={idx}</div>
                  <div className="ubst-dp-cell-value">{value}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {step && step.phase === 'calc_contribution' && (
          <div className="ubst-formula-box">
            <div className="ubst-formula-title">Calculation</div>
            <div className="ubst-formula-equation">
              dp[{step.len}] += dp[{step.left}] × dp[{step.right}]
            </div>
            <div className="ubst-formula-equation result">
              += {step.dpValue}
            </div>
          </div>
        )}

        {step && step.phase === 'update_dp' && (
          <div className="ubst-result-box">
            <div className="ubst-result-label">Result</div>
            <div className="ubst-result-value">{step.dpValue}</div>
            <div className="ubst-result-desc">
              Unique BSTs with {step.len} nodes
            </div>
          </div>
        )}

        {step && step.phase === 'done' && (
          <div className="ubst-final-box">
            <div className="ubst-final-label">Answer</div>
            <div className="ubst-final-value">{step.dpValue}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({
  nInput,
  setNInput,
  n,
  inputError,
  handleReset,
  step,
  applyExample,
}) {
  return (
    <div className="ubst-viz-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-viz-panel-head">
        Input & Explanation
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="ubst-viz-panel-body" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="ubst-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>n =</span>
          <input
            type="number"
            value={nInput}
            onChange={(e) => {
              setNInput(e.target.value)
              handleReset()
            }}
            placeholder="3"
            className="ubst-input"
            style={{ width: '80px', margin: 0, textAlign: 'center' }}
            min="0"
            max="10"
          />
        </div>

        <div className="ubst-explanation">
          <div className="ubst-exp-title">Problem</div>
          <div className="ubst-exp-content">
            Count the number of structurally unique binary search trees (BSTs) with
            {' '}
            <span className="highlight">{n}</span>
            {' '}
            distinct nodes.
          </div>
        </div>

        <div className="ubst-explanation">
          <div className="ubst-exp-title">Approach</div>
          <div className="ubst-exp-content">
            Use dynamic programming. For each possible root i:
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Left subtree has i-1 nodes (values 1 to i-1)</li>
              <li>Right subtree has n-i nodes (values i+1 to n)</li>
              <li>Multiply combinations: dp[i-1] × dp[n-i]</li>
            </ul>
          </div>
        </div>

        {step && step.phase !== 'init' && step.len !== undefined && (
          <div className="ubst-explanation">
            <div className="ubst-exp-title">Current Step</div>
            <div className="ubst-exp-content">{step.message}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExplanationPanel({ step }) {
  return (
    <div className="ubst-exp-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ubst-exp-panel-head">Step Information</div>
      <div className="ubst-exp-panel-body">
        {step ? (
          <div className="ubst-step-info">
            <div className="ubst-step-phase">
              <strong>Phase:</strong> {step.phase}
            </div>
            {step.len !== undefined && (
              <div className="ubst-step-detail">
                <strong>Computing:</strong> dp[{step.len}]
              </div>
            )}
            {step.root !== undefined && (
              <div className="ubst-step-detail">
                <strong>Root Position:</strong> {step.root}
                <span style={{ marginLeft: 12 }}>
                  Left: {step.left} nodes, Right: {step.right} nodes
                </span>
              </div>
            )}
            {step.dpValue !== null && step.dpValue !== undefined && (
              <div className="ubst-step-detail">
                <strong>Contribution:</strong> {step.dpValue}
              </div>
            )}
            <div className="ubst-step-message">{step.message}</div>
          </div>
        ) : (
          <div style={{ color: '#64748b' }}>Click next to begin stepping through the algorithm.</div>
        )}
      </div>
    </div>
  )
}

export default function UniqueBinarySearchTreesVisualizer() {
  const [nInput, setNInput] = useState('3')

  // Load solution code from registry
    { line: 1, text: 'def numTrees(n: int) -> int:' },
    { line: 2, text: '    # dp[i] = number of unique BSTs with i nodes' },
    { line: 3, text: '    dp = [0] * (n + 1)' },
    { line: 4, text: '    dp[0] = dp[1] = 1' },
    { line: 5, text: '    ' },
    { line: 6, text: '    for length in range(2, n + 1):' },
    { line: 7, text: '        for root in range(1, length + 1):' },
    { line: 8, text: '            left = root - 1' },
    { line: 9, text: '            right = length - root' },
    { line: 10, text: '            dp[length] += dp[left] * dp[right]' },
    { line: 11, text: '    ' },
    { line: 12, text: '    return dp[n]' },
  ]

  const { n, inputError } = useMemo(() => {
    try {
      const num = parseInt(nInput, 10)
      if (isNaN(num) || num < 0 || num > 10) throw new Error('n must be between 0 and 10')
      return { n: num, inputError: '' }
    } catch (e) {
      return { n: 3, inputError: e.message || 'Invalid input' }
    }
  }, [nInput])

  const steps = useMemo(
    () =>
      generateSteps(n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [n],
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Use modular visualization features system
  const vizFeatureDefs = getVisualizationFeatures('unique-binary-search-trees') || []
  const { items: vizFeatures, toggle: toggleVizFeature, enabledIds: enabledVizIds } = useVisualizationFeatures(vizFeatureDefs)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (ex) => {
      setNInput(String(ex.n))
      handleReset()
    },
    [handleReset],
  )

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const dockPanels = useMemo(
    () => [
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
        id: 'dp',
        title: 'DP Table',
        content: <DPTablePanel step={step} n={n} />,
      },
      {
        id: 'viz',
        title: 'Input & Explanation',
        content: (
          <VisualizationPanel
            nInput={nInput}
            setNInput={setNInput}
            n={n}
            inputError={inputError}
            handleReset={handleReset}
            step={step}
            applyExample={applyExample}
          />
        ),
      },
      {
        id: 'info',
        title: 'Step Info',
        content: <ExplanationPanel step={step} />,
      },
    ],
    [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, autoScrollCode, nInput, setNInput, n, inputError, handleReset, applyExample, setActiveLineDom],
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'dp'], ['viz', 'info']], minimized: [] }} />
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
        {vizFeatures.length > 0 && <VisualizationControls features={vizFeatures} onToggle={toggleVizFeature} />}
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
