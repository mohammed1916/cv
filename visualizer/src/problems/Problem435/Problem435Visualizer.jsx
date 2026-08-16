import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem435Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('non-overlapping-intervals')

const PATTERNS = ['complete', 'init', 'keep', 'remove', 'sorted']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'sorted',
  3: 'keep',
  4: 'remove',
  5: 'complete'
}


const EXAMPLES = getExamples('non-overlapping-intervals')

function generateSteps(intervals) {
  const steps = []

  if (!intervals || intervals.length === 0) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      intervals: [],
      sorted: [],
      removed: [],
      current: null,
      message: 'No intervals to process',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    intervals: [...intervals],
    sorted: [],
    removed: [],
    current: null,
    message: 'Sort intervals by end time',
  })

  const sorted = [...intervals].sort((a, b) => a[1] - b[1])

  steps.push({
    activeLine: 2,
    phase: 'sorted',
    intervals: [...intervals],
    sorted: [...sorted],
    removed: [],
    current: null,
    message: `Sorted ${sorted.length} intervals by end time`,
  })

  let removed = []
  let lastEnd = -Infinity

  for (let i = 0; i < sorted.length; i++) {
    const [start, end] = sorted[i]

    if (start >= lastEnd) {
      steps.push({
        activeLine: 3,
        phase: 'keep',
        intervals: [...intervals],
        sorted: [...sorted],
        removed: [...removed],
        current: { interval: [start, end], index: i },
        message: `Keep interval [${start}, ${end}] - no overlap`,
      })
      lastEnd = end
    } else {
      removed.push([start, end])
      steps.push({
        activeLine: 4,
        phase: 'remove',
        intervals: [...intervals],
        sorted: [...sorted],
        removed: [...removed],
        current: { interval: [start, end], index: i },
        message: `Remove interval [${start}, ${end}] - overlaps with previous`,
      })
    }
  }

  steps.push({
    activeLine: 5,
    phase: 'complete',
    intervals: [...intervals],
    sorted: [...sorted],
    removed: [...removed],
    current: null,
    isComplete: true,
    message: `Done! Removed ${removed.length} intervals`,
  })

  return steps
}

function IntervalVisualization({ intervals, removed, current, title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>{title}</div>
      <div style={{
        padding: 12,
        backgroundColor: 'var(--surface2)',
        borderRadius: 8,
        border: '2px solid var(--border)',
        minHeight: 100,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {intervals.length > 0 ? (
            intervals.map(([start, end], idx) => {
              const isRemoved = removed.some(r => r[0] === start && r[1] === end)
              const isCurrent = current && current.interval[0] === start && current.interval[1] === end

              return (
                <motion.div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: isCurrent ? '3px solid #dc2626' : isRemoved ? '2px solid #ef4444' : '2px solid var(--border)',
                    backgroundColor: isRemoved ? '#fee2e2' : isCurrent ? '#fef2f2' : 'var(--surface)',
                  }}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                    opacity: isRemoved ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', minWidth: 50 }}>
                    [{start}, {end}]
                  </div>
                  <div style={{
                    flex: 1,
                    height: 16,
                    backgroundColor: '#dbeafe',
                    borderRadius: 3,
                    position: 'relative',
                    border: isRemoved ? '1px solid #ef4444' : '1px solid #0284c7',
                    opacity: isRemoved ? 0.5 : 1,
                  }}>
                    <motion.div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        backgroundColor: isCurrent ? '#dc2626' : isRemoved ? '#ef4444' : '#0284c7',
                        borderRadius: 2,
                      }}
                      animate={{ width: `${((end - start) / 10) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {isRemoved && (
                    <div style={{ fontSize: 11, color: '#e91414', fontWeight: 600 }}>removed</div>
                  )}
                </motion.div>
              )
            })
          ) : (
            <div style={{ color: '#627794', fontSize: 12 }}>No intervals</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatsVisualization({ intervals, removed }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>Statistics</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: '#ecfdf5',
          borderRadius: 6,
          border: '2px solid #10b981',
        }}>
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Total Intervals</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#04865e', marginTop: 4 }}>
            {intervals.length}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#fee2e2',
          borderRadius: 6,
          border: '2px solid #ef4444',
        }}>
          <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Removed</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e91414', marginTop: 4 }}>
            {removed.length}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
          gridColumn: '1 / -1',
        }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Keep (Minimum)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#027bba', marginTop: 4 }}>
            {intervals.length - removed.length}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <IntervalVisualization
        intervals={step?.sorted || []}
        removed={step?.removed || []}
        current={step?.current}
        title="Intervals (sorted by end)"
      />

      <StatsVisualization
        intervals={step?.intervals || []}
        removed={step?.removed || []}
      />
    </div>
  )
}

export default function Problem435Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [intervalsInput, setIntervalsInput] = useState("[[1,2],[2,3],[3,4]]");
  const { intervals, inputError } = useMemo(() => {
    try {
      const parsedIntervals = JSON.parse(intervalsInput); if (!Array.isArray(parsedIntervals)) throw new Error('intervals must be an array');
      return { intervals: parsedIntervals, inputError: '' };
    } catch (e) {
      return { intervals: "[[1,2],[2,3],[3,4]]", inputError: e.message };
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

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"intervals","label":"intervals","type":"string"}]}
        values={{ intervals: intervalsInput }}
        onChange={(k, v) => { if (k === 'intervals') setIntervalsInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <VisualizationPanel
      step={step}
      applyEx={applyEx}
    />
  
    </>)

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📊 Intervals', dockMode: 'split-right' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
