import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem354Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = ['binary_search', 'binary_search_init', 'done', 'dp_append', 'dp_update', 'envelope_start', 'sort_done', 'sort_start']

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def maxEnvelopes(envelopes):' },
  { line: 2, text: '    if not envelopes: return 0' },
  { line: 3, text: '    envelopes.sort(key=lambda x: (x[0], -x[1]))' },
  { line: 4, text: '    ' },
  { line: 5, text: '    dp = []' },
  { line: 6, text: '    for _, h in envelopes:' },
  { line: 7, text: '        left, right = 0, len(dp)' },
  { line: 8, text: '        while left < right:' },
  { line: 9, text: '            mid = (left + right) // 2' },
  { line: 10, text: '            if dp[mid] < h:' },
  { line: 11, text: '                left = mid + 1' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                right = mid' },
  { line: 14, text: '        ' },
  { line: 15, text: '        if left == len(dp):' },
  { line: 16, text: '            dp.append(h)' },
  { line: 17, text: '        else:' },
  { line: 18, text: '            dp[left] = h' },
  { line: 19, text: '    return len(dp)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(envelopes) {
  const steps = []

  if (!envelopes || envelopes.length === 0) {
    steps.push({
      phase: 'done',
      currentIdx: -1,
      sortedEnvelopes: [],
      dp: [],
      nestingChain: [],
      activeLine: 2,
      message: 'Empty envelopes array.',
    })
    return steps
  }

  // Step 1: Sort envelopes
  let sorted = [...envelopes]
    .map((e, idx) => ({ ...e, origIdx: idx }))
    .sort((a, b) => a[0] - b[0] || b[1] - a[1])

  steps.push({
    phase: 'sort_start',
    currentIdx: -1,
    sortedEnvelopes: sorted,
    dp: [],
    nestingChain: [],
    activeLine: 3,
    message: `Sorting ${envelopes.length} envelopes by (width, -height)`,
  })

  steps.push({
    phase: 'sort_done',
    currentIdx: -1,
    sortedEnvelopes: sorted,
    dp: [],
    nestingChain: [],
    activeLine: 5,
    message: `Envelopes sorted. Initialize dp = []`,
  })

  let dp = []
  let nestingChain = []

  // Step 2-5: Process each envelope
  for (let i = 0; i < sorted.length; i++) {
    const [w, h] = sorted[i]

    steps.push({
      phase: 'envelope_start',
      currentIdx: i,
      sortedEnvelopes: sorted,
      dp: [...dp],
      nestingChain: [...nestingChain],
      activeLine: 6,
      message: `Process envelope ${i}: (${w}, ${h})`,
    })

    // Binary search
    let left = 0
    let right = dp.length
    let searchSteps = 0

    steps.push({
      phase: 'binary_search_init',
      currentIdx: i,
      sortedEnvelopes: sorted,
      dp: [...dp],
      nestingChain: [...nestingChain],
      activeLine: 7,
      message: `Binary search in dp=[${dp.join(', ')}] for height ${h}`,
    })

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      searchSteps++

      steps.push({
        phase: 'binary_search',
        currentIdx: i,
        sortedEnvelopes: sorted,
        dp: [...dp],
        nestingChain: [...nestingChain],
        binarySearchLeft: left,
        binarySearchRight: right,
        binarySearchMid: mid,
        activeLine: 9,
        message: `Search step ${searchSteps}: left=${left}, right=${right}, mid=${mid}, dp[${mid}]=${dp[mid]}`,
      })

      if (dp[mid] < h) {
        left = mid + 1
        steps.push({
          phase: 'binary_search',
          currentIdx: i,
          sortedEnvelopes: sorted,
          dp: [...dp],
          nestingChain: [...nestingChain],
          binarySearchLeft: left,
          binarySearchRight: right,
          binarySearchMid: mid,
          activeLine: 11,
          message: `dp[${mid}]=${dp[mid]} < ${h}, move left to ${left}`,
        })
      } else {
        right = mid
        steps.push({
          phase: 'binary_search',
          currentIdx: i,
          sortedEnvelopes: sorted,
          dp: [...dp],
          nestingChain: [...nestingChain],
          binarySearchLeft: left,
          binarySearchRight: right,
          binarySearchMid: mid,
          activeLine: 13,
          message: `dp[${mid}]=${dp[mid]} >= ${h}, move right to ${right}`,
        })
      }
    }

    // Update DP
    if (left === dp.length) {
      dp.push(h)
      nestingChain.push(i)
      steps.push({
        phase: 'dp_append',
        currentIdx: i,
        sortedEnvelopes: sorted,
        dp: [...dp],
        nestingChain: [...nestingChain],
        activeLine: 16,
        message: `left=${left} == len(dp), append ${h}. dp=[${dp.join(', ')}]`,
      })
    } else {
      dp[left] = h
      steps.push({
        phase: 'dp_update',
        currentIdx: i,
        sortedEnvelopes: sorted,
        dp: [...dp],
        nestingChain: [...nestingChain],
        activeLine: 18,
        message: `left=${left} < len(dp), update dp[${left}]=${h}. dp=[${dp.join(', ')}]`,
      })
    }
  }

  steps.push({
    phase: 'done',
    currentIdx: sorted.length,
    sortedEnvelopes: sorted,
    dp: [...dp],
    nestingChain: [...nestingChain],
    activeLine: 19,
    message: `Complete. Maximum nesting count: ${dp.length}`,
  })

  return steps
}

const EXAMPLES = getExamples('russian-doll-envelopes')
const DEFAULT_ENVELOPES = EXAMPLES[0]?.envelopes ?? [
  [5, 4],
  [6, 4],
  [6, 7],
  [2, 3],
]

function VisualizationPanel({ EXAMPLES, applyExample, selected, handleReset, step, inputEnvelopes }) {
  const initial = inputEnvelopes ?? DEFAULT_ENVELOPES
  const envelopes = step?.sortedEnvelopes ?? initial
  const sortedEnvelopes = step?.sortedEnvelopes ?? []

  const containerWidth = 500
  const containerHeight = 350

  // Find max width and height for scaling
  const maxW = Math.max(1, ...envelopes.map(e => e[0]))
  const maxH = Math.max(1, ...envelopes.map(e => e[1]))

  const scaleX = (containerWidth - 40) / maxW
  const scaleY = (containerHeight - 40) / maxH

  const getEnvelopeColor = (idx) => {
    if (step?.phase === 'sort_start' || step?.phase === 'sort_done') {
      return '#9399b2'
    }
    if (idx === step?.currentIdx) {
      return '#f5c6de'
    }
    if (step?.nestingChain?.includes(idx)) {
      return '#a6e3a1'
    }
    return '#585b70'
  }

  return (
    <div className="rde-viz-panel">
      <div className="rde-top">
        <section className="rde-panel main">
          <header className="rde-head">
            <span>Russian Doll Envelopes</span>
          </header>
          <div className="rde-body">
            {EXAMPLES && EXAMPLES.length > 0 && (
              <div className="rde-examples">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.label}
                    className={`rde-chip ${selected === i ? 'active' : ''}`}
                    onClick={() => applyExample(i)}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            <div className="rde-content">
              <div className="rde-visualization-section">
                <div className="rde-panel-label">Envelopes (sorted)</div>
                <svg
                  width={containerWidth}
                  height={containerHeight}
                  className="rde-envelope-canvas"
                  style={{
                    border: '1px solid #313244',
                    borderRadius: '8px',
                    backgroundColor: '#1e1e2e',
                  }}
                >
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {envelopes.map((env, idx) => {
                    const [w, h] = env
                    const x = (containerWidth - w * scaleX) / 2
                    const y = (containerHeight - h * scaleY) / 2

                    return (
                      <motion.g
                        key={`envelope-${idx}`}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.rect
                          x={x}
                          y={y}
                          width={w * scaleX}
                          height={h * scaleY}
                          fill={getEnvelopeColor(idx)}
                          stroke="#cdd6f4"
                          strokeWidth="2"
                          rx="4"
                          filter="url(#shadow)"
                          animate={{
                            opacity: idx === step?.currentIdx ? 0.9 : 0.6,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <text
                          x={x + (w * scaleX) / 2}
                          y={y + (h * scaleY) / 2 + 4}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="rde-envelope-label"
                          fill="#1e1e2e"
                          fontWeight="bold"
                          fontSize="12"
                        >
                          {w}×{h}
                        </text>
                      </motion.g>
                    )
                  })}
                </svg>
              </div>

              <div className="rde-dp-section">
                <div className="rde-panel-label">DP Sequence (LIS by height)</div>
                <div className="rde-dp-array">
                  {step?.dp && step.dp.length > 0 ? (
                    step.dp.map((height, idx) => (
                      <motion.div
                        key={`dp-${idx}`}
                        className="rde-dp-item"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="rde-dp-value">{height}</div>
                        <div className="rde-dp-index">i={idx}</div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="rde-dp-empty">Empty</div>
                  )}
                </div>
              </div>

              <div className="rde-state-section">
                <div className="rde-panel-label">State</div>
                <div className="rde-state">
                  <div className="rde-state-item">
                    <div className="rde-state-label">Phase:</div>
                    <div className="rde-state-value">{step?.phase}</div>
                  </div>
                  <div className="rde-state-item">
                    <div className="rde-state-label">Current Index:</div>
                    <div className="rde-state-value">{step?.currentIdx ?? '-'}</div>
                  </div>
                  <div className="rde-state-item">
                    <div className="rde-state-label">Nesting Count:</div>
                    <div className="rde-state-value">{step?.dp?.length ?? 0}</div>
                  </div>
                  {step?.binarySearchMid !== undefined && (
                    <div className="rde-state-item">
                      <div className="rde-state-label">Binary Search:</div>
                      <div className="rde-state-value">
                        mid={step.binarySearchMid} (left={step.binarySearchLeft},
                        right={step.binarySearchRight})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="rde-status">{step?.message ?? 'Press Play to begin.'}</div>
    </div>
  )
}

export default function Problem354Visualizer() {
  const [selected, setSelected] = useState(0)
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const [envelopesInput, setEnvelopesInput] = useState(() => JSON.stringify(DEFAULT_ENVELOPES))

  const { envelopes, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(envelopesInput)
      if (!Array.isArray(parsed)) throw new Error('envelopes must be an array, e.g. [[2,3],[5,4]]')
      if (!parsed.every((e) => Array.isArray(e) && e.length === 2 && e.every((n) => typeof n === 'number'))) {
        throw new Error('each envelope must be a [width, height] pair of numbers')
      }
      return { envelopes: parsed, inputError: '' }
    } catch (e) {
      return { envelopes: DEFAULT_ENVELOPES, inputError: e.message }
    }
  }, [envelopesInput])

  const steps = useMemo(() => generateSteps(envelopes), [envelopes])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (idx) => {
      setSelected(idx)
      const next = EXAMPLES[idx]?.envelopes
      if (next) setEnvelopesInput(JSON.stringify(next))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'viz', title: 'Visualization' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    viz: (
      <>
        <ManualInputPanel
          fields={[{ key: 'envelopes', label: 'envelopes', type: 'array' }]}
          values={{ envelopes: envelopesInput }}
          onChange={(k, v) => { if (k === 'envelopes') setEnvelopesInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[selected]?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
        <VisualizationPanel
          EXAMPLES={EXAMPLES}
          applyExample={applyExample}
          selected={selected}
          handleReset={handleReset}
          step={step}
          inputEnvelopes={envelopes}
        />
      </>
    ),
    code: (<CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />),
  }), [step, autoScrollCode, selected, envelopesInput, envelopes, inputError, applyExample, handleReset, setActiveLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
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
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
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
