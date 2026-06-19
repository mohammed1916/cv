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
import './RandomFlipMatrixVisualizer.css'

const EXAMPLES = getExamples('random-flip-matrix')

function generateSteps(m, n, flips) {
  const steps = []

  steps.push({
    activeLine: 1,
    m,
    n,
    flipped: new Set(),
    total: m * n,
    flipIdx: -1,
    message: `Initialize ${m}x${n} matrix with ${m * n} cells`,
    relatedLines: [1]
  })

  const flipped = new Set()

  flips.forEach((flip, flipIdx) => {
    const cell = flip[0] * n + flip[1]

    steps.push({
      activeLine: 2,
      m,
      n,
      flipped: new Set(flipped),
      total: m * n - flipped.size,
      flipIdx,
      currentFlip: flip,
      message: `Flip cell [${flip[0]}, ${flip[1]}]`,
      relatedLines: [2]
    })

    flipped.add(cell)

    steps.push({
      activeLine: 3,
      m,
      n,
      flipped: new Set(flipped),
      total: m * n - flipped.size,
      flipIdx,
      currentFlip: flip,
      message: `Cell [${flip[0]}, ${flip[1]}] flipped. Remaining: ${m * n - flipped.size}`,
      relatedLines: [3]
    })
  })

  steps.push({
    activeLine: 4,
    m,
    n,
    flipped,
    done: true,
    result: Array.from(flipped).map(cell => [Math.floor(cell / n), cell % n]),
    message: `All flips complete`,
    relatedLines: [4]
  })

  return steps
}

function VisualizationPanel({ m, n, flips, step, applyEx }) {
  const flipped = step?.flipped || new Set()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#faf5ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>
          "Randomly flip cells in matrix without replacement. Use mapping to track flipped cells."
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

      {/* Matrix */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Matrix ({m}x{n})
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gap: 4,
          maxWidth: '300px'
        }}>
          {Array.from({ length: m * n }).map((_, idx) => {
            const row = Math.floor(idx / n)
            const col = idx % n
            const isCellFlipped = flipped.has(idx)
            const isCurrentFlip = step && step.currentFlip && step.currentFlip[0] === row && step.currentFlip[1] === col

            return (
              <motion.div
                key={`cell-${idx}`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 4,
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isCurrentFlip ? '#f472b6' : isCellFlipped ? '#e9d5ff' : '#f1f5f9',
                  borderColor: isCurrentFlip ? '#ec4899' : isCellFlipped ? '#c084fc' : '#cbd5e1',
                  color: isCurrentFlip ? '#fff' : isCellFlipped ? '#7c3aed' : '#334155'
                }}
                animate={{ scale: isCurrentFlip ? 1.2 : 1 }}
              >
                {isCellFlipped ? '1' : '0'}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Flip Log */}
      {flips.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#faf5ff',
            borderRadius: 6,
            border: '1px solid #e9d5ff'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>
            Flip History
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto' }}>
            {flips.map((flip, idx) => {
              const isActive = step && idx === step.flipIdx
              return (
                <div key={idx} style={{
                  padding: '6px 12px',
                  backgroundColor: isActive ? '#e9d5ff' : '#f3f4f6',
                  borderRadius: 4,
                  border: `1px solid ${isActive ? '#c084fc' : '#cbd5e1'}`,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? '#7c3aed' : '#334155'
                }}>
                  [{flip[0]}, {flip[1]}]
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#faf5ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' }}>
          Flipped: {flipped.size} / Total: {m * n}
        </div>
        <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function RandomFlipMatrixVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { m: 3, n: 3, flips: [[1, 0], [1, 1]] })
  const SOLUTION_CODE = useSolutionCode('random-flip-matrix')

  const steps = useMemo(
    () =>
      generateSteps(ex.m, ex.n, ex.flips).map((current) => ({
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
      title: '🎲 Random Flip Matrix',
      content: (
        <VisualizationPanel
          m={ex.m}
          n={ex.n}
          flips={ex.flips}
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
