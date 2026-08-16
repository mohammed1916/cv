import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './StudentAttendanceVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def checkRecord(self, s: str) -> bool:' },
  { line: 3, text: '        absent_count = s.count("A")' },
  { line: 4, text: '        if absent_count >= 2:' },
  { line: 5, text: '            return False' },
  { line: 6, text: '        ' },
  { line: 7, text: '        if "LLL" in s:' },
  { line: 8, text: '            return False' },
  { line: 9, text: '        ' },
  { line: 10, text: '        return True' },
]

const PATTERNS = ['count', 'check_absent', 'check_late', 'valid', 'done']
const LINE_PATTERN_MAP = {
  3: 'count',
  4: 'check_absent',
  7: 'check_late',
  10: 'valid',
}

function generateSteps(s) {
  const steps = []

  steps.push({
    phase: 'count',
    activeLine: 3,
    relatedLines: [3],
    message: `Record: "${s}"`,
    s,
  })

  const absentCount = (s.match(/A/g) || []).length

  steps.push({
    phase: 'count',
    activeLine: 3,
    relatedLines: [3],
    message: `Count absences: ${absentCount}`,
    s,
    absentCount,
  })

  if (absentCount >= 2) {
    steps.push({
      phase: 'check_absent',
      activeLine: 4,
      relatedLines: [4, 5],
      message: `${absentCount} absences >= 2: INELIGIBLE`,
      result: false,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'check_absent',
    activeLine: 4,
    relatedLines: [4],
    message: `${absentCount} absences < 2: OK`,
    absentCount,
    s,
  })

  const hasLateLate = s.includes('LLL')

  steps.push({
    phase: 'check_late',
    activeLine: 7,
    relatedLines: [7],
    message: `Check for 3 consecutive lates: ${hasLateLate ? 'Found' : 'Not found'}`,
    s,
    hasLateLate,
  })

  if (hasLateLate) {
    steps.push({
      phase: 'check_late',
      activeLine: 8,
      relatedLines: [7, 8],
      message: `3 consecutive lates found: INELIGIBLE`,
      result: false,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'valid',
    activeLine: 10,
    relatedLines: [10],
    message: `No violations found: ELIGIBLE`,
    result: true,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
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

      {step?.s && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Record</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#5577a4', letterSpacing: '2px' }}>
            {step.s.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  color: char === 'A' ? '#f87171' : char === 'L' ? '#f59e0b' : '#22c55e',
                  fontWeight: 600,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {step?.absentCount !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #f87171',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ea0c0c', marginBottom: 6 }}>Absence Count</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ea0c0c' }}>{step.absentCount}</div>
        </motion.div>
      )}

      {step?.hasLateLate !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #f59e0b',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Three Consecutive Lates</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#a36907' }}>
            {step.hasLateLate ? '✗ Found' : '✓ Not found'}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid',
            borderColor: step.result ? '#22c55e' : '#f87171',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Status</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: step.result ? '#22c55e' : '#f87171' }}>
            {step.result ? '✓ ELIGIBLE' : '✗ INELIGIBLE'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function StudentAttendanceVisualizer() {
  const examples = useMemo(() => getExamplesOr('student-attendance', []), [])
  const [record, setRecord] = useState('PPALLP')

  const steps = useMemo(() => generateSteps(record), [record])

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
      setRecord(ex.record || ex.s || 'PPALLP')
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📋 Attendance Record', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Record (P/A/L)</div>
              <input
                type="text"
                value={record}
                onChange={(e) => {
                  setRecord(e.target.value.toUpperCase())
                  handleReset()
                }}
                placeholder="PPALLP"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  letterSpacing: '2px',
                }}
              />
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, record, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
