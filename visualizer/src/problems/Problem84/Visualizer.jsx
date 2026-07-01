import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './LargestRectangleInHistogramVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def largestRectangleArea(self, heights):' },
  { line: 3, text: '        stack = []  # (start, height)' },
  { line: 4, text: '        best = 0' },
  { line: 5, text: '        for i, h in enumerate(heights):' },
  { line: 6, text: '            start = i' },
  { line: 7, text: '            while stack and stack[-1][1] > h:' },
  { line: 8, text: '                idx, ht = stack.pop()' },
  { line: 9, text: '                best = max(best, ht * (i - idx))' },
  { line: 10, text: '                start = idx' },
  { line: 11, text: '            stack.append((start, h))' },
  { line: 12, text: '        for i, h in stack:' },
  { line: 13, text: '            best = max(best, h * (len(heights) - i))' },
  { line: 14, text: '        return best' },
]

function parseHeights(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed)) throw new Error('Input must be array')
  return parsed.map((n) => Math.max(0, Number(n)))
}

function generateSteps(heights) {
  const steps = []
  const stack = []
  let best = 0
  steps.push({
    phase: 'init',
    activeLine: 4,
    heights,
    i: -1,
    stack: [...stack],
    best,
    area: 0,
    rect: null,
    message: 'Initialize stack and best area.',
  })
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i]
    let start = i
    steps.push({
      phase: 'iterate',
      activeLine: 6,
      heights,
      i,
      h,
      stack: [...stack],
      best,
      area: 0,
      rect: null,
      message: `Index ${i}, height ${h}.`,
    })
    while (stack.length && stack[stack.length - 1].h > h) {
      const top = stack.pop()
      const area = top.h * (i - top.start)
      best = Math.max(best, area)
      start = top.start
      steps.push({
        phase: 'pop',
        activeLine: 9,
        heights,
        i,
        h,
        stack: [...stack],
        best,
        area,
        rect: { start: top.start, end: i - 1, height: top.h },
        message: `Pop height ${top.h}, width ${i - top.start}, area ${area}.`,
      })
    }
    stack.push({ start, h })
    steps.push({
      phase: 'push',
      activeLine: 11,
      heights,
      i,
      h,
      stack: [...stack],
      best,
      area: 0,
      rect: null,
      message: `Push bar (${start}, ${h}).`,
    })
  }
  for (const item of stack) {
    const area = item.h * (heights.length - item.start)
    best = Math.max(best, area)
    steps.push({
      phase: 'finalize',
      activeLine: 13,
      heights,
      i: heights.length - 1,
      h: item.h,
      stack: [...stack],
      best,
      area,
      rect: { start: item.start, end: heights.length - 1, height: item.h },
      message: `Finalize bar ${item.h}: area=${area}.`,
    })
  }
  steps.push({
    phase: 'done',
    activeLine: 14,
    heights,
    i: heights.length - 1,
    stack: [...stack],
    best,
    area: 0,
    rect: null,
    message: `Largest rectangle area = ${best}.`,
  })
  return steps
}

const EXAMPLES = getExamples('largest-rectangle-in-histogram') || [
  { label: '[2,1,5,6,2,3]', heights: [2, 1, 5, 6, 2, 3] },
  { label: '[2,4]', heights: [2, 4] },
  { label: '[0,9]', heights: [0, 9] },
]

function HistogramVisualization({ step, heights, inputError, input, setInput, handleReset, applyExample }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Histogram Visualization
        {inputError && <span style={{ marginLeft: 8, color: '#ef4444', fontSize: 12 }}>{inputError}</span>}
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => applyExample(ex)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          handleReset()
        }}
        placeholder="[2,1,5,6,2,3]"
        style={{
          padding: '8px 10px',
          border: '1px solid #cbd5e1',
          borderRadius: 4,
          fontSize: 12,
        }}
      />

      {/* Histogram bars */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '16px 0', borderBottom: '2px solid #e2e8f0', minHeight: 300 }}>
        {heights.map((v, i) => {
          const active = step?.i === i
          const inRect = step?.rect && i >= step?.rect.start && i <= step?.rect.end && v >= step?.rect.height

          return (
            <div key={`bar-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <motion.div
                style={{
                  width: '100%',
                  height: `${Math.max(20, v * 25)}px`,
                  backgroundColor: inRect ? '#10b981' : active ? '#a855f7' : '#0ea5e9',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
                animate={{ scale: active ? 1.1 : 1 }}
              >
                {v > 0 && v}
              </motion.div>
              <small style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{i}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function StackState({ step, heights }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Stack & State
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stack display */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Stack (start, height):</div>
          <div
            style={{
              padding: 12,
              backgroundColor: '#f1f5f9',
              borderRadius: 4,
              minHeight: 40,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {(step?.stack || []).length === 0 ? (
              <span style={{ fontSize: 12, color: '#94a3b8' }}>[ empty ]</span>
            ) : (
              (step?.stack || []).map((s, i) => (
                <span
                  key={`stack-${i}`}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    border: '1px solid #0ea5e9',
                    borderRadius: 3,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  ({s.start},{s.h})
                </span>
              ))
            )}
          </div>
        </div>

        {/* Current state */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Current Index</div>
            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
              {step?.i >= 0 ? step.i : '-'}
            </div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Current Height</div>
            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
              {step?.h >= 0 ? step.h : '-'}
            </div>
          </div>
        </div>

        {/* Best area */}
        <div style={{ padding: 12, backgroundColor: '#fef08a', border: '2px solid #eab308', borderRadius: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#854d0e', marginBottom: 6 }}>Best Area Found</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#854d0e' }}>
            {step?.best || 0}
          </div>
        </div>

        {/* Last calculated area */}
        {step?.area > 0 && (
          <div style={{ padding: 12, backgroundColor: '#dcfce7', border: '2px solid #10b981', borderRadius: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#166534', marginBottom: 6 }}>Last Calculated Area</div>
            <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#166534' }}>
              {step.area}
            </div>
          </div>
        )}

        {/* Status message */}
        <div style={{ padding: 12, backgroundColor: '#e0e7ff', border: '1px solid #818cf8', borderRadius: 4 }}>
          <div style={{ fontSize: 12, color: '#3730a3', lineHeight: 1.5 }}>
            {step?.message || 'Press Play to begin.'}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LargestRectangleInHistogramVisualizer() {
  const [input, setInput] = useState('[2,1,5,6,2,3]')

  const { heights, inputError } = useMemo(() => {
    try {
      return { heights: parseHeights(input), inputError: '' }
    } catch (e) {
      return { heights: [2, 1, 5, 6, 2, 3], inputError: e.message || 'Invalid input' }
    }
  }, [input])

  const steps = useMemo(() => generateSteps(heights), [heights])

  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (ex) => {
      setInput(JSON.stringify(ex.heights))
      handleReset()
    },
    [handleReset]
  )

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: "relative" }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              onActiveLineDomChange={setActiveLineDom}
              autoScroll={autoScrollCode}
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
        title: 'Visualization',
        content: (
          <div style={{ display: 'flex', height: '100%' }}>
            <HistogramVisualization
              step={step}
              heights={heights}
              inputError={inputError}
              input={input}
              setInput={setInput}
              handleReset={handleReset}
              applyExample={applyExample}
            />
            <StackState step={step} heights={heights} />
          </div>
        ),
      },
    ],
    [step, autoScrollCode, heights, inputError, input, handleReset]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
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

    </div>
  )
}
