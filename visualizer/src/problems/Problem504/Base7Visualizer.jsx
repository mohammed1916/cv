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
import './Base7Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def convertToBase7(self, num: int) -> str:' },
  { line: 3, text: '        if num == 0:' },
  { line: 4, text: '            return "0"' },
  { line: 5, text: '        ' },
  { line: 6, text: '        negative = num < 0' },
  { line: 7, text: '        num = abs(num)' },
  { line: 8, text: '        result = ""' },
  { line: 9, text: '        ' },
  { line: 10, text: '        while num > 0:' },
  { line: 11, text: '            result = str(num % 7) + result' },
  { line: 12, text: '            num //= 7' },
  { line: 13, text: '        ' },
  { line: 14, text: '        if negative:' },
  { line: 15, text: '            result = "-" + result' },
  { line: 16, text: '        return result' },
]

const PATTERNS = ['init', 'check_zero', 'convert', 'append_digit', 'negate', 'done']
const LINE_PATTERN_MAP = {
  3: 'check_zero',
  6: 'init',
  10: 'convert',
  11: 'append_digit',
  14: 'negate',
  16: 'done',
}

function generateSteps(numInput) {
  const steps = []
  let num = parseInt(numInput, 10)

  if (isNaN(num)) {
    steps.push({
      phase: 'done',
      activeLine: 16,
      relatedLines: [16],
      message: 'Invalid input.',
      result: '0',
      done: true,
    })
    return steps
  }

  if (num === 0) {
    steps.push({
      phase: 'check_zero',
      activeLine: 3,
      relatedLines: [3, 4],
      message: 'Zero input returns "0".',
      result: '0',
      done: true,
    })
    return steps
  }

  const negative = num < 0

  steps.push({
    phase: 'init',
    activeLine: 6,
    relatedLines: [6, 7, 8],
    message: `Initial value: ${num}, negative: ${negative}`,
    num,
    negative,
    result: '',
  })

  num = Math.abs(num)
  let result = ''

  steps.push({
    phase: 'convert',
    activeLine: 10,
    relatedLines: [10],
    message: `Start conversion loop, num = ${num}`,
    num,
    negative,
    result,
  })

  let iteration = 0
  while (num > 0) {
    const remainder = num % 7
    result = remainder + result

    iteration++

    steps.push({
      phase: 'append_digit',
      activeLine: 11,
      relatedLines: [11],
      message: `${num} % 7 = ${remainder}, prepend to result`,
      num,
      negative,
      result,
      remainder,
      iteration,
    })

    num = Math.floor(num / 7)

    steps.push({
      phase: 'convert',
      activeLine: 12,
      relatedLines: [12],
      message: `${num === 0 ? 'Done dividing' : `Divide: num = ${num}`}`,
      num,
      negative,
      result,
      iteration,
    })
  }

  if (negative) {
    result = '-' + result

    steps.push({
      phase: 'negate',
      activeLine: 15,
      relatedLines: [14, 15],
      message: `Apply negative sign: ${result}`,
      negative,
      result,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 16,
    relatedLines: [16],
    message: `Result: "${result}"`,
    result,
    done: true,
  })

  return steps
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

      {step?.num !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Current Number</div>
          <div style={{ fontSize: 14, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>{step.num}</div>
        </div>
      )}

      {step?.remainder !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Remainder</div>
            <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.remainder}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Iteration</div>
            <div style={{ fontSize: 16, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.iteration}
            </div>
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
            {step.done ? 'Final Result' : 'Current Result'}
          </div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}

      {step?.negative && (
        <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '1px solid #f87171' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f87171' }}>Negative number detected</div>
        </div>
      )}
    </div>
  )
}

export default function Base7Visualizer() {
  const examples = useMemo(() => getExamplesOr('base-7', []), [])
  const [numInput, setNumInput] = useState('100')

  const steps = useMemo(() => generateSteps(numInput), [numInput])

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
      setNumInput(String(ex.num || ex.input || 100))
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
        title: '#️⃣ Base 7',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Number</div>
              <input
                type="number"
                value={numInput}
                onChange={(e) => {
                  setNumInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              />
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, numInput, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"num","label":"num","type":"string"}]}
        values={{ num: numInput }}
        onChange={(k, v) => { if (k === 'num') setNumInput(v); handleReset(); }}
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
