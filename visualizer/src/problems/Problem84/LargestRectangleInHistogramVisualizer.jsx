import HistogramBars from '../../components/shared/HistogramBars';
import { HISTOGRAM_CODE as SOLUTION_CODE, histogramSteps as generateSteps } from '../../algorithms/shared/histogram.js';
import authoredExamples0 from '../../config/examples/largest-rectangle-in-histogram.js';
import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'

import './LargestRectangleInHistogramVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'



const LARGESTRECTANGLEINHISTOGRAM_PATTERNS = ['done', 'finalize', 'init', 'iterate', 'pop', 'push']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'init',
  6: 'iterate',
  9: 'pop',
  11: 'push',
  13: 'finalize',
  14: 'done',
}

function parseHeights(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed)) throw new Error('Input must be array')
  return parsed.map((n) => Math.max(0, Number(n)))
}



const EXAMPLES = authoredExamples0

export default function LargestRectangleInHistogramVisualizer() {
  const [input, setInput] = useState('[2,1,5,6,2,3]')
  const { heights, inputError } = useMemo(() => {
    try {
      return { heights: parseHeights(input), inputError: '' }
    } catch (e) {
      return { heights: [2, 1, 5, 6, 2, 3], inputError: e.message || 'Invalid input' }
    }
  }, [input])
  const steps = useMemo(() => generateSteps(heights), [heights])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyExample = useCallback((ex) => { setInput(JSON.stringify(ex.heights));

 handleReset() }, [handleReset])
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const primaryPanel = (
    <div className="lr-panel">
      <header className="lr-head"><span>Histogram Stack Sweep</span>{inputError && <span className="lr-error">{inputError}</span>}</header>
      <div className="lr-body">
        <div className="lr-examples">{EXAMPLES.map((ex) => <button key={ex.label} className="lr-chip" onClick={() => applyExample(ex)}>{ex.label}</button>)}</div>
        <input className="lr-input" value={input} onChange={(e) => { setInput(e.target.value); handleReset() }} />
        <HistogramBars heights={heights} step={step} />
      </div>
    </div>
  )

  const statePanel = (
    <div className="lr-panel">
      <header className="lr-head"><span>Stack / Best</span></header>
      <div className="lr-body">
        <div className="lr-stack">{(step?.stack || []).map((s, i) => <span key={`${s.start}-${s.h}-${i}`}>({s.start},{s.h})</span>)}</div>
        <div className="lr-best">best area: <strong>{step?.best ?? 0}</strong></div>
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} disableResizer />
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div className="lr-status">{step?.message || 'Press Play.'}</div>
  )

  const playbackPanel = (
    <>
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
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={LARGESTRECTANGLEINHISTOGRAM_PATTERNS} />
      )}
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Histogram Stack Sweep', dockMode: 'split-right' },
      { id: 'state', title: 'Stack / Best', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="lr-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
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

