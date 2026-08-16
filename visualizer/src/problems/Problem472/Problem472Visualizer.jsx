import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem472Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('concatenated-words')

const PATTERNS = []

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
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
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
                  backgroundColor: isActive ? '#fef08a' : 'var(--surface2)',
                  borderColor: isActive ? '#eab308' : 'var(--border)',
                  color: isActive ? '#854d0e' : 'var(--border)'
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
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#0c865d' }}>
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
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [wordsInput, setWordsInput] = useState("[\"cat\",\"cats\",\"catsdogcats\",\"dog\",\"catscat\",\"ratcatdogcat\"]");
  const { words, inputError } = useMemo(() => {
    try {
      const parsedWords = JSON.parse(wordsInput); if (!Array.isArray(parsedWords)) throw new Error('words must be an array');
      return { words: parsedWords, inputError: '' };
    } catch (e) {
      return { words: "[\"cat\",\"cats\",\"catsdogcats\",\"dog\",\"catscat\",\"ratcatdogcat\"]", inputError: e.message };
    }
  }, [wordsInput]);

  const steps = useMemo(
    () =>
      generateSteps(words).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [words]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setWordsInput(JSON.stringify(e.words)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔗 Concatenated Words', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          words={words}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"words","label":"words","type":"array"}]}
          values={{ words: wordsInput }}
          onChange={(k, v) => { if (k === 'words') setWordsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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
