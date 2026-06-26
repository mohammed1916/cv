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
import { getExamples } from '../../../config/examplesRegistry'
import './RepeatedSubstringPatternVisualizer.css'

const EXAMPLES = getExamples('repeated-substring-pattern')

function generateSteps(s) {
  const steps = []
  const n = s.length

  steps.push({
    activeLine: 1,
    s,
    n,
    i: -1,
    patternLen: -1,
    pattern: '',
    isRepeated: false,
    message: 'Initialize: Check if string is made of repeating pattern'
  })

  let found = false
  for (let i = 1; i <= n / 2; i++) {
    if (n % i === 0) {
      steps.push({
        activeLine: 2,
        s,
        n,
        i,
        patternLen: i,
        pattern: s.substring(0, i),
        isRepeated: false,
        message: `Check pattern length ${i}: "${s.substring(0, i)}"`
      })

      const pattern = s.substring(0, i)
      let isValid = true
      for (let j = 0; j < n; j += i) {
        if (s.substring(j, j + i) !== pattern) {
          isValid = false
          break
        }
      }

      if (isValid) {
        steps.push({
          activeLine: 3,
          s,
          n,
          i,
          patternLen: i,
          pattern,
          isRepeated: true,
          message: `FOUND! Pattern "${pattern}" repeats ${n / i} times`
        })
        found = true
        break
      } else {
        steps.push({
          activeLine: 4,
          s,
          n,
          i,
          patternLen: i,
          pattern,
          isRepeated: false,
          message: `Pattern "${pattern}" does NOT repeat throughout`
        })
      }
    }
  }

  steps.push({
    activeLine: 5,
    s,
    n,
    i: -1,
    patternLen: found ? steps[steps.length - 1].patternLen : -1,
    pattern: found ? steps[steps.length - 1].pattern : '',
    isRepeated: found,
    done: true,
    message: found ? `Answer: Yes, repeats every ${steps[steps.length - 1].patternLen} chars` : 'Answer: No repeating pattern'
  })

  return steps
}

function VisualizationPanel({ s, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          "Is this string built by repeating a smaller pattern? For example, 'abab' is made of 'ab' repeated twice. Find if the entire string is a repetition!"
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

      {/* Input String */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Input String: "{s}" (length: {s.length})
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {s.split('').map((char, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid #cbd5e1',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#334155'
              }}
              animate={{ scale: 1 }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pattern Check */}
      {step && step.patternLen > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f8f4ff',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 12 }}>
            Testing Pattern Length: {step.patternLen}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#6b21a8', marginBottom: 8 }}>
              Pattern: "<span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{step.pattern}</span>"
            </div>

            <div style={{
              padding: 12,
              backgroundColor: '#e9d5ff',
              borderRadius: 4,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              {Array.from({ length: step.n / step.patternLen }).map((_, repIdx) => (
                <div key={repIdx} style={{
                  padding: '8px 12px',
                  backgroundColor: step.isRepeated ? '#d1fae5' : '#fee2e2',
                  borderRadius: 4,
                  border: `2px solid ${step.isRepeated ? '#10b981' : '#ef4444'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  color: step.isRepeated ? '#16a34a' : '#991b1b'
                }}>
                  Repeat {repIdx + 1}: {step.pattern}
                </div>
              ))}
            </div>
          </div>

          {step.isRepeated && (
            <div style={{
              padding: 10,
              backgroundColor: '#d1fae5',
              borderRadius: 4,
              border: '2px solid #10b981',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#10b981'
            }}>
              ✓ Perfect match! String = "{step.pattern}" × {step.n / step.patternLen}
            </div>
          )}

          {!step.isRepeated && (
            <div style={{
              padding: 10,
              backgroundColor: '#fee2e2',
              borderRadius: 4,
              border: '2px solid #ef4444',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#ef4444'
            }}>
              ✗ Does not match the full string
            </div>
          )}
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: step?.isRepeated ? '#d1fae5' : '#fee2e2',
          borderRadius: 6,
          border: `2px solid ${step?.isRepeated ? '#22c55e' : '#ef4444'}`,
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: step?.isRepeated ? '#16a34a' : '#991b1b'
        }}>
          {step?.isRepeated ? '✓ YES - REPEATING PATTERN' : '✗ NO - NOT A PATTERN'}
        </div>
        <div style={{
          fontSize: 12,
          color: step?.isRepeated ? '#15803d' : '#7f1d1d',
          marginTop: 8
        }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function RepeatedSubstringPatternVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { s: 'abab' })

  const steps = useMemo(
    () =>
      generateSteps(ex.s).map((current) => ({
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
      title: '🔁 Pattern Detection',
      content: (
        <VisualizationPanel
          s={ex.s}
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
