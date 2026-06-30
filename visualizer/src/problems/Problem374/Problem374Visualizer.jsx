import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem374Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['adjust_left', 'adjust_right', 'calc_guess', 'call_guess', 'check_condition', 'done', 'equal', 'higher', 'init', 'lower']

const EXAMPLES = getExamples('guess-number-higher-or-lower')

function generateSteps(n, pick) {
  const steps = []

  let left = 1
  let right = n

  steps.push({
    activeLine: 1,
    left,
    right,
    guess: null,
    response: null,
    message: `Initialize: left=1, right=${n} (search space: [1, ${n}])`,
    phase: 'init'
  })

  while (left <= right) {
    steps.push({
      activeLine: 3,
      left,
      right,
      guess: null,
      response: null,
      message: `Check loop condition: left (${left}) <= right (${right})? Yes, continue.`,
      phase: 'check_condition'
    })

    const guess = Math.floor(left + (right - left) / 2)

    steps.push({
      activeLine: 4,
      left,
      right,
      guess,
      response: null,
      message: `Calculate guess: mid = ${left} + (${right} - ${left}) / 2 = ${guess}`,
      phase: 'calc_guess'
    })

    steps.push({
      activeLine: 5,
      left,
      right,
      guess,
      response: null,
      message: `Call guess(${guess}). Oracle checks: is ${guess} the target (${pick})?`,
      phase: 'call_guess'
    })

    let response
    if (guess === pick) {
      response = 0
      steps.push({
        activeLine: 6,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: EQUAL (${guess} == ${pick}). Found the number!`,
        phase: 'equal',
        found: true
      })
      return steps
    } else if (guess < pick) {
      response = 1
      steps.push({
        activeLine: 8,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: HIGHER (target ${pick} > guess ${guess})`,
        phase: 'higher'
      })

      steps.push({
        activeLine: 9,
        left: guess + 1,
        right,
        guess,
        response,
        message: `Adjust left = ${guess} + 1 = ${guess + 1}. Search upper half.`,
        phase: 'adjust_left'
      })
      left = guess + 1
    } else {
      response = -1
      steps.push({
        activeLine: 11,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: LOWER (target ${pick} < guess ${guess})`,
        phase: 'lower'
      })

      steps.push({
        activeLine: 12,
        left,
        right: guess - 1,
        guess,
        response,
        message: `Adjust right = ${guess} - 1 = ${guess - 1}. Search lower half.`,
        phase: 'adjust_right'
      })
      right = guess - 1
    }
  }

  steps.push({
    activeLine: 14,
    left,
    right,
    guess: null,
    response: null,
    message: `Loop ends: left (${left}) > right (${right}). Number not found (invalid input).`,
    phase: 'done',
    found: false
  })

  return steps
}

function GuessVisualization({ n, pick, step }) {
  const searchSpaceSize = step ? Math.max(0, step.right - step.left + 1) : n
  const isGuessed = step?.guess !== null && step?.guess !== undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Range display */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Search Space
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#dbeafe',
              borderRadius: 6,
              border: '2px solid #0284c7',
              textAlign: 'center'
            }}
            animate={{
              backgroundColor: step?.response === 1 ? '#bbf7d0' : '#dbeafe',
              borderColor: step?.response === 1 ? '#059669' : '#0284c7'
            }}
          >
            <div style={{ fontSize: 11, color: '#1e40af', marginBottom: 4 }}>Left</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0c4a6e' }}>
              {step?.left ?? 1}
            </div>
          </motion.div>

          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#fcd34d',
              borderRadius: 6,
              border: '2px solid #ca8a04',
              textAlign: 'center'
            }}
            animate={{
              scale: isGuessed ? 1.05 : 1,
              boxShadow: isGuessed ? '0 0 20px rgba(202, 138, 4, 0.5)' : '0 0 0px rgba(0,0,0,0)'
            }}
          >
            <div style={{ fontSize: 11, color: '#92400e', marginBottom: 4 }}>Guess</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#78350f' }}>
              {step?.guess ?? '—'}
            </div>
          </motion.div>

          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#fecaca',
              borderRadius: 6,
              border: '2px solid #dc2626',
              textAlign: 'center'
            }}
            animate={{
              backgroundColor: step?.response === -1 ? '#bbf7d0' : '#fecaca',
              borderColor: step?.response === -1 ? '#059669' : '#dc2626'
            }}
          >
            <div style={{ fontSize: 11, color: '#991b1b', marginBottom: 4 }}>Right</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#7f1d1d' }}>
              {step?.right ?? n}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Number range visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Number Range [1, {n}]
        </div>
        <div style={{
          padding: 16,
          backgroundColor: '#f8fafc',
          borderRadius: 6,
          border: '1px solid #cbd5e1'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>1</div>
            <div style={{
              flex: 1,
              height: 8,
              backgroundColor: '#e2e8f0',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {step && step.left <= step.right && (
                <motion.div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    backgroundColor: '#0284c7',
                    left: `${((step.left - 1) / (n - 1)) * 100}%`,
                    right: `${(100 - (step.right / n) * 100)}%`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {step?.guess && (
                <motion.div
                  style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    backgroundColor: '#fbbf24',
                    borderRadius: '50%',
                    top: '50%',
                    left: `${((step.guess - 1) / (n - 1)) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid #d97706'
                  }}
                  animate={{
                    scale: step?.phase === 'equal' ? 1.5 : 1,
                    boxShadow: step?.phase === 'equal'
                      ? '0 0 20px rgba(217, 119, 6, 0.8)'
                      : '0 0 0px rgba(0,0,0,0)'
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{n}</div>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            {step?.left && step?.right
              ? `Search space: ${searchSpaceSize} numbers [${step.left}, ${step.right}]`
              : `Full range: ${n} numbers [1, ${n}]`
            }
          </div>
        </div>
      </div>

      {/* Oracle response */}
      {step?.response !== null && step?.response !== undefined && (
        <motion.div
          style={{
            padding: 12,
            borderRadius: 6,
            border: '2px solid',
            backgroundColor: step.response === 0 ? '#dcfce7' : step.response === 1 ? '#dbeafe' : '#fee2e2',
            borderColor: step.response === 0 ? '#22c55e' : step.response === 1 ? '#0284c7' : '#ef4444'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
            Oracle Response
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: step.response === 0 ? '#166534' : step.response === 1 ? '#0c4a6e' : '#991b1b'
          }}>
            {step.response === 0 && '✓ EQUAL — Found!'}
            {step.response === 1 && '↑ HIGHER — Guess is too low'}
            {step.response === -1 && '↓ LOWER — Guess is too high'}
          </div>
        </motion.div>
      )}

      {/* Success indicator */}
      {step?.found === true && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dcfce7',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        >
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#166534' }}>
            🎉 Number Found: {pick}
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#e0e7ff', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#3730a3' }}>Target</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#4f46e5' }}>{pick}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Space Size</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#b45309' }}>{searchSpaceSize}</div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ n, pick, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
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
                backgroundColor: '#f1f5f9',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(ev) => ev.target.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(ev) => ev.target.style.backgroundColor = '#f1f5f9'}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <GuessVisualization n={n} pick={pick} step={step} />
    </div>
  )
}

export default function Problem374Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 10, pick: 6 })

  const steps = useMemo(
    () =>
      generateSteps(ex.n, ex.pick).map((current) => ({
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
      title: '🎯 Binary Search Guessing',
      content: (
        <VisualizationPanel
          n={ex.n}
          pick={ex.pick}
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
