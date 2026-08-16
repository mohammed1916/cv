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
import './HighestAnswerRateVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'SELECT q.question_id, ROUND(COUNT(a.answer_id)/' },
  { line: 2, text: '       (SELECT COUNT(*) FROM answer_submit' },
  { line: 3, text: '        WHERE question_id = q.question_id), 3) AS rate' },
  { line: 4, text: 'FROM question q' },
  { line: 5, text: 'LEFT JOIN answer_submit a' },
  { line: 6, text: '  ON q.question_id = a.question_id' },
  { line: 7, text: '  AND a.is_accepted = 1' },
  { line: 8, text: 'GROUP BY q.question_id' },
  { line: 9, text: 'ORDER BY rate DESC' },
  { line: 10, text: 'LIMIT 1' },
]

const PATTERNS = ['load_questions', 'load_answers', 'join_data', 'aggregate', 'calculate_rate', 'find_highest', 'done']
const LINE_PATTERN_MAP = {
  4: 'load_questions',
  5: 'load_answers',
  6: 'join_data',
  8: 'aggregate',
  3: 'calculate_rate',
  9: 'find_highest',
  10: 'done',
}

const DEFAULT_QUESTIONS = [
  { id: 1, submissions: 3 },
  { id: 2, submissions: 5 },
  { id: 3, submissions: 2 },
]

const DEFAULT_ANSWERS = [
  { id: 1, question_id: 1, is_accepted: 1 },
  { id: 2, question_id: 1, is_accepted: 0 },
  { id: 3, question_id: 1, is_accepted: 1 },
  { id: 4, question_id: 2, is_accepted: 1 },
  { id: 5, question_id: 2, is_accepted: 0 },
  { id: 6, question_id: 2, is_accepted: 1 },
  { id: 7, question_id: 2, is_accepted: 1 },
  { id: 8, question_id: 3, is_accepted: 0 },
  { id: 9, question_id: 3, is_accepted: 1 },
]

function aggregateData(questions, answers) {
  const aggregation = {}

  for (const q of questions) {
    aggregation[q.id] = {
      question_id: q.id,
      total_submissions: q.submissions,
      accepted_count: 0,
      answer_rate: 0,
    }
  }

  for (const a of answers) {
    if (aggregation[a.question_id]) {
      if (a.is_accepted) {
        aggregation[a.question_id].accepted_count++
      }
    }
  }

  for (const qId in aggregation) {
    const agg = aggregation[qId]
    agg.answer_rate = agg.total_submissions > 0 ? (agg.accepted_count / agg.total_submissions).toFixed(3) : '0.000'
  }

  return Object.values(aggregation)
}

function generateSteps(questions, answers) {
  const steps = []

  if (!questions || questions.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 10,
      relatedLines: [10],
      message: 'No questions to process',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'load_questions',
    activeLine: 4,
    relatedLines: [4],
    message: `Load ${questions.length} questions from database`,
    questions,
    answers: [],
    aggregation: [],
  })

  steps.push({
    phase: 'load_answers',
    activeLine: 5,
    relatedLines: [5, 6, 7],
    message: `Load ${answers.length} answer submissions (filtered for accepted answers)`,
    questions,
    answers,
    aggregation: [],
  })

  steps.push({
    phase: 'join_data',
    activeLine: 6,
    relatedLines: [5, 6, 7],
    message: 'Join questions with accepted answer submissions',
    questions,
    answers,
    aggregation: [],
  })

  steps.push({
    phase: 'aggregate',
    activeLine: 8,
    relatedLines: [8],
    message: 'Group by question_id and count accepted answers',
    questions,
    answers,
    aggregation: aggregateData(questions, answers),
  })

  const aggregation = aggregateData(questions, answers)

  steps.push({
    phase: 'calculate_rate',
    activeLine: 3,
    relatedLines: [1, 2, 3],
    message: 'Calculate answer rate (accepted_count / total_submissions)',
    questions,
    answers,
    aggregation,
  })

  const sorted = [...aggregation].sort((a, b) => parseFloat(b.answer_rate) - parseFloat(a.answer_rate))

  steps.push({
    phase: 'find_highest',
    activeLine: 9,
    relatedLines: [9],
    message: `Sort by answer_rate DESC: Q${sorted[0].question_id} has highest rate (${sorted[0].answer_rate})`,
    questions,
    answers,
    aggregation,
    sorted,
  })

  steps.push({
    phase: 'done',
    activeLine: 10,
    relatedLines: [10],
    message: `Result: Question ${sorted[0].question_id} with answer rate ${sorted[0].answer_rate}`,
    questions,
    answers,
    aggregation,
    result: sorted[0],
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  if (!step) return null

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

      {['load_questions', 'load_answers', 'join_data'].includes(step.phase) && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Questions Table</div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--text-muted)', borderRadius: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--border)' }}>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>question_id</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>submissions</th>
                </tr>
              </thead>
              <tbody>
                {step.questions?.map((q) => (
                  <tr key={q.id} className="table-row">
                    <td className="table-cell">{q.id}</td>
                    <td className="table-cell">{q.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {['load_answers', 'join_data', 'aggregate', 'calculate_rate', 'find_highest', 'done'].includes(step.phase) && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>
            Answer Submissions (is_accepted = 1)
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--text-muted)', borderRadius: 4, maxHeight: 200 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--border)' }}>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>answer_id</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>question_id</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>is_accepted</th>
                </tr>
              </thead>
              <tbody>
                {step.answers?.filter((a) => a.is_accepted === 1).map((a) => (
                  <tr key={a.id} className="table-row">
                    <td className="table-cell">{a.id}</td>
                    <td className="table-cell">{a.question_id}</td>
                    <td className="table-cell" style={{ color: '#178740', fontWeight: 600 }}>1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {['aggregate', 'calculate_rate', 'find_highest', 'done'].includes(step.phase) && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Aggregated Results</div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--text-muted)', borderRadius: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--border)' }}>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>question_id</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>total_submissions</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>accepted_count</th>
                  <th className="table-cell" style={{ color: '#a36907', fontWeight: 600 }}>answer_rate</th>
                </tr>
              </thead>
              <tbody>
                {(step.sorted || step.aggregation || []).map((agg) => (
                  <motion.tr
                    key={agg.question_id}
                    className={`table-row ${step.result?.question_id === agg.question_id ? 'highlighted' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="table-cell">{agg.question_id}</td>
                    <td className="table-cell">{agg.total_submissions}</td>
                    <td className="table-cell">{agg.accepted_count}</td>
                    <td
                      className="table-cell"
                      style={{
                        color: step.result?.question_id === agg.question_id ? '#22c55e' : 'var(--border)',
                        fontWeight: step.result?.question_id === agg.question_id ? 600 : 400,
                      }}
                    >
                      {agg.answer_rate}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step.result && (
        <motion.div
          className="result-highlight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#178740', marginBottom: 8 }}>HIGHEST ANSWER RATE</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#5577a4', marginBottom: 4 }}>
            Question ID: {step.result.question_id}
          </div>
          <div style={{ fontSize: 13, color: '#5a779b' }}>Answer Rate: {step.result.answer_rate}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function HighestAnswerRateVisualizer() {
  const examples = useMemo(() => getExamplesOr('highest-answer-rate', []), [])
  const [questionsInput, setQuestionsInput] = useState(JSON.stringify(DEFAULT_QUESTIONS))
  const [answersInput, setAnswersInput] = useState(JSON.stringify(DEFAULT_ANSWERS))

  const { questions, answers, inputError } = useMemo(() => {
    try {
      const q = JSON.parse(questionsInput)
      const a = JSON.parse(answersInput)
      if (!Array.isArray(q)) throw new Error('Questions must be array')
      if (!Array.isArray(a)) throw new Error('Answers must be array')
      return { questions: q, answers: a, inputError: '' }
    } catch (e) {
      return { questions: [], answers: [], inputError: e.message }
    }
  }, [questionsInput, answersInput])

  const steps = useMemo(() => generateSteps(questions, answers), [questions, answers])

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

  const applyExample = useCallback((ex) => {
    if (ex.questions) {
      setQuestionsInput(JSON.stringify(ex.questions))
    }
    if (ex.answers) {
      setAnswersInput(JSON.stringify(ex.answers))
    }
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "SQL Solution" },
    { id: 'right', title: "Data Visualization", dockMode: 'split-right' },
    { id: 'bottom', title: "bottom", dockMode: 'split-bottom' },
  ], [])
  const panelContents = {
    left: (<CodeTracePanel
              codeLines={SOLUTION_CODE}
              currentLineNumber={step?.activeLine}
              relatedLineNumbers={step?.relatedLines || []}
              connectivity={connectivity}
            >
              {showPatternOverlay && (
                <CodePatternAnnotations
                  codeLines={SOLUTION_CODE}
                  patterns={PATTERNS}
                  linePatternMap={LINE_PATTERN_MAP}
                  onLineRef={setActiveLineDom}
                />
              )}
            </CodeTracePanel>),
    right: (<VisualizationPanel step={step} applyExample={applyExample} examples={examples} />),
    bottom: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, overflow: 'auto' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', display: 'block', marginBottom: 6 }}>
                Questions (JSON)
              </label>
              <textarea
                value={questionsInput}
                onChange={(e) => setQuestionsInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  backgroundColor: 'var(--code-bg)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  minHeight: 60,
                  resize: 'vertical',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', display: 'block', marginBottom: 6 }}>
                Answer Submissions (JSON)
              </label>
              <textarea
                value={answersInput}
                onChange={(e) => setAnswersInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  backgroundColor: 'var(--code-bg)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  minHeight: 60,
                  resize: 'vertical',
                }}
              />
            </div>
            {inputError && <div style={{ color: '#e91414', fontSize: 11, fontWeight: 600 }}>Error: {inputError}</div>}
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"questions","label":"questions","type":"array"},{"key":"answers","label":"answers","type":"array"}]}
        values={{ questions: questionsInput, answers: answersInput }}
        onChange={(k, v) => { if (k === 'questions') setQuestionsInput(v); if (k === 'answers') setAnswersInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
            {panelDivs.bottom && createPortal(panelContents.bottom, panelDivs.bottom)}
          </>
        )}
        <FloatingPanel title="Playback Controls">
<PlaybackControls
          onPlay={togglePlay}
          onPause={() => togglePlay()}
          onNext={stepForward}
          onPrev={stepBack}
          onReset={handleReset}
          isPlaying={isPlaying}
          speed={speed}
          onSpeedChange={setSpeed}
          currentStep={stepIndex + 1}
          totalSteps={steps.length}
          isDone={isDone}
          onShowPatterns={() => setShowPatternOverlay(!showPatternOverlay)}
          showPatterns={showPatternOverlay}
          accent="#f59e0b"
        />
        </FloatingPanel>
      </>
    </div>
  )
}
