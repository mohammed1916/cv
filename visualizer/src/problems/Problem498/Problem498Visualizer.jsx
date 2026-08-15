import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import './Problem498Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('diagonal-traverse')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'done',


}

const EXAMPLES = getExamplesOr('diagonal-traverse', [
  { label: 'Example', mat: [[1,2,3],[4,5,6],[7,8,9]] },
])

function generateSteps(mat) {
    const steps = []
  const result = []
  steps.push({ activeLine: 1, mat, result: [], visited: new Set(), message: 'Start diagonal traversal' })
  let m = mat.length, n = mat[0].length
  for (let d = 0; d < m + n - 1; d++) {
    for (let r = Math.max(0, d - n + 1); r <= Math.min(d, m - 1); r++) {
      let c = d - r
      result.push(mat[r][c])
      steps.push({ activeLine: 2, mat, result: [...result], row: r, col: c, diag: d, message: `Visit (${r},${c})` })
    }
  }
  steps.push({ activeLine: 3, mat, result, done: true, message: `Result: [${result.join(',')}]` })
  return steps
}

function VisualizationPanel({ mat, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>Traverse diagonally: up-right then down-left alternating.</div>
      </div>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${mat[0].length}, 1fr)`, gap: 2 }}>
        {mat.map((row, r) => row.map((val, c) => (<motion.div key={`m${r}${c}`} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step?.row === r && step?.col === c ? '#0ea5e9' : '#cffafe', border: '1px solid #06b6d4', fontWeight: 700, color: '#164e63' }} animate={{ scale: step?.row === r && step?.col === c ? 1.2 : 1 }}>{val}</motion.div>)))}
      </div>
      {step?.result && (<motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Result: [{step.result.join(', ')}]</div></motion.div>)}
    </div>
  )
}

export default function Problem498Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [matInput, setMatInput] = useState("[[1,2,3],[4,5,6],[7,8,9]]");
  const { mat, inputError } = useMemo(() => {
    try {
      const parsedMat = JSON.parse(matInput); if (!Array.isArray(parsedMat)) throw new Error('mat must be an array');
      return { mat: parsedMat, inputError: '' };
    } catch (e) {
      return { mat: [[1,2,3],[4,5,6],[7,8,9]], inputError: e.message };
    }
  }, [matInput]);
  const applyEx = useCallback((e) => { setEx(e); setMatInput(JSON.stringify(e.mat)); handleReset(); }, [handleReset]);
  const steps = useMemo(() => generateSteps(mat).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [mat])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '↗️ Diagonal', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel mat={mat} step={step} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, mat])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (<div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"mat","label":"mat","type":"string"}]}
          values={{ mat: matInput }}
          onChange={(k, v) => { if (k === 'mat') setMatInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
      </><FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}

