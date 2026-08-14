import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MinimumTimeDifferenceVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findMinDifference(self, timePoints: List[str]) -> int:' },
  { line: 3, text: '        minutes = sorted([int(h)*60+int(m) for h,m in (t.split(":") for t in timePoints)])' },
  { line: 4, text: '        min_diff = float("inf")' },
  { line: 5, text: '        ' },
  { line: 6, text: '        for i in range(len(minutes)-1):' },
  { line: 7, text: '            min_diff = min(min_diff, minutes[i+1]-minutes[i])' },
  { line: 8, text: '        ' },
  { line: 9, text: '        min_diff = min(min_diff, 1440-minutes[-1]+minutes[0])' },
  { line: 10, text: '        return min_diff' },
]

const PATTERNS = ['init', 'convert', 'sort', 'compare', 'wrap', 'done']
const LINE_PATTERN_MAP = {
  3: 'convert',
  4: 'init',
  6: 'compare',
  9: 'wrap',
  10: 'done',
}

function generateSteps(timePoints) {
  const steps = []

  if (!timePoints || timePoints.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 10,
      relatedLines: [10],
      message: 'Empty input.',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 2,
    relatedLines: [2],
    message: 'Find minimum time difference in 24-hour circular format.',
  })

  const minutes = timePoints
    .map((t) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    })
    .sort((a, b) => a - b)

  steps.push({
    phase: 'convert',
    activeLine: 3,
    relatedLines: [3],
    message: `Convert to minutes and sort: ${minutes.join(', ')}`,
    minutes,
  })

  let minDiff = Infinity

  for (let i = 0; i < minutes.length - 1; i++) {
    const diff = minutes[i + 1] - minutes[i]

    steps.push({
      phase: 'compare',
      activeLine: 7,
      relatedLines: [6, 7],
      message: `Compare: ${minutes[i + 1]} - ${minutes[i]} = ${diff}`,
      minutes,
      currentIdx: i,
      currentDiff: diff,
      minDiff,
    })

    if (diff < minDiff) {
      minDiff = diff
      steps.push({
        phase: 'compare',
        activeLine: 7,
        relatedLines: [7],
        message: `Update min_diff = ${minDiff}`,
        minutes,
        currentIdx: i,
        currentDiff: diff,
        minDiff,
      })
    }
  }

  const wrapDiff = 1440 - minutes[minutes.length - 1] + minutes[0]

  steps.push({
    phase: 'wrap',
    activeLine: 9,
    relatedLines: [9],
    message: `Wrap-around: 1440 - ${minutes[minutes.length - 1]} + ${minutes[0]} = ${wrapDiff}`,
    minutes,
    wrapDiff,
    minDiff,
  })

  minDiff = Math.min(minDiff, wrapDiff)

  steps.push({
    phase: 'done',
    activeLine: 10,
    relatedLines: [10],
    message: `Minimum time difference: ${minDiff} minutes`,
    minutes,
    result: minDiff,
    done: true,
  })

  return steps
}

function VisualizationPanel({ timePoints, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Input Times</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <AnimatePresence mode="popLayout">
            {timePoints.map((t, idx) => (
              <motion.div
                key={`time-${idx}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                {t}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {step?.minutes && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Sorted Minutes</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <AnimatePresence mode="popLayout">
              {step.minutes.map((min, idx) => {
                const isCurrent = step.currentIdx === idx || step.currentIdx === idx - 1
                return (
                  <motion.div
                    key={`min-${idx}`}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: isCurrent ? '#38bdf8' : '#334155',
                      borderColor: isCurrent ? '#0ea5e9' : '#64748b',
                      color: '#e2e8f0',
                    }}
                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                  >
                    {min}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.currentDiff !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Current Comparison</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
            Difference: {step.currentDiff} min
          </div>
        </div>
      )}

      {step?.wrapDiff !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Wrap-Around</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
            1440 - {step.minutes[step.minutes.length - 1]} + {step.minutes[0]} = {step.wrapDiff} min
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Minimum Difference</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>{step.result} min</div>
        </motion.div>
      )}
    </div>
  )
}

export default function MinimumTimeDifferenceVisualizer() {
  const examples = useMemo(() => getExamplesOr('minimum-time-difference', []), [])
  const [timesInput, setTimesInput] = useState('["23:59","00:00"]')

  const { times, inputError } = useMemo(() => {
    try {
      const t = JSON.parse(timesInput)
      if (!Array.isArray(t)) throw new Error('Input must be array')
      return { times: t, inputError: '' }
    } catch (e) {
      return { times: [], inputError: e.message }
    }
  }, [timesInput])

  const steps = useMemo(() => generateSteps(times), [times])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setTimesInput(JSON.stringify(ex.timePoints || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
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
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
      {
        id: 'viz',
        title: '⏱ Minimum Time Difference',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input Times</div>
              <textarea
                value={timesInput}
                onChange={(e) => {
                  setTimesInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder='["23:59","00:00"]'
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel times={times} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, timesInput, times, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"times","label":"times","type":"array"}]}
        values={{ times: timesInput }}
        onChange={(k, v) => { if (k === 'times') setTimesInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
        />
      </FloatingPanel>
    </div>
  )
}
