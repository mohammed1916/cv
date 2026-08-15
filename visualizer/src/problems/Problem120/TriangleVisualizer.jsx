import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './TriangleVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('triangle', [
  { label: 'Example 1', triangle: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] },
  { label: 'Example 2', triangle: [[-10]] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def minimumTotal(triangle):' },
  { line: 2, text: '    if not triangle: return 0' },
  { line: 3, text: '    dp = triangle[-1][:]' },
  { line: 4, text: '    for i in range(len(triangle)-2, -1, -1):' },
  { line: 5, text: '        for j in range(len(triangle[i])):' },
  { line: 6, text: '            dp[j] = triangle[i][j] + min(dp[j], dp[j+1])' },
  { line: 7, text: '    return dp[0]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(triangle) {
  const steps = []

  if (!triangle || triangle.length === 0) {
    steps.push({
      activeLine: 2,
      message: 'Empty triangle',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    triangle,
    message: `Find minimum path sum in triangle`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    triangle,
    dp: [...triangle[triangle.length - 1]],
    message: `Initialize dp with bottom row: [${triangle[triangle.length - 1].join(', ')}]`,
    relatedLines: [3],
  })

  let dp = triangle[triangle.length - 1].map((x) => x)

  for (let i = triangle.length - 2; i >= 0; i--) {
    steps.push({
      activeLine: 4,
      triangle,
      currentRow: i,
      dp: [...dp],
      message: `Process row ${i}: [${triangle[i].join(', ')}]`,
      relatedLines: [4],
    })

    for (let j = 0; j < triangle[i].length; j++) {
      const oldVal = dp[j]
      const minBelow = Math.min(dp[j], dp[j + 1])
      dp[j] = triangle[i][j] + minBelow

      steps.push({
        activeLine: 6,
        triangle,
        currentRow: i,
        currentCol: j,
        currentVal: triangle[i][j],
        minBelow,
        newVal: dp[j],
        dp: [...dp],
        message: `dp[${j}] = ${triangle[i][j]} + min(${oldVal}, ${dp[j + 1]}) = ${dp[j]}`,
        relatedLines: [6],
      })
    }
  }

  steps.push({
    activeLine: 7,
    triangle,
    dp,
    result: dp[0],
    done: true,
    message: `Minimum path sum = ${dp[0]}`,
    relatedLines: [7],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#627794' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#165e4d', fontStyle: 'italic' }}>
          Bottom-up DP: compute minimum path sum from bottom row upward.
        </div>
      </div>

      {step.triangle && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Triangle
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            {step.triangle.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                {row.map((val, jdx) => (
                  <motion.div
                    key={jdx}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      backgroundColor:
                        step.currentRow === idx && step.currentCol === jdx ? '#a7f3d0' : step.currentRow === idx ? '#bfdbfe' : '#e5e7eb',
                      border:
                        step.currentRow === idx && step.currentCol === jdx ? '2px solid #10b981' : '1px solid #cbd5e1',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'center',
                      minWidth: 32,
                    }}
                    animate={{ scale: step.currentRow === idx && step.currentCol === jdx ? 1.15 : 1 }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.dp && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            DP Array
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
            {step.dp.map((val, idx) => (
              <div key={idx} style={{ padding: '4px 8px', backgroundColor: '#e9d5ff', borderRadius: 3, border: '1px solid #c084fc' }}>
                {val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function TriangleVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","triangle":[[2],[3,4],[6,5,7],[4,1,8,3]]});
  const [triangleInput, setTriangleInput] = useState("[[2],[3,4],[6,5,7],[4,1,8,3]]");
  const { triangle, inputError } = useMemo(() => {
    try {
      const parsedTriangle = JSON.parse(triangleInput); if (!Array.isArray(parsedTriangle)) throw new Error('triangle must be an array');
      return { triangle: parsedTriangle, inputError: '' };
    } catch (e) {
      return { triangle: [[2],[3,4],[6,5,7],[4,1,8,3]], inputError: e.message };
    }
  }, [triangleInput]);  const steps = useMemo(
    () =>
      generateSteps(triangle).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [triangle]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setTriangleInput(JSON.stringify(e.triangle)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 3: Extract panels into consts
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} />}
    </div>
  )

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"triangle","label":"triangle","type":"string"}]}
        values={{ triangle: triangleInput }}
        onChange={(k, v) => { if (k === 'triangle') setTriangleInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="tri-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="tri-status">
      {step?.message && (
        <div style={{ padding: 8, fontSize: 12, color: '#5577a4' }}>
          {step.message}
        </div>
      )}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
    </>
  )

  // Step 4: Add panelConfigs
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '△ Minimum Path', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="tri-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
