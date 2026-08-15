import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem436Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('find-right-interval')

const PATTERNS = ['binary_search', 'complete', 'extract_starts', 'found', 'init', 'search_start']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'extract_starts',
  3: 'search_start',
  4: 'binary_search',
  5: 'found',
  6: 'complete'
}


const EXAMPLES = getExamples('find-right-interval')

function generateSteps(intervals) {
  const steps = []

  if (!intervals || intervals.length === 0) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      intervals: [],
      result: [],
      startValues: [],
      searchState: null,
      message: 'No intervals',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    intervals: [...intervals],
    result: new Array(intervals.length).fill(-1),
    startValues: [],
    searchState: null,
    message: `Find right interval for each of ${intervals.length} intervals`,
  })

  const startValues = intervals.map(i => i[0]).sort((a, b) => a - b)

  steps.push({
    activeLine: 2,
    phase: 'extract_starts',
    intervals: [...intervals],
    result: new Array(intervals.length).fill(-1),
    startValues: [...startValues],
    searchState: null,
    message: `Extract sorted start values: [${startValues.join(', ')}]`,
  })

  let result = new Array(intervals.length).fill(-1)

  for (let i = 0; i < intervals.length; i++) {
    const [start, end] = intervals[i]

    steps.push({
      activeLine: 3,
      phase: 'search_start',
      intervals: [...intervals],
      result: [...result],
      startValues: [...startValues],
      searchState: { intervalIdx: i, end, message: `Search for interval >= ${end}` },
      message: `Process interval ${i}: [${start}, ${end}]`,
    })

    let left = 0, right = startValues.length - 1
    let foundIdx = -1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)

      steps.push({
        activeLine: 4,
        phase: 'binary_search',
        intervals: [...intervals],
        result: [...result],
        startValues: [...startValues],
        searchState: { intervalIdx: i, end, left, right, mid, value: startValues[mid], foundIdx },
        message: `Binary search: left=${left}, right=${right}, mid=${mid}, value=${startValues[mid]}`,
      })

      if (startValues[mid] >= end) {
        foundIdx = mid
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    result[i] = foundIdx

    steps.push({
      activeLine: 5,
      phase: 'found',
      intervals: [...intervals],
      result: [...result],
      startValues: [...startValues],
      searchState: { intervalIdx: i, end, foundIdx },
      message: foundIdx !== -1 ? `Found interval at index ${foundIdx}` : `No interval found`,
    })
  }

  steps.push({
    activeLine: 6,
    phase: 'complete',
    intervals: [...intervals],
    result: [...result],
    startValues: [...startValues],
    searchState: null,
    isComplete: true,
    message: `Result: [${result.join(', ')}]`,
  })

  return steps
}

function IntervalsVisualization({ intervals, result, currentIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Intervals & Results</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 120,
      }}>
        {intervals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {intervals.map(([start, end], idx) => {
              const isCurrent = idx === currentIdx
              const resultIdx = result ? result[idx] : -1

              return (
                <motion.div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: isCurrent ? '3px solid #dc2626' : '2px solid #cbd5e1',
                    backgroundColor: isCurrent ? '#fef2f2' : '#f8fafc',
                  }}
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', minWidth: 80 }}>
                    [{start}, {end}]
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: '#64748b' }}>→</div>
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: resultIdx !== -1 ? '#dbeafe' : '#fee2e2',
                    borderRadius: 4,
                    border: resultIdx !== -1 ? '1px solid #0284c7' : '1px solid #ef4444',
                    fontSize: 12,
                    fontWeight: 600,
                    color: resultIdx !== -1 ? '#0c4a6e' : '#dc2626',
                    minWidth: 40,
                    textAlign: 'center',
                  }}>
                    {resultIdx !== -1 ? resultIdx : 'X'}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No intervals</div>
        )}
      </div>
    </div>
  )
}

function BinarySearchVisualization({ startValues, searchState }) {
  if (!searchState) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Binary Search: Find start &gt;= {searchState.end}
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {startValues.map((val, idx) => {
            const isLeft = searchState.left !== undefined && idx === searchState.left
            const isRight = searchState.right !== undefined && idx === searchState.right
            const isMid = searchState.mid !== undefined && idx === searchState.mid
            const iFound = searchState.foundIdx !== undefined && idx === searchState.foundIdx
            const isValid = val >= searchState.end

            return (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: iFound ? '#dbeafe' : isMid ? '#fbbf24' : isLeft ? '#86efac' : isRight ? '#f87171' : isValid ? '#c7d2fe' : '#f3f4f6',
                  borderRadius: 4,
                  border: isMid ? '3px solid #f59e0b' : iFound ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: iFound ? '#0c4a6e' : isMid ? '#b45309' : isLeft ? '#166534' : isRight ? '#7f1d1d' : '#1e293b',
                }}>
                  {val}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textAlign: 'center', minWidth: 40 }}>
                  {isMid ? 'mid' : isLeft ? 'L' : isRight ? 'R' : idx}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
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
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <IntervalsVisualization
        intervals={step?.intervals || []}
        result={step?.result}
        currentIdx={step?.searchState?.intervalIdx}
      />

      <BinarySearchVisualization
        startValues={step?.startValues || []}
        searchState={step?.searchState}
      />
    </div>
  )
}

export default function Problem436Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [intervalsInput, setIntervalsInput] = useState("[[1,2]]");
  const { intervals, inputError } = useMemo(() => {
    try {
      const parsedIntervals = JSON.parse(intervalsInput); if (!Array.isArray(parsedIntervals)) throw new Error('intervals must be an array');
      return { intervals: parsedIntervals, inputError: '' };
    } catch (e) {
      return { intervals: "[[1,2]]", inputError: e.message };
    }
  }, [intervalsInput]);

  const steps = useMemo(
    () =>
      generateSteps(intervals).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [intervals]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setIntervalsInput(JSON.stringify(e.intervals)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔍 Binary Search', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"intervals","label":"intervals","type":"array"}]}
          values={{ intervals: intervalsInput }}
          onChange={(k, v) => { if (k === 'intervals') setIntervalsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
