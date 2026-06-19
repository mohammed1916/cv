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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem507Visualizer.css'

const EXAMPLES = getExamples('perfect-number') || [
  { label: 'Example 1: Perfect', num: 28 },
  { label: 'Example 2: Not Perfect', num: 1 },
]

function generateSteps(num) {
  const steps = []
  const divisors = []

  steps.push({
    activeLine: 1,
    num,
    divisors: [],
    sum: 0,
    message: `Check if ${num} is a perfect number`,
    phase: 'Initialize'
  })

  if (num <= 1) {
    steps.push({
      activeLine: 2,
      num,
      divisors,
      sum: 0,
      done: true,
      isPerfect: false,
      message: `${num} is not a perfect number (must be > 1)`,
      phase: 'Check'
    })
    return steps
  }

  // Find proper divisors
  steps.push({
    activeLine: 3,
    num,
    divisors: [],
    sum: 0,
    message: 'Find all proper divisors (excluding the number itself)',
    phase: 'Finding Divisors'
  })

  for (let i = 1; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      divisors.push(i)
      if (i !== num / i && num / i !== num) {
        divisors.push(num / i)
      }
      steps.push({
        activeLine: 4,
        num,
        divisors: [...divisors.sort((a, b) => a - b)],
        sum: 0,
        currentDivisor: i,
        message: `Found divisor: ${i}${num / i !== i && num / i !== num ? ` and ${num / i}` : ''}`,
        phase: 'Finding Divisors'
      })
    }
  }

  // Filter to proper divisors only
  const properDivisors = divisors.filter(d => d !== num).sort((a, b) => a - b)
  const sum = properDivisors.reduce((a, b) => a + b, 0)

  steps.push({
    activeLine: 5,
    num,
    divisors: properDivisors,
    sum,
    message: `Sum of proper divisors: ${properDivisors.join(' + ')} = ${sum}`,
    phase: 'Calculate Sum'
  })

  const isPerfect = sum === num

  steps.push({
    activeLine: 6,
    num,
    divisors: properDivisors,
    sum,
    isPerfect,
    done: true,
    message: isPerfect ? `${num} is a perfect number! ${sum} = ${num}` : `${num} is not perfect. ${sum} ≠ ${num}`,
    phase: 'Result'
  })

  return steps
}

function VisualizationPanel({ num, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, borderLeft: '4px solid #a855f7' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>A perfect number equals the sum of its proper divisors (excluding itself).</div>
      </div>

      <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>Input Number</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#a855f7', textAlign: 'center' }}>{num}</div>
      </motion.div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#f3e8ff', borderRadius: 4, border: '1px solid #d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      {step?.divisors && step.divisors.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, border: '1px solid #a5b4fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>Proper Divisors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.divisors.map((d, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: step.currentDivisor === d ? '#818cf8' : '#e0e7ff',
                  borderRadius: 4,
                  border: step.currentDivisor === d ? '2px solid #4f46e5' : '1px solid #a5b4fc',
                  fontSize: 12,
                  fontWeight: 600,
                  color: step.currentDivisor === d ? 'white' : '#3730a3'
                }}
                animate={{ backgroundColor: step.currentDivisor === d ? '#818cf8' : '#e0e7ff' }}
              >
                {d}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.sum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Sum Calculation</div>
          <div style={{ fontSize: 11, color: '#0369a1', marginBottom: 8, fontFamily: 'monospace' }}>
            {step.divisors?.join(' + ') || '0'} = {step.sum}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0369a1' }}>
            {step.sum} {step.sum === num ? '=' : '≠'} {num}
          </div>
        </motion.div>
      )}

      {step?.isPerfect !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.isPerfect ? '#d1fae5' : '#fee2e2',
            borderRadius: 6,
            border: step.isPerfect ? '2px solid #10b981' : '2px solid #ef4444'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: step.isPerfect ? '#065f46' : '#7f1d1d', textAlign: 'center' }}>
            {step.isPerfect ? '✓ Perfect Number' : '✗ Not Perfect'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem507Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('perfect-number')
  const steps = useMemo(() => generateSteps(ex.num).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔢 Perfect Number', content: (<VisualizationPanel num={ex.num} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
