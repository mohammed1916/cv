import { useState, useMemo } from 'react'
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
import './Problem520Visualizer.css'

const EXAMPLES = getExamples('detect-capital') || [
  { label: 'Example 1', word: "USA" },
  { label: 'Example 2', word: "FiCkS" },
]

function generateSteps(word) {
  const steps = []

  steps.push({
    activeLine: 1,
    word,
    message: `Check capitalization pattern of "${word}"`,
    phase: 'Initialize'
  })

  const allUpper = word === word.toUpperCase()
  const allLower = word === word.toLowerCase()
  const firstCapitalRestLower = word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()

  steps.push({
    activeLine: 2,
    word,
    allUpper,
    allLower,
    firstCapitalRestLower,
    message: `All uppercase? ${allUpper}`,
    phase: 'Check All Uppercase'
  })

  steps.push({
    activeLine: 3,
    word,
    allUpper,
    allLower,
    firstCapitalRestLower,
    message: `All lowercase? ${allLower}`,
    phase: 'Check All Lowercase'
  })

  steps.push({
    activeLine: 4,
    word,
    allUpper,
    allLower,
    firstCapitalRestLower,
    message: `First capital + rest lowercase? ${firstCapitalRestLower}`,
    phase: 'Check Title Case'
  })

  const isValid = allUpper || allLower || firstCapitalRestLower

  steps.push({
    activeLine: 5,
    word,
    isValid,
    done: true,
    message: isValid ? `"${word}" has valid capitalization` : `"${word}" has invalid capitalization`,
    phase: 'Result'
  })

  return steps
}

function VisualizationPanel({ word, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid '#0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>Check if word follows valid capitalization rules.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Word: {word}</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {word.split('').map((char, i) => (
            <motion.div
              key={i}
              style={{
                padding: '8px 12px',
                backgroundColor: char === char.toUpperCase() ? '#60a5fa' : '#bfdbfe',
                borderRadius: 4,
                border: '1px solid '#3b82f6',
                fontSize: 14,
                fontWeight: 700,
                color: 'white'
              }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid '#fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Validation Checks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <motion.div
            style={{
              padding: '8px',
              backgroundColor: step?.allUpper ? '#bfdbfe' : '#f3f4f6',
              borderRadius: 4,
              border: step?.allUpper ? '2px solid '#0284c7' : '1px solid '#d1d5db',
              fontSize: 11,
              fontWeight: 600,
              color: step?.allUpper ? '#0c4a6e' : '#6b7280'
            }}
            animate={{ backgroundColor: step?.allUpper ? '#bfdbfe' : '#f3f4f6' }}
          >
            {step?.allUpper ? '✓' : '✗'} All Uppercase
          </motion.div>

          <motion.div
            style={{
              padding: '8px',
              backgroundColor: step?.allLower ? '#bfdbfe' : '#f3f4f6',
              borderRadius: 4,
              border: step?.allLower ? '2px solid '#0284c7' : '1px solid '#d1d5db',
              fontSize: 11,
              fontWeight: 600,
              color: step?.allLower ? '#0c4a6e' : '#6b7280'
            }}
            animate={{ backgroundColor: step?.allLower ? '#bfdbfe' : '#f3f4f6' }}
          >
            {step?.allLower ? '✓' : '✗'} All Lowercase
          </motion.div>

          <motion.div
            style={{
              padding: '8px',
              backgroundColor: step?.firstCapitalRestLower ? '#bfdbfe' : '#f3f4f6',
              borderRadius: 4,
              border: step?.firstCapitalRestLower ? '2px solid '#0284c7' : '1px solid '#d1d5db',
              fontSize: 11,
              fontWeight: 600,
              color: step?.firstCapitalRestLower ? '#0c4a6e' : '#6b7280'
            }}
            animate={{ backgroundColor: step?.firstCapitalRestLower ? '#bfdbfe' : '#f3f4f6' }}
          >
            {step?.firstCapitalRestLower ? '✓' : '✗'} Capital + Rest Lowercase
          </motion.div>
        </div>
      </motion.div>

      {step?.isValid !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.isValid ? '#d1fae5' : '#fee2e2',
            borderRadius: 6,
            border: step.isValid ? '2px solid '#10b981' : '2px solid '#dc2626'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: step.isValid ? '#065f46' : '#7f1d1d', textAlign: 'center' }}>
            {step.isValid ? '✓ Valid Capitalization' : '✗ Invalid Capitalization'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem520Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('detect-capital')
  const steps = useMemo(() => generateSteps(ex.word).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔤 Detect Capital', content: (<VisualizationPanel word={ex.word} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
