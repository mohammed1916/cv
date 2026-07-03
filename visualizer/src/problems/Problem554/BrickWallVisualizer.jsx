import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './BrickWallVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def brickWall(self, wall: List[List[int]]) -> int:' },
  { line: 3, text: '        edge_count = {}' },
  { line: 4, text: '        ' },
  { line: 5, text: '        for row in wall:' },
  { line: 6, text: '            position = 0' },
  { line: 7, text: '            for i in range(len(row) - 1):' },
  { line: 8, text: '                position += row[i]' },
  { line: 9, text: '                edge_count[position] = edge_count.get(position, 0) + 1' },
  { line: 10, text: '        ' },
  { line: 11, text: '        if not edge_count:' },
  { line: 12, text: '            return len(wall)' },
  { line: 13, text: '        ' },
  { line: 14, text: '        max_edges = max(edge_count.values())' },
  { line: 15, text: '        return len(wall) - max_edges' },
]

const PATTERNS = ['iterate', 'edge_count', 'find_max', 'result']
const LINE_PATTERN_MAP = {
  5: 'iterate',
  8: 'edge_count',
  9: 'edge_count',
  14: 'find_max',
  15: 'result',
}

function generateSteps(wallInput) {
  const steps = []

  if (!Array.isArray(wallInput) || wallInput.length === 0) {
    steps.push({
      phase: 'result',
      activeLine: 12,
      relatedLines: [12],
      message: 'No rows in wall. Return row count.',
      result: 0,
      done: true,
    })
    return steps
  }

  const wall = wallInput.map((row) => (Array.isArray(row) ? row : []))
  if (wall.some((r) => r.length === 0)) {
    steps.push({
      phase: 'result',
      activeLine: 12,
      relatedLines: [12],
      message: 'Invalid wall configuration.',
      result: wall.length,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'iterate',
    activeLine: 3,
    relatedLines: [3],
    message: 'Initialize edge count hash map.',
    edgeCount: {},
    rowIndex: -1,
  })

  const edgeCount = {}

  for (let rowIdx = 0; rowIdx < wall.length; rowIdx++) {
    const row = wall[rowIdx]

    steps.push({
      phase: 'iterate',
      activeLine: 5,
      relatedLines: [5],
      message: `Processing row ${rowIdx}: [${row.join(', ')}]`,
      edgeCount: { ...edgeCount },
      rowIndex: rowIdx,
      row,
    })

    steps.push({
      phase: 'iterate',
      activeLine: 6,
      relatedLines: [6],
      message: `Initialize position = 0 for row ${rowIdx}`,
      edgeCount: { ...edgeCount },
      rowIndex: rowIdx,
      position: 0,
      row,
    })

    let position = 0
    for (let i = 0; i < row.length - 1; i++) {
      position += row[i]

      steps.push({
        phase: 'edge_count',
        activeLine: 8,
        relatedLines: [8],
        message: `Add brick width ${row[i]} to position. New position: ${position}`,
        edgeCount: { ...edgeCount },
        rowIndex: rowIdx,
        brickIndex: i,
        position,
        row,
      })

      edgeCount[position] = (edgeCount[position] || 0) + 1

      steps.push({
        phase: 'edge_count',
        activeLine: 9,
        relatedLines: [9],
        message: `Record edge at position ${position}. Count: ${edgeCount[position]}`,
        edgeCount: { ...edgeCount },
        rowIndex: rowIdx,
        brickIndex: i,
        position,
        row,
      })
    }
  }

  steps.push({
    phase: 'find_max',
    activeLine: 14,
    relatedLines: [14],
    message: 'Find position with maximum edges.',
    edgeCount: { ...edgeCount },
  })

  if (Object.keys(edgeCount).length === 0) {
    steps.push({
      phase: 'result',
      activeLine: 12,
      relatedLines: [12],
      message: 'No edges found. Return total row count.',
      result: wall.length,
      done: true,
    })
    return steps
  }

  const maxEdges = Math.max(...Object.values(edgeCount))
  const maxPosition = Object.entries(edgeCount).find(([, count]) => count === maxEdges)[0]

  steps.push({
    phase: 'find_max',
    activeLine: 14,
    relatedLines: [14],
    message: `Maximum edges: ${maxEdges} at position ${maxPosition}`,
    edgeCount: { ...edgeCount },
    maxEdges,
    maxPosition: Number(maxPosition),
  })

  steps.push({
    phase: 'result',
    activeLine: 15,
    relatedLines: [15],
    message: `Minimum bricks to cross: ${wall.length} - ${maxEdges} = ${wall.length - maxEdges}`,
    result: wall.length - maxEdges,
    maxEdges,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples, wall }) {
  const wallWidth = useMemo(() => {
    if (!wall || wall.length === 0) return 0
    return wall[0].reduce((sum, brick) => sum + brick, 0)
  }, [wall])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brick Wall Visualization */}
      {wall && wall.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>Brick Wall</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {wall.map((row, rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  opacity: step?.rowIndex === rowIdx ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ fontSize: 10, color: '#94a3b8', minWidth: 25 }}>R{rowIdx}</div>
                <div style={{ display: 'flex', gap: 1, flex: 1 }}>
                  {row.map((brickWidth, brickIdx) => {
                    const isCurrentBrick = step?.rowIndex === rowIdx && step?.brickIndex === brickIdx
                    return (
                      <div
                        key={brickIdx}
                        style={{
                          flex: brickWidth,
                          height: 30,
                          backgroundColor: isCurrentBrick ? '#f59e0b' : '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#cbd5e1',
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {brickWidth}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Edge Positions Visualization */}
          {step?.position !== undefined && (
            <div style={{ marginTop: 16, fontSize: 11, color: '#cbd5e1' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#f59e0b' }}>Current Position: {step.position}</div>
              <div
                style={{
                  position: 'relative',
                  height: 60,
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                  border: '1px solid #334155',
                  marginBottom: 8,
                }}
              >
                {step.position > 0 && wallWidth > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(step.position / wallWidth) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: '#f59e0b',
                      transition: 'left 0.3s',
                    }}
                  />
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 8,
                    fontSize: 10,
                    color: '#64748b',
                  }}
                >
                  0
                </div>
                {wallWidth > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 8,
                      fontSize: 10,
                      color: '#64748b',
                    }}
                  >
                    {wallWidth}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edge Count Hash Map */}
      {step?.edgeCount && Object.keys(step.edgeCount).length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Edge Count Map</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: 8,
            }}
          >
            {Object.entries(step.edgeCount)
              .sort(([posA], [posB]) => Number(posA) - Number(posB))
              .map(([position, count]) => {
                const isMaxPosition = step?.maxPosition === Number(position)
                return (
                  <div
                    key={position}
                    style={{
                      padding: 8,
                      backgroundColor: isMaxPosition ? '#1e293b' : '#0f172a',
                      border: isMaxPosition ? '2px solid #22c55e' : '1px solid #334155',
                      borderRadius: 4,
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>pos {position}</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isMaxPosition ? '#22c55e' : '#f59e0b',
                      }}
                    >
                      {count}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Max Edges Info */}
      {step?.maxEdges !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #22c55e' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Maximum Edges</div>
          <div style={{ fontSize: 14, color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.maxEdges}
          </div>
        </div>
      )}

      {/* Result */}
      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Minimum Bricks to Cross</div>
          <div
            style={{
              fontSize: 20,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#f59e0b',
            }}
          >
            {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function BrickWallVisualizer() {
  const examples = useMemo(() => getExamples('brick-wall') || [], [])
  const [wallInput, setWallInput] = useState('[[1,1],[2],[1,1]]')

  const { wall, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(wallInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array of arrays')
      return { wall: parsed, inputError: '' }
    } catch (e) {
      return { wall: [], inputError: e.message }
    }
  }, [wallInput])

  const steps = useMemo(() => generateSteps(wall), [wall])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setWallInput(JSON.stringify(ex.wall || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
        title: '🧱 Brick Wall',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Wall (JSON)</div>
              <textarea
                value={wallInput}
                onChange={(e) => {
                  setWallInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 100,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} wall={wall} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, wallInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom, wall]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
