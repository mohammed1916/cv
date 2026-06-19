import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem533Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findLonelyPixel(picture, n):' },
  { line: 2, text: '    m, size = len(picture), len(picture[0])' },
  { line: 3, text: '    row_count = [0] * m' },
  { line: 4, text: '    col_count = [0] * size' },
  { line: 5, text: '    for i in range(m):' },
  { line: 6, text: '        for j in range(size):' },
  { line: 7, text: '            if picture[i][j] == "B":' },
  { line: 8, text: '                row_count[i] += 1' },
  { line: 9, text: '                col_count[j] += 1' },
  { line: 10, text: '    result = 0' },
  { line: 11, text: '    for i in range(m):' },
  { line: 12, text: '        for j in range(size):' },
  { line: 13, text: '            if picture[i][j]=="B" and row_count[i]==n and col_count[j]==n:' },
  { line: 14, text: '                result += 1' },
  { line: 15, text: '    return result' },
]

function generateSteps(picture, n) {
  const steps = []
  const m = picture.length
  const size = picture[0].length
  const rowCount = Array(m).fill(0)
  const colCount = Array(size).fill(0)

  steps.push({
    activeLine: 1,
    rowCount: [...rowCount],
    colCount: [...colCount],
    n,
    message: `Find lonely pixels where row has exactly ${n} Bs and column has exactly ${n} Bs`,
  })

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < size; j++) {
      if (picture[i][j] === 'B') {
        rowCount[i]++
        colCount[j]++
        steps.push({
          activeLine: 8,
          rowCount: [...rowCount],
          colCount: [...colCount],
          i,
          j,
          n,
          message: `Found B at [${i}, ${j}]`,
        })
      }
    }
  }

  const lonely = []
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < size; j++) {
      if (picture[i][j] === 'B' && rowCount[i] === n && colCount[j] === n) {
        lonely.push([i, j])
        steps.push({
          activeLine: 13,
          rowCount: [...rowCount],
          colCount: [...colCount],
          i,
          j,
          n,
          found: true,
          message: `Found lonely pixel at [${i}, ${j}]`,
        })
      }
    }
  }

  steps.push({
    activeLine: 15,
    rowCount: [...rowCount],
    colCount: [...colCount],
    lonely,
    n,
    message: `Return ${lonely.length} lonely pixel(s)`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: n=1', picture: [['W', 'B', 'W'], ['B', 'W', 'B'], ['W', 'B', 'W']], n: 1 },
  { label: 'Example 2: n=2', picture: [['B', 'B', 'B'], ['B', 'B', 'B'], ['B', 'B', 'B']], n: 2 },
]

export default function Problem533Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.picture, ex.n), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '🎯 Lonely Pixel II',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${ex.picture[0].length}, 40px)`,
                        gap: 4,
                      }}
                    >
                      {ex.picture.map((row, i) =>
                        row.map((cell, j) => {
                          const isCurrent = i === step.i && j === step.j
                          const isLonely = step.lonely?.some(([li, lj]) => li === i && lj === j)

                          return (
                            <motion.div
                              key={`${i}-${j}`}
                              animate={{ scale: isCurrent ? 1.15 : 1 }}
                              style={{
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                                fontWeight: 700,
                                fontSize: 14,
                                border: isCurrent ? '2px solid #0ea5e9' : isLonely ? '2px solid #10b981' : '1px solid #cbd5e1',
                                backgroundColor: isCurrent ? '#dbeafe' : isLonely ? '#dcfce7' : cell === 'B' ? '#fee2e2' : '#f3f4f6',
                              }}
                            >
                              {cell}
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Counts (need {step.n}):</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {step.rowCount.map((cnt, i) => (
                        <span key={i} style={{ padding: '3px 6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 3, fontSize: 9 }}>
                          R{i}:{cnt}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {step.colCount.map((cnt, j) => (
                        <span key={j} style={{ padding: '3px 6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 3, fontSize: 9 }}>
                          C{j}:{cnt}
                        </span>
                      ))}
                    </div>
                  </div>
              </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex]
  )

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
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
