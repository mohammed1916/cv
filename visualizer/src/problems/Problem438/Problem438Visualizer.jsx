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
import './Problem438Visualizer.css'

const EXAMPLES = getExamples('find-all-anagrams-in-string')

function generateSteps(s, p) {
  const steps = []

  if (!s || !p || p.length > s.length) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      s,
      p,
      windowStart: 0,
      windowEnd: 0,
      result: [],
      message: 'Invalid input',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    s,
    p,
    windowStart: 0,
    windowEnd: 0,
    result: [],
    message: `Find anagrams of "${p}" in "${s}"`,
  })

  const pLen = p.length
  const result = []

  for (let i = 0; i <= s.length - pLen; i++) {
    const window = s.substring(i, i + pLen)

    steps.push({
      activeLine: 2,
      phase: 'window',
      s,
      p,
      windowStart: i,
      windowEnd: i + pLen,
      result: [...result],
      window,
      message: `Check window [${i}, ${i + pLen - 1}]: "${window}"`,
    })

    const pChars = p.split('').sort().join('')
    const windowChars = window.split('').sort().join('')

    if (pChars === windowChars) {
      result.push(i)

      steps.push({
        activeLine: 3,
        phase: 'found',
        s,
        p,
        windowStart: i,
        windowEnd: i + pLen,
        result: [...result],
        window,
        message: `Found anagram at index ${i}: "${window}"`,
      })
    }
  }

  steps.push({
    activeLine: 4,
    phase: 'complete',
    s,
    p,
    windowStart: 0,
    windowEnd: 0,
    result: [...result],
    isComplete: true,
    message: `Found ${result.length} anagram(s)`,
  })

  return steps
}

function StringVisualization({ s, windowStart, windowEnd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>String with Window</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {s && s.split('').map((char, idx) => {
            const inWindow = idx >= windowStart && idx < windowEnd

            return (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: inWindow ? '#dbeafe' : '#f1f5f9',
                  border: inWindow ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: inWindow ? '#0c4a6e' : '#64748b',
                }}
                animate={{ scale: inWindow ? 1.1 : 1 }}
                >
                  {char}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                  {idx}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PatternVisualization({ p }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Pattern to Find</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f3e8ff',
        borderRadius: 8,
        border: '2px solid #8b5cf6',
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {p && p.split('').map((char, idx) => (
            <div
              key={idx}
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                backgroundColor: '#ede9fe',
                border: '2px solid #8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#6b21a8',
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultsVisualization({ s, result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Anagram Start Indices</div>
      <div style={{
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        border: '2px solid #10b981',
        minHeight: 60,
      }}>
        {result && result.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.map((idx, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#d1fae5',
                  borderRadius: 4,
                  border: '2px solid #10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#047857',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {idx}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No anagrams found yet</div>
        )}
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

      <PatternVisualization p={step?.p} />

      <StringVisualization
        s={step?.s}
        windowStart={step?.windowStart || 0}
        windowEnd={step?.windowEnd || 0}
      />

      <ResultsVisualization
        s={step?.s}
        result={step?.result || []}
      />
    </div>
  )
}

export default function Problem438Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { s: 'cbaebabacd', p: 'abc', label: 'Example 1' })
  const SOLUTION_CODE = useSolutionCode('find-all-anagrams-in-string')

  const steps = useMemo(
    () =>
      generateSteps(ex.s, ex.p).map((current) => ({
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
      title: '🔤 Anagrams',
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
