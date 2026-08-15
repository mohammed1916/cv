import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './ExcelSheetColumnNumberVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = [
  { label: 'Example 1', s: 'A' },
  { label: 'Example 2', s: 'AB' },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def titleToNumber(s):' },
  { line: 2, text: '    result = 0' },
  { line: 3, text: '    for char in s:' },
  { line: 4, text: '        result = result * 26' },
  { line: 5, text: '        result += ord(char) - ord("A") + 1' },
  { line: 6, text: '    return result' },
]

function generateSteps(s) {
    const steps = []
  steps.push({ activeLine: 1, s, message: `Convert "${s}" to column number`, relatedLines: [1] })
  steps.push({ activeLine: 2, result: 0, message: 'Initialize result = 0', relatedLines: [2] })

  let result = 0
  for (let i = 0; i < s.length; i++) {
    const char = s[i]
    const val = char.charCodeAt(0) - 'A'.charCodeAt(0) + 1
    result = result * 26 + val
    steps.push({
      activeLine: 4,
      s, char, charValue: val, result, position: i,
      message: `Char '${char}' (${val}): result = ${result}`,
      relatedLines: [4, 5],
    })
  }

  steps.push({ activeLine: 6, s, result, done: true, message: `Result: ${result}`, relatedLines: [6] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>Base-26: multiply by 26, add value.</div>
      </div>
      {step.s && <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Input</div>
        <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#0c4a6e', fontWeight: 600 }}>{step.s}</div>
      </motion.div>}
      {step.char && <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Current: '{step.char}' = {step.charValue}</div>
      </motion.div>}
      {step.result !== undefined && <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{step.result}</div>
      </motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function ExcelSheetColumnNumberVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("A");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "A", inputError: e.message };
    }
  }, [sInput]);
  const steps = useMemo(() => generateSteps(s).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [s])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"}]}
        values={{ s: sInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
        showExamples={false}
        inputError={inputError}
      />
    <div className="escn-panel" style={{ flex: 1 }}>
      <div className="escn-panel-head">🔢 Excel Column</div>
      <div className="escn-panel-body">
        <VisualizationPanel step={step} />
      </div>
    </div>
  
    </>)

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
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.activeLine}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div className="escn-status">
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.activeLine} usedPatterns={PATTERNS} />
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
    </>
  )

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🔢 Excel Column', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="escn-shell">
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
    </div>
  )
}
