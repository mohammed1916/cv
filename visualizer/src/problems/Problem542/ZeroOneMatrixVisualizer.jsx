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
import { getExamplesOr } from '../../config/examplesRegistry'
import './ZeroOneMatrixVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:' },
  { line: 3, text: '        rows, cols = len(mat), len(mat[0])' },
  { line: 4, text: '        result = [[float("inf")] * cols for _ in range(rows)]' },
  { line: 5, text: '        queue = collections.deque()' },
  { line: 6, text: '        ' },
  { line: 7, text: '        for r in range(rows):' },
  { line: 8, text: '            for c in range(cols):' },
  { line: 9, text: '                if mat[r][c] == 0:' },
  { line: 10, text: '                    result[r][c] = 0' },
  { line: 11, text: '                    queue.append((r, c))' },
  { line: 12, text: '        ' },
  { line: 13, text: '        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]' },
  { line: 14, text: '        while queue:' },
  { line: 15, text: '            r, c = queue.popleft()' },
  { line: 16, text: '            for dr, dc in directions:' },
  { line: 17, text: '                nr, nc = r + dr, c + dc' },
  { line: 18, text: '                if 0 <= nr < rows and 0 <= nc < cols:' },
  { line: 19, text: '                    if result[nr][nc] > result[r][c] + 1:' },
  { line: 20, text: '                        result[nr][nc] = result[r][c] + 1' },
  { line: 21, text: '                        queue.append((nr, nc))' },
  { line: 22, text: '        return result' },
]

const PATTERNS = ['init', 'init_queue', 'processing', 'update', 'done']
const LINE_PATTERN_MAP = {
  7: 'init',
  11: 'init_queue',
  15: 'processing',
  20: 'update',
  22: 'done',
}

function generateSteps(matrix) {
  const steps = []
  if (!matrix || matrix.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 22,
      relatedLines: [22],
      message: 'Empty matrix.',
      result: [],
      processed: 0,
    })
    return steps
  }

  const rows = matrix.length
  const cols = matrix[0].length
  const result = Array(rows).fill(0).map(() => Array(cols).fill(Infinity))
  const queue = []

  steps.push({
    phase: 'init',
    activeLine: 4,
    relatedLines: [3, 4, 5],
    message: 'Initialize result matrix with infinity and empty queue.',
    result: result.map(r => [...r]),
    queueSize: 0,
    processed: 0,
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 0) {
        result[r][c] = 0
        queue.push([r, c])
      }
    }
  }

  steps.push({
    phase: 'init_queue',
    activeLine: 11,
    relatedLines: [7, 8, 9, 10, 11],
    message: `Queue initialized with ${queue.length} zero cells (sources).`,
    result: result.map(r => [...r]),
    queue: [...queue],
    queueSize: queue.length,
    processed: 0,
  })

  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  let processed = 0

  while (queue.length > 0) {
    const [r, c] = queue.shift()
    processed++

    for (const [dr, dc] of directions) {
      const nr = r + dr
      const nc = c + dc

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (result[nr][nc] > result[r][c] + 1) {
          result[nr][nc] = result[r][c] + 1
          queue.push([nr, nc])

          steps.push({
            phase: 'update',
            activeLine: 20,
            relatedLines: [16, 17, 18, 19, 20, 21],
            message: `Update result[${nr}][${nc}] = ${result[nr][nc]} (from result[${r}][${c}] + 1)`,
            result: result.map(row => [...row]),
            currentCell: [nr, nc],
            dist: result[nr][nc],
            queue: [...queue],
            queueSize: queue.length,
            processed,
          })
        }
      }
    }

    if (processed % Math.max(1, Math.ceil((rows * cols) / 8)) === 0) {
      steps.push({
        phase: 'processing',
        activeLine: 15,
        relatedLines: [14, 15, 16],
        message: `Processed ${processed} cells. Queue size: ${queue.length}.`,
        result: result.map(row => [...row]),
        queue: [...queue],
        queueSize: queue.length,
        processed,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 22,
    relatedLines: [22],
    message: 'BFS complete. All distances calculated.',
    result: result.map(row => [...row]),
    queue: [],
    queueSize: 0,
    processed,
    done: true,
  })

  return steps
}

function VisualizationPanel({ matrix, step, applyExample, examples }) {
  const rows = step?.result?.length || 0
  const cols = rows > 0 ? step.result[0].length : 0
  const cellSize = Math.min(60, 300 / Math.max(cols, 1))

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

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Matrix (distances to nearest 0)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 4, alignContent: 'start' }}>
          <AnimatePresence mode="popLayout">
            {step?.result?.map((row, r) =>
              row.map((dist, c) => {
                const isZero = matrix[r]?.[c] === 0
                const isCurrent = step?.currentCell?.[0] === r && step?.currentCell?.[1] === c
                const isInQueue = step?.queue?.some(([qr, qc]) => qr === r && qc === c)

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: isZero
                        ? '#22c55e'
                        : isCurrent
                          ? '#f59e0b'
                          : isInQueue
                            ? '#38bdf8'
                            : dist === Infinity
                              ? '#475569'
                              : '#334155',
                      borderColor: isCurrent ? '#fbbf24' : isInQueue ? '#0ea5e9' : '#64748b',
                      color: '#e2e8f0',
                    }}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {dist === Infinity ? '∞' : dist}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Status</div>
        <div style={{ fontSize: 12, color: '#e2e8f0' }}>
          {step?.message || 'Initialize algorithm...'}
        </div>
        {step?.queueSize !== undefined && (
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            Queue size: {step.queueSize} | Processed: {step.processed}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ZeroOneMatrixVisualizer() {
  const defaultMatrix = [[0, 0, 0], [0, 1, 0], [1, 1, 1]]
  const examples = useMemo(() => getExamplesOr('01-matrix', []), [])
  const [matrixInput, setMatrixInput] = useState(JSON.stringify(defaultMatrix))

  const { matrix, inputError } = useMemo(() => {
    try {
      const m = JSON.parse(matrixInput)
      if (!Array.isArray(m) || !m.every(row => Array.isArray(row))) {
        throw new Error('Invalid matrix format')
      }
      return { matrix: m, inputError: '' }
    } catch (e) {
      return { matrix: [], inputError: e.message }
    }
  }, [matrixInput])

  const steps = useMemo(() => generateSteps(matrix), [matrix])
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
      setMatrixInput(JSON.stringify(ex.mat || ex))
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
        title: '📊 Matrix Distances',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input</div>
              <textarea
                value={matrixInput}
                onChange={(e) => {
                  setMatrixInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder="[[0,0,0],[0,1,0],[1,1,1]]"
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel matrix={matrix} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, matrixInput, matrix, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
