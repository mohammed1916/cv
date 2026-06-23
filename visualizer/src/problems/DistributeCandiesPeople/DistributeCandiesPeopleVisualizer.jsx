import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './DistributeCandiesPeopleVisualizer.css'

const EXAMPLES = getExamples('distribute-candies-to-people')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def distributeCandies(n, k):' },
  { line: 2, text: '    result = [0] * k' },
  { line: 3, text: '    candies_left = n' },
  { line: 4, text: '    give = 1' },
  { line: 5, text: '    person = 0' },
  { line: 6, text: '    while candies_left > 0:' },
  { line: 7, text: '        amount = min(give, candies_left)' },
  { line: 8, text: '        result[person % k] += amount' },
  { line: 9, text: '        candies_left -= amount' },
  { line: 10, text: '        person += 1' },
  { line: 11, text: '        give += 1' },
  { line: 12, text: '    return result' },
]

function generateSteps(n, k) {
  const steps = []
  const people = k
  const result = new Array(people).fill(0)

  steps.push({
    activeLine: 1,
    result: [...result],
    candies: n,
    current: 0,
    give: 1,
    message: 'Initialize: distribute candies to people in rounds'
  })

  let candies = n
  let current = 0
  let give = 1

  while (candies > 0) {
    const amount = Math.min(give, candies)
    result[current] += amount
    candies -= amount

    steps.push({
      activeLine: 2,
      result: [...result],
      candies,
      current,
      give,
      message: `Give ${amount} candies to person ${current}. ${candies} candies left.`
    })

    current = (current + 1) % people
    if (current === 0) {
      give += 1
      steps.push({
        activeLine: 3,
        result: [...result],
        candies,
        current,
        give,
        message: `Completed round. Next round will give ${give} candies.`
      })
    }
  }

  steps.push({
    activeLine: 4,
    result: [...result],
    candies: 0,
    current,
    give,
    done: true,
    message: `Distribution complete! Final result: ${JSON.stringify(result)}`
  })

  return steps
}

function VisualizationPanel({ n, k, step, applyEx }) {
  const EXAMPLES_LIST = [
    { label: 'n=10, k=3', n: 10, k: 3 },
    { label: 'n=100, k=2', n: 100, k: 2 },
    { label: 'n=7, k=4', n: 7, k: 4 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#9f1239', fontStyle: 'italic' }}>
          "You have {n} candies and {k} people. Distribute candies giving 1 candy to person 0, 2 to person 1, ..., then 2 to person 0 again, 3 to person 1, etc. Stop when you run out."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES_LIST.map(e => (
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

      {/* People Distribution */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          People Candies Distribution (Total: {n} candies)
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(step?.result || new Array(k).fill(0)).map((candies, idx) => (
            <motion.div
              key={`person-${idx}`}
              style={{
                padding: '16px 12px',
                borderRadius: 6,
                border: '2px solid',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: step && idx === step.current && !step.done ? '#fee2e2' : '#f1f5f9',
                borderColor: step && idx === step.current && !step.done ? '#dc2626' : '#cbd5e1',
                color: step && idx === step.current && !step.done ? '#991b1b' : '#334155',
                minWidth: 80
              }}
              animate={{ scale: step && idx === step.current && !step.done ? 1.1 : 1 }}
            >
              <div style={{ fontSize: 11, color: '#6b7280' }}>Person {idx}</div>
              <div style={{ fontSize: 20, marginTop: 4 }}>🍬 {candies}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Distribution Info */}
      <div style={{
        padding: 16,
        backgroundColor: '#f3e8ff',
        borderRadius: 6,
        border: '2px solid #a78bfa'
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Distribution Status</div>
        <div style={{ fontSize: 12, color: '#6b21b6', lineHeight: 1.6 }}>
          <div>Candies remaining: <strong>{step?.candies ?? n}</strong></div>
          <div>Current person: <strong>Person {step?.current ?? 0}</strong></div>
          <div>About to give: <strong>{step?.give ?? 1} candies</strong></div>
        </div>
      </div>

      {/* Message */}
      {step && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '1px solid #10b981',
            fontSize: 12,
            color: '#065f46'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function DistributeCandiesPeopleVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0] || { n: 10, k: 3 })
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () =>
      generateSteps(input.n, input.k).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setInput(e); handleReset(); }, [handleReset])

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
      title: '🍬 Distribution',
      content: (
        <VisualizationPanel
          n={input.n}
          k={input.k}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, input, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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
