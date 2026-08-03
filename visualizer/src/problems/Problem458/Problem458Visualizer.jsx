import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['checking', 'done', 'init_pigs', 'start', 'states_calculated']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  3: 'init_pigs',
  4: 'checking',
  6: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def poorPigs(buckets, minutesToDie, minutesToTest):' },
  { line: 2, text: '    states = minutesToTest // minutesToDie + 1' },
  { line: 3, text: '    pigs = 0' },
  { line: 4, text: '    while states ** pigs < buckets:' },
  { line: 5, text: '        pigs += 1' },
  { line: 6, text: '    return pigs' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('poor-pigs') || [
  { label: 'Example 1', buckets: 1000, minutesToDie: 15, minutesToTest: 60, expected: 5 },
  { label: 'Example 2', buckets: 8, minutesToDie: 5, minutesToTest: 20, expected: 2 },
  { label: 'Example 3', buckets: 125, minutesToDie: 1, minutesToTest: 40, expected: 3 },
]

const SNIPPETS = [
  { id: 'calc_states', label: 'Calculate States', lines: [2] },
  { id: 'init', label: 'Initialize', lines: [3] },
  { id: 'loop', label: 'Find Pigs', lines: [4, 5] },
  { id: 'return', label: 'Return', lines: [6] },
]

function generateSteps(buckets, minutesToDie, minutesToTest) {
  const steps = []

  if (buckets <= 0 || minutesToDie <= 0 || minutesToTest <= 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      stepNum: 0,
      pigs: 0,
      message: 'Invalid inputs.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    stepNum: 0,
    pigs: 0,
    message: `Finding minimum pigs needed for ${buckets} buckets`,
  })

  const states = Math.floor(minutesToTest / minutesToDie) + 1

  steps.push({
    phase: 'states_calculated',
    activeLine: 2,
    stepNum: 1,
    states,
    pigs: 0,
    message: `Each pig can distinguish ${states} states (minute ${minutesToTest / minutesToDie} + 1)`,
  })

  steps.push({
    phase: 'init_pigs',
    activeLine: 3,
    stepNum: 2,
    states,
    pigs: 0,
    message: `Starting with 0 pigs`,
  })

  let pigs = 0
  let stepNum = 3

  while (Math.pow(states, pigs) < buckets) {
    pigs++

    const capacity = Math.pow(states, pigs)

    steps.push({
      phase: 'checking',
      activeLine: 4,
      stepNum,
      states,
      pigs,
      capacity,
      message: `With ${pigs} pig(s): ${states}^${pigs} = ${capacity} (need ${buckets})`,
    })
    stepNum++
  }

  steps.push({
    phase: 'done',
    activeLine: 6,
    stepNum,
    states,
    pigs,
    capacity: Math.pow(states, pigs),
    message: `Minimum pigs needed: ${pigs}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'states_calculated') return 'calc_states'
  if (phase === 'init_pigs') return 'init'
  if (phase === 'checking') return 'loop'
  if (phase === 'done') return 'return'
  return 'calc_states'
}

function PigMathVisualization({ step }) {
  const states = step?.states ?? 0
  const pigs = step?.pigs ?? 0
  const capacity = step?.capacity ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <motion.div
          animate={{ scale: 1 }}
          style={{
            padding: 16,
            backgroundColor: '#dbeafe',
            borderRadius: 8,
            border: '2px solid #3b82f6',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
            States per Pig
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>
            {states}
          </div>
          <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 4 }}>
            (minutesToTest / minutesToDie + 1)
          </div>
        </motion.div>

        <motion.div
          animate={{ scale: 1 }}
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 8,
            border: '2px solid #fcd34d',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
            Number of Pigs
          </div>
          <motion.div
            key={pigs}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 28, fontWeight: 700, color: '#92400e' }}
          >
            {pigs}
          </motion.div>
          <div style={{ fontSize: 10, color: '#b45309', marginTop: 4 }}>
            (minimized)
          </div>
        </motion.div>

        <motion.div
          animate={{ scale: 1 }}
          style={{
            padding: 16,
            backgroundColor: '#d1fae5',
            borderRadius: 8,
            border: '2px solid #10b981',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#047857', marginBottom: 8 }}>
            Total Capacity
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#047857' }}>
            {capacity}
          </div>
          <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>
            ({states}^{pigs})
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          State Distribution
        </header>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(states, 5)}, 1fr)`,
          gap: 6,
        }}>
          {Array.from({ length: Math.min(states, 5) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: 8,
                backgroundColor: '#f3f4f6',
                borderRadius: 4,
                border: '1px solid #d1d5db',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              State {i}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, EXAMPLES, handleExampleClick, bucketsInput, minutesToDieInput, minutesToTestInput, setBucketsInput, setMinutesToDieInput, setMinutesToTestInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            Buckets
          </label>
          <input
            value={bucketsInput}
            onChange={(e) => { setBucketsInput(e.target.value); handleReset() }}
            placeholder="e.g., 1000"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            Minutes to Die
          </label>
          <input
            value={minutesToDieInput}
            onChange={(e) => { setMinutesToDieInput(e.target.value); handleReset() }}
            placeholder="e.g., 15"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            Minutes to Test
          </label>
          <input
            value={minutesToTestInput}
            onChange={(e) => { setMinutesToTestInput(e.target.value); handleReset() }}
            placeholder="e.g., 60"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <PigMathVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Pig Logic
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Each pig can distinguish multiple states. Find minimum pigs where states^pigs &gt;= buckets.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem458Visualizer() {
  const [bucketsInput, setBucketsInput] = useState('1000')
  const [minutesToDieInput, setMinutesToDieInput] = useState('15')
  const [minutesToTestInput, setMinutesToTestInput] = useState('60')

  const { buckets, minutesToDie, minutesToTest } = useMemo(() => {
    const b = parseInt(bucketsInput.trim())
    const d = parseInt(minutesToDieInput.trim())
    const t = parseInt(minutesToTestInput.trim())

    return {
      buckets: isNaN(b) || b <= 0 ? 1 : b,
      minutesToDie: isNaN(d) || d <= 0 ? 1 : d,
      minutesToTest: isNaN(t) || t <= 0 ? 1 : t,
    }
  }, [bucketsInput, minutesToDieInput, minutesToTestInput])

  const steps = useMemo(
    () => generateSteps(buckets, minutesToDie, minutesToTest).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [buckets, minutesToDie, minutesToTest],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setBucketsInput(String(ex.buckets))
    setMinutesToDieInput(String(ex.minutesToDie))
    setMinutesToTestInput(String(ex.minutesToTest))
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          step={step}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          bucketsInput={bucketsInput}
          minutesToDieInput={minutesToDieInput}
          minutesToTestInput={minutesToTestInput}
          setBucketsInput={setBucketsInput}
          setMinutesToDieInput={setMinutesToDieInput}
          setMinutesToTestInput={setMinutesToTestInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    bucketsInput,
    minutesToDieInput,
    minutesToTestInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
