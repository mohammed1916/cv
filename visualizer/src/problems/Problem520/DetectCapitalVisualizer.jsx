import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './DetectCapitalVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['init', 'loop']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop'
}


const EXAMPLES = getExamples('detect-capital')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def detectCapitalUse(word):' },
  { line: 2, text: '    # Check if all uppercase' },
  { line: 3, text: '    if word.isupper(): return True' },
  { line: 4, text: '    # Check if all lowercase' },
  { line: 5, text: '    if word.islower(): return True' },
  { line: 6, text: '    # Check if title case (first letter upper, rest lower)' },
  { line: 7, text: '    if word[0].isupper() and word[1:].islower(): return True' },
  { line: 8, text: '    return False' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(word) {
  const steps = []

  steps.push({
    activeLine: 1,
    word,
    charIdx: -1,
    message: `Check capital usage in "${word}"`,
    relatedLines: [1]
  })

  const isAllCaps = word === word.toUpperCase()
  const isAllLower = word === word.toLowerCase()
  const isFirstCapOnly = word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()

  if (isAllCaps) {
    steps.push({
      activeLine: 2,
      word,
      charIdx: -1,
      done: true,
      result: true,
      message: 'Valid: All uppercase',
      relatedLines: [2]
    })
    return steps
  }

  if (isAllLower) {
    steps.push({
      activeLine: 3,
      word,
      charIdx: -1,
      done: true,
      result: true,
      message: 'Valid: All lowercase',
      relatedLines: [3]
    })
    return steps
  }

  if (isFirstCapOnly) {
    steps.push({
      activeLine: 4,
      word,
      charIdx: -1,
      done: true,
      result: true,
      message: 'Valid: Only first character capitalized',
      relatedLines: [4]
    })
    return steps
  }

  steps.push({
    activeLine: 5,
    word,
    charIdx: 0,
    done: true,
    result: false,
    message: 'Invalid: Mixed capital usage',
    relatedLines: [5]
  })

  return steps
}

function VisualizationPanel({ word, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          "A word is properly capitalized if: all uppercase, all lowercase, OR only first character uppercase."
        </div>
      </div>

      {/* Examples */}
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

      {/* Word Display */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Word: {word}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {word.split('').map((char, idx) => {
            const isUpper = char === char.toUpperCase()
            const isFirst = idx === 0
            return (
              <motion.div
                key={`char-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 700,
                  minWidth: 50,
                  textAlign: 'center',
                  backgroundColor: isUpper ? '#fbcfe8' : '#f1f5f9',
                  borderColor: isUpper ? '#ec4899' : '#cbd5e1',
                  color: isUpper ? '#be185d' : '#334155'
                }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Analysis */}
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#fce7f3',
          borderRadius: 6,
          border: '1px solid #f472b6'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#831843', marginBottom: 8 }}>
          Analysis
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
          <div style={{
            padding: '8px 12px',
            backgroundColor: word === word.toUpperCase() ? '#fbcfe8' : '#f1f5f9',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: word === word.toUpperCase() ? '#be185d' : '#334155'
          }}>
            All Upper: {word === word.toUpperCase() ? '✓' : '✗'}
          </div>
          <div style={{
            padding: '8px 12px',
            backgroundColor: word === word.toLowerCase() ? '#fbcfe8' : '#f1f5f9',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: word === word.toLowerCase() ? '#be185d' : '#334155'
          }}>
            All Lower: {word === word.toLowerCase() ? '✓' : '✗'}
          </div>
          <div style={{
            padding: '8px 12px',
            backgroundColor: (word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) ? '#fbcfe8' : '#f1f5f9',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: (word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) ? '#be185d' : '#334155'
          }}>
            First Cap: {(word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) ? '✓' : '✗'}
          </div>
        </div>
      </motion.div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fce7f3',
          borderRadius: 6,
          border: '2px solid #ec4899',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 8 }}>Result</div>
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: step?.result ? '#10b981' : '#ef4444'
        }}>
          {step?.result ? '✓ Valid' : '✗ Invalid'}
        </div>
        <div style={{ fontSize: 12, color: '#ec4899', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function DetectCapitalVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [wordInput, setWordInput] = useState("USA");
  const { word, inputError } = useMemo(() => {
    try {
      const parsedWord = wordInput;
      return { word: parsedWord, inputError: '' };
    } catch (e) {
      return { word: "USA", inputError: e.message };
    }
  }, [wordInput]);

  const steps = useMemo(
    () =>
      generateSteps(word).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [word]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setWordInput(String(e.word)); handleReset(); }, [handleReset]);

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

          
            </div>
      ),
    },
    {
      id: 'viz',
      title: '🔤 Detect Capital',
      content: (
        <VisualizationPanel
          word={word}
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
