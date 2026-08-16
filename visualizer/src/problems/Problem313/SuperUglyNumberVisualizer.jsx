import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SuperUglyNumberVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['done', 'init', 'process']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'process',
  5: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: '# Solution for Super Ugly Number' },
  { line: 2, text: '# Implement step-by-step visualization' },
  { line: 3, text: 'def solve(input):' },
  { line: 4, text: '    # Algorithm here' },
  { line: 5, text: '    return result' },
]

function generateSteps(input) {
  const steps = []

  steps.push({
    phase: 'init',
    activeLine: 1,
    relatedLines: [1],
    message: 'Initialize algorithm'
  })

  steps.push({
    phase: 'process',
    activeLine: 3,
    relatedLines: [3],
    message: 'Processing input...'
  })

  steps.push({
    phase: 'done',
    activeLine: 5,
    relatedLines: [5],
    message: 'Algorithm complete'
  })

  return steps
}

const EXAMPLES = getExamplesOr('super-ugly-number', [])

export default function SuperUglyNumberVisualizer() {
  const [inputValue, setInputValue] = useState(EXAMPLES.length > 0 ? JSON.stringify(EXAMPLES[0]) : '{}')

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input) : []
  }, [input])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const renderVisualization = () => {
    if (!input) return <div className="super-ugly-number-error">{inputError}</div>

    return (
      <motion.div
        className="super-ugly-number-viz"
        key={stepIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="super-ugly-number-step-info">
          <h3>{step?.message ?? 'Press Play or Step to begin.'}</h3>
        </div>
      </motion.div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="super-ugly-number-panel super-ugly-number-panel-input">
            <div className="super-ugly-number-panel-head">Input</div>
            <div className="super-ugly-number-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="super-ugly-number-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="super-ugly-number-panel super-ugly-number-panel-viz">
            <div className="super-ugly-number-panel-head">Visualization</div>
            <div className="super-ugly-number-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="super-ugly-number-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

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
