import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './CountStudentsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'SELECT department_id, COUNT(*) as student_number' },
  { line: 2, text: 'FROM student' },
  { line: 3, text: 'GROUP BY department_id;' },
]

const PATTERNS = ['init', 'grouping', 'counting', 'done']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'grouping',
  3: 'counting',
}

function generateSteps(students) {
  const steps = []

  if (!Array.isArray(students) || students.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 3,
      relatedLines: [1, 2, 3],
      message: 'No students to count.',
      departments: {},
      result: [],
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 1,
    relatedLines: [1, 2, 3],
    message: 'Initialize query to count students by department.',
    departments: {},
    result: [],
  })

  const deptMap = {}

  for (const student of students) {
    const deptId = student.department_id
    if (!deptMap[deptId]) {
      deptMap[deptId] = { department_id: deptId, count: 0 }
    }
    deptMap[deptId].count++

    steps.push({
      phase: 'grouping',
      activeLine: 2,
      relatedLines: [1, 2],
      message: `Processing student "${student.student_name}" from department ${deptId}`,
      departments: { ...deptMap },
      result: Object.values(deptMap),
      currentStudent: student,
    })
  }

  const result = Object.values(deptMap).sort((a, b) => a.department_id - b.department_id)

  steps.push({
    phase: 'counting',
    activeLine: 3,
    relatedLines: [1, 2, 3],
    message: `Grouped by department and counted students`,
    departments: deptMap,
    result,
  })

  steps.push({
    phase: 'done',
    activeLine: 3,
    relatedLines: [1, 2, 3],
    message: `Complete. Found ${result.length} departments with ${students.length} total students`,
    departments: deptMap,
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
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--border)'
                  e.target.style.borderColor = 'var(--text-muted)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--surface2)'
                  e.target.style.borderColor = 'var(--text-muted)'
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.currentStudent && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #f87171',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ea0c0c', marginBottom: 6 }}>Current Student</div>
          <div style={{ fontSize: 13, color: '#5577a4', fontFamily: 'monospace', fontWeight: 600 }}>
            {step.currentStudent.student_name}
          </div>
          <div style={{ fontSize: 11, color: '#627794', marginTop: 4 }}>
            Dept: {step.currentStudent.department_id}
          </div>
        </motion.div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>
          Department Summary ({step?.result?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
          <AnimatePresence mode="popLayout">
            {step?.result?.map((dept, idx) => (
              <motion.div
                key={`${step.result.length}-${dept.department_id}`}
                style={{
                  padding: '12px',
                  borderRadius: 6,
                  border: '2px solid',
                  backgroundColor: 'var(--surface2)',
                  borderColor: '#f87171',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4' }}>
                    Department {dept.department_id}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#22c55e',
                    backgroundColor: 'var(--surface2)',
                    borderRadius: 4,
                    padding: '4px 12px',
                    border: '1px solid #22c55e',
                  }}
                >
                  {dept.count}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {step?.result && step.result.length > 0 && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Total Students</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#178740' }}>
            {step.result.reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Across {step.result.length} department{step.result.length !== 1 ? 's' : ''}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function CountStudentsVisualizer() {
  const examples = useMemo(() => getExamplesOr('count-students', []), [])
  const [studentsInput, setStudentsInput] = useState(
    JSON.stringify([
      { student_id: 1, student_name: 'Alice', department_id: 1 },
      { student_id: 2, student_name: 'Bob', department_id: 1 },
      { student_id: 3, student_name: 'Charlie', department_id: 2 },
      { student_id: 4, student_name: 'Diana', department_id: 2 },
      { student_id: 5, student_name: 'Eve', department_id: 3 },
    ])
  )

  const { students, inputError } = useMemo(() => {
    try {
      const s = JSON.parse(studentsInput)
      if (!Array.isArray(s)) throw new Error('Input must be array')
      return { students: s, inputError: '' }
    } catch (e) {
      return { students: [], inputError: e.message }
    }
  }, [studentsInput])

  const steps = useMemo(() => generateSteps(students), [students])

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
      setStudentsInput(JSON.stringify(ex.students || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'SQL Query' },
    { id: 'viz', title: '📊 Students & Departments', dockMode: 'split-right' },
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Student Data</div>
              <textarea
                value={studentsInput}
                onChange={(e) => {
                  setStudentsInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 80,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder="[{student_id, student_name, department_id}]"
              />
              {inputError && (
                <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel students={students} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, studentsInput, students, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"students","label":"students","type":"array"}]}
        values={{ students: studentsInput }}
        onChange={(k, v) => { if (k === 'students') setStudentsInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
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
