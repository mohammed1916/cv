import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'
const PATTERNS = ['checking', 'done', 'initialized', 'new_arrow', 'overlap', 'sorted', 'start']
const LINE_PATTERN_MAP = {
  2: 'done',
  3: 'start',
  5: 'initialized',
  7: 'checking',
  9: 'new_arrow',
  10: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findMinArrowShots(points: list) -> int:' },
  { line: 2, text: '    if not points: return 0' },
  { line: 3, text: '    points.sort(key=lambda x: x[1])' },
  { line: 4, text: '    arrows = 1' },
  { line: 5, text: '    last_pos = points[0][1]' },
  { line: 6, text: '    for i in range(1, len(points)):' },
  { line: 7, text: '        if points[i][0] > last_pos:' },
  { line: 8, text: '            arrows += 1' },
  { line: 9, text: '            last_pos = points[i][1]' },
  { line: 10, text: '    return arrows' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('minimum-number-of-arrows-to-burst-balloons', [
  { label: 'Example 1', points: [[10, 16], [2, 8], [1, 6], [7, 12], [4, 9]], expected: 2 },
  { label: 'Example 2', points: [[1, 2], [3, 4], [5, 6], [7, 8]], expected: 4 },
  { label: 'Example 3', points: [[1, 10], [2, 9]], expected: 1 },
])

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2, 3, 4, 5] },
  { id: 'loop', label: 'Check Overlaps', lines: [6, 7, 8, 9] },
  { id: 'return', label: 'Return', lines: [10] },
]

function generateSteps(points) {
  const steps = []

  if (!Array.isArray(points) || points.length === 0) {
    return [{
      phase: 'done',
      activeLine: 2,
      points: [],
      arrows: 0,
      stepNum: 0,
      message: 'Empty balloon list.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 3,
    points: [...points],
    arrows: 0,
    stepNum: 0,
    message: `${points.length} balloons to burst`,
  })

  const sorted = [...points].sort((a, b) => a[1] - b[1])

  steps.push({
    phase: 'sorted',
    activeLine: 3,
    points: sorted,
    arrows: 0,
    stepNum: 1,
    message: `Sorted by end position`,
  })

  let arrows = 1
  let lastPos = sorted[0][1]
  let stepNum = 2

  steps.push({
    phase: 'initialized',
    activeLine: 5,
    points: sorted,
    arrows,
    lastPos,
    stepNum,
    message: `First balloon: [${sorted[0][0]}, ${sorted[0][1]}], arrow placed at ${lastPos}`,
  })
  stepNum++

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i]

    steps.push({
      phase: 'checking',
      activeLine: 7,
      points: sorted,
      arrows,
      lastPos,
      currentIdx: i,
      stepNum,
      message: `Balloon ${i}: [${start}, ${end}]. Start ${start} > lastPos ${lastPos}? ${start > lastPos}`,
    })
    stepNum++

    if (start > lastPos) {
      arrows++
      lastPos = end

      steps.push({
        phase: 'new_arrow',
        activeLine: 9,
        points: sorted,
        arrows,
        lastPos,
        currentIdx: i,
        stepNum,
        message: `No overlap! Need new arrow at ${lastPos}. Arrows=${arrows}`,
      })
      stepNum++
    } else {
      steps.push({
        phase: 'overlap',
        activeLine: 7,
        points: sorted,
        arrows,
        lastPos,
        currentIdx: i,
        stepNum,
        message: `Overlaps! One arrow bursts both.`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 10,
    points: sorted,
    arrows,
    stepNum,
    message: `Minimum arrows needed: ${arrows}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'sorted' || phase === 'initialized') return 'init'
  if (phase === 'checking' || phase === 'new_arrow' || phase === 'overlap') return 'loop'
  if (phase === 'done') return 'return'
  return 'init'
}

function BalloonVisualization({ points, currentIdx, lastPos }) {
  const maxEnd = Math.max(...points.map(p => p[1]), lastPos)
  const minStart = Math.min(...points.map(p => p[0]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Balloons (sorted by end)
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {points.map((balloon, idx) => {
          const [start, end] = balloon
          const isCurrent = idx === currentIdx
          const scale = (end - start) / (maxEnd - minStart)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', minWidth: 60 }}>
                [{start}, {end}]
              </span>
              <motion.div
                style={{
                  height: 30,
                  backgroundColor: isCurrent ? '#fef08a' : '#dbeafe',
                  border: `2px solid ${isCurrent ? '#eab308' : '#3b82f6'}`,
                  borderRadius: 4,
                  flex: 0.3,
                  minWidth: 40,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 4,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: '#1e40af' }}>
                  {idx}
                </span>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ArrowCount({ arrows, lastPos }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Arrow Count
      </header>
      <div style={{
        padding: 16,
        backgroundColor: '#dcfce7',
        borderRadius: 4,
        border: '2px solid #22c55e',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#15803d',
          marginBottom: 8,
        }}>
          {arrows}
        </div>
        <div style={{
          fontSize: 12,
          color: '#166534',
          fontWeight: 600,
        }}>
          arrows needed
        </div>
        {lastPos !== undefined && (
          <div style={{
            fontSize: 11,
            color: '#12873d',
            marginTop: 8,
            fontFamily: 'monospace',
          }}>
            last arrow at position {lastPos}
          </div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, points, EXAMPLES, handleExampleClick, pointsInput, setPointsInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
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
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface2)',
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

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          Balloons (format: [start,end] separated by spaces)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={pointsInput}
            onChange={(e) => { setPointsInput(e.target.value); handleReset() }}
            placeholder="[10,16] [2,8] [1,6]"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleReset}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--text)',
              border: '1px solid var(--primary)',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <BalloonVisualization
          points={step?.points || []}
          currentIdx={step?.currentIdx}
          lastPos={step?.lastPos}
        />
        <ArrowCount arrows={step?.arrows ?? 0} lastPos={step?.lastPos} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Greedy Balloon Bursting
        </div>
        <div style={{ fontSize: 12, color: '#178740', lineHeight: 1.4 }}>
          Sort by ending position, place arrow at rightmost end, and reuse for overlapping balloons.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem452Visualizer() {
  const [pointsInput, setPointsInput] = useState('[10,16] [2,8] [1,6] [7,12] [4,9]')

  const points = useMemo(() => {
    try {
      const regex = /\[(\d+),(\d+)\]/g
      const matches = []
      let match
      while ((match = regex.exec(pointsInput)) !== null) {
        matches.push([parseInt(match[1]), parseInt(match[2])])
      }
      return matches
    } catch {
      return []
    }
  }, [pointsInput])

  const steps = useMemo(
    () => generateSteps(points).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [points],
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
    const str = ex.points.map(p => `[${p[0]},${p[1]}]`).join(' ')
    setPointsInput(str)
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />),
    viz: (<VisualizationPanel
          step={step}
          points={points}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          pointsInput={pointsInput}
          setPointsInput={setPointsInput}
          handleReset={handleReset}
        />),
  }), [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    points,
    pointsInput,
    autoScrollCode,
    handleReset,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"points","label":"points","type":"string"}]}
        values={{ points: pointsInput }}
        onChange={(k, v) => { if (k === 'points') setPointsInput(v); handleReset() }}
        showExamples={false}
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
        <div style={{ marginBottom: '12px', fontSize: 12, color: 'var(--text-muted)' }}>
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
