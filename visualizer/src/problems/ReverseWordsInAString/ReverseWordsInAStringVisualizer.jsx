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
import { getExamples } from '../../config/examplesRegistry'
import './ReverseWordsInAStringVisualizer.css'

const EXAMPLES = getExamples('reverse-words-in-a-string') || [
  { label: 'Example 1', s: '  Hello World  ' },
  { label: 'Example 2', s: 'a good   example' },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def reverseWords(s):' },
  { line: 2, text: '    # Split by whitespace' },
  { line: 3, text: '    words = s.split()' },
  { line: 4, text: '    # Reverse the list' },
  { line: 5, text: '    words.reverse()' },
  { line: 6, text: '    # Join with space' },
  { line: 7, text: '    return " ".join(words)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s) {
  const steps = []

  if (!s || s.trim().length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty string',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    input: s,
    message: `Reverse words in: "${s}"`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    input: s,
    message: 'Split by whitespace',
    relatedLines: [3],
  })

  const words = s.split(/\s+/).filter(w => w.length > 0)

  steps.push({
    activeLine: 3,
    input: s,
    words: [...words],
    message: `Words: ${words.map(w => `"${w}"`).join(', ')}`,
    relatedLines: [3],
  })

  steps.push({
    activeLine: 5,
    input: s,
    words: [...words],
    message: 'Reverse the array',
    relatedLines: [5],
  })

  const reversed = [...words].reverse()

  for (let i = 0; i < reversed.length; i++) {
    steps.push({
      activeLine: 5,
      input: s,
      words: [...words],
      reversed: reversed.slice(0, i + 1),
      message: `Reversed progress: ${reversed.slice(0, i + 1).map(w => `"${w}"`).join(', ')}`,
      relatedLines: [5],
    })
  }

  steps.push({
    activeLine: 7,
    input: s,
    words: [...words],
    reversed: [...reversed],
    message: 'Join with space',
    relatedLines: [7],
  })

  const result = reversed.join(' ')

  steps.push({
    activeLine: 7,
    input: s,
    words: [...words],
    reversed: [...reversed],
    result,
    done: true,
    message: `Result: "${result}"`,
    relatedLines: [7],
  })

  return steps
}

function WordBox({ word, isReversed }) {
  return (
    <motion.div
      style={{
        padding: '8px 12px',
        backgroundColor: isReversed ? '#86efac' : '#dbeafe',
        borderRadius: 4,
        border: `2px solid ${isReversed ? '#22c55e' : '#0c4a6e'}`,
        fontSize: 13,
        fontWeight: 600,
        color: isReversed ? '#065f46' : '#0c4a6e',
        fontFamily: 'monospace',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      "{word}"
    </motion.div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Split → Reverse → Join: three-step word reversal.
        </div>
      </div>

      {step.input && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Input String
          </div>
          <div style={{ fontSize: 13, color: '#0c4a6e', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            "{step.input}"
          </div>
        </motion.div>
      )}

      {step.words && step.words.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Words (Original Order)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.words.map((word, idx) => (
              <WordBox key={idx} word={word} isReversed={false} />
            ))}
          </div>
        </motion.div>
      )}

      {step.reversed && step.reversed.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Words (Reversed Order)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.reversed.map((word, idx) => (
              <WordBox key={idx} word={word} isReversed={true} />
            ))}
          </div>
        </motion.div>
      )}

      {step.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Result String
          </div>
          <div style={{ fontSize: 13, color: '#065f46', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function ReverseWordsInAStringVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.s || '  Hello World  ')
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.s); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '📝 Reverse Words',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
