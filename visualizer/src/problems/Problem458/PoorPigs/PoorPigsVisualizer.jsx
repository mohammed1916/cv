import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './PoorPigsVisualizer.css'

const EXAMPLES = getExamples('poor-pigs')

function generateSteps(numBuckets, minutesToDie, minutesToTest) {
  const steps = []
  const states = minutesToTest / minutesToDie + 1

  steps.push({
    activeLine: 1,
    numBuckets,
    minutesToDie,
    minutesToTest,
    states,
    pigs: 0,
    calculation: `states per pig: ${minutesToTest} / ${minutesToDie} + 1 = ${states}`,
    message: 'Calculate: How many states can each pig represent?'
  })

  let pigs = 0
  let capacity = 1

  steps.push({
    activeLine: 2,
    numBuckets,
    minutesToDie,
    minutesToTest,
    states,
    pigs: pigs,
    capacity,
    calculation: `1 pig can distinguish ${states} outcomes`,
    message: `With 1 test interval, 1 pig can identify which of ${states} outcomes occurred`
  })

  while (capacity < numBuckets) {
    pigs++
    capacity *= states

    steps.push({
      activeLine: 3,
      numBuckets,
      minutesToDie,
      minutesToTest,
      states,
      pigs,
      capacity,
      calculation: `${pigs} pigs * ${states} states = ${capacity} buckets`,
      message: `${pigs} pig(s) can distinguish between ${capacity} buckets`
    })
  }

  steps.push({
    activeLine: 4,
    numBuckets,
    minutesToDie,
    minutesToTest,
    states,
    pigs,
    capacity,
    calculation: `${pigs} pigs needed`,
    done: true,
    message: `Answer: ${pigs} pigs can distinguish ${numBuckets} buckets in ${minutesToTest} minutes`
  })

  return steps
}

function VisualizationPanel({ numBuckets, minutesToDie, minutesToTest, step, applyEx }) {
  const states = minutesToTest / minutesToDie + 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#9d174d', fontStyle: 'italic' }}>
          "Poor pigs! They must drink from toxic buckets to identify which one is poisoned. With n buckets, m minutes to die, and t minutes to test, how many pigs do you need? Each pig's behavior (sick or not) encodes information!"
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

      {/* Problem Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fce7f3',
            borderRadius: 6,
            border: '2px solid #ec4899',
            textAlign: 'center'
          }}
          animate={{ scale: step?.activeLine === 1 ? 1.05 : 1 }}
        >
          <div style={{ fontSize: 11, color: '#9d174d', fontWeight: 600 }}>Buckets</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ec4899', marginTop: 4 }}>
            {numBuckets}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7',
            textAlign: 'center'
          }}
          animate={{ scale: step?.activeLine === 1 ? 1.05 : 1 }}
        >
          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>Dies in (min)</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0284c7', marginTop: 4 }}>
            {minutesToDie}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dcfce7',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center'
          }}
          animate={{ scale: step?.activeLine === 1 ? 1.05 : 1 }}
        >
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>Test Time (min)</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#22c55e', marginTop: 4 }}>
            {minutesToTest}
          </div>
        </motion.div>
      </div>

      {/* States per Pig */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 12 }}>
          Key Insight: States Per Pig
        </div>
        <div style={{ fontSize: 12, color: '#5b21b6', marginBottom: 8, fontFamily: 'monospace' }}>
          {minutesToTest} ÷ {minutesToDie} + 1 = {states} states
        </div>
        <div style={{ fontSize: 12, color: '#6b21a8' }}>
          Each pig can be in {states} different states (healthy at different times or dead), allowing us to encode {states} outcomes.
        </div>
      </motion.div>

      {/* Pig Capacity */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Building Pig Population
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(pigCount => {
            const capacity = Math.pow(states, pigCount)
            const isCurrent = step && step.pigs === pigCount
            const isActive = capacity <= numBuckets

            return (
              <motion.div
                key={pigCount}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: '2px solid',
                  backgroundColor: isCurrent ? '#ecfdf5' : isActive ? '#f0f9ff' : '#f5f5f5',
                  borderColor: isCurrent ? '#10b981' : isActive ? '#0284c7' : '#cbd5e1'
                }}
                animate={{ scale: isCurrent ? 1.05 : 1 }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: isCurrent ? '#065f46' : isActive ? '#0c4a6e' : '#666'
                }}>
                  <span>{pigCount} pig{pigCount > 1 ? 's' : ''} 🐷</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {pigCount}^{states} = {capacity} buckets
                  </span>
                </div>
                {isCurrent && (
                  <div style={{ fontSize: 11, color: '#10b981', marginTop: 8, fontWeight: 500 }}>
                    ✓ Minimum needed!
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Answer */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#dcfce7',
          borderRadius: 6,
          border: '2px solid #22c55e',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>Answer</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>
          {step?.pigs || 0} 🐷
        </div>
        <div style={{ fontSize: 12, color: '#15803d', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function PoorPigsVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { buckets: 1000, minutesToDie: 15, minutesToTest: 60 })

  const steps = useMemo(
    () =>
      generateSteps(ex.buckets, ex.minutesToDie, ex.minutesToTest).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🐷 Poor Pigs',
      content: (
        <VisualizationPanel
          numBuckets={ex.buckets}
          minutesToDie={ex.minutesToDie}
          minutesToTest={ex.minutesToTest}
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
