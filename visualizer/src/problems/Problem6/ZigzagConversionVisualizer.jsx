import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './ZigzagConversionVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def convert(self, s: str, numRows: int) -> str:' },
  { line: 3, text: '        if numRows == 1: return s' },
  { line: 4, text: '        rows = [""] * numRows' },
  { line: 5, text: '        cur_row = 0' },
  { line: 6, text: '        going_down = True' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for char in s:' },
  { line: 9, text: '            rows[cur_row] += char' },
  { line: 10, text: '            ' },
  { line: 11, text: '            if cur_row == 0:' },
  { line: 12, text: '                going_down = True' },
  { line: 13, text: '            elif cur_row == numRows - 1:' },
  { line: 14, text: '                going_down = False' },
  { line: 15, text: '            ' },
  { line: 16, text: '            if going_down:' },
  { line: 17, text: '                cur_row += 1' },
  { line: 18, text: '            else:' },
  { line: 19, text: '                cur_row -= 1' },
  { line: 20, text: '        return "".join(rows)' },
]

const PATTERNS = ['init', 'char_add', 'direction_check', 'move', 'done']
const LINE_PATTERN_MAP = {
  4: 'init',
  9: 'char_add',
  11: 'direction_check',
  17: 'move',
  20: 'done',
}

function generateSteps(str, numRows) {
  const steps = []

  if (!str || numRows <= 0 || numRows > str.length) {
    steps.push({
      phase: 'done',
      activeLine: 20,
      relatedLines: [20],
      message: 'Invalid input.',
      done: true,
    })
    return steps
  }

  if (numRows === 1) {
    steps.push({
      phase: 'init',
      activeLine: 3,
      relatedLines: [3],
      message: 'numRows = 1, return as-is.',
      result: str,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 4,
    relatedLines: [4, 5, 6],
    message: `Initialize ${numRows} rows for string "${str}"`,
    rows: Array(numRows).fill(''),
    curRow: 0,
    goingDown: true,
  })

  const rows = Array(numRows).fill('')
  let curRow = 0
  let goingDown = true

  for (let idx = 0; idx < str.length; idx++) {
    const char = str[idx]

    rows[curRow] += char

    steps.push({
      phase: 'char_add',
      activeLine: 9,
      relatedLines: [8, 9],
      message: `Add '${char}' to row ${curRow}`,
      rows: rows.map(r => r),
      curRow,
      goingDown,
      charIdx: idx,
    })

    if (curRow === 0) {
      goingDown = true
      steps.push({
        phase: 'direction_check',
        activeLine: 12,
        relatedLines: [11, 12],
        message: 'At top (row 0), change direction to DOWN',
        rows: rows.map(r => r),
        curRow,
        goingDown,
      })
    } else if (curRow === numRows - 1) {
      goingDown = false
      steps.push({
        phase: 'direction_check',
        activeLine: 14,
        relatedLines: [13, 14],
        message: `At bottom (row ${numRows - 1}), change direction to UP`,
        rows: rows.map(r => r),
        curRow,
        goingDown,
      })
    }

    if (idx < str.length - 1) {
      if (goingDown) {
        curRow += 1
        steps.push({
          phase: 'move',
          activeLine: 17,
          relatedLines: [16, 17],
          message: `Move DOWN → row ${curRow}`,
          rows: rows.map(r => r),
          curRow,
          goingDown,
        })
      } else {
        curRow -= 1
        steps.push({
          phase: 'move',
          activeLine: 19,
          relatedLines: [18, 19],
          message: `Move UP → row ${curRow}`,
          rows: rows.map(r => r),
          curRow,
          goingDown,
        })
      }
    }
  }

  const result = rows.join('')

  steps.push({
    phase: 'done',
    activeLine: 20,
    relatedLines: [20],
    message: `Result: "${result}"`,
    rows,
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ str, numRows, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>String</div>
          <div style={{ fontSize: 13, color: '#5577a4', fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
            "{str}"
          </div>
        </div>
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Rows</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#067db1' }}>{numRows}</div>
        </div>
      </div>

      {step?.rows && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Zigzag Pattern</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 11 }}>
            <AnimatePresence mode="wait">
              {step.rows.map((row, idx) => {
                const isCurrent = step.curRow === idx
                return (
                  <motion.div
                    key={`row-${idx}`}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 4,
                      border: '2px solid',
                      backgroundColor: isCurrent ? '#38bdf8' : 'var(--border)',
                      borderColor: isCurrent ? '#0ea5e9' : 'var(--text-muted)',
                      color: isCurrent ? '#0c4a6e' : 'var(--text)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                    animate={{ scale: isCurrent ? 1.05 : 1 }}
                  >
                    Row {idx}: <span style={{ color: isCurrent ? '#0c4a6e' : '#22c55e', fontWeight: 600 }}>"{row}"</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.result && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#178740', wordBreak: 'break-all' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ZigzagConversionVisualizer() {
  const examples = useMemo(() => getExamplesOr('zigzag-conversion', []), [])
  const [str, setStr] = useState('PAYPALISHIRING')
  const [numRows, setNumRows] = useState(3)
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(() => generateSteps(str, numRows), [str, numRows])

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
      setStr(ex.s || ex)
      setNumRows(ex.numRows || 3)
      handleReset()
    },
    [handleReset]
  )

  const mainPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>String</div>
          <input
            type="text"
            value={str}
            onChange={(e) => {
              setStr(e.target.value)
              handleReset()
            }}
            placeholder="PAYPALISHIRING"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 4,
              border: '1px solid var(--text-muted)',
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Rows</div>
          <input
            type="number"
            value={numRows}
            onChange={(e) => {
              setNumRows(Math.max(1, parseInt(e.target.value, 10) || 1))
              handleReset()
            }}
            min="1"
            max="str.length"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 4,
              border: '1px solid var(--text-muted)',
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          />
        </div>
      </div>
      <VisualizationPanel str={str} numRows={numRows} step={step} applyExample={applyExample} examples={examples} />
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 16px', minHeight: 0 }}>
      <div style={{ fontSize: 13, color: '#5577a4' }}>
        {stepIndex < 0 ? 'Not started' : isDone ? `Done! ${steps.length} steps` : `Step ${stepIndex + 1} / ${steps.length}`}
      </div>
    </div>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'main', title: 'Visualizer', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs)
  }, [])

  return (
    <div className="problem-shell" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.main && createPortal(mainPanel, panelDivs.main)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
