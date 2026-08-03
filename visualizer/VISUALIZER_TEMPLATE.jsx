import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import VisualizationControls from '../../components/VisualizationControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

/**
 * Generate algorithm execution steps for visualization
 * Each step represents a moment in the algorithm execution with:
 * - phase: current stage of the algorithm (e.g., 'init', 'processing', 'done')
 * - activeLine: which line of code is executing
 * - relatedLines: array of line numbers that are relevant to this step
 * - state data: current values of variables/data structures
 * - message: human-readable description of what's happening
 */
function generateSteps(inputData) {
  const steps = []

  // TODO: Implement step generation logic
  // Example structure:
  // steps.push({
  //   phase: 'init',
  //   activeLine: 1,
  //   relatedLines: [1],
  //   message: 'Algorithm initialization',
  //   // ... your algorithm-specific state properties
  // })

  return steps
}

// Get examples from registry (must exist in config/examplesRegistry.json)
const EXAMPLES = getExamples('problem-key-here')

/**
 * Variables Panel Component
 * Display current values of variables/data structures being tracked
 */
function VariablesPanel({ step }) {
  return (
    <div className="var-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="var-panel-head">Variables</div>
      <div className="var-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* TODO: Render variable cards */}
        {/* Example structure:
        <div className="var-card">
          <span className="var-name">variableName</span>
          <span className="var-val">{step?.variableName ?? 'default'}</span>
          <span className="var-desc">Description of what this tracks</span>
        </div>
        */}
      </div>
    </div>
  )
}

/**
 * Main Visualization Panel Component
 * Display the primary visualization of the algorithm's data structures
 */
function VisualizationPanel({
  inputData,
  setInputData,
  inputError,
  handleReset,
  step,
  applyExample,
}) {
  return (
    <div className="viz-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="viz-panel-head">
        Visualization
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="viz-panel-body" style={{ flex: 1, overflow: 'auto' }}>

        {/* Examples section */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Input controls section */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>Input:</span>
          <input
            type="text"
            value={inputData}
            onChange={(e) => { setInputData(e.target.value); handleReset() }}
            placeholder="Enter input"
            className="input-field"
            style={{ width: '200px', margin: 0 }}
          />
        </div>

        {/* Main visualization area */}
        <div className="visual-area">
          {/* TODO: Render your algorithm visualization here */}
          {/* This could be:
            - Array visualization with color coding
            - Tree structure visualization
            - Graph visualization
            - Matrix visualization
            - Custom SVG rendering
            - etc.
          */}
        </div>

      </div>
    </div>
  )
}

/**
 * Main Visualizer Component
 * Orchestrates the entire visualization with playback controls and dockable panels
 */
export default function ProblemVisualizer() {
  // Input state
  const [inputData, setInputData] = useState('defaultValue')

  // Load solution code from registry (must exist in solutions/ProblemName/solution.js)
  const SOLUTION_CODE = useSolutionCode('problem-key-here')

  // Validate and parse input
  const { parsedInput, inputError } = useMemo(() => {
    try {
      // TODO: Implement input validation
      // Example:
      // const num = parseInt(inputData, 10)
      // if (isNaN(num)) throw new Error('Invalid input')
      return { parsedInput: inputData, inputError: '' }
    } catch (e) {
      return { parsedInput: null, inputError: e.message || 'Invalid input' }
    }
  }, [inputData])

  // Generate all steps for the algorithm
  const steps = useMemo(
    () => generateSteps(parsedInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [parsedInput],
  )

  // Playback state management
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  // Pattern overlay state
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Auto-scroll code panel state
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Visualization features (toggleable enhancements)
  const vizFeatureDefs = getVisualizationFeatures('problem-key-here')
  const { items: vizFeatures, toggle: toggleVizFeature, enabledIds: enabledVizIds } = useVisualizationFeatures(vizFeatureDefs)

  // Current step in execution
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  // Handle example selection
  const applyExample = useCallback((ex) => {
    setInputData(String(ex.input))
    handleReset()
  }, [handleReset])

  // Code-visualization connectivity
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Dockable workspace panel definitions
  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          inputData={inputData}
          setInputData={setInputData}
          inputError={inputError}
          handleReset={handleReset}
          step={step}
          applyExample={applyExample}
        />
      ),
    },
    {
      id: 'vars',
      title: 'Variables',
      content: <VariablesPanel step={step} />,
    },
  ], [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, autoScrollCode, inputData, setInputData, inputError, handleReset, applyExample, setActiveLineDom])

  return (
    <div className="problem-shell">
      {/* Dockable workspace with resizable panels */}
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz'], ['vars']], minimized: [] }}
      />

      {/* Floating playback controls panel */}
      <FloatingPanel title="Playback Controls">
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
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
        />
        {/* Optional visualization feature toggles */}
        {vizFeatures.length > 0 && (
          <VisualizationControls features={vizFeatures} onToggle={toggleVizFeature} />
        )}
      </FloatingPanel>

      {/* Pattern overlay (shows algorithm pattern on code) */}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
