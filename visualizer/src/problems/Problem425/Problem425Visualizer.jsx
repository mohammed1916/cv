import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem425Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('word-squares', [
  { label: 'Example 1', words: ['ball', 'area', 'lead', 'lady'] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def wordSquares(words):' },
  { line: 2, text: '    trie = {}' },
  { line: 3, text: '    for w in words: insert_trie(trie, w)' },
  { line: 4, text: '    result = []' },
  { line: 5, text: '    square = []' },
  { line: 6, text: '    dfs(trie, 0, square, words[0].__len__(), result)' },
  { line: 7, text: '    return result' },
  { line: 8, text: '    ' },
  { line: 9, text: 'def dfs(trie, row, square, n, result):' },
  { line: 10, text: '    if row == n:' },
  { line: 11, text: '        result.append(square[:])' },
  { line: 12, text: '        return' },
]

function generateSteps(words) {
  const steps = []

  if (!words || words.length === 0 || !words[0]) {
    steps.push({ activeLine: 1, message: 'Empty word list → no squares', words: [], square: [], done: true, result: [] })
    return steps
  }

  const n = words[0].length || 0
  if (n === 0) {
    steps.push({ activeLine: 1, message: 'Empty word length → no squares', words, square: [], done: true, result: [] })
    return steps
  }
  steps.push({ activeLine: 1, message: `Initialize: ${words.length} words, length=${n}`, words, n })

  steps.push({ activeLine: 2, message: 'Build prefix trie for efficient word lookup' })

  // Simulate building trie
  const trie = {}
  for (const word of words) {
    let node = trie
    for (const char of word) {
      if (!node[char]) node[char] = {}
      node = node[char]
    }
    node.isWord = true
  }
  steps.push({ activeLine: 3, message: 'Trie built with all words indexed by prefix' })

  steps.push({ activeLine: 4, message: 'Initialize DFS: result = [], square = []', result: [] })

  let square = []
  const result = []

  steps.push({ activeLine: 5, message: 'Start DFS from row 0' })

  // Simulate DFS backtracking
  for (let row = 0; row < Math.min(n, 2); row++) {
    steps.push({ activeLine: 6, message: `DFS row ${row}: find words matching prefix`, square: [...square], row })

    let matchCount = 0
    for (const word of words) {
      let isValid = true
      for (let col = 0; col < row && col < square.length; col++) {
        if (word[col] !== (square[col] && square[col][row])) {
          isValid = false
          break
        }
      }

      if (isValid) {
        matchCount++
        if (matchCount <= 2) {
          steps.push({ activeLine: 7, message: `Match found: word="${word}" satisfies column constraints`, currentWord: word, row })
          square.push(word)
          steps.push({ activeLine: 8, message: `Add "${word}" to square at row ${row}`, square: [...square], row })

          if (row === n - 1) {
            steps.push({ activeLine: 9, message: `Square complete! Valid word square formed.`, square: [...square], done: true })
            result.push([...square])
          } else {
            steps.push({ activeLine: 10, message: `Recursively search row ${row + 1}`, square: [...square], row })
          }

          square.pop()
          steps.push({ activeLine: 11, message: `Backtrack: remove row ${row}`, square: [...square], row })
        }
      }
    }
  }

  steps.push({ activeLine: 12, message: `DFS complete: found ${result.length} valid word square(s)`, result, done: true })
  return steps
}

function WordSquareVisualization({ square }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Word Square</div>
      {square.length > 0 ? (
        <div style={{
          display: 'inline-block',
          border: '2px solid #0284c7',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {square.map((word, i) => (
            <motion.div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${word.length}, 1fr)`,
                gap: 0,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {word.split('').map((char, j) => (
                <div
                  key={`${i}-${j}`}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: i === j ? '#dbeafe' : '#f1f5f9',
                    borderRight: j < word.length - 1 ? '1px solid #cbd5e1' : 'none',
                    borderBottom: i < square.length - 1 ? '1px solid #cbd5e1' : 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    color: i === j ? '#0c4a6e' : '#475569',
                  }}
                >
                  {char}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
          No square formed yet
        </div>
      )}
    </div>
  )
}

function VisualizationPanel({ words, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Input Words</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {words.map((w, i) => (
            <motion.div
              key={i}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                backgroundColor: step?.currentWord === w ? '#fef08a' : '#f3e8ff',
                border: step?.currentWord === w ? '2px solid #eab308' : '2px solid #d8b4fe',
                fontSize: 12,
                fontWeight: 600,
                color: step?.currentWord === w ? '#713f12' : '#6b21a8',
              }}
              animate={{ scale: step?.currentWord === w ? 1.05 : 1 }}
            >
              {w}
            </motion.div>
          ))}
        </div>
      </div>

      <WordSquareVisualization square={step?.square || []} />

      {step?.row !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '2px solid #0284c7' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Current Row</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#075985' }}>{step.row}</div>
        </div>
      )}

      {step?.n !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Target Square Size</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#047857' }}>{step.n}×{step.n}</div>
        </div>
      )}

      {step?.result && step.result.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Found Squares</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {step.result.map((sq, i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: '#047857' }}>
                [{sq.map(w => `"${w}"`).join(', ')}]
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem425Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [wordsInput, setWordsInput] = useState("[\"abat\",\"baba\",\"atan\",\"tata\"]");
  const { words, inputError } = useMemo(() => {
    try {
      const parsedWords = JSON.parse(wordsInput); if (!Array.isArray(parsedWords)) throw new Error('words must be an array');
      return { words: parsedWords, inputError: '' };
    } catch (e) {
      return { words: "[\"abat\",\"baba\",\"atan\",\"tata\"]", inputError: e.message };
    }
  }, [wordsInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(words).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [words]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setWordsInput(JSON.stringify(e.words)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '🔤 Word Squares',
      content: <VisualizationPanel words={words} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
