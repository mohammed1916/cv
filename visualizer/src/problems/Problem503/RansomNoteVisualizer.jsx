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
import './RansomNoteVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def canConstruct(self, ransomNote: str, magazine: str) -> bool:' },
  { line: 3, text: '        mag_count = {}' },
  { line: 4, text: '        ' },
  { line: 5, text: '        for char in magazine:' },
  { line: 6, text: '            mag_count[char] = mag_count.get(char, 0) + 1' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for char in ransomNote:' },
  { line: 9, text: '            if char not in mag_count or mag_count[char] == 0:' },
  { line: 10, text: '                return False' },
  { line: 11, text: '            mag_count[char] -= 1' },
  { line: 12, text: '        ' },
  { line: 13, text: '        return True' },
]

const PATTERNS = ['count_magazine', 'check_note', 'found', 'missing', 'done']
const LINE_PATTERN_MAP = {
  5: 'count_magazine',
  8: 'check_note',
  9: 'missing',
  11: 'found',
  13: 'done',
}

function generateSteps(ransomNote, magazine) {
  const steps = []

  if (!ransomNote || !magazine) {
    steps.push({
      phase: 'done',
      activeLine: 13,
      relatedLines: [13],
      message: 'Empty input.',
      result: !ransomNote,
      done: true,
    })
    return steps
  }

  const magCount = {}

  steps.push({
    phase: 'count_magazine',
    activeLine: 3,
    relatedLines: [3, 4],
    message: 'Count character frequencies in magazine.',
    magCount: {},
    ransomNote,
    magazine,
  })

  for (const char of magazine) {
    magCount[char] = (magCount[char] || 0) + 1

    steps.push({
      phase: 'count_magazine',
      activeLine: 6,
      relatedLines: [5, 6],
      message: `Count '${char}': ${magCount[char]}`,
      magCount: { ...magCount },
      ransomNote,
      magazine,
    })
  }

  steps.push({
    phase: 'check_note',
    activeLine: 8,
    relatedLines: [8],
    message: 'Check if ransom note can be constructed.',
    magCount: { ...magCount },
    ransomNote,
    magazine,
    noteIdx: -1,
  })

  for (let i = 0; i < ransomNote.length; i++) {
    const char = ransomNote[i]

    steps.push({
      phase: 'check_note',
      activeLine: 9,
      relatedLines: [9],
      message: `Need '${char}': ${magCount[char] || 0} available`,
      magCount: { ...magCount },
      ransomNote,
      magazine,
      noteIdx: i,
      checkChar: char,
    })

    if (!magCount[char] || magCount[char] === 0) {
      steps.push({
        phase: 'missing',
        activeLine: 10,
        relatedLines: [9, 10],
        message: `Cannot construct: '${char}' not available`,
        magCount: { ...magCount },
        result: false,
        done: true,
      })
      return steps
    }

    magCount[char]--

    steps.push({
      phase: 'found',
      activeLine: 11,
      relatedLines: [11],
      message: `Use '${char}': ${magCount[char]} remaining`,
      magCount: { ...magCount },
      ransomNote,
      magazine,
      noteIdx: i,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 13,
    relatedLines: [13],
    message: 'Successfully constructed ransom note!',
    magCount,
    result: true,
    done: true,
  })

  return steps
}

function VisualizationPanel({ ransomNote, magazine, step, applyExample, examples }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Ransom Note</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            "{ransomNote}"
          </div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Magazine</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            "{magazine}"
          </div>
        </div>
      </div>

      {step?.magCount && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Magazine Counts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 100, overflowY: 'auto' }}>
            <AnimatePresence mode="popLayout">
              {Object.entries(step.magCount)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([char, count]) => (
                  <motion.div
                    key={`${char}-${count}`}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: '#334155',
                      borderColor: count === 0 ? '#f87171' : '#38bdf8',
                      color: count === 0 ? '#f87171' : '#38bdf8',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    '{char}': {count}
                  </motion.div>
                ))}
            </AnimatePresence>
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
            borderColor: step.result ? '#22c55e' : '#f87171',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: step.result ? '#22c55e' : '#f87171' }}>
            {step.result ? '✓ Can Construct' : '✗ Cannot Construct'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function RansomNoteVisualizer() {
  const examples = useMemo(() => getExamplesOr('ransom-note', []), [])
  const [ransomNote, setRansomNote] = useState('a')
  const [magazine, setMagazine] = useState('b')

  const steps = useMemo(() => generateSteps(ransomNote, magazine), [ransomNote, magazine])

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
      setRansomNote(ex.ransomNote || ex.a || '')
      setMagazine(ex.magazine || ex.b || '')
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
        title: '📝 Ransom Note',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Ransom Note</div>
                <input
                  type="text"
                  value={ransomNote}
                  onChange={(e) => {
                    setRansomNote(e.target.value)
                    handleReset()
                  }}
                  placeholder="a"
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
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Magazine</div>
                <input
                  type="text"
                  value={magazine}
                  onChange={(e) => {
                    setMagazine(e.target.value)
                    handleReset()
                  }}
                  placeholder="b"
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
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, ransomNote, magazine, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
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
