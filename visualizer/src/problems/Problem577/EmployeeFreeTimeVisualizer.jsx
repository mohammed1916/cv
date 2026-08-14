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
import './EmployeeFreeTimeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def employeeFreeTime(self, schedules):' },
  { line: 3, text: '        # Flatten all intervals' },
  { line: 4, text: '        all_intervals = []' },
  { line: 5, text: '        for schedule in schedules:' },
  { line: 6, text: '            all_intervals.extend(schedule)' },
  { line: 7, text: '        ' },
  { line: 8, text: '        # Sort by start time' },
  { line: 9, text: '        all_intervals.sort()' },
  { line: 10, text: '        ' },
  { line: 11, text: '        # Merge overlapping intervals' },
  { line: 12, text: '        merged = []' },
  { line: 13, text: '        for start, end in all_intervals:' },
  { line: 14, text: '            if merged and start <= merged[-1][1]:' },
  { line: 15, text: '                merged[-1][1] = max(merged[-1][1], end)' },
  { line: 16, text: '            else:' },
  { line: 17, text: '                merged.append([start, end])' },
  { line: 18, text: '        ' },
  { line: 19, text: '        # Find free time gaps' },
  { line: 20, text: '        free_time = []' },
  { line: 21, text: '        for i in range(len(merged) - 1):' },
  { line: 22, text: '            free_time.append([merged[i][1], merged[i+1][0]])' },
  { line: 23, text: '        return free_time' },
]

const PATTERNS = ['flatten', 'sort', 'merge', 'overlap_check', 'merge_update', 'find_gaps', 'done']
const LINE_PATTERN_MAP = {
  4: 'flatten',
  5: 'flatten',
  9: 'sort',
  12: 'merge',
  14: 'overlap_check',
  15: 'merge_update',
  20: 'find_gaps',
  23: 'done',
}

const COLORS = ['#38bdf8', '#ec4899', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4', '#f87171']

function generateSteps(schedules) {
  const steps = []

  // Validate input
  if (!Array.isArray(schedules) || schedules.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 23,
      relatedLines: [23],
      message: 'Empty input',
      allIntervals: [],
      merged: [],
      freeTime: [],
      done: true,
    })
    return steps
  }

  // Step 1: Initialize
  steps.push({
    phase: 'flatten',
    activeLine: 4,
    relatedLines: [3, 4, 5, 6],
    message: 'Flattening all employee schedules...',
    allIntervals: [],
    merged: [],
    freeTime: [],
  })

  // Step 2: Flatten all intervals
  const allIntervals = []
  for (const schedule of schedules) {
    for (const interval of schedule) {
      allIntervals.push([...interval])
      steps.push({
        phase: 'flatten',
        activeLine: 6,
        relatedLines: [5, 6],
        message: `Added interval [${interval[0]}, ${interval[1]}]`,
        allIntervals: JSON.parse(JSON.stringify(allIntervals)),
        merged: [],
        freeTime: [],
        currentInterval: interval,
      })
    }
  }

  // Step 3: Sort
  steps.push({
    phase: 'sort',
    activeLine: 9,
    relatedLines: [8, 9],
    message: 'Sorting intervals by start time...',
    allIntervals: JSON.parse(JSON.stringify(allIntervals)),
    merged: [],
    freeTime: [],
  })

  allIntervals.sort((a, b) => a[0] - b[0])

  steps.push({
    phase: 'sort',
    activeLine: 9,
    relatedLines: [8, 9],
    message: `Sorted: ${allIntervals.map(i => `[${i[0]},${i[1]}]`).join(' ')}`,
    allIntervals: JSON.parse(JSON.stringify(allIntervals)),
    merged: [],
    freeTime: [],
  })

  // Step 4: Merge overlapping intervals
  steps.push({
    phase: 'merge',
    activeLine: 12,
    relatedLines: [11, 12],
    message: 'Merging overlapping intervals...',
    allIntervals: JSON.parse(JSON.stringify(allIntervals)),
    merged: [],
    freeTime: [],
  })

  const merged = []

  for (let i = 0; i < allIntervals.length; i++) {
    const [start, end] = allIntervals[i]

    steps.push({
      phase: 'overlap_check',
      activeLine: 14,
      relatedLines: [13, 14],
      message: `Checking [${start}, ${end}]...`,
      allIntervals: JSON.parse(JSON.stringify(allIntervals)),
      merged: JSON.parse(JSON.stringify(merged)),
      freeTime: [],
      currentIndex: i,
    })

    if (merged.length > 0 && start <= merged[merged.length - 1][1]) {
      const oldEnd = merged[merged.length - 1][1]
      const newEnd = Math.max(oldEnd, end)

      steps.push({
        phase: 'overlap_check',
        activeLine: 14,
        relatedLines: [14],
        message: `✓ Overlaps with [${merged[merged.length - 1][0]}, ${oldEnd}]`,
        allIntervals: JSON.parse(JSON.stringify(allIntervals)),
        merged: JSON.parse(JSON.stringify(merged)),
        freeTime: [],
        currentIndex: i,
        overlaps: true,
      })

      steps.push({
        phase: 'merge_update',
        activeLine: 15,
        relatedLines: [15],
        message: `Merging: [${merged[merged.length - 1][0]}, ${oldEnd}] → [${merged[merged.length - 1][0]}, ${newEnd}]`,
        allIntervals: JSON.parse(JSON.stringify(allIntervals)),
        merged: JSON.parse(JSON.stringify(merged)),
        freeTime: [],
        currentIndex: i,
        mergeInfo: { oldEnd, newEnd },
      })

      merged[merged.length - 1][1] = newEnd
    } else {
      steps.push({
        phase: 'merge',
        activeLine: 17,
        relatedLines: [16, 17],
        message: `✗ No overlap, adding [${start}, ${end}] to merged list`,
        allIntervals: JSON.parse(JSON.stringify(allIntervals)),
        merged: JSON.parse(JSON.stringify(merged)),
        freeTime: [],
        currentIndex: i,
        overlaps: false,
      })

      merged.push([start, end])
    }

    steps.push({
      phase: 'merge',
      activeLine: 13,
      relatedLines: [12, 13],
      message: `Merged intervals: ${merged.map(m => `[${m[0]},${m[1]}]`).join(' ')}`,
      allIntervals: JSON.parse(JSON.stringify(allIntervals)),
      merged: JSON.parse(JSON.stringify(merged)),
      freeTime: [],
      currentIndex: i,
    })
  }

  // Step 5: Find free time gaps
  steps.push({
    phase: 'find_gaps',
    activeLine: 20,
    relatedLines: [19, 20],
    message: 'Finding free time gaps between merged intervals...',
    allIntervals: JSON.parse(JSON.stringify(allIntervals)),
    merged: JSON.parse(JSON.stringify(merged)),
    freeTime: [],
  })

  const freeTime = []

  for (let i = 0; i < merged.length - 1; i++) {
    const gap = [merged[i][1], merged[i + 1][0]]

    steps.push({
      phase: 'find_gaps',
      activeLine: 22,
      relatedLines: [21, 22],
      message: `Gap found: [${gap[0]}, ${gap[1]}] between [${merged[i][0]}, ${merged[i][1]}] and [${merged[i + 1][0]}, ${merged[i + 1][1]}]`,
      allIntervals: JSON.parse(JSON.stringify(allIntervals)),
      merged: JSON.parse(JSON.stringify(merged)),
      freeTime: [...freeTime],
      currentGapIndex: i,
    })

    freeTime.push(gap)
  }

  // Final step
  steps.push({
    phase: 'done',
    activeLine: 23,
    relatedLines: [23],
    message: `Done! Found ${freeTime.length} free time slot(s)`,
    allIntervals: JSON.parse(JSON.stringify(allIntervals)),
    merged: JSON.parse(JSON.stringify(merged)),
    freeTime: JSON.parse(JSON.stringify(freeTime)),
    done: true,
  })

  return steps
}

function TimelineBar({ intervals, merged = false, step = null }) {
  if (!intervals || intervals.length === 0) return null

  const allValues = intervals.flat()
  const minTime = Math.min(...allValues)
  const maxTime = Math.max(...allValues)
  const range = maxTime - minTime || 1

  const getPosition = (value) => ((value - minTime) / range) * 100
  const getWidth = (start, end) => ((end - start) / range) * 100

  return (
    <div className="timeline-container">
      <div className="timeline-scale">
        {[0, 1, 2, 3, 4].map((i) => {
          const time = minTime + (i * range) / 4
          return (
            <div key={i} className="timeline-scale-item">
              {Math.round(time)}
            </div>
          )
        })}
      </div>

      <div className="intervals-bar">
        <AnimatePresence mode="popLayout">
          {intervals.map((interval, idx) => (
            <motion.div
              key={`interval-${idx}-${interval[0]}-${interval[1]}`}
              className="interval-block"
              style={{
                left: `${getPosition(interval[0])}%`,
                width: `${getWidth(interval[0], interval[1])}%`,
                backgroundColor: merged ? '#38bdf8' : COLORS[idx % COLORS.length],
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {interval[0]}-{interval[1]}
            </motion.div>
          ))}
        </AnimatePresence>

        {step?.currentGapIndex !== undefined && step.freeTime.length > 0 && (
          <motion.div
            className="free-time-gap"
            style={{
              left: `${getPosition(step.freeTime[step.currentGapIndex][0])}%`,
              width: `${getWidth(step.freeTime[step.currentGapIndex][0], step.freeTime[step.currentGapIndex][1])}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyExample, examples }) {
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

      {step?.currentInterval && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #a78bfa',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Current Interval</div>
          <div
            style={{
              fontSize: 13,
              color: '#e2e8f0',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            [{step.currentInterval[0]}, {step.currentInterval[1]}]
          </div>
        </motion.div>
      )}

      {step?.allIntervals && step.allIntervals.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>All Intervals</div>
          <TimelineBar intervals={step.allIntervals} />
        </div>
      )}

      {step?.merged && step.merged.length > 0 && (
        <div className="merged-section">
          <div className="merged-label">✓ Merged Intervals</div>
          <TimelineBar intervals={step.merged} merged={true} />
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
            {step.merged.map((i) => `[${i[0]}, ${i[1]}]`).join(' → ')}
          </div>
        </div>
      )}

      {step?.freeTime && step.freeTime.length > 0 && (
        <div className="free-time-section">
          <div className="free-time-label">★ Free Time Slots</div>
          <div className="free-time-list">
            <AnimatePresence mode="popLayout">
              {step.freeTime.map((slot, idx) => (
                <motion.div
                  key={`free-${idx}-${slot[0]}-${slot[1]}`}
                  className="free-time-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  [{slot[0]}, {slot[1]}]
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.message && (
        <div className="step-info">
          <div className="step-message">{step.message}</div>
        </div>
      )}
    </div>
  )
}

export default function EmployeeFreeTimeVisualizer() {
  const examples = useMemo(() => getExamplesOr('employee-free-time', []), [])
  const [schedulesInput, setSchedulesInput] = useState('[[[1,2],[5,6]],[[1,3]],[[4,6]]]')

  const { schedules, inputError } = useMemo(() => {
    try {
      const s = JSON.parse(schedulesInput)
      if (!Array.isArray(s) || !s.every(sched => Array.isArray(sched))) throw new Error('Invalid format')
      return { schedules: s, inputError: '' }
    } catch (e) {
      return { schedules: [], inputError: e.message }
    }
  }, [schedulesInput])

  const steps = useMemo(() => generateSteps(schedules), [schedules])

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
      setSchedulesInput(JSON.stringify(ex.schedules || ex))
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
        title: '⏰ Employee Schedules',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Employee Schedules</div>
              <textarea
                value={schedulesInput}
                onChange={(e) => {
                  setSchedulesInput(e.target.value)
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
                placeholder='[[[1,2],[5,6]],[[1,3]],[[4,6]]]'
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel schedules={schedules} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, schedulesInput, schedules, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"schedules","label":"schedules","type":"array"}]}
        values={{ schedules: schedulesInput }}
        onChange={(k, v) => { if (k === 'schedules') setSchedulesInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
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
