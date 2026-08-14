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
import './ShortestWordDistanceVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class WordDistance:' },
  { line: 2, text: '    def __init__(self, words):' },
  { line: 3, text: '        self.word_indices = {}' },
  { line: 4, text: '        for i, word in enumerate(words):' },
  { line: 5, text: '            if word not in self.word_indices:' },
  { line: 6, text: '                self.word_indices[word] = []' },
  { line: 7, text: '            self.word_indices[word].append(i)' },
  { line: 8, text: '    ' },
  { line: 9, text: '    def shortest(self, word1, word2):' },
  { line: 10, text: '        indices1 = self.word_indices.get(word1, [])' },
  { line: 11, text: '        indices2 = self.word_indices.get(word2, [])' },
  { line: 12, text: '        ' },
  { line: 13, text: '        if not indices1 or not indices2:' },
  { line: 14, text: '            return -1' },
  { line: 15, text: '        ' },
  { line: 16, text: '        i, j = 0, 0' },
  { line: 17, text: '        min_distance = float("inf")' },
  { line: 18, text: '        ' },
  { line: 19, text: '        while i < len(indices1) and j < len(indices2):' },
  { line: 20, text: '            distance = abs(indices1[i] - indices2[j])' },
  { line: 21, text: '            min_distance = min(min_distance, distance)' },
  { line: 22, text: '            ' },
  { line: 23, text: '            if indices1[i] < indices2[j]:' },
  { line: 24, text: '                i += 1' },
  { line: 25, text: '            else:' },
  { line: 26, text: '                j += 1' },
  { line: 27, text: '        ' },
  { line: 28, text: '        return min_distance' },
]

const PATTERNS = ['init', 'track_indices', 'retrieve', 'two_pointers', 'calculate', 'done']
const LINE_PATTERN_MAP = {
  4: 'init',
  5: 'track_indices',
  10: 'retrieve',
  19: 'two_pointers',
  20: 'calculate',
  28: 'done',
}

function generateSteps(words, word1, word2) {
  const steps = []

  if (!Array.isArray(words) || words.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 28,
      relatedLines: [28],
      message: 'Invalid input.',
      result: -1,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5, 6, 7],
    message: 'Building word indices mapping...',
    wordIndices: {},
  })

  const wordIndices = {}
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (!wordIndices[word]) {
      wordIndices[word] = []
    }
    wordIndices[word].push(i)

    steps.push({
      phase: 'track_indices',
      activeLine: 7,
      relatedLines: [4, 5, 6, 7],
      message: `Added index ${i} to word "${word}"`,
      wordIndices: { ...wordIndices },
      words,
      currentIndex: i,
    })
  }

  steps.push({
    phase: 'retrieve',
    activeLine: 10,
    relatedLines: [10, 11],
    message: `Retrieving indices for "${word1}" and "${word2}"`,
    wordIndices,
  })

  const indices1 = wordIndices[word1] || []
  const indices2 = wordIndices[word2] || []

  if (indices1.length === 0 || indices2.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 14,
      relatedLines: [13, 14],
      message: `Word "${indices1.length === 0 ? word1 : word2}" not found.`,
      result: -1,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'retrieve',
    activeLine: 10,
    relatedLines: [10, 11],
    message: `${word1} indices: [${indices1.join(', ')}], ${word2} indices: [${indices2.join(', ')}]`,
    indices1,
    indices2,
    word1,
    word2,
  })

  steps.push({
    phase: 'two_pointers',
    activeLine: 16,
    relatedLines: [16, 17],
    message: `Initialize two pointers: i=0, j=0, min_distance=∞`,
    i: 0,
    j: 0,
    minDistance: Infinity,
    indices1,
    indices2,
    word1,
    word2,
  })

  let i = 0
  let j = 0
  let minDistance = Infinity

  while (i < indices1.length && j < indices2.length) {
    const idx1 = indices1[i]
    const idx2 = indices2[j]
    const distance = Math.abs(idx1 - idx2)

    steps.push({
      phase: 'calculate',
      activeLine: 20,
      relatedLines: [20],
      message: `Calculate distance: |${idx1} - ${idx2}| = ${distance}`,
      i,
      j,
      currentDistance: distance,
      minDistance,
      indices1,
      indices2,
      word1,
      word2,
    })

    if (distance < minDistance) {
      minDistance = distance

      steps.push({
        phase: 'calculate',
        activeLine: 21,
        relatedLines: [21],
        message: `Update min_distance to ${minDistance}`,
        i,
        j,
        currentDistance: distance,
        minDistance,
        indices1,
        indices2,
        word1,
        word2,
      })
    }

    steps.push({
      phase: 'two_pointers',
      activeLine: 23,
      relatedLines: [23, 24, 25, 26],
      message: `${idx1} < ${idx2} ? ${idx1 < idx2 ? 'yes, i++' : 'no, j++'}`,
      i,
      j,
      minDistance,
      indices1,
      indices2,
      word1,
      word2,
    })

    if (idx1 < idx2) {
      i++
    } else {
      j++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 28,
    relatedLines: [28],
    message: `Found minimum distance: ${minDistance}`,
    result: minDistance,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, words, word1, word2, applyExample, examples }) {
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

      {step?.words && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Word List</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {step.words.map((word, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor:
                    step.currentIndex === idx
                      ? '#a78bfa'
                      : step.indices1?.includes(idx)
                        ? '#38bdf8'
                        : step.indices2?.includes(idx)
                          ? '#f59e0b'
                          : '#334155',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: step.currentIndex === idx ? '#8b5cf6' : 'transparent',
                }}
              >
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>[{idx}]</div>
                <div>{word}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.wordIndices && Object.keys(step.wordIndices).length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Word Indices Map</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {Object.entries(step.wordIndices).map(([word, indices]) => (
              <div key={word} style={{ color: '#e2e8f0' }}>
                <span style={{ color: '#a78bfa', fontWeight: 600 }}>{word}</span>: [{indices.join(', ')}]
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.indices1 && step?.indices2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>
              "{step.word1}" Indices
            </div>
            <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
              [{step.indices1.join(', ')}]
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>
              "{step.word2}" Indices
            </div>
            <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
              [{step.indices2.join(', ')}]
            </div>
          </div>
        </div>
      )}

      {step?.i !== undefined && step?.j !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Pointer i</div>
            <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.i} → idx: {step.indices1?.[step.i]}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Pointer j</div>
            <div style={{ fontSize: 16, color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.j} → idx: {step.indices2?.[step.j]}
            </div>
          </div>
        </div>
      )}

      {step?.currentDistance !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #ec4899' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#ec4899', marginBottom: 6 }}>Current Distance</div>
            <div style={{ fontSize: 18, color: '#ec4899', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.currentDistance}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Min Distance</div>
            <div style={{ fontSize: 18, color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.minDistance === Infinity ? '∞' : step.minDistance}
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
            border: '2px solid',
            borderColor: step.result >= 0 ? '#22c55e' : '#f87171',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: step.result >= 0 ? '#22c55e' : '#f87171',
            }}
          >
            {step.result >= 0 ? `Shortest Distance: ${step.result}` : 'Word Not Found'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ShortestWordDistanceVisualizer() {
  const examples = useMemo(() => getExamplesOr('shortest-distance-ii', []), [])
  const [wordsInput, setWordsInput] = useState('["practice","can","do","coding","now"]')
  const [word1, setWord1] = useState('practice')
  const [word2, setWord2] = useState('now')

  const { words, inputError } = useMemo(() => {
    try {
      const w = JSON.parse(wordsInput)
      if (!Array.isArray(w)) throw new Error('Input must be array')
      if (!w.every((item) => typeof item === 'string')) throw new Error('All items must be strings')
      return { words: w, inputError: '' }
    } catch (e) {
      return { words: [], inputError: e.message }
    }
  }, [wordsInput])

  const steps = useMemo(() => generateSteps(words, word1, word2), [words, word1, word2])

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
      setWord1(ex.word1 || 'practice')
      setWord2(ex.word2 || 'now')
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
        title: '🔍 Shortest Distance',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Word List (JSON)</div>
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
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Word 1</div>
                <input
                  type="text"
                  value={word1}
                  onChange={(e) => {
                    setWord1(e.target.value)
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
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Word 2</div>
                <input
                  type="text"
                  value={word2}
                  onChange={(e) => {
                    setWord2(e.target.value)
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
            </div>
            <VisualizationPanel
              step={step}
              words={words}
              word1={word1}
              word2={word2}
              applyExample={applyExample}
              examples={examples}
            />
          </div>
        ),
      },
    ],
    [
      step,
      connectivity,
      setActiveLineDom,
      wordsInput,
      inputError,
      word1,
      word2,
      words,
      examples,
      applyExample,
      handleReset,
      showPatternOverlay,
      activeLineDom,
    ]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"words","label":"words","type":"array"}]}
        values={{ words: wordsInput }}
        onChange={(k, v) => { if (k === 'words') setWordsInput(v); handleReset(); }}
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
