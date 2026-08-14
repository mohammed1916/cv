import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem439Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('ternary-expression-parser')

const PATTERNS = ['complete', 'init', 'process_ternary', 'push_char', 'push_ternary', 'read_char', 'skip_colon', 'start_from_end']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'start_from_end',
  3: 'read_char',
  4: 'process_ternary',
  5: 'push_ternary',
  6: 'skip_colon',
  7: 'push_char',
  8: 'complete'
}


const EXAMPLES = getExamples('ternary-expression-parser')

function generateSteps(expression) {
  const steps = []

  if (!expression) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      expression: '',
      stack: [],
      pos: 0,
      result: '',
      message: 'Empty expression',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    expression,
    stack: [],
    pos: 0,
    result: '',
    message: `Parse: ${expression}`,
  })

  let stack = []
  let pos = expression.length - 1

  steps.push({
    activeLine: 2,
    phase: 'start_from_end',
    expression,
    stack: [],
    pos,
    result: '',
    message: 'Start from end, process right-to-left',
  })

  while (pos >= 0) {
    const char = expression[pos]

    steps.push({
      activeLine: 3,
      phase: 'read_char',
      expression,
      stack: [...stack],
      pos,
      currentChar: char,
      result: '',
      message: `Read: '${char}'`,
    })

    if (char === '?') {
      const falseVal = stack.pop()
      const trueVal = stack.pop()

      steps.push({
        activeLine: 4,
        phase: 'process_ternary',
        expression,
        stack: [...stack],
        pos,
        currentChar: char,
        result: '',
        message: `Ternary: pop true='${trueVal}', false='${falseVal}'`,
      })

      stack.push(`(${falseVal} ? ${trueVal})`);

      steps.push({
        activeLine: 5,
        phase: 'push_ternary',
        expression,
        stack: [...stack],
        pos,
        result: '',
        message: `Push ternary expression`,
      })
    } else if (char === ':') {
      steps.push({
        activeLine: 6,
        phase: 'skip_colon',
        expression,
        stack: [...stack],
        pos,
        currentChar: char,
        result: '',
        message: 'Skip colon (handled in ternary)',
      })
    } else if (char !== ' ') {
      stack.push(char)

      steps.push({
        activeLine: 7,
        phase: 'push_char',
        expression,
        stack: [...stack],
        pos,
        currentChar: char,
        result: '',
        message: `Push: '${char}'`,
      })
    }

    pos--
  }

  const result = stack.length > 0 ? stack[0] : ''

  steps.push({
    activeLine: 8,
    phase: 'complete',
    expression,
    stack: [...stack],
    pos: -1,
    result,
    isComplete: true,
    message: `Result: '${result}'`,
  })

  return steps
}

function ExpressionVisualization({ expression, pos }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Expression</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          {expression}
        </div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {expression && expression.split('').map((char, idx) => {
            const isActive = idx === pos

            return (
              <motion.div
                key={idx}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: isActive ? '#dc2626' : char === ' ' ? '#f1f5f9' : '#dbeafe',
                  border: isActive ? '2px solid #991b1b' : char === ' ' ? '1px solid #cbd5e1' : '2px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? '#white' : char === ' ' ? '#94a3b8' : '#0c4a6e',
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {char === ' ' ? '·' : char}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StackVisualization({ stack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Processing Stack</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        {stack && stack.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
            {stack.map((item, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: 6,
                  border: '2px solid #8b5cf6',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b21a8',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {String(item).substring(0, 50)}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Stack empty</div>
        )}
      </div>
    </div>
  )
}

function ResultVisualization({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Result</div>
      <div style={{
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        border: '2px solid #10b981',
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#047857',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          {result || '...'}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <ExpressionVisualization
        expression={step?.expression}
        pos={step?.pos}
      />

      <StackVisualization
        stack={step?.stack}
      />

      <ResultVisualization
        result={step?.result}
      />
    </div>
  )
}

export default function Problem439Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [expressionInput, setExpressionInput] = useState("T?2:3");
  const { expression, inputError } = useMemo(() => {
    try {
      const parsedExpression = expressionInput;
      return { expression: parsedExpression, inputError: '' };
    } catch (e) {
      return { expression: "T?2:3", inputError: e.message };
    }
  }, [expressionInput]);

  const steps = useMemo(
    () =>
      generateSteps(expression).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [expression]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setExpressionInput(String(e.expression)); handleReset(); }, [handleReset]);

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
      title: '🤔 Parser',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
          onSpeedChange={e => setSpeed(Number(e.target.value
    </>))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
