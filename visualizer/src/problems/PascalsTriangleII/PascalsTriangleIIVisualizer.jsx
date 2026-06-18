import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './PascalsTriangleII.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def getRow(rowIndex):' },
  { line: 2, text: '    row = [1]' },
  { line: 3, text: '    for i in range(rowIndex):' },
  { line: 4, text: '        row = [1] + [row[j] + row[j+1] for j in range(len(row)-1)] + [1]' },
  { line: 5, text: '    return row' },
]

function generateSteps(rowIndex) {
  const steps = []
  const rows = []

  // Step 1: Initialize with [1]
  rows.push([1])
  steps.push({
    activeLine: 2,
    rows: [rows[0]],
    currentRowIndex: 0,
    message: `Initialize row 0 with [1]`,
  })

  // Step 2-N: Build each row
  for (let i = 0; i < rowIndex; i++) {
    const prevRow = rows[rows.length - 1]
    const newRow = [1]

    for (let j = 0; j < prevRow.length - 1; j++) {
      newRow.push(prevRow[j] + prevRow[j + 1])
    }

    newRow.push(1)
    rows.push([...newRow])

    steps.push({
      activeLine: 4,
      rows: rows.map(r => [...r]),
      currentRowIndex: i + 1,
      message: `Build row ${i + 1}: [1, ${newRow.slice(1, -1).join(', ')}, 1]`,
    })
  }

  return steps
}

const EXAMPLES = [
  { label: 'Row 0', rowIndex: 0 },
  { label: 'Row 1', rowIndex: 1 },
  { label: 'Row 2', rowIndex: 2 },
  { label: 'Row 3', rowIndex: 3 },
  { label: 'Row 4', rowIndex: 4 },
  { label: 'Row 5', rowIndex: 5 },
]

export default function PascalsTriangleIIVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const SOLUTION_CODE_HOOK = useSolutionCode('pascals-triangle-ii')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.rowIndex), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
      title: '△ Pascal\'s Triangle Row',
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
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{step.message}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {step.rows.map((row, rowIdx) => (
                    <motion.div
                      key={rowIdx}
                      animate={{ opacity: rowIdx <= step.currentRowIndex ? 1 : 0.4 }}
                      style={{
                        display: 'flex',
                        gap: 6,
                        justifyContent: 'center',
                        marginLeft: `${(step.rows.length - row.length) * 12}px`,
                      }}
                    >
                      {row.map((num, colIdx) => (
                        <motion.div
                          key={`${rowIdx}-${colIdx}`}
                          animate={{
                            scale: rowIdx === step.currentRowIndex ? 1.1 : 1,
                            backgroundColor: rowIdx === step.currentRowIndex ? '#0ea5e9' : '#dbeafe',
                          }}
                          style={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            border: rowIdx === step.currentRowIndex ? '2px solid #0ea5e9' : '1px solid #0ea5e9',
                            color: rowIdx === step.currentRowIndex ? '#fff' : '#1e40af',
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {num}
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </div>

              {step.currentRowIndex > 0 && (
                <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Target Row (Row {step.currentRowIndex}):</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {step.rows[step.currentRowIndex].map((num, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f0f9ff',
                          border: '2px solid #0ea5e9',
                          borderRadius: 3,
                          color: '#1e40af',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample])

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
