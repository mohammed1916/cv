import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from './components/shared/DockableWorkspace'
import FloatingPanel from './components/shared/FloatingPanel'
import CodeTracePanel from './components/CodeTracePanel'
import PlaybackControls from './components/PlaybackControls'
import PatternOverlay from './components/PatternOverlay'
import VisualizationControls from './components/VisualizationControls'
import { usePlaybackState } from './hooks/usePlaybackState'
import { useCodeVisualConnectivity } from './hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from './hooks/usePatternOverlay'
import { useAutoScroll } from './hooks/useAutoScroll'
import { useVisualizationFeatures } from './hooks/useVisualizationFeatures'
import { useSolutionCode } from './hooks/useSolutionCode'
import { getVisualizationFeatures } from './config/visualizationRegistry'
import { getExamples } from './config/examplesRegistry'

/**
 * Generic Visualizer.jsx Template
 *
 * This is a reusable template for creating problem visualizers.
 *
 * Each problem visualizer should:
 * 1. Define a generateSteps() function that produces step objects with:
 *    - phase: string describing the current phase
 *    - activeLine: line number in solution code
 *    - message: description of what's happening
 *    - [custom fields]: problem-specific data (values, indices, etc.)
 *
 * 2. Export a default component that uses the hooks and panels provided
 *
 * 3. Create sub-components for:
 *    - Input/Configuration panel
 *    - Visualization panel (displays algorithm state)
 *    - Variables panel (shows current values)
 *
 * Structure:
 * - DockableWorkspace: Main layout with resizable panels
 * - FloatingPanel: Playback controls
 * - CodeTracePanel: Shows code with highlighted lines
 * - Visualization/Variables panels: Problem-specific panels
 */

/**
 * Example generateSteps function signature
 * Replace with actual algorithm logic for your problem
 */
function generateSteps(input) {
  const steps = []

  // Initialize step
  steps.push({
    phase: 'init',
    activeLine: 1,
    message: 'Initialization phase',
    // Add custom fields here: values, indices, state, etc.
  })

  // Process steps
  steps.push({
    phase: 'process',
    activeLine: 5,
    message: 'Processing phase',
  })

  // Completion step
  steps.push({
    phase: 'done',
    activeLine: 10,
    message: 'Algorithm complete',
  })

  return steps
}

/**
 * Variables Panel Component
 * Displays current variable values during execution
 */
function VariablesPanel({ step }) {
  return (
    <div className="viz-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="viz-panel-head">Variables</div>
      <div className="viz-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step ? (
          <>
            <div className="viz-var-card">
              <span className="viz-var-name">Phase</span>
              <span className="viz-var-val">{step.phase}</span>
            </div>
            <div className="viz-var-card">
              <span className="viz-var-name">Line</span>
              <span className="viz-var-val">{step.activeLine}</span>
            </div>
            {/* Add problem-specific variables here */}
          </>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>No step selected</div>
        )}
      </div>
    </div>
  )
}

/**
 * Visualization Panel Component
 * Displays the main algorithm visualization
 */
function VisualizationPanel({
  inputValue,
  setInputValue,
  inputError,
  handleReset,
  step,
  applyExample,
  EXAMPLES,
}) {
  return (
    <div className="viz-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="viz-panel-head">
        Visualization
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="viz-panel-body" style={{ flex: 1, overflow: 'auto' }}>

        {/* Example buttons */}
        {EXAMPLES.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                className="viz-example-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.2s',
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        {/* Input controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>Input:</span>
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              handleReset()
            }}
            placeholder="Enter input"
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          />
        </div>

        {/* Visualization area */}
        <div className="viz-area" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          borderRadius: 8,
          border: '1px solid #334155',
          padding: 20,
          minHeight: 200,
        }}>
          {step ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, marginBottom: 12 }}>
                {step.message}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                Phase: {step.phase}
              </div>
            </div>
          ) : (
            <div style={{ color: '#475569' }}>
              Press Play or Step to begin
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/**
 * Main Visualizer Component
 *
 * Usage:
 * 1. Replace generateSteps() with your algorithm logic
 * 2. Update VariablesPanel and VisualizationPanel with problem-specific content
 * 3. Add custom CSS file (Visualizer.css)
 * 4. Update import paths if needed
 */
export default function GenericVisualizer({
  problemSlug = 'generic-problem',
  EXAMPLES = [],
}) {
  const [inputValue, setInputValue] = useState('')

  // Load solution code from registry
  const SOLUTION_CODE = useSolutionCode(problemSlug)

  const { processedInput, inputError } = useMemo(() => {
    try {
      // Replace with actual input parsing logic
      return { processedInput: inputValue, inputError: '' }
    } catch (e) {
      return { processedInput: null, inputError: e.message || 'Invalid input' }
    }
  }, [inputValue])

  const steps = useMemo(
    () => generateSteps(processedInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [processedInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Use modular visualization features system
  const vizFeatureDefs = getVisualizationFeatures(problemSlug)
  const { items: vizFeatures, toggle: toggleVizFeature, enabledIds: enabledVizIds } = useVisualizationFeatures(vizFeatureDefs)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex.input))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Define dockable panels
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
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputError={inputError}
          handleReset={handleReset}
          step={step}
          applyExample={applyExample}
          EXAMPLES={EXAMPLES}
        />
      ),
    },
    {
      id: 'vars',
      title: 'Variables',
      content: <VariablesPanel step={step} />,
    },
  ], [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, autoScrollCode, inputValue, setInputValue, inputError, handleReset, applyExample, EXAMPLES, setActiveLineDom])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz'], ['vars']], minimized: [] }}
      />
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
        {vizFeatures.length > 0 && (
          <VisualizationControls features={vizFeatures} onToggle={toggleVizFeature} />
        )}
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
