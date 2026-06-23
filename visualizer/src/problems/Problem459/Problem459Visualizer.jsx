import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def repeatedSubstringPattern(s):' },
  { line: 2, text: '    n = len(s)' },
  { line: 3, text: '    for i in range(1, n // 2 + 1):' },
  { line: 4, text: '        if n % i == 0:' },
  { line: 5, text: '            pattern = s[:i]' },
  { line: 6, text: '            if pattern * (n // i) == s:' },
  { line: 7, text: '                return True' },
  { line: 8, text: '    return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('repeated-substring-pattern') || [
  { label: 'Example 1', s: 'abab', expected: true },
  { label: 'Example 2', s: 'aba', expected: false },
  { label: 'Example 3', s: 'abcabcabcabc', expected: true },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [2] },
  { id: 'loop', label: 'Loop Through', lines: [3, 4] },
  { id: 'check', label: 'Check Pattern', lines: [5, 6, 7] },
  { id: 'return', label: 'Return', lines: [8] },
]

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      s: '',
      result: false,
      stepNum: 0,
      message: 'Empty string.',
    }]
  }

  if (s.length === 1) {
    return [{
      phase: 'done',
      activeLine: 8,
      s,
      result: false,
      stepNum: 0,
      message: 'Single character cannot have repeating pattern.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    s,
    n: s.length,
    stepNum: 0,
    message: `Checking if "${s}" has repeated pattern (length ${s.length})`,
  })

  const n = s.length
  let found = false
  let stepNum = 1

  for (let i = 1; i <= Math.min(n / 2, 5); i++) {
    steps.push({
      phase: 'checking_length',
      activeLine: 3,
      s,
      n,
      i,
      stepNum,
      message: `Checking pattern length ${i}`,
    })
    stepNum++

    if (n % i === 0) {
      steps.push({
        phase: 'divisible',
        activeLine: 4,
        s,
        n,
        i,
        stepNum,
        message: `${n} is divisible by ${i} (${n / i} times)`,
      })
      stepNum++

      const pattern = s.substring(0, i)
      const repetitions = n / i

      steps.push({
        phase: 'extracted_pattern',
        activeLine: 5,
        s,
        n,
        i,
        pattern,
        repetitions,
        stepNum,
        message: `Pattern extracted: "${pattern}" (repeat ${repetitions} times)`,
      })
      stepNum++

      const reconstructed = pattern.repeat(repetitions)
      const matches = reconstructed === s

      steps.push({
        phase: 'comparing',
        activeLine: 6,
        s,
        n,
        i,
        pattern,
        repetitions,
        reconstructed,
        matches,
        stepNum,
        message: `"${pattern}" repeated ${repetitions}x = "${reconstructed}" ${matches ? '✓' : '✗'}`,
      })
      stepNum++

      if (matches) {
        steps.push({
          phase: 'found',
          activeLine: 7,
          s,
          pattern,
          stepNum,
          message: `Found! Pattern "${pattern}" repeats in string.`,
        })
        stepNum++

        found = true
        break
      }
    } else {
      steps.push({
        phase: 'not_divisible',
        activeLine: 4,
        s,
        n,
        i,
        stepNum,
        message: `${n} not divisible by ${i}, skip`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 8,
    s,
    result: found,
    stepNum,
    message: found ? `Pattern found!` : `No repeating pattern found.`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'checking_length') return 'loop'
  if (phase === 'divisible' || phase === 'not_divisible') return 'loop'
  if (phase === 'extracted_pattern' || phase === 'comparing' || phase === 'found') return 'check'
  if (phase === 'done') return 'return'
  return 'init'
}

function StringVisualization({ step }) {
  const s = step?.s || ''
  const pattern = step?.pattern || ''
  const repetitions = step?.repetitions ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Original String
        </header>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 4,
          border: '2px solid #3b82f6',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 600,
          color: '#1e40af',
          wordBreak: 'break-all',
          minHeight: 40,
        }}>
          "{s}"
        </div>
      </div>

      {pattern && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
              Pattern Found
            </header>
            <div style={{
              padding: 12,
              backgroundColor: '#fef3c7',
              borderRadius: 4,
              border: '2px solid #fcd34d',
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 600,
              color: '#92400e',
              minHeight: 40,
            }}>
              "{pattern}"
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
              Reconstructed ({repetitions}x)
            </header>
            <div style={{
              padding: 12,
              backgroundColor: '#d1fae5',
              borderRadius: 4,
              border: '2px solid #10b981',
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 600,
              color: '#047857',
              wordBreak: 'break-all',
              minHeight: 40,
            }}>
              "{pattern.repeat(repetitions)}"
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: Math.min(repetitions, 4) }).map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  padding: 8,
                  backgroundColor: '#ede9fe',
                  borderRadius: 4,
                  border: '1px solid #8b5cf6',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#5b21b6',
                }}
              >
                "{pattern}"
              </motion.div>
            ))}
            {repetitions > 4 && (
              <div style={{
                padding: 8,
                backgroundColor: '#f3f4f6',
                borderRadius: 4,
                border: '1px solid #d1d5db',
                fontSize: 12,
                fontWeight: 600,
                color: '#1f2937',
              }}>
                ...+{repetitions - 4} more
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function VisualizationPanel({ step, s, EXAMPLES, handleExampleClick, sInput, setSInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          String Input
        </label>
        <input
          value={sInput}
          onChange={(e) => { setSInput(e.target.value); handleReset() }}
          placeholder="e.g., abab"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <StringVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Pattern Matching
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Check all divisors of string length as potential pattern lengths, then verify.
        </div>
      </div>
    </section>
  )
}

export default function Problem459Visualizer() {
  const [sInput, setSInput] = useState('abab')

  const s = useMemo(() => {
    return sInput ? String(sInput) : ''
  }, [sInput])

  const steps = useMemo(
    () => generateSteps(s).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setSInput(ex.s)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          step={step}
          s={s}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          sInput={sInput}
          setSInput={setSInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    s,
    sInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
