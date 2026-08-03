import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem383Visualizer.css'

const PATTERNS = ['build_freq', 'check', 'complete', 'init']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'build_freq',
  5: 'build_freq',
  7: 'check',
  8: 'check',
  10: 'check',
  11: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def canConstruct(ransomNote, magazine):' },
  { line: 2, text: '    # Count character frequencies' },
  { line: 3, text: '    freq = {}' },
  { line: 4, text: '    for char in magazine:' },
  { line: 5, text: '        freq[char] = freq.get(char, 0) + 1' },
  { line: 6, text: '    # Check if ransom note can be built' },
  { line: 7, text: '    for char in ransomNote:' },
  { line: 8, text: '        if char not in freq or freq[char] == 0:' },
  { line: 9, text: '            return False' },
  { line: 10, text: '        freq[char] -= 1' },
  { line: 11, text: '    return True' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(ransomNote, magazine) {
  const steps = []
  const freq = {}

  // Step 1: Initialize
  steps.push({
    activeLine: 3,
    phase: 'init',
    ransomNote,
    magazine,
    freq: {},
    current: -1,
    currentNote: -1,
    result: null,
    message: 'Initialize frequency map for magazine characters',
  })

  // Step 2: Build frequency map
  steps.push({
    activeLine: 4,
    phase: 'build_freq',
    ransomNote,
    magazine,
    freq: {},
    current: -1,
    currentNote: -1,
    result: null,
    message: 'Count frequency of each character in magazine',
  })

  magazine.split('').forEach((char, idx) => {
    freq[char] = (freq[char] || 0) + 1
    steps.push({
      activeLine: 5,
      phase: 'build_freq',
      ransomNote,
      magazine,
      freq: { ...freq },
      current: idx,
      currentNote: -1,
      result: null,
      highlighted: char,
      message: `Process magazine[${idx}]='${char}': count[${char}] = ${freq[char]}`,
    })
  })

  // Step 3: Check ransom note
  steps.push({
    activeLine: 7,
    phase: 'check',
    ransomNote,
    magazine,
    freq: { ...freq },
    current: -1,
    currentNote: -1,
    result: true,
    message: 'Check if ransom note characters are available',
  })

  const freqCopy = { ...freq }
  let canConstruct = true

  for (let i = 0; i < ransomNote.length; i++) {
    const char = ransomNote[i]

    steps.push({
      activeLine: 7,
      phase: 'check',
      ransomNote,
      magazine,
      freq: { ...freqCopy },
      current: -1,
      currentNote: i,
      result: null,
      highlighted: char,
      message: `Check ransomNote[${i}]='${char}'`,
    })

    if (!freqCopy[char] || freqCopy[char] === 0) {
      canConstruct = false

      steps.push({
        activeLine: 8,
        phase: 'check',
        ransomNote,
        magazine,
        freq: { ...freqCopy },
        current: -1,
        currentNote: i,
        result: false,
        highlighted: char,
        notFound: true,
        message: `Character '${char}' not available! Cannot construct ransom note.`,
      })

      break
    }

    freqCopy[char] -= 1

    steps.push({
      activeLine: 10,
      phase: 'check',
      ransomNote,
      magazine,
      freq: { ...freqCopy },
      current: -1,
      currentNote: i,
      result: null,
      highlighted: char,
      message: `Use '${char}': count[${char}] = ${freqCopy[char]}`,
    })
  }

  steps.push({
    activeLine: 11,
    phase: 'complete',
    ransomNote,
    magazine,
    freq: { ...freqCopy },
    current: -1,
    currentNote: -1,
    result: canConstruct,
    message: `Result: ${canConstruct ? 'CAN construct ransom note' : 'CANNOT construct ransom note'}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Possible',
    ransomNote: 'a',
    magazine: 'b',
  },
  {
    label: 'Possible 2',
    ransomNote: 'aa',
    magazine: 'aab',
  },
  {
    label: 'Impossible',
    ransomNote: 'aa',
    magazine: 'aab',
  },
]

export default function Problem383Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(ex.ransomNote, ex.magazine).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
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
      title: '📝 Ransom Note Builder',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Strings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Ransom Note</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.ransomNote.split('').map((char, idx) => (
                      <motion.div
                        key={`rn-${idx}`}
                        animate={{
                          scale: step.currentNote === idx ? 1.2 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: step.currentNote === idx ? '#fed7aa' : '#fef3c7',
                          border: step.currentNote === idx ? '2px solid #f59e0b' : '1px solid #fcd34d',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#92400e',
                        }}
                      >
                        {char}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Magazine</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.magazine.split('').map((char, idx) => (
                      <motion.div
                        key={`mag-${idx}`}
                        animate={{
                          scale: step.current === idx ? 1.2 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: step.current === idx ? '#a7f3d0' : '#d1fae5',
                          border: step.current === idx ? '2px solid #10b981' : '1px solid #6ee7b7',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#047857',
                        }}
                      >
                        {char}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Frequency Map */}
              {step.phase !== 'init' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Character Frequencies</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(step.freq)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([char, count]) => (
                        <motion.div
                          key={`freq-${char}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 4,
                            backgroundColor:
                              step.highlighted === char
                                ? count > 0
                                  ? '#dcfce7'
                                  : '#fee2e2'
                                : '#f1f5f9',
                            border:
                              step.highlighted === char
                                ? count > 0
                                  ? '2px solid #10b981'
                                  : '2px solid #ef4444'
                                : '1px solid #cbd5e1',
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              step.highlighted === char
                                ? count > 0
                                  ? '#047857'
                                  : '#991b1b'
                                : '#334155',
                          }}
                        >
                          '{char}': {count}
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.result ? '#dcfce7' : '#fee2e2',
                    border: step.result ? '2px solid #10b981' : '2px solid #ef4444',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: step.result ? '#166534' : '#991b1b',
                  }}
                >
                  {step.result ? '✓ CAN construct ransom note' : '✗ CANNOT construct ransom note'}
                </motion.div>
              )}

              {step.notFound && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#fee2e2',
                    border: '2px solid #ef4444',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                    Missing character: '{step.highlighted}'
                  </div>
                </motion.div>
              )}

              {step.phase === 'build_freq' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#1e40af',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Building Frequency Map:</div>
                  <div>Counting all available characters in magazine</div>
                </motion.div>
              )}

              {step.phase === 'check' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#92400e',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Checking Ransom Note:</div>
                  <div>Verifying each character is available and decrementing count</div>
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
          prevDisabled={stepIndex <= 0}
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
