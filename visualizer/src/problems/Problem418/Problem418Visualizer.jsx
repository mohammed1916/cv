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
import './Problem418Visualizer.css'

const EXAMPLES = [
  { label: 'Small', sentence: ['a'], rows: 4, cols: 5, expected: 4 },
  { label: 'Medium', sentence: ['abc', 'aaab', 'bc'], rows: 3, cols: 6, expected: 2 },
  { label: 'Large', sentence: ['a', 'bbb', 'c'], rows: 2, cols: 3, expected: 1 },
]

function generateSteps(sentence, rows, cols) {
  const steps = []

  steps.push({
    activeLine: 1,
    message: `Fit sentence in ${rows} rows of width ${cols}. Sentence: [${sentence.join(', ')}]`,
    phase: 'init',
    result: 0,
    count: 0,
    lines: [],
    currentLine: 0,
    currentPos: 0,
    sentence,
    rows,
    cols,
  })

  let count = 0
  let currentLine = 0
  let currentPos = 0
  const lines = Array(rows).fill('')

  steps.push({
    activeLine: 2,
    message: `Initialize. Screen has ${rows} rows.`,
    phase: 'init_screen',
    result: 0,
    count: 0,
    lines: [...lines],
    currentLine: 0,
    currentPos: 0,
    sentence,
    rows,
    cols,
  })

  let wordIdx = 0

  for (let r = 0; r < rows; r++) {
    steps.push({
      activeLine: 3,
      message: `Process row ${r}. Current position: word ${wordIdx}`,
      phase: 'process_row',
      result: count,
      count,
      lines: [...lines],
      currentLine: r,
      currentPos: currentPos,
      wordIdx,
      sentence,
      rows,
      cols,
    })

    let rowText = ''
    let tempWordIdx = wordIdx

    for (let w = 0; w < sentence.length; w++) {
      const word = sentence[tempWordIdx % sentence.length]
      const testText = rowText ? rowText + ' ' + word : word

      if (testText.length <= cols) {
        rowText = testText
        tempWordIdx++

        steps.push({
          activeLine: 4,
          message: `Row ${r}: Added "${word}". Current: "${rowText}"`,
          phase: 'add_word',
          result: count,
          count,
          lines: lines.map((l, i) => i === r ? rowText : l),
          currentLine: r,
          currentPos: rowText.length,
          wordIdx: tempWordIdx,
          sentence,
          rows,
          cols,
        })
      } else {
        break
      }
    }

    lines[r] = rowText

    if (tempWordIdx >= wordIdx + sentence.length) {
      count++

      steps.push({
        activeLine: 5,
        message: `Row ${r}: Sentence completed! Count: ${count}`,
        phase: 'sentence_done',
        result: count,
        count,
        lines: [...lines],
        currentLine: r,
        currentPos: rowText.length,
        wordIdx: tempWordIdx % sentence.length,
        sentence,
        rows,
        cols,
      })
    }

    wordIdx = tempWordIdx % sentence.length
  }

  steps.push({
    activeLine: 6,
    message: `Complete. Sentence fits ${count} times.`,
    phase: 'done',
    result: count,
    count,
    lines: [...lines],
    currentLine: -1,
    currentPos: 0,
    sentence,
    rows,
    cols,
  })

  return steps
}

function ScreenFittingVisualization({ sentence, rows, cols, step }) {
  const result = step?.result || 0
  const lines = step?.lines || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Sentence Screen Fitting</div>

      {/* Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Rows</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>{rows}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Cols</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>{cols}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Words</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>{sentence.length}</div>
        </div>
      </div>

      {/* Sentence */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Sentence Words</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sentence.map((word, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 10px',
                backgroundColor: '#f1f5f9',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              "{word}"
            </div>
          ))}
        </div>
      </div>

      {/* Screen visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Screen</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(cols, 15)}, minmax(20px, 1fr))`,
          gap: 2,
          padding: 8,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
        }}>
          {Array(rows * cols).fill(0).map((_, idx) => {
            const row = Math.floor(idx / cols)
            const col = idx % cols
            const rowText = lines[row] || ''
            const isFilled = col < rowText.length
            const isCurrent = row === step?.currentLine && col === step?.currentPos

            return (
              <motion.div
                key={idx}
                style={{
                  aspectRatio: '1',
                  backgroundColor: isCurrent ? '#c7d2fe' : isFilled ? '#dbeafe' : '#ffffff',
                  borderRadius: 2,
                  border: `1px solid ${isCurrent ? '#6366f1' : isFilled ? '#0284c7' : '#e2e8f0'}`,
                }}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                }}
              />
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
          Blue = filled, White = empty (total {rows} rows × {cols} cols)
        </div>
      </div>

      {/* Row content */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Row Content</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lines.map((text, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                backgroundColor: step?.currentLine === idx ? '#c7d2fe' : '#f1f5f9',
                borderRadius: 4,
                border: `2px solid ${step?.currentLine === idx ? '#6366f1' : '#cbd5e1'}`,
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#1e293b',
                minHeight: 24,
              }}
            >
              {text || '(empty)'}
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #10b981' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>Times Sentence Fits</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
          {result}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem418Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.sentence, example.rows, example.cols).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

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
      title: '🎯 Screen Fitting',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #84cc16' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#e8f48d' : '#f1f5f9',
                    color: exIdx === idx ? '#3f6212' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <ScreenFittingVisualization sentence={example.sentence} rows={example.rows} cols={example.cols} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

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
