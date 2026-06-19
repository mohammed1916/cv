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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem472Visualizer.css'

const EXAMPLES = getExamples('concatenated-words')

function generateSteps(words) {
  const steps = []

  steps.push({
    activeLine: 1,
    words,
    index: 0,
    wordSet: new Set(words),
    concatenated: [],
    message: 'Initialize word set and find concatenated words'
  })

  for (let i = 0; i < Math.min(words.length, 4); i++) {
    const word = words[i]
    steps.push({
      activeLine: 2,
      words,
      index: i,
      wordSet: new Set(words),
      concatenated: [],
      currentWord: word,
      message: `Check word: "${word}"`
    })

    const otherWords = new Set(words)
    otherWords.delete(word)

    let isConcatenated = false
    steps.push({
      activeLine: 3,
      words,
      index: i,
      wordSet: otherWords,
      concatenated: [],
      currentWord: word,
      isConcatenated,
      message: `Can "${word}" be formed from other words?`
    })
  }

  steps.push({
    activeLine: 4,
    words,
    index: words.length,
    wordSet: new Set(words),
    concatenated: [],
    done: true,
    message: 'Find all words that can be concatenated from other words'
  })

  return steps
}

function VisualizationPanel({ words, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find all words that can be formed by concatenating other words from the list. Use DP or Trie to verify if each word can be built."
        </div>
      </div>

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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Words List
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {words.map((word, idx) => {
            const isActive = step && idx === step.index && !step.done
            return (
              <motion.div
                key={`word-${idx}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fef08a' : '#f1f5f9',
                  borderColor: isActive ? '#eab308' : '#cbd5e1',
                  color: isActive ? '#854d0e' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {word}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current Word</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>
            {step?.currentWord || '-'}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Progress</div>
          <div style={{ fontSize: 14, color: '#b45309' }}>
            {step?.index ?? 0} / {words.length}
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem472Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { words: ['cat','cats','catsdogcats','dog','catscat','rat','catsdog'] })
  const SOLUTION_CODE = useSolutionCode('concatenated-words')

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
      title: '🔗 Concatenated Words',
      content: (
        <VisualizationPanel
          words={ex.words}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
