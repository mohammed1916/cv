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
import './Problem492Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('construct-the-rectangle')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  2: 'init',


  3: 'loop',


  4: 'done',


}

const EXAMPLES = getExamplesOr('construct-the-rectangle', [
  { label: 'Example 1', area: 8 },
  { label: 'Example 2', area: 37 },
  { label: 'Example 3', area: 122122 },
])

function generateSteps(area) {
  const steps = []
  const start = Math.floor(Math.sqrt(area))
  steps.push({ activeLine: 2, w: start, area, width: 0, height: 0, message: `Start width at floor(√${area}) = ${start}` })

  for (let width = start; width >= 1; width--) {
    if (area % width === 0) {
      const L = Math.max(width, area / width)
      const W = Math.min(width, area / width)
      steps.push({ activeLine: 3, w: width, area, width: 0, height: 0, message: `Check w=${width}: ${area} % ${width} == 0 ✓ divides evenly` })
      steps.push({ activeLine: 4, w: width, area, width: L, height: W, done: true, message: `Return [${L}, ${W}]` })
      break
    }
    steps.push({ activeLine: 3, w: width, area, width: 0, height: 0, message: `Check w=${width}: ${area} % ${width} = ${area % width} ≠ 0, shrink` })
  }
  return steps
}

function VisualizationPanel({ area, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Find rectangle dimensions with given area, maximizing the length to width ratio (length &gt;= width).
        </div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Given Area: {area}</div></div>
      {step && step.width > 0 && (
        <motion.div style={{ padding: 16, backgroundColor: '#cffafe', borderRadius: 6, border: '2px solid #06b6d4' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#164e63', marginBottom: 12 }}>Result Rectangle</div>
          <div style={{
            width: step.width * 2,
            height: step.height * 2,
            border: '3px solid #06b6d4',
            backgroundColor: '#cffafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#04788c',
            fontSize: 14
          }}>
            {step.width} × {step.height}
          </div>
        </motion.div>
      )}
      <motion.div style={{ padding: 16, backgroundColor: '#cffafe', borderRadius: 6, border: '2px solid #06b6d4', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#164e63' }}>Dimensions</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#048196' }}>{step?.width || 0} × {step?.height || 0}</div>
        <div style={{ fontSize: 12, color: '#048196', marginTop: 8 }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem492Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [areaInput, setAreaInput] = useState(8);
  const { area, inputError } = useMemo(() => {
    try {
      const parsedArea = Number(areaInput); if (isNaN(parsedArea)) throw new Error('area must be a number');
      return { area: parsedArea, inputError: '' };
    } catch (e) {
      return { area: 8, inputError: e.message };
    }
  }, [areaInput]);
  const steps = useMemo(() => generateSteps(area).map((current) => ({ ...current, relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []) })), [area])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setAreaInput(String(e.area)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📐 Rectangle', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel area={area} step={step} applyEx={applyEx} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (<div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"area","label":"area","type":"number"}]}
          values={{ area: areaInput }}
          onChange={(k, v) => { if (k === 'area') setAreaInput(v); handleReset() }}
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

