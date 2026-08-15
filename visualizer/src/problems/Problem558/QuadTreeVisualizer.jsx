import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './QuadTreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def construct(self, grid: List[List[int]]) -> Node:' },
  { line: 3, text: '        def buildTree(row: int, col: int, size: int) -> Node:' },
  { line: 4, text: '            # Check if all values in region are same' },
  { line: 5, text: '            allSame = True' },
  { line: 6, text: '            val = grid[row][col]' },
  { line: 7, text: '            for i in range(row, row + size):' },
  { line: 8, text: '                for j in range(col, col + size):' },
  { line: 9, text: '                    if grid[i][j] != val:' },
  { line: 10, text: '                        allSame = False' },
  { line: 11, text: '                        break' },
  { line: 12, text: '            ' },
  { line: 13, text: '            if allSame:' },
  { line: 14, text: '                return Node(val=val, isLeaf=True)' },
  { line: 15, text: '            ' },
  { line: 16, text: '            # Divide into 4 quadrants' },
  { line: 17, text: '            halfSize = size // 2' },
  { line: 18, text: '            topLeft = buildTree(row, col, halfSize)' },
  { line: 19, text: '            topRight = buildTree(row, col + halfSize, halfSize)' },
  { line: 20, text: '            bottomLeft = buildTree(row + halfSize, col, halfSize)' },
  { line: 21, text: '            bottomRight = buildTree(row + halfSize, col + halfSize, halfSize)' },
  { line: 22, text: '            ' },
  { line: 23, text: '            return Node(val=1, isLeaf=False,' },
  { line: 24, text: '                       topLeft=topLeft, topRight=topRight,' },
  { line: 25, text: '                       bottomLeft=bottomLeft, bottomRight=bottomRight)' },
  { line: 26, text: '        ' },
  { line: 27, text: '        return buildTree(0, 0, len(grid))' },
]

const PATTERNS = ['check', 'subdivide', 'leaf', 'recurse', 'done']
const LINE_PATTERN_MAP = {
  7: 'check',
  9: 'check',
  13: 'leaf',
  14: 'leaf',
  17: 'subdivide',
  18: 'recurse',
  19: 'recurse',
  20: 'recurse',
  21: 'recurse',
  27: 'done',
}

function generateSteps(gridSize, customGrid = null) {
  const steps = []

  // Generate or use custom grid
  const grid = customGrid || generateRandomGrid(gridSize)

  // Validate grid
  if (!Array.isArray(grid) || grid.length === 0 || grid.length !== gridSize) {
    steps.push({
      phase: 'done',
      activeLine: 27,
      relatedLines: [27],
      message: 'Invalid grid input.',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'check',
    activeLine: 3,
    relatedLines: [3],
    message: `Starting quad tree construction for ${gridSize}x${gridSize} grid`,
    gridSize,
    grid,
  })

  const visited = new Set()

  function buildTreeSteps(row, col, size, depth = 0) {
    const regionKey = `${row},${col},${size}`

    // Check if all values are same
    steps.push({
      phase: 'check',
      activeLine: 5,
      relatedLines: [5, 6, 7, 8, 9],
      message: `Checking region [${row}:${row + size}, ${col}:${col + size}]`,
      currentRegion: { row, col, size, depth },
      grid,
    })

    let allSame = true
    const val = grid[row][col]

    for (let i = row; i < row + size; i++) {
      for (let j = col; j < col + size; j++) {
        if (grid[i][j] !== val) {
          allSame = false
          break
        }
      }
      if (!allSame) break
    }

    if (allSame) {
      steps.push({
        phase: 'leaf',
        activeLine: 13,
        relatedLines: [13, 14],
        message: `All values are ${val}. Creating leaf node.`,
        currentRegion: { row, col, size, depth },
        isLeaf: true,
        nodeValue: val,
        grid,
      })
      return { val, isLeaf: true }
    }

    // Subdivide
    steps.push({
      phase: 'subdivide',
      activeLine: 17,
      relatedLines: [17, 18, 19, 20, 21],
      message: `Region has mixed values. Subdividing into 4 quadrants.`,
      currentRegion: { row, col, size, depth },
      grid,
    })

    const halfSize = size / 2

    steps.push({
      phase: 'recurse',
      activeLine: 18,
      relatedLines: [18],
      message: `Recursing: Top-Left [${row}:${row + halfSize}, ${col}:${col + halfSize}]`,
      currentRegion: { row, col, size, depth },
      nextRegion: { row, col, size: halfSize },
      grid,
    })
    const topLeft = buildTreeSteps(row, col, halfSize, depth + 1)

    steps.push({
      phase: 'recurse',
      activeLine: 19,
      relatedLines: [19],
      message: `Recursing: Top-Right [${row}:${row + halfSize}, ${col + halfSize}:${col + size}]`,
      currentRegion: { row, col, size, depth },
      nextRegion: { row, col: col + halfSize, size: halfSize },
      grid,
    })
    const topRight = buildTreeSteps(row, col + halfSize, halfSize, depth + 1)

    steps.push({
      phase: 'recurse',
      activeLine: 20,
      relatedLines: [20],
      message: `Recursing: Bottom-Left [${row + halfSize}:${row + size}, ${col}:${col + halfSize}]`,
      currentRegion: { row, col, size, depth },
      nextRegion: { row: row + halfSize, col, size: halfSize },
      grid,
    })
    const bottomLeft = buildTreeSteps(row + halfSize, col, halfSize, depth + 1)

    steps.push({
      phase: 'recurse',
      activeLine: 21,
      relatedLines: [21],
      message: `Recursing: Bottom-Right [${row + halfSize}:${row + size}, ${col + halfSize}:${col + size}]`,
      currentRegion: { row, col, size, depth },
      nextRegion: { row: row + halfSize, col: col + halfSize, size: halfSize },
      grid,
    })
    const bottomRight = buildTreeSteps(row + halfSize, col + halfSize, halfSize, depth + 1)

    steps.push({
      phase: 'subdivide',
      activeLine: 23,
      relatedLines: [23, 24, 25],
      message: `Creating internal node with 4 children.`,
      currentRegion: { row, col, size, depth },
      grid,
    })

    return {
      val: 1,
      isLeaf: false,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    }
  }

  const tree = buildTreeSteps(0, 0, gridSize)

  steps.push({
    phase: 'done',
    activeLine: 27,
    relatedLines: [27],
    message: `Quad tree construction complete!`,
    done: true,
    tree,
    grid,
  })

  return steps
}

function generateRandomGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * 2))
  )
}

function GridVisualization({ grid, currentRegion, highlightRegions = [] }) {
  if (!grid || grid.length === 0) return null

  const cellSize = Math.max(20, Math.min(40, 400 / grid.length))
  const gridSize = grid.length * cellSize

  return (
    <div style={{ position: 'relative', width: gridSize + 2, height: gridSize + 2, border: '1px solid #64748b', background: '#0f172a' }}>
      {/* Highlight regions */}
      {highlightRegions.map((region, idx) => {
        const top = region.row * cellSize
        const left = region.col * cellSize
        const size = region.size * cellSize
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top,
              left,
              width: size,
              height: size,
              border: `2px dashed ${region.color || '#f59e0b'}`,
              pointerEvents: 'none',
              opacity: region.opacity || 0.7,
            }}
          />
        )
      })}

      {/* Current region highlight */}
      {currentRegion && (
        <motion.div
          style={{
            position: 'absolute',
            top: currentRegion.row * cellSize,
            left: currentRegion.col * cellSize,
            width: currentRegion.size * cellSize,
            height: currentRegion.size * cellSize,
            border: '2px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.1)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Grid cells */}
      {grid.map((row, i) =>
        row.map((val, j) => (
          <div
            key={`${i}-${j}`}
            style={{
              position: 'absolute',
              top: i * cellSize,
              left: j * cellSize,
              width: cellSize,
              height: cellSize,
              backgroundColor: val === 1 ? '#1e293b' : '#f1f5f9',
              border: '1px solid #64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: cellSize > 30 ? 12 : 10,
              color: val === 1 ? '#f1f5f9' : '#1e293b',
              fontWeight: 'bold',
            }}
          >
            {cellSize > 24 && val}
          </div>
        ))
      )}
    </div>
  )
}

function TreeVisualization({ tree, depth = 0 }) {
  if (!tree) return null

  if (tree.isLeaf) {
    return (
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#1e293b',
          border: '2px solid #22c55e',
          borderRadius: 4,
          marginBottom: 8,
          textAlign: 'center',
          minWidth: 80,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#178740' }}>Leaf</div>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#4879a9', marginTop: 4 }}>
          {tree.val}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 12,
        backgroundColor: '#1e293b',
        border: '2px solid #f59e0b',
        borderRadius: 4,
        marginBottom: 8,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', textAlign: 'center' }}>Internal Node</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Top-Left</div>
          {tree.topLeft && <TreeVisualization tree={tree.topLeft} depth={depth + 1} />}
        </div>
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Top-Right</div>
          {tree.topRight && <TreeVisualization tree={tree.topRight} depth={depth + 1} />}
        </div>
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Bottom-Left</div>
          {tree.bottomLeft && <TreeVisualization tree={tree.bottomLeft} depth={depth + 1} />}
        </div>
        <div>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Bottom-Right</div>
          {tree.bottomRight && <TreeVisualization tree={tree.bottomRight} depth={depth + 1} />}
        </div>
      </div>
    </motion.div>
  )
}

function VisualizationPanel({ step, applyExample, examples, gridSize }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
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

      {step?.grid && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Grid Visualization</div>
          <div style={{ overflow: 'auto' }}>
            <GridVisualization
              grid={step.grid}
              currentRegion={step.currentRegion}
              highlightRegions={step.highlightRegions || []}
            />
          </div>
        </div>
      )}

      {step?.currentRegion && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Current Region</div>
          <div style={{ fontSize: 12, color: '#5577a4', fontFamily: 'monospace', lineHeight: 1.6 }}>
            <div>Row: [{step.currentRegion.row}:{step.currentRegion.row + step.currentRegion.size}]</div>
            <div>Col: [{step.currentRegion.col}:{step.currentRegion.col + step.currentRegion.size}]</div>
            <div>Size: {step.currentRegion.size}x{step.currentRegion.size}</div>
            <div>Depth: {step.currentRegion.depth}</div>
          </div>
        </div>
      )}

      {step?.isLeaf && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#178740', marginBottom: 6 }}>Leaf Node Created</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#4879a9' }}>{step.nodeValue}</div>
        </motion.div>
      )}

      {step?.tree && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Quad Tree Structure</div>
          <div style={{ maxHeight: 400, overflow: 'auto', padding: 8, backgroundColor: '#0f172a', borderRadius: 6 }}>
            <TreeVisualization tree={step.tree} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuadTreeVisualizer() {
  const examples = useMemo(() => getExamplesOr('quad-tree', []), [])
  const [gridSize, setGridSize] = useState(4)
  const [gridInput, setGridInput] = useState('[[1,1,0,0],[1,1,0,0],[1,1,1,1],[1,1,1,1]]')

  const { grid, inputError } = useMemo(() => {
    try {
      const g = JSON.parse(gridInput)
      if (!Array.isArray(g) || g.length === 0) throw new Error('Grid must be non-empty array')
      if (!g.every(row => Array.isArray(row) && row.length === g.length)) {
        throw new Error('Grid must be square matrix')
      }
      return { grid: g, inputError: '' }
    } catch (e) {
      return { grid: null, inputError: e.message }
    }
  }, [gridInput])

  const steps = useMemo(() => generateSteps(gridSize, grid), [gridSize, grid])

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
      setGridSize(ex.grid?.length || 4)
      setGridInput(JSON.stringify(ex.grid || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Quad Tree', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Grid Size</div>
                <input
                  type="number"
                  value={gridSize}
                  onChange={(e) => {
                    const size = Number(e.target.value)
                    if (size > 0) {
                      setGridSize(size)
                      setGridInput(JSON.stringify(generateRandomGrid(size)))
                      handleReset()
                    }
                  }}
                  min={1}
                  max={8}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Grid (JSON)</div>
              <textarea
                value={gridInput}
                onChange={(e) => {
                  setGridInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 80,
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
              {inputError && <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} gridSize={gridSize} />
          </div>),
  }), [step, connectivity, setActiveLineDom, gridSize, gridInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"grid","label":"grid","type":"array"}]}
        values={{ grid: gridInput }}
        onChange={(k, v) => { if (k === 'grid') setGridInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
