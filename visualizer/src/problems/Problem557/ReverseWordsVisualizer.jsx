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
import './ReverseWordsVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def reverseWords(self, s: str) -> str:' },
  { line: 3, text: '        words = s.split()' },
  { line: 4, text: '        reversed_words = []' },
  { line: 5, text: '        ' },
  { line: 6, text: '        for word in words:' },
  { line: 7, text: '            reversed_word = word[::-1]' },
  { line: 8, text: '            reversed_words.append(reversed_word)' },
  { line: 9, text: '        ' },
  { line: 10, text: '        return " ".join(reversed_words)' },
]

const PATTERNS = ['split', 'iterate', 'reverse', 'append', 'join']
const LINE_PATTERN_MAP = {
  3: 'split',
  6: 'iterate',
  7: 'reverse',
  8: 'append',
  10: 'join',
}

function generateSteps(inputString) {
  const steps = []

  if (!inputString || typeof inputString !== 'string') {
    steps.push({
      phase: 'done',
      activeLine: 10,
      relatedLines: [10],
      message: 'Invalid input.',
      result: '',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'split',
    activeLine: 3,
    relatedLines: [3],
    message: `Input: "${inputString}"`,
    input: inputString,
  })

  const words = inputString.split(' ')

  steps.push({
    phase: 'split',
    activeLine: 3,
    relatedLines: [3],
    message: `Split into ${words.length} word(s): [${words.map((w) => `"${w}"`).join(', ')}]`,
    words,
    wordsCount: words.length,
  })

  steps.push({
    phase: 'iterate',
    activeLine: 4,
    relatedLines: [4],
    message: `Initialize empty list for reversed words`,
    words,
    reversedWords: [],
  })

  const reversedWords = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    steps.push({
      phase: 'iterate',
      activeLine: 6,
      relatedLines: [6],
      message: `Processing word ${i + 1}/${words.length}: "${word}"`,
      currentWordIndex: i,
      currentWord: word,
      words,
      reversedWords: [...reversedWords],
    })

    const reversed = word.split('').reverse().join('')

    steps.push({
      phase: 'reverse',
      activeLine: 7,
      relatedLines: [7],
      message: `Reverse "${word}" → "${reversed}"`,
      currentWordIndex: i,
      currentWord: word,
      reversedWord: reversed,
      words,
      reversedWords: [...reversedWords],
    })

    reversedWords.push(reversed)

    steps.push({
      phase: 'append',
      activeLine: 8,
      relatedLines: [8],
      message: `Append "${reversed}" to result list`,
      currentWordIndex: i,
      reversedWord: reversed,
      words,
      reversedWords: [...reversedWords],
    })
  }

  const result = reversedWords.join(' ')

  steps.push({
    phase: 'join',
    activeLine: 10,
    relatedLines: [10],
    message: `Join words with space: "${result}"`,
    result,
    reversedWords,
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

      {step?.input && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Input String</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            "{step.input}"
          </div>
        </div>
      )}

      {step?.words && step?.wordsCount !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Words Array</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.words.map((word, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  fontSize: 12,
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                }}
              >
                [{idx}] "{word}"
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.currentWord && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #f59e0b',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Current Word</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Original</div>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
                "{step.currentWord}"
              </div>
            </div>
            {step.reversedWord && (
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Reversed</div>
                <div style={{ fontSize: 14, color: '#22c55e', fontFamily: 'monospace', fontWeight: 600 }}>
                  "{step.reversedWord}"
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {step?.reversedWords && step?.reversedWords.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
            Reversed Words ({step.reversedWords.length})
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.reversedWords.map((word, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                  border: '2px solid #a78bfa',
                  fontSize: 12,
                  color: '#a78bfa',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                "{word}"
              </motion.div>
            ))}
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#22c55e',
              wordBreak: 'break-all',
            }}
          >
            "{step.result}"
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ReverseWordsVisualizer() {
  const examples = useMemo(() => getExamplesOr('reverse-words-iii', []), [])
  const [inputString, setInputString] = useState("the sky is blue")

  const steps = useMemo(() => generateSteps(inputString), [inputString])

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
      setInputString(ex.input || ex)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔄 Reverse Words', dockMode: 'split-right' },
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input String</div>
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  setInputString(e.target.value)
                  handleReset()
                }}
                placeholder='e.g. "the sky is blue"'
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
          </div>),
  }), [step, connectivity, setActiveLineDom, inputString, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
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
