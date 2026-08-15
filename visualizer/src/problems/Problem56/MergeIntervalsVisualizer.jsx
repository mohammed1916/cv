import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MergeIntervalsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def merge(self, intervals: List[List[int]]) -> List[List[int]]:' },
  { line: 3, text: '        intervals.sort(key=lambda x: x[0])' },
  { line: 4, text: '        merged = []' },
  { line: 5, text: '        for interval in intervals:' },
  { line: 6, text: '            if not merged or merged[-1][1] < interval[0]:' },
  { line: 7, text: '                merged.append(interval)' },
  { line: 8, text: '            else:' },
  { line: 9, text: '                merged[-1][1] = max(merged[-1][1], interval[1])' },
  { line: 10, text: '        return merged' },
]

const MERGEINTERVALS_PATTERNS = ['append', 'check', 'done', 'eval', 'init', 'merge', 'sorted']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'sorted',
  5: 'eval',
  6: 'check',
  7: 'append',
  9: 'merge',
  10: 'done',
}

function generateSteps(originalIntervals) {
  const steps = []

  // Clone and sort
  const intervals = originalIntervals.map(a => [...a])

  steps.push({
    phase: 'init',
    intervals: originalIntervals,
    merged: [],
    currIdx: null,
    activeLine: 3,
    message: 'Sort intervals based on their start times.',
    isSorted: false
  })

  intervals.sort((a, b) => a[0] - b[0])

  steps.push({
    phase: 'sorted',
    intervals,
    merged: [],
    currIdx: null,
    activeLine: 4,
    message: 'Intervals sorted. Initialize empty merged list.',
    isSorted: true
  })

  const merged = []

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]

    steps.push({
      phase: 'eval',
      intervals,
      merged,
      currIdx: i,
      activeLine: 5,
      message: `Evaluating interval [${interval[0]}, ${interval[1]}].`,
      isSorted: true
    })

    steps.push({
      phase: 'check',
      intervals,
      merged,
      currIdx: i,
      activeLine: 6,
      message: merged.length === 0
        ? 'Merged list is empty.'
        : `Check if last merged end (${merged[merged.length - 1][1]}) < current start (${interval[0]}).`,
      isSorted: true
    })

    if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {
      merged.push([...interval])
      steps.push({
        phase: 'append',
        intervals,
        merged,
        currIdx: i,
        activeLine: 7,
        message: `No overlap. Append [${interval[0]}, ${interval[1]}] to merged list.`,
        isSorted: true
      })
    } else {
      const prevEnd = merged[merged.length - 1][1]
      const newEnd = Math.max(prevEnd, interval[1])
      merged[merged.length - 1][1] = newEnd

      steps.push({
        phase: 'merge',
        intervals,
        merged,
        currIdx: i,
        activeLine: 9,
        message: `Overlap detected! Update end of last merged interval to max(${prevEnd}, ${interval[1]}) = ${newEnd}.`,
        isSorted: true
      })
    }
  }

  steps.push({
    phase: 'done',
    intervals,
    merged,
    currIdx: null,
    activeLine: 10,
    message: 'All intervals processed. Return merged list.',
    isSorted: true
  })

  return steps
}

const EXAMPLES = getExamples('merge-intervals')

export default function MergeIntervalsVisualizer() {
  const [intervalsInput, setIntervalsInput] = useState('[[1,3],[2,6],[8,10],[15,18]]')

  const { originalIntervals, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(intervalsInput)
      if (!Array.isArray(parsed) || parsed.some(arr => !Array.isArray(arr) || arr.length !== 2 || typeof arr[0] !== 'number' || typeof arr[1] !== 'number')) {
        throw new Error('Must be an array of [start, end] pairs.')
      }
      if (parsed.some(arr => arr[0] > arr[1])) {
        throw new Error('Start time cannot be greater than end time.')
      }
      return { originalIntervals: parsed, inputError: '' }
    } catch (e) {
      return { originalIntervals: [[1, 3], [2, 6], [8, 10], [15, 18]], inputError: e.message || 'Invalid input format' }
    }
  }, [intervalsInput])

  const steps = useMemo(() => generateSteps(originalIntervals), [originalIntervals])

  const {
    stepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setIntervalsInput(JSON.stringify(ex.intervals))
    handleReset()
  }, [handleReset])

  const displayIntervals = step ? step.intervals : originalIntervals
  const displayMerged = step ? step.merged : []

  const { minVal, maxVal, range } = useMemo(() => {
    const minVal = Math.min(0, ...displayIntervals.map(i => i[0]))
    const maxVal = Math.max(10, ...displayIntervals.map(i => i[1]))
    const range = Math.max(maxVal - minVal, 1)
    return { minVal, maxVal, range }
  }, [displayIntervals])

  // Step 3: Extract panel consts
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"intervals","label":"intervals","type":"array"}]}
        values={{ intervals: intervalsInput }}
        onChange={(k, v) => { if (k === 'intervals') setIntervalsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <div className="mi-panel">
      <div className="mi-panel-head">
        Input Intervals
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="mi-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="mi-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <input
          value={intervalsInput}
          onChange={(e) => { setIntervalsInput(e.target.value);
handleReset() }}
          placeholder="[[1,3],[2,6],[8,10],[15,18]]"
          className="mi-input"
        />

        <div className="mi-canvas">
          <div className="mi-axis">
            {Array.from({ length: 11 }).map((_, i) => {
              const val = Math.round(minVal + (i / 10) * range)
              return (
                <div key={i} className="mi-axis-tick" style={{ left: `${((val - minVal) / range) * 100}%` }}>
                  <span className="mi-tick-label">{val}</span>
                </div>
              )
            })}
          </div>

          <div className="mi-intervals-list">
            <div className="mi-section-title">Intervals {step?.isSorted ? '(Sorted)' : '(Unsorted)'}</div>
            {displayIntervals.map((interval, i) => {
              const isActive = step?.currIdx === i
              const leftPct = ((interval[0] - minVal) / range) * 100
              const widthPct = ((interval[1] - interval[0]) / range) * 100

              return (
                <div key={`input-${i}`} className="mi-row">
                  <div className="mi-row-idx">[{i}]</div>
                  <div className="mi-track">
                    <motion.div
                      className={`mi-bar ${isActive ? 'active' : ''}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <span className="mi-bar-text">[{interval[0]}, {interval[1]}]</span>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mi-intervals-list merged-list">
            <div className="mi-section-title">Merged</div>
            {displayMerged.map((interval, i) => {
              const isLast = i === displayMerged.length - 1
              const isJustMerged = isLast && step?.phase === 'merge'
              const isJustAppended = isLast && step?.phase === 'append'
              const isActive = isLast && (isJustMerged || isJustAppended || step?.phase === 'eval' || step?.phase === 'check')

              const leftPct = ((interval[0] - minVal) / range) * 100
              const widthPct = ((interval[1] - interval[0]) / range) * 100

              return (
                <div key={`merged-${i}`} className="mi-row">
                  <div className="mi-row-idx">[{i}]</div>
                  <div className="mi-track">
                    <motion.div
                      className={`mi-bar merged ${isActive ? 'active' : ''} ${isJustMerged ? 'just-merged' : ''}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <span className="mi-bar-text">[{interval[0]}, {interval[1]}]</span>
                    </motion.div>
                  </div>
                </div>
              )
            })}
            {displayMerged.length === 0 && (
              <div className="mi-empty-text">[]</div>
            )}
          </div>
        </div>
      </div>
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const statusPanel = (
    <div className={`mi-status ${step?.phase === 'merge' ? 'merge' : step?.phase === 'append' ? 'append' : ''}`}>
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={MERGEINTERVALS_PATTERNS} />
      )}
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
    </>
  )

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Input Intervals', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="mi-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
