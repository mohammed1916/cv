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
import './Problem423Visualizer.css'

const EXAMPLES = getExamples('reconstruct-original-digits')

const DIGIT_WORDS = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
}

function generateSteps(inputStr) {
  const steps = []

  // Step 1: Count character frequencies
  const charCount = {}
  for (const char of inputStr) {
    charCount[char] = (charCount[char] ?? 0) + 1
  }

  steps.push({
    activeLine: 1,
    phase: 'count_chars',
    inputStr,
    charCount: { ...charCount },
    digitCount: {},
    usedChars: {},
    currentDigit: null,
    message: `Count all characters in input. Found ${Object.keys(charCount).length} unique characters.`,
  })

  const digitCount = {}
  const usedChars = { ...charCount }

  // Step 2: Extract digits with unique characters (0, 2, 4, 6, 8)
  const uniqueDigits = [
    { digit: 0, word: 'zero', uniqueChar: 'z' },
    { digit: 2, word: 'two', uniqueChar: 'w' },
    { digit: 4, word: 'four', uniqueChar: 'u' },
    { digit: 6, word: 'six', uniqueChar: 'x' },
    { digit: 8, word: 'eight', uniqueChar: 'g' },
  ]

  for (const { digit, word, uniqueChar } of uniqueDigits) {
    const count = usedChars[uniqueChar] ?? 0
    digitCount[digit] = count

    steps.push({
      activeLine: 2,
      phase: 'extract_unique',
      inputStr,
      charCount: { ...usedChars },
      digitCount: { ...digitCount },
      usedChars: { ...usedChars },
      currentDigit: digit,
      extractWord: word,
      extractChar: uniqueChar,
      message: `Extract '${word}' (unique char '${uniqueChar}'): found ${count} occurrence${count !== 1 ? 's' : ''}`,
    })

    // Remove used characters
    if (count > 0) {
      for (const char of word) {
        usedChars[char] = (usedChars[char] ?? 0) - count
      }
    }
  }

  // Step 3: Extract remaining digits (3, 5, 7, 9, 1)
  const remainingDigits = [
    { digit: 3, word: 'three', usesChar: 'h' },
    { digit: 5, word: 'five', usesChar: 'f' },
    { digit: 7, word: 'seven', usesChar: 's' },
    { digit: 9, word: 'nine', usesChar: 'i' },
    { digit: 1, word: 'one', usesChar: 'o' },
  ]

  for (const { digit, word, usesChar } of remainingDigits) {
    const count = usedChars[usesChar] ?? 0
    digitCount[digit] = count

    steps.push({
      activeLine: 3,
      phase: 'extract_remaining',
      inputStr,
      charCount: { ...usedChars },
      digitCount: { ...digitCount },
      usedChars: { ...usedChars },
      currentDigit: digit,
      extractWord: word,
      extractChar: usesChar,
      message: `Extract '${word}' (using char '${usesChar}'): found ${count} occurrence${count !== 1 ? 's' : ''}`,
    })

    // Remove used characters
    if (count > 0) {
      for (const char of word) {
        usedChars[char] = (usedChars[char] ?? 0) - count
      }
    }
  }

  // Step 4: Build result
  let result = ''
  for (let digit = 0; digit <= 9; digit++) {
    const count = digitCount[digit] ?? 0
    result += String(digit).repeat(count)
  }

  steps.push({
    activeLine: 4,
    phase: 'build_result',
    inputStr,
    charCount: charCount,
    digitCount: { ...digitCount },
    usedChars: {},
    currentDigit: null,
    result,
    message: `Concatenate all extracted digits in order: ${result}`,
  })

  return steps
}

function CharacterCountVisualization({ charCount, usedChars, currentExtractChar }) {
  const allChars = Array.from(new Set(Object.keys(charCount).concat(Object.keys(usedChars))))
    .filter(c => /[a-z]/.test(c))
    .sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Character Frequencies</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8
        }}>
          {allChars.map(char => {
            const count = charCount[char] ?? 0
            const remaining = usedChars[char] ?? 0
            const isCurrentChar = char === currentExtractChar
            const used = count - remaining

            return (
              <motion.div
                key={char}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: isCurrentChar ? '3px solid #0284c7' : '2px solid #cbd5e1',
                  backgroundColor: isCurrentChar ? '#dbeafe' : '#f1f5f9',
                  textAlign: 'center',
                }}
                animate={{
                  scale: isCurrentChar ? 1.05 : 1,
                  backgroundColor: isCurrentChar ? '#dbeafe' : '#f1f5f9',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 4 }}>'{char}'</div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  <div>{count} total</div>
                  {used > 0 && <div style={{ color: '#059669' }}>-{used} used</div>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DigitCountVisualization({ digitCount, currentDigit, extractWord }) {
  const digits = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Digit Count</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {digits.map(digit => {
            const count = digitCount[digit] ?? 0
            const isCurrent = digit === currentDigit
            const hasCount = count > 0

            return (
              <motion.div
                key={digit}
                style={{
                  padding: 16,
                  borderRadius: 6,
                  border: isCurrent ? '3px solid #8b5cf6' : hasCount ? '2px solid #10b981' : '2px solid #cbd5e1',
                  backgroundColor: isCurrent ? '#f3e8ff' : hasCount ? '#ecfdf5' : '#f1f5f9',
                  textAlign: 'center',
                }}
                animate={{
                  scale: isCurrent ? 1.08 : hasCount ? 1.02 : 1,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: isCurrent ? '#6b21a8' : hasCount ? '#047857' : '#64748b' }}>
                  {digit}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: isCurrent ? '#7c3aed' : hasCount ? '#10b981' : '#94a3b8' }}>
                  ×{count}
                </div>
                {isCurrent && extractWord && (
                  <div style={{ fontSize: 10, marginTop: 6, color: '#6b21a8', fontStyle: 'italic' }}>
                    {extractWord}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ResultVisualization({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Final Result</div>
      {result ? (
        <motion.div
          style={{
            padding: 20,
            backgroundColor: '#ecfdf5',
            borderRadius: 8,
            border: '2px solid #10b981',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#047857',
            letterSpacing: 4,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {result}
        </motion.div>
      ) : (
        <div style={{
          padding: 20,
          backgroundColor: '#f1f5f9',
          borderRadius: 8,
          border: '2px solid #cbd5e1',
          textAlign: 'center',
          color: '#64748b',
        }}>
          (building result...)
        </div>
      )}
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
        <CharacterCountVisualization
          charCount={step?.charCount || {}}
          usedChars={step?.usedChars || {}}
          currentExtractChar={step?.extractChar}
        />

        <DigitCountVisualization
          digitCount={step?.digitCount || {}}
          currentDigit={step?.currentDigit}
          extractWord={step?.extractWord}
        />

        <ResultVisualization result={step?.result} />
      </div>
    </div>
  )
}

export default function Problem423Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { tokens: 'zerozerozerozerotwotwotwotwo', label: 'Simple' })
  const SOLUTION_CODE = useSolutionCode('reconstruct-original-digits')

  const steps = useMemo(
    () =>
      generateSteps(ex.tokens).map((current) => ({
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
      title: '🔢 Digit Extraction',
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
