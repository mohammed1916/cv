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
import './Problem390Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['complete', 'eliminate', 'init', 'round_complete']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'round_complete',
  6: 'eliminate',
  11: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def lastRemaining(n):' },
  { line: 2, text: '    # Recursive elimination' },
  { line: 3, text: '    def eliminate(n, k, left_to_right):' },
  { line: 4, text: '        if n == 1:' },
  { line: 5, text: '            return 1  # Position of last element' },
  { line: 6, text: '        if left_to_right or n % 2 == 1:' },
  { line: 7, text: '            next_pos = 2 * eliminate(n // 2, k, not left_to_right)' },
  { line: 8, text: '        else:' },
  { line: 9, text: '            next_pos = 2 * eliminate(n // 2, k, not left_to_right) - 1' },
  { line: 10, text: '        return next_pos' },
  { line: 11, text: '    return eliminate(n, 2, True)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n) {
  const steps = []

  // Simulate elimination
  let remaining = Array.from({ length: n }, (_, i) => i + 1)
  const rounds = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    remaining: [...remaining],
    round: 0,
    direction: 'LTR',
    eliminated: [],
    message: `Start with numbers 1-${n}`,
  })

  let leftToRight = true
  let round = 0

  while (remaining.length > 1) {
    round++
    const eliminated = []

    if (leftToRight) {
      for (let i = 0; i < remaining.length; i += 2) {
        eliminated.push(remaining[i])

        steps.push({
          activeLine: 6,
          phase: 'eliminate',
          n,
          remaining: remaining.filter((_, idx) => !eliminated.includes(_)),
          round,
          direction: 'LTR',
          eliminatedIdx: i,
          eliminated: [...eliminated],
          message: `Round ${round} (L→R): Eliminate position ${i} (value ${remaining[i]})`,
        })
      }
    } else {
      for (let i = remaining.length - 1; i >= 0; i -= 2) {
        eliminated.push(remaining[i])

        steps.push({
          activeLine: 6,
          phase: 'eliminate',
          n,
          remaining: remaining.filter((_, idx) => !eliminated.includes(_)),
          round,
          direction: 'RTL',
          eliminatedIdx: i,
          eliminated: [...eliminated],
          message: `Round ${round} (R→L): Eliminate position ${i} (value ${remaining[i]})`,
        })
      }
    }

    remaining = remaining.filter((val) => !eliminated.includes(val))
    leftToRight = !leftToRight

    steps.push({
      activeLine: 4,
      phase: 'round_complete',
      n,
      remaining: [...remaining],
      round,
      direction: leftToRight ? 'LTR' : 'RTL',
      eliminated,
      message: `Round ${round} complete. Remaining: [${remaining.join(', ')}]. Next direction: ${leftToRight ? 'L→R' : 'R→L'}`,
    })

    if (remaining.length <= 8) {
      // Keep going
    } else if (round > 5) {
      // Stop early for large n
      break
    }
  }

  steps.push({
    activeLine: 11,
    phase: 'complete',
    n,
    remaining: [...remaining],
    round,
    direction: 'Done',
    eliminated: [],
    result: remaining[0],
    message: `Last remaining number: ${remaining[0]}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'n=8',
    n: 8,
  },
  {
    label: 'n=10',
    n: 10,
  },
  {
    label: 'n=5',
    n: 5,
  },
]

export default function Problem390Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [nInput, setNInput] = useState(String(EXAMPLES[0]?.n ?? 0));
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: EXAMPLES[exIdx]?.n ?? '', inputError: e.message };
    }
  }, [nInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(n).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNInput(String(EXAMPLES[i].n)); handleReset(); }, [handleReset]);

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
      title: '🎯 Elimination Round',
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

              {/* Round Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>Round</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.round}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Direction</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>{step.direction}</div>
                </div>
              </div>

              {/* Remaining Numbers */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                  Remaining Numbers ({step.remaining.length})
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.remaining.map((val, idx) => (
                    <motion.div
                      key={`rem-${val}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        backgroundColor:
                          step.remaining.length === 1
                            ? '#dcfce7'
                            : '#f0fdf4',
                        border:
                          step.remaining.length === 1
                            ? '2px solid #10b981'
                            : '2px solid #bbf7d0',
                        fontSize: 12,
                        fontWeight: 600,
                        color: step.remaining.length === 1 ? '#047857' : '#166534',
                      }}
                    >
                      {val}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Eliminated in this round */}
              {step.eliminated && step.eliminated.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                    Eliminated ({step.eliminated.length})
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.eliminated.map((val) => (
                      <motion.div
                        key={`elim-${val}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: '#fee2e2',
                          border: '2px solid #fca5a5',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#991b1b',
                          textDecoration: 'line-through',
                        }}
                      >
                        {val}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direction indicator */}
              {step.phase === 'eliminate' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#eff6ff',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>
                    Elimination direction: {step.direction === 'LTR' ? 'Left → Right' : 'Right ← Left'}
                  </div>
                </motion.div>
              )}

              {/* Algorithm explanation */}
              {step.phase === 'init' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Alternating Elimination:</div>
                  <div>
                    Eliminate every 2nd element alternating direction until one remains
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    ✓ Last remaining: {step.result}
                  </div>
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
