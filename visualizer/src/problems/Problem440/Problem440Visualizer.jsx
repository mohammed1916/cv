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
import { getExamples } from '../../config/examplesRegistry'
import './Problem440Visualizer.css'

const EXAMPLES = getExamples('kth-smallest-lexicographical-order')

function generateSteps(n, k) {
  const steps = []

  if (n < 1 || k < 1) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      n,
      k,
      current: 1,
      count: 0,
      result: -1,
      message: 'Invalid input',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    k,
    current: 1,
    count: 0,
    result: -1,
    message: `Find ${k}th number in lexicographical order [1, ${n}]`,
  })

  let current = 1
  let count = 0
  let result = -1

  for (let i = 0; i < k - 1; i++) {
    steps.push({
      activeLine: 2,
      phase: 'check',
      n,
      k,
      current,
      count,
      result: -1,
      iteration: i + 1,
      message: `Check number: ${current}`,
    })

    if (current * 10 <= n) {
      current *= 10
      steps.push({
        activeLine: 3,
        phase: 'go_deeper',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Go deeper: ${current}`,
      })
    } else if (current % 10 !== 9 && current + 1 <= n) {
      current += 1
      steps.push({
        activeLine: 4,
        phase: 'go_next',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Go to next: ${current}`,
      })
    } else {
      while (current / 10 % 10 === 9) {
        current = Math.floor(current / 10)
      }
      current = Math.floor(current / 10) * 10 + Math.floor(current / 10 % 10) + 1

      steps.push({
        activeLine: 5,
        phase: 'backtrack',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Backtrack to: ${current}`,
      })
    }

    count++
  }

  result = current

  steps.push({
    activeLine: 6,
    phase: 'complete',
    n,
    k,
    current,
    count,
    result,
    isComplete: true,
    message: `Found: ${result}`,
  })

  return steps
}

function NumberSequenceVisualization({ n, current, k }) {
  const numsToShow = Math.min(12, Math.max(5, Math.floor(n / 2)))
  const nums = Array.from({ length: numsToShow }, (_, i) => i + 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Numbers 1 to {n} (showing first {numsToShow})
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map((num) => {
            const isCurrent = num === current

            return (
              <motion.div
                key={num}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: isCurrent ? '#dc2626' : '#dbeafe',
                  border: isCurrent ? '2px solid #991b1b' : '2px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isCurrent ? 'white' : '#0c4a6e',
                }}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? '0 0 16px rgba(220, 38, 38, 0.5)' : 'none',
                }}
              >
                {num}
              </motion.div>
            )
          })}
          {numsToShow < n && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 13,
              color: '#64748b',
              fontWeight: 600,
            }}>
              ... {n}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LexicographicalTreeVisualization({ n, current }) {
  const renderLevel = () => {
    const currentStr = String(current)
    const levels = []

    for (let i = 0; i < currentStr.length; i++) {
      const prefix = currentStr.substring(0, i + 1)
      levels.push(prefix)
    }

    return levels
  }

  const levels = renderLevel()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Path in Lexicographical Tree</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        {levels.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {levels.map((level, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dbeafe',
                    borderRadius: 4,
                    border: '2px solid #0284c7',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                  animate={{ scale: 1 }}
                >
                  {level}
                </motion.div>
                {idx < levels.length - 1 && (
                  <div style={{ fontSize: 14, color: '#cbd5e1' }}>→</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Building path...</div>
        )}
      </div>
    </div>
  )
}

function StatsVisualization({ k, current, result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Statistics</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
        }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Target (K)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
            {k}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: result !== -1 ? '#ecfdf5' : '#fee2e2',
          borderRadius: 6,
          border: result !== -1 ? '2px solid #10b981' : '2px solid #ef4444',
        }}>
          <div style={{ fontSize: 11, color: result !== -1 ? '#047857' : '#dc2626', fontWeight: 600 }}>
            Result
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: result !== -1 ? '#10b981' : '#ef4444',
            marginTop: 4,
          }}>
            {result !== -1 ? result : '...'}
          </div>
        </div>
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

      <NumberSequenceVisualization
        n={step?.n || 10}
        current={step?.current}
        k={step?.k}
      />

      <LexicographicalTreeVisualization
        n={step?.n || 10}
        current={step?.current}
      />

      <StatsVisualization
        k={step?.k || 0}
        current={step?.current}
        result={step?.result || -1}
      />
    </div>
  )
}

export default function Problem440Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 13, k: 2, label: 'n=13, k=2' })

  const steps = useMemo(
    () =>
      generateSteps(ex.n, ex.k).map((current) => ({
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
      title: '123️ Lexicographical',
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
