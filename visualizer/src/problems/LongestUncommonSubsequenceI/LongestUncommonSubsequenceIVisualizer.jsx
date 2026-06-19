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
import './LongestUncommonSubsequenceIVisualizer.css'

const EXAMPLES = getExamples('longest-uncommon-subsequence-i')

function generateSteps(a, b) {
  const steps = []

  steps.push({
    activeLine: 1,
    a,
    b,
    message: `Compare "${a}" and "${b}"`,
    relatedLines: [1]
  })

  if (a === b) {
    steps.push({
      activeLine: 2,
      a,
      b,
      done: true,
      result: -1,
      message: 'Strings are equal, no uncommon subsequence',
      relatedLines: [2]
    })
    return steps
  }

  const result = Math.max(a.length, b.length)

  steps.push({
    activeLine: 3,
    a,
    b,
    done: true,
    result,
    message: `Strings differ. Longer string is uncommon: "${a.length > b.length ? a : b}" (length ${result})`,
    relatedLines: [3]
  })

  return steps
}

function VisualizationPanel({ a, b, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#78350f', fontStyle: 'italic' }}>
          "An uncommon subsequence is a string that is NOT a subsequence of the other string."
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

      {/* Strings */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Strings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>String A:</div>
            <motion.div
              style={{
                padding: '12px 16px',
                borderRadius: 6,
                border: '2px solid #f59e0b',
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: '#fef3c7',
                color: '#78350f'
              }}
              animate={{ scale: a.length > b.length ? 1.05 : 1 }}
            >
              "{a}" ({a.length})
            </motion.div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>String B:</div>
            <motion.div
              style={{
                padding: '12px 16px',
                borderRadius: 6,
                border: '2px solid #f59e0b',
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: '#fef3c7',
                color: '#78350f'
              }}
              animate={{ scale: b.length > a.length ? 1.05 : 1 }}
            >
              "{b}" ({b.length})
            </motion.div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '1px solid #f59e0b'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>
          Analysis
        </div>
        <div style={{
          padding: '8px 12px',
          backgroundColor: a === b ? '#fecaca' : '#d1fae5',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          color: a === b ? '#7f1d1d' : '#065f46'
        }}>
          {a === b ? 'Strings are identical' : 'Strings are different'}
        </div>
      </motion.div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Result</div>
        <div style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: step?.result === -1 ? '#ef4444' : '#f59e0b'
        }}>
          {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LongestUncommonSubsequenceIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { a: 'aba', b: 'cdc' })
  const SOLUTION_CODE = useSolutionCode('longest-uncommon-subsequence-i')

  const steps = useMemo(
    () =>
      generateSteps(ex.a, ex.b).map((current) => ({
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
      title: '🔤 Longest Uncommon Subsequence I',
      content: (
        <VisualizationPanel
          a={ex.a}
          b={ex.b}
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
