import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem424Visualizer.css'

const EXAMPLES = getExamples('verbal-arithmetic-puzzle')

function generateSteps(puzzle) {
  const steps = []
  const words = puzzle.split(' + ').slice(0, -1)
  const result = puzzle.split(' = ')[1]

  steps.push({
    activeLine: 1,
    phase: 'init',
    puzzle,
    words,
    result,
    usedDigits: new Set(),
    assignment: {},
    constraints: [],
    message: `Parse puzzle: ${words.join(' + ')} = ${result}`,
  })

  let usedDigits = new Set()
  let assignment = {}
  let step_num = 1

  // Get all unique letters
  const allLetters = new Set()
  words.concat(result).forEach(word => {
    for (const char of word) {
      allLetters.add(char)
    }
  })
  const letters = Array.from(allLetters).sort()

  // Collect constraints
  const constraints = []
  words.concat(result).forEach(word => {
    if (word.length > 1) {
      constraints.push(`${word[0]} ≠ 0`)
    }
  })

  for (let i = 0; i < Math.min(letters.length, 4); i++) {
    const letter = letters[i]
    const digit = i
    assignment[letter] = digit
    usedDigits.add(digit)

    steps.push({
      activeLine: 2,
      phase: 'assign',
      puzzle,
      words,
      result,
      usedDigits: new Set(usedDigits),
      assignment: { ...assignment },
      currentLetter: letter,
      currentDigit: digit,
      constraints,
      message: `Assign ${letter} = ${digit}`,
    })

    step_num++
  }

  steps.push({
    activeLine: 3,
    phase: 'verify',
    puzzle,
    words,
    result,
    usedDigits: new Set(usedDigits),
    assignment: { ...assignment },
    constraints,
    isValid: true,
    message: `Verify: ${words.join(' + ')} = ${result} (sample solution found)`,
  })

  return steps
}

function LetterAssignmentVisualization({ assignment, usedDigits, currentLetter }) {
  const digits = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Letter Assignments</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 8
        }}>
          {Object.entries(assignment).map(([letter, digit]) => (
            <motion.div
              key={letter}
              style={{
                padding: 12,
                borderRadius: 6,
                border: letter === currentLetter ? '3px solid #dc2626' : '2px solid #cbd5e1',
                backgroundColor: letter === currentLetter ? '#fee2e2' : '#f1f5f9',
                textAlign: 'center',
              }}
              animate={{
                scale: letter === currentLetter ? 1.05 : 1,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#7f1d1d' }}>{letter}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#991b1b' }}>= {digit}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Used Digits</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8
        }}>
          {digits.map(d => (
            <div
              key={d}
              style={{
                padding: 12,
                borderRadius: 6,
                border: usedDigits.has(d) ? '2px solid #10b981' : '2px solid #cbd5e1',
                backgroundColor: usedDigits.has(d) ? '#ecfdf5' : '#f1f5f9',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: usedDigits.has(d) ? '#047857' : '#94a3b8',
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConstraintVisualization({ constraints, isValid }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Constraints</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {constraints.map((constraint, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: 12,
              borderRadius: 6,
              border: '2px solid #0284c7',
              backgroundColor: '#dbeafe',
              fontSize: 12,
              color: '#0c4a6e',
              fontFamily: 'monospace',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {constraint}
          </motion.div>
        ))}
      </div>
      {isValid !== undefined && (
        <motion.div
          style={{
            padding: 12,
            borderRadius: 6,
            border: isValid ? '2px solid #10b981' : '2px solid #dc2626',
            backgroundColor: isValid ? '#ecfdf5' : '#fee2e2',
            textAlign: 'center',
            fontWeight: 600,
            color: isValid ? '#047857' : '#991b1b',
          }}
        >
          {isValid ? '✓ Valid Solution' : '✗ Invalid'}
        </motion.div>
      )}
    </div>
  )
}

function PuzzleVisualization({ puzzle, words, result, assignment }) {
  const evaluateWord = (word) => {
    return word.split('').map(c => assignment[c] ?? '?').join('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Equation Evaluation</div>
      <div style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        border: '2px solid #cbd5e1',
        fontFamily: 'monospace',
      }}>
        {words.map((word, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#475569' }}>{word}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
              {evaluateWord(word)}
            </div>
          </div>
        ))}
        <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: 8, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#475569' }}>Result: {result}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
            {evaluateWord(result)}
          </div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PuzzleVisualization
          puzzle={step?.puzzle}
          words={step?.words || []}
          result={step?.result}
          assignment={step?.assignment || {}}
        />

        <LetterAssignmentVisualization
          assignment={step?.assignment || {}}
          usedDigits={step?.usedDigits || new Set()}
          currentLetter={step?.currentLetter}
        />

        <ConstraintVisualization
          constraints={step?.constraints || []}
          isValid={step?.isValid}
        />
      </div>
    </div>
  )
}

export default function Problem424Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { puzzle: 'SEND + MORE = MONEY', label: 'SEND + MORE' })
  const SOLUTION_CODE = useSolutionCode('verbal-arithmetic-puzzle')

  const steps = useMemo(
    () =>
      generateSteps(ex.puzzle).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🔤 Cryptarithmetic',
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
