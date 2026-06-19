import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './Problem429Visualizer.css'

const EXAMPLES = getExamples('nary-tree-level-order')

function generateSteps(levels) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    levels,
    queue: [levels[0]],
    result: [],
    currentLevel: 0,
    message: `Start level order traversal (BFS) of N-ary tree`,
  })

  let queue = [levels[0]]
  let result = [[levels[0]]]
  let currentLevel = 0

  for (let i = 1; i < Math.min(levels.length, 4); i++) {
    queue.push(levels[i])
    result.push([levels[i]])

    steps.push({
      activeLine: 2,
      phase: 'process_level',
      levels,
      queue: [...queue],
      result: result.map(r => [...r]),
      currentLevel: i,
      currentNode: levels[i],
      message: `Process level ${i}: [${levels.slice(0, i + 1).join(', ')}]`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'complete',
    levels,
    queue: [],
    result: result.map(r => [...r]),
    currentLevel: levels.length,
    isComplete: true,
    message: `Level order traversal complete`,
  })

  return steps
}

function QueueVisualization({ queue, currentNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Queue</div>
      <div style={{
        display: 'flex',
        gap: 8,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 60,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {queue.length > 0 ? (
          <>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Front:</div>
            {queue.map((node, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: node === currentNode ? '3px solid #0284c7' : '2px solid #cbd5e1',
                  backgroundColor: node === currentNode ? '#dbeafe' : '#f1f5f9',
                  fontSize: 12,
                  fontWeight: 600,
                  color: node === currentNode ? '#0c4a6e' : '#64748b',
                }}
                animate={{
                  scale: node === currentNode ? 1.08 : 1,
                }}
              >
                {node}
              </motion.div>
            ))}
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>:Back</div>
          </>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>queue empty</div>
        )}
      </div>
    </div>
  )
}

function LevelOrderVisualization({ levels, currentLevel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Tree Structure</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {levels.map((node, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: '10px 12px',
              borderRadius: 4,
              border: idx <= currentLevel ? '2px solid #10b981' : '2px solid #cbd5e1',
              backgroundColor: idx <= currentLevel ? '#ecfdf5' : '#f1f5f9',
              fontSize: 12,
              fontWeight: 600,
              color: idx <= currentLevel ? '#047857' : '#64748b',
            }}
            animate={{
              opacity: idx <= currentLevel ? 1 : 0.6,
            }}
          >
            Level {idx}: <span style={{ fontFamily: 'monospace' }}>{node}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ResultVisualization({ result, isComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Result {isComplete && '✓'}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {result.length > 0 ? (
          result.map((level, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: 4,
                backgroundColor: '#dbeafe',
                border: '1px solid #0284c7',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#0c4a6e',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              [{level.join(', ')}]
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>building result...</div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <QueueVisualization
          queue={step?.queue || []}
          currentNode={step?.currentNode}
        />

        <LevelOrderVisualization
          levels={step?.levels || []}
          currentLevel={step?.currentLevel || 0}
        />

        <ResultVisualization
          result={step?.result || []}
          isComplete={step?.isComplete || false}
        />
      </div>
    </div>
  )
}

export default function Problem429Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { levels: [1, 2, 3, 4, 5, 6, 7], label: 'NaryTree' })
  const SOLUTION_CODE = useSolutionCode('nary-tree-level-order')

  const steps = useMemo(
    () =>
      generateSteps(ex.levels).map((current) => ({
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
      title: '🌳 Level Order',
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
