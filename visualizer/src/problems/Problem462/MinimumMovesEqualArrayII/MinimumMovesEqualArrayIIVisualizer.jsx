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
import './MinimumMovesEqualArrayIIVisualizer.css'

const EXAMPLES = getExamples('minimum-moves-to-equal-array-elements-ii')

function generateSteps(nums) {
  const steps = []
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const median = sorted[Math.floor(n / 2)]

  steps.push({
    activeLine: 1,
    nums: sorted,
    median: -1,
    totalMoves: 0,
    message: 'Initialize: Sort the array'
  })

  steps.push({
    activeLine: 2,
    nums: sorted,
    median,
    totalMoves: 0,
    message: `Find median at index ${Math.floor(n / 2)}: ${median}`
  })

  let totalMoves = 0
  const moves = []

  for (let i = 0; i < n; i++) {
    const move = Math.abs(sorted[i] - median)
    moves.push({ index: i, value: sorted[i], move })
    totalMoves += move

    steps.push({
      activeLine: 3,
      nums: sorted,
      median,
      moves: moves.slice(),
      currentIdx: i,
      totalMoves,
      message: `Calculate moves for ${sorted[i]}: |${sorted[i]} - ${median}| = ${move}`
    })
  }

  steps.push({
    activeLine: 4,
    nums: sorted,
    median,
    moves,
    currentIdx: -1,
    totalMoves,
    done: true,
    message: `Total minimum moves: ${totalMoves}`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          "You can increment or decrement any element by 1. What's the minimum total moves to make all elements equal? The median minimizes sum of absolute distances!"
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

      {/* Original Array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Original Array</div>
        <div style={{
          padding: 12,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {nums.map((val, idx) => (
            <motion.div
              key={`orig-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid #cbd5e1',
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#334155'
              }}
            >
              {val}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sorted Array with Median */}
      {step && step.nums && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #22c55e'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 12 }}>
            Sorted Array (Median: {step.median})
          </div>
          <div style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {step.nums.map((val, idx) => {
              const isMedian = val === step.median
              const isCurrent = step.currentIdx === idx

              return (
                <motion.div
                  key={`sorted-${idx}`}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: isCurrent ? '#dbeafe' : isMedian ? '#d1fae5' : '#f1f5f9',
                    borderColor: isCurrent ? '#0284c7' : isMedian ? '#10b981' : '#cbd5e1',
                    color: isCurrent ? '#0c4a6e' : isMedian ? '#047857' : '#334155'
                  }}
                  animate={{ scale: isCurrent || isMedian ? 1.1 : 1 }}
                >
                  {val}
                  {isMedian && <div style={{ fontSize: 10, color: '#10b981', fontWeight: 500 }}>median</div>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Moves Calculation */}
      {step && step.moves && step.moves.length > 0 && (
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
            Moves Required to Reach Median ({step.median})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8
          }}>
            {step.moves.map((m, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: 10,
                  backgroundColor: '#e9d5ff',
                  borderRadius: 4,
                  border: '2px solid #c084fc',
                  textAlign: 'center'
                }}
                animate={{ scale: step.currentIdx === idx ? 1.05 : 1 }}
              >
                <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 600 }}>
                  {m.value} → {step.median}
                </div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#7c3aed', marginTop: 4 }}>
                  {m.move}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Total Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f3e8ff',
          borderRadius: 6,
          border: '2px solid #d8b4fe',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>
          Minimum Total Moves
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#a855f7',
          marginBottom: 8
        }}>
          {step?.totalMoves ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#6b21a8' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function MinimumMovesEqualArrayIIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [1, 0, 0, 8, 6] })

  const steps = useMemo(
    () =>
      generateSteps(ex.nums).map((current) => ({
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
      title: '↕️ Minimum Moves',
      content: (
        <VisualizationPanel
          nums={ex.nums}
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
