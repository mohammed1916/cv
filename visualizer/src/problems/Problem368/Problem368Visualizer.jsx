import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem368.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def largestDivisibleSubset(nums):' },
  { line: 2, text: '    if not nums: return []' },
  { line: 3, text: '    nums.sort()' },
  { line: 4, text: '    n = len(nums)' },
  { line: 5, text: '    dp = [1] * n' },
  { line: 6, text: '    parent = [-1] * n' },
  { line: 7, text: '    for i in range(n):' },
  { line: 8, text: '        for j in range(i):' },
  { line: 9, text: '            if nums[i] % nums[j] == 0:' },
  { line: 10, text: '                if dp[j] + 1 > dp[i]:' },
  { line: 11, text: '                    dp[i] = dp[j] + 1' },
  { line: 12, text: '                    parent[i] = j' },
  { line: 13, text: '    maxIdx = dp.index(max(dp))' },
  { line: 14, text: '    result = []' },
  { line: 15, text: '    while maxIdx != -1:' },
  { line: 16, text: '        result.append(nums[maxIdx]); maxIdx = parent[maxIdx]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
  const steps = []
  if (!nums || nums.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty array: return []',
      sortedArray: [],
      dp: [],
      parent: [],
      chain: [],
      currentIdx: -1,
    })
    return steps
  }

  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length

  // Initialize
  steps.push({
    activeLine: 3,
    message: 'Step 1: Sort array for divisibility property',
    sortedArray: sorted,
    dp: Array(n).fill(0),
    parent: Array(n).fill(-1),
    chain: [],
    currentIdx: -1,
  })

  let dp = Array(n).fill(1)
  let parent = Array(n).fill(-1)

  steps.push({
    activeLine: 5,
    message: 'Step 2: Initialize DP tracking (each element is chain of length 1)',
    sortedArray: sorted,
    dp: [...dp],
    parent: [...parent],
    chain: [],
    currentIdx: -1,
  })

  // DP process
  for (let i = 0; i < n; i++) {
    steps.push({
      activeLine: 7,
      message: `Step 3: Processing element at index ${i} (value: ${sorted[i]})`,
      sortedArray: sorted,
      dp: [...dp],
      parent: [...parent],
      chain: [],
      currentIdx: i,
    })

    for (let j = 0; j < i; j++) {
      if (sorted[i] % sorted[j] === 0) {
        steps.push({
          activeLine: 9,
          message: `Found divisor: ${sorted[i]} % ${sorted[j]} === 0`,
          sortedArray: sorted,
          dp: [...dp],
          parent: [...parent],
          highlighted: [j, i],
          chain: [],
          currentIdx: i,
        })

        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1
          parent[i] = j

          steps.push({
            activeLine: 11,
            message: `Updated: chain length at ${i} = ${dp[i]}, parent[${i}] = ${j}`,
            sortedArray: sorted,
            dp: [...dp],
            parent: [...parent],
            highlighted: [j, i],
            chain: [],
            currentIdx: i,
          })
        }
      }
    }
  }

  // Find max
  let maxLen = Math.max(...dp)
  let maxIdx = dp.indexOf(maxLen)

  steps.push({
    activeLine: 13,
    message: `Step 4: Found max chain length ${maxLen} at index ${maxIdx}`,
    sortedArray: sorted,
    dp: [...dp],
    parent: [...parent],
    chain: [],
    currentIdx: maxIdx,
  })

  // Build result chain
  let result = []
  let idx = maxIdx
  while (idx !== -1) {
    result.unshift(idx)
    idx = parent[idx]
  }

  steps.push({
    activeLine: 14,
    message: 'Step 5: Build result by traversing parent chain',
    sortedArray: sorted,
    dp: [...dp],
    parent: [...parent],
    chain: result,
    currentIdx: -1,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Powers of 2',
    input: [1, 2, 4, 8],
  },
  {
    label: 'Example 2: Mixed divisors',
    input: [1, 2, 3, 4, 6],
  },
  {
    label: 'Example 3: Simple case',
    input: [1, 2],
  },
]

function DivisibilityArrows({ sorted, highlighted, currentIdx }) {
  const elementWidth = 60
  const gapBetweenElements = 40
  const containerPadding = 20
  const elementHeight = 50
  const radius = 25

  const getX = (idx) => containerPadding + idx * (elementWidth + gapBetweenElements) + radius
  const getY = () => containerPadding + elementHeight / 2

  return (
    <svg
      width="100%"
      height={150}
      style={{ minHeight: 150, background: 'rgba(15,23,42,0.2)', borderRadius: 6 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="var(--text-muted)" />
        </marker>
        <marker
          id="arrowhead-highlight"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
        </marker>
      </defs>

      {sorted.map((num, i) => {
        const x = getX(i)
        const y = getY()
        const isHighlighted = highlighted?.includes(i)
        const isCurrent = i === currentIdx

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={isCurrent ? '#fbbf24' : isHighlighted ? '#0ea5e9' : 'var(--border)'}
              stroke={isCurrent ? '#f59e0b' : isHighlighted ? '#0ea5e9' : 'var(--text-muted)'}
              strokeWidth={isCurrent || isHighlighted ? 3 : 2}
              style={{ transition: 'all 0.3s ease' }}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="bold"
            >
              {num}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function ChainVisualization({ sorted, chain }) {
  if (chain.length === 0) return null

  const chainValues = chain.map((idx) => sorted[idx])
  const elementWidth = 70
  const gapBetweenElements = 30

  return (
    <div style={{ padding: 12, backgroundColor: '#065f46', borderRadius: 6, border: '2px solid #10b981' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#0f8749', marginBottom: 8 }}>
        Final Divisible Subset (length: {chain.length}):
      </div>
      <svg width="100%" height={80} style={{ minHeight: 80 }}>
        <defs>
          <marker
            id="arrow-chain"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
        </defs>

        {chainValues.map((val, i) => {
          const x = 20 + i * (elementWidth + gapBetweenElements)
          const y = 40

          return (
            <motion.g key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <motion.circle
                cx={x}
                cy={y}
                r={22}
                fill="#10b981"
                stroke="#d1fae5"
                strokeWidth={2}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#065f46"
                fontSize="14"
                fontWeight="bold"
              >
                {val}
              </text>

              {i < chainValues.length - 1 && (
                <motion.line
                  x1={x + 22}
                  y1={y}
                  x2={x + gapBetweenElements}
                  y2={y}
                  stroke="#10b981"
                  strokeWidth={2}
                  markerEnd="url(#arrow-chain)"
                  initial={{ strokeDashoffset: 30, opacity: 0 }}
                  animate={{ strokeDashoffset: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.1 }}
                  strokeDasharray="30"
                />
              )}
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Problem368Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [inputInput, setInputInput] = useState(EXAMPLES[0]?.input ?? '');
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = inputInput;
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: EXAMPLES[exIdx]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(input), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setInputInput(String(EXAMPLES[i].input)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⛓️ Divisible Subset', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
        </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selection */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : 'var(--surface2)',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Status message */}
              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--surface2)' }}>{step.message}</div>
              </div>

              {/* Array and DP state */}
              <div style={{ padding: 8, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Sorted Array & Chain Length:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.sortedArray.map((num, i) => {
                    const isCurrent = i === step.currentIdx
                    const isHighlighted = step.highlighted?.includes(i)
                    return (
                      <motion.div
                        key={i}
                        animate={{ scale: isCurrent || isHighlighted ? 1.15 : 1 }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: isCurrent || isHighlighted ? '2px solid #0ea5e9' : '1px solid var(--border)',
                          backgroundColor: isCurrent ? '#fef08a' : isHighlighted ? '#0ea5e9' : 'var(--surface2)',
                          color: isHighlighted ? '#fff' : 'var(--surface2)',
                          fontSize: 11,
                          fontWeight: 600,
                          textAlign: 'center',
                          minWidth: 50,
                        }}
                      >
      
                        <div>{num}</div>
                        <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                          {step.dp[i] > 0 ? `L:${step.dp[i]}` : ''}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Divisibility visualization */}
              <DivisibilityArrows
                sorted={step.sortedArray}
                highlighted={step.highlighted}
                currentIdx={step.currentIdx}
              />

              {/* Final chain */}
              {step.chain.length > 0 && <ChainVisualization sorted={step.sortedArray} chain={step.chain} />}

              {/* Story section */}
              <div style={{ padding: 8, backgroundColor: '#ede9fe', borderRadius: 6, fontSize: 11, color: '#5b21b6' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>📖 Story:</div>
                <div style={{ lineHeight: 1.4 }}>
                  Build a tower where each block divides the next, like stacking building blocks where each
                  one must be a multiple of the one below. The longer the tower, the better!
                </div>
              </div>
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, exIdx, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"input","label":"input","type":"array"}]}
          values={{ input: inputInput }}
          onChange={(k, v) => { if (k === 'input') setInputInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
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
