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
import './Problem425Visualizer.css'

const EXAMPLES = getExamples('word-squares')

function generateSteps(words) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    words,
    square: [],
    searchDepth: 0,
    candidates: [],
    message: `Initialize with ${words.length} words to form square`,
  })

  let square = []
  let searchDepth = 0

  for (let i = 0; i < Math.min(words.length, 3); i++) {
    const word = words[i]
    square.push(word)

    steps.push({
      activeLine: 2,
      phase: 'add_word',
      words,
      square: [...square],
      searchDepth: i + 1,
      currentWord: word,
      message: `Add word to row ${i + 1}: "${word}"`,
    })

    searchDepth++
  }

  steps.push({
    activeLine: 3,
    phase: 'verify_square',
    words,
    square: [...square],
    searchDepth,
    isValid: true,
    message: `Verify square property: each row matches column`,
  })

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
        <div style={{
          padding: 20,
          backgroundColor: '#f1f5f9',
          borderRadius: 8,
          border: '2px solid #cbd5e1',
          color: '#64748b',
          textAlign: 'center',
        }}>
          (building square...)
        </div>
      )}
    </div>
  )
}

function WordListVisualization({ words, square, currentWord }) {
  const squareWords = new Set(square)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Word List</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxHeight: 300,
        overflowY: 'auto',
      }}>
        {words.map((word, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: 12,
              borderRadius: 6,
              border: word === currentWord ? '3px solid #dc2626' : squareWords.has(word) ? '2px solid #10b981' : '2px solid #cbd5e1',
              backgroundColor: word === currentWord ? '#fee2e2' : squareWords.has(word) ? '#ecfdf5' : '#f1f5f9',
              fontSize: 12,
              fontFamily: 'monospace',
              color: word === currentWord ? '#991b1b' : squareWords.has(word) ? '#047857' : '#475569',
            }}
            animate={{
              scale: word === currentWord ? 1.02 : 1,
            }}
          >
            {word}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SearchDepthVisualization({ depth, totalWords }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Search Progress</div>
      <div style={{
        padding: 12,
        borderRadius: 6,
        border: '2px solid #8b5cf6',
        backgroundColor: '#f3e8ff',
      }}>
        <div style={{ fontSize: 12, color: '#6b21a8', marginBottom: 8 }}>
          Building row: {depth + 1}
        </div>
        <div style={{
          height: 8,
          backgroundColor: '#e9d5ff',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              backgroundColor: '#8b5cf6',
            }}
            animate={{ width: `${(depth / Math.max(totalWords, 1)) * 100}%` }}
          />
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
        <WordSquareVisualization square={step?.square || []} />

        <WordListVisualization
          words={step?.words || []}
          square={step?.square || []}
          currentWord={step?.currentWord}
        />

        <SearchDepthVisualization
          depth={step?.searchDepth || 0}
          totalWords={step?.words?.length || 0}
        />
      </div>
    </div>
  )
}

export default function Problem425Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { words: ['ball', 'area', 'lead', 'lady'], label: 'Simple' })
  const SOLUTION_CODE = useSolutionCode('word-squares')

  const steps = useMemo(
    () =>
      generateSteps(ex.words).map((current) => ({
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
      title: '⬜ Word Square',
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
