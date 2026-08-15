import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem378.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def kthSmallest(matrix, k):' },
  { line: 2, text: '    import heapq' },
  { line: 3, text: '    heap = [(matrix[0][j], 0, j) for j in range(len(matrix[0]))]' },
  { line: 4, text: '    heapq.heapify(heap)' },
  { line: 5, text: '    for _ in range(k - 1):' },
  { line: 6, text: '        val, i, j = heapq.heappop(heap)' },
  { line: 7, text: '        if i + 1 < len(matrix):' },
  { line: 8, text: '            heapq.heappush(heap, (matrix[i+1][j], i+1, j))' },
  { line: 9, text: '    return heap[0][0]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(matrix, k) {
  const steps = []
  const n = matrix.length
  const m = matrix[0].length

  // Initialize heap with first row
  const heap = matrix[0].map((val, j) => ({ val, i: 0, j }))
  heap.sort((a, b) => a.val - b.val)

  steps.push({
    activeLine: 3,
    heap: [...heap],
    matrix,
    k,
    extracted: [],
    currentVal: null,
    message: `Initialize min-heap with first row (${m} elements).`,
  })

  // Extract k-1 minimum elements
  const extracted = []
  for (let count = 0; count < k - 1; count++) {
    const min = heap.shift()
    extracted.push(min.val)

    steps.push({
      activeLine: 6,
      heap: [...heap],
      matrix,
      k,
      extracted: [...extracted],
      currentVal: min.val,
      highlightedPos: [min.i, min.j],
      message: `Extract ${min.val} from heap (extraction ${count + 1}/${k - 1}).`,
    })

    // Add next element from same column if exists
    if (min.i + 1 < n) {
      const newVal = matrix[min.i + 1][min.j]
      heap.push({ val: newVal, i: min.i + 1, j: min.j })
      heap.sort((a, b) => a.val - b.val)

      steps.push({
        activeLine: 8,
        heap: [...heap],
        matrix,
        k,
        extracted: [...extracted],
        currentVal: newVal,
        highlightedPos: [min.i + 1, min.j],
        message: `Add matrix[${min.i + 1}][${min.j}]=${newVal} to heap.`,
      })
    }
  }

  // Final result
  const result = heap[0]?.val || matrix[n - 1][m - 1]
  steps.push({
    activeLine: 9,
    heap: [...heap],
    matrix,
    k,
    extracted: [...extracted],
    currentVal: result,
    message: `Kth smallest element is ${result}.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    matrix: [[1, 2], [1, 3]],
    k: 1,
  },
  {
    label: 'Example 2',
    matrix: [[1, 2], [1, 4]],
    k: 3,
  },
  {
    label: 'Example 3',
    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    k: 4,
  },
]

export default function Problem378Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [matrixInput, setMatrixInput] = useState(JSON.stringify(EXAMPLES[0]?.matrix ?? []));
  const [kInput, setKInput] = useState("");
  const { matrix, k, inputError } = useMemo(() => {
    try {
      const parsedMatrix = JSON.parse(matrixInput); if (!Array.isArray(parsedMatrix)) throw new Error('matrix must be an array');
      const parsedK = Number(kInput); if (isNaN(parsedK)) throw new Error('k must be a number');
      return { matrix: parsedMatrix, k: parsedK, inputError: '' };
    } catch (e) {
      return { matrix: EXAMPLES[exIdx]?.matrix ?? '', k: EXAMPLES[exIdx]?.k ?? '', inputError: e.message };
    }
  }, [matrixInput, kInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(matrix, k).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setMatrixInput(JSON.stringify(EXAMPLES[i].matrix)); setKInput(String(EXAMPLES[i].k)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📊 Min-Heap & Matrix', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Target: Find {k}th smallest</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Matrix ({matrix.length}x{matrix[0].length}):</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix[0].length}, 1fr)`, gap: 6 }}>
                  {matrix.map((row, i) =>
                    row.map((val, j) => (
                      <motion.div
                        key={`${i}-${j}`}
                        animate={{
                          scale: step.highlightedPos && step.highlightedPos[0] === i && step.highlightedPos[1] === j ? 1.15 : 1,
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border:
                            step.highlightedPos && step.highlightedPos[0] === i && step.highlightedPos[1] === j
                              ? '2px solid #f59e0b'
                              : '1px solid #d97706',
                          backgroundColor:
                            step.highlightedPos && step.highlightedPos[0] === i && step.highlightedPos[1] === j
                              ? '#fbbf24'
                              : '#fcd34d',
                          color: '#78350f',
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      >
                        {val}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Min-Heap (Top Elements):</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.heap.slice(0, 5).map((item, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: idx === 0 ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                        backgroundColor: idx === 0 ? '#0ea5e9' : '#dbeafe',
                        color: idx === 0 ? '#fff' : '#1e40af',
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      {item.val}
                    </motion.div>
                  ))}
                  {step.heap.length > 5 && <span style={{ color: '#64748b' }}>+{step.heap.length - 5} more</span>}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#15803d' }}>Extracted ({step.extracted.length}):</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.extracted.map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '2px solid #22c55e',
                        backgroundColor: '#86efac',
                        color: '#15803d',
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      {val}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"matrix","label":"matrix","type":"array"},{"key":"k","label":"k","type":"number"}]}
          values={{ matrix: matrixInput, k: kInput }}
          onChange={(k, v) => { if (k === 'matrix') setMatrixInput(v); if (k === 'k') setKInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
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
          prevDisabled={stepIndex <= 0}
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
