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
import './KeyboardRowVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findWords(self, words: List[str]) -> List[str]:' },
  { line: 3, text: '        rows = [' },
  { line: 4, text: '            set("qwertyuiop"),' },
  { line: 5, text: '            set("asdfghjkl"),' },
  { line: 6, text: '            set("zxcvbnm")' },
  { line: 7, text: '        ]' },
  { line: 8, text: '        result = []' },
  { line: 9, text: '        ' },
  { line: 10, text: '        for word in words:' },
  { line: 11, text: '            word_lower = word.lower()' },
  { line: 12, text: '            for row in rows:' },
  { line: 13, text: '                if all(c in row for c in word_lower):' },
  { line: 14, text: '                    result.append(word)' },
  { line: 15, text: '                    break' },
  { line: 16, text: '        return result' },
]

const PATTERNS = ['init', 'check_word', 'check_row', 'found', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  10: 'check_word',
  13: 'check_row',
  14: 'found',
  16: 'done',
}

const KEYBOARD_ROWS = [
  { name: 'Row 1', chars: 'qwertyuiop', color: '#38bdf8' },
  { name: 'Row 2', chars: 'asdfghjkl', color: '#a78bfa' },
  { name: 'Row 3', chars: 'zxcvbnm', color: '#f59e0b' },
]

function generateSteps(words) {
  const steps = []

  if (!Array.isArray(words) || words.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 16,
      relatedLines: [16],
      message: 'Empty input.',
      result: [],
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5, 6, 7],
    message: 'Initialize 3 keyboard rows.',
    result: [],
  })

  const result = []

  for (const word of words) {
    const wordLower = word.toLowerCase()

    steps.push({
      phase: 'check_word',
      activeLine: 11,
      relatedLines: [10, 11],
      message: `Checking "${word}"`,
      word,
      wordLower,
      result: [...result],
      currentRow: -1,
    })

    let found = false
    for (let rowIdx = 0; rowIdx < KEYBOARD_ROWS.length; rowIdx++) {
      const rowChars = KEYBOARD_ROWS[rowIdx].chars
      const allCharsInRow = wordLower.split('').every(c => rowChars.includes(c))

      steps.push({
        phase: 'check_row',
        activeLine: 13,
        relatedLines: [12, 13],
        message: `Check ${KEYBOARD_ROWS[rowIdx].name}: ${allCharsInRow ? '✓ All chars match' : '✗ Missing chars'}`,
        word,
        wordLower,
        result: [...result],
        currentRow: rowIdx,
        allCharsInRow,
      })

      if (allCharsInRow) {
        result.push(word)
        found = true

        steps.push({
          phase: 'found',
          activeLine: 14,
          relatedLines: [14, 15],
          message: `Found! "${word}" is on ${KEYBOARD_ROWS[rowIdx].name}`,
          word,
          wordLower,
          result: [...result],
          currentRow: rowIdx,
        })

        break
      }
    }

    if (!found) {
      steps.push({
        phase: 'check_word',
        activeLine: 10,
        relatedLines: [10],
        message: `"${word}" not on same row`,
        word,
        wordLower,
        result: [...result],
        currentRow: -1,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 16,
    relatedLines: [16],
    message: `Result: [${result.map(w => `"${w}"`).join(', ')}]`,
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

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Keyboard Rows</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {KEYBOARD_ROWS.map((row, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: 4,
                border: '2px solid',
                backgroundColor: '#1e293b',
                borderColor: step?.currentRow === idx ? row.color : '#475569',
                fontFamily: 'monospace',
                fontSize: 12,
                color: step?.currentRow === idx ? row.color : '#64748b',
                fontWeight: step?.currentRow === idx ? 600 : 400,
              }}
            >
              {row.name}: {row.chars}
            </div>
          ))}
        </div>
      </div>

      {step?.word && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Current Word</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
            "{step.word}"
          </div>
        </div>
      )}

      {step?.result && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
            Found Words ({step.result.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 40 }}>
            <AnimatePresence mode="popLayout">
              {step.result.map((w, idx) => (
                <motion.div
                  key={`${step.result.length}-${idx}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #22c55e',
                    backgroundColor: '#1e293b',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#22c55e',
                    fontWeight: 600,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  "{w}"
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.result && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Total Words</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>{step.result.length}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function KeyboardRowVisualizer() {
  const examples = useMemo(() => getExamplesOr('keyboard-row', []), [])
  const [wordsInput, setWordsInput] = useState('["Hello","Alaska","Dad","Peace"]')

  const { words, inputError } = useMemo(() => {
    try {
      const w = JSON.parse(wordsInput)
      if (!Array.isArray(w)) throw new Error('Input must be array')
      return { words: w, inputError: '' }
    } catch (e) {
      return { words: [], inputError: e.message }
    }
  }, [wordsInput])

  const steps = useMemo(() => generateSteps(words), [words])

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
      setWordsInput(JSON.stringify(ex.words || ex))
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
        title: '⌨ Keyboard Row',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Words</div>
              <textarea
                value={wordsInput}
                onChange={(e) => {
                  setWordsInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder='["Hello","Alaska","Dad","Peace"]'
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel words={words} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, wordsInput, words, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"words","label":"words","type":"array"}]}
        values={{ words: wordsInput }}
        onChange={(k, v) => { if (k === 'words') setWordsInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
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
