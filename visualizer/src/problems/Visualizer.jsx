import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../components/LuminoDockPanel'
import FloatingPanel from '../components/shared/FloatingPanel'
import CodeTracePanel from '../components/CodeTracePanel'
import PlaybackControls from '../components/PlaybackControls'
import PatternOverlay from '../components/PatternOverlay'
import VisualizationControls from '../components/VisualizationControls'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../hooks/usePatternOverlay'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { useVisualizationFeatures } from '../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../config/visualizationRegistry'
import { getExamples } from '../config/examplesRegistry'
import './Visualizer.css'
/**
 * Generic Visualizer template for algorithm visualization problems.
 *
 * To use this template:
 * 1. Create a new problem directory under /src/problems/{ProblemName}/
 * 2. Define SOLUTION_CODE - array of code lines with line numbers and text
 * 3. Create generateSteps(inputParams) - function that returns array of step objects
 * 4. Create createVisualizationPanel() - function that renders the main viz
 * 5. Export from index.jsx with meta information
 *
 * Step object structure:
 * {
 *   phase: 'string',           // Semantic phase identifier
 *   activeLine: number,        // Which line in SOLUTION_CODE is active
 *   message: 'string',         // Description of this step
 *   relatedLines: [number],    // Additional highlighted lines (auto-generated)
 *   ...stepData                // Any visualization-specific state
 * }
 */

// ============================================================================
// 1. DEFINE SOLUTION CODE (copy from problem solution)
// ============================================================================
const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def solve(self, ...):' },
  { line: 3, text: '        # Initialize' },
  { line: 4, text: '        # Process' },
  { line: 5, text: '        # Return result' },
]

// ============================================================================
// 2. DEFINE STEP GENERATION FUNCTION
// ============================================================================
/**
 * Generate visualization steps from input parameters.
 * Each step represents one moment in the algorithm execution.
 *
 * @param {object} inputs - Input parameters from the visualization panel
 * @returns {array} Array of step objects
 */
function generateSteps(inputs) {
  const steps = []

  // Example: initialization step
  steps.push({
    phase: 'init',
    activeLine: 3,
    message: 'Initialize algorithm with input parameters.',
    // Add any algorithm-specific state here
  })

  // Example: processing steps (this is where the algorithm unfolds)
  for (let i = 0; i < 5; i++) {
    steps.push({
      phase: 'process',
      activeLine: 4,
      message: `Processing step ${i + 1}...`,
      iteration: i,
    })
  }

  // Example: completion step
  steps.push({
    phase: 'done',
    activeLine: 5,
    message: 'Algorithm completed.',
  })

  return steps
}

// ============================================================================
// 3. DEFINE VISUALIZATION PANEL COMPONENT
// ============================================================================
/**
 * Main visualization panel that displays the algorithm state.
 * Update this to match your specific problem's visualization needs.
 */
function VisualizationPanel({
  inputErrors,
  applyExample,
  examples,
  step,
}) {
  return (
    <div className="viz-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="viz-panel-head">
        Visualization
        {inputErrors?.main && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputErrors.main}</span>}
      </div>
      <div className="viz-panel-body" style={{ flex: 1, overflow: 'auto' }}>

        {/* Example Buttons */}
        {examples && examples.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex.inputs || ex)}
                className="viz-example-btn"
                style={{
                  padding: '6px 12px',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1e293b'
                  e.target.style.borderColor = '#64748b'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0f172a'
                  e.target.style.borderColor = '#475569'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Add input fields based on your problem's needs */}
          {/* Example:
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>
              Input:
            </label>
            <input
              type="text"
              value={inputs.data ?? ''}
              onChange={(e) => onInputChange('data', e.target.value)}
              placeholder="Enter input"
              className="viz-input"
              style={{
                padding: '6px 8px',
                border: inputErrors?.data ? '2px solid #f87171' : '1px solid #cbd5e1',
                borderRadius: '4px',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                fontSize: 13,
                fontFamily: 'monospace',
                width: '150px',
              }}
            />
            {inputErrors?.data && (
              <span style={{ color: '#f87171', fontSize: 12 }}>{inputErrors.data}</span>
            )}
          </div>
          */}
        </div>

        {/* Visualization Area - customize this */}
        <div className="viz-area" style={{ flex: 1, border: '1px solid #334155', borderRadius: '4px', padding: 16, backgroundColor: '#0f172a' }}>
          <div style={{ color: '#627794', fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>
            {step ? `Phase: ${step.phase}` : 'Ready to visualize...'}
          </div>
        </div>

      </div>
    </div>
  )
}

// ============================================================================
// 4. OPTIONAL: VARIABLES PANEL COMPONENT
// ============================================================================
/**
 * Optional panel showing algorithm variables and state.
 * Remove this if your problem doesn't need variable tracking.
 */
function VariablesPanel({ step }) {
  return (
    <div className="vars-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="vars-panel-head">Variables</div>
      <div className="vars-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step && (
          <motion.div
            className="var-card"
            style={{
              padding: 12,
              borderRadius: '4px',
              background: '#1e293b',
              borderLeft: '4px solid #0ea5e9',
            }}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ color: '#627794', fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>phase</span>
            </div>
            <div style={{ color: '#5577a4', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' }}>
              {step.phase}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 5. MAIN VISUALIZER COMPONENT
// ============================================================================
export default function YourProblemVisualizer() {
  // State for input parameters - adjust based on your problem
  const [inputs, setInputs] = useState({
    // data: defaultValue,
  })

  // Load solution code
  const codeLines = SOLUTION_CODE

  // Validate inputs
  const validatedInputs = useMemo(() => {
    const errors = {}
    const result = { ...inputs }
    // Add validation logic here
    return { inputs: result, errors }
  }, [inputs])

  // Generate visualization steps
  const steps = useMemo(
    () => generateSteps(validatedInputs.inputs).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [validatedInputs.inputs],
  )

  // Playback controls
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  // Pattern overlay and auto-scroll
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Visualization features (optional)
  const vizFeatureDefs = useMemo(() => getVisualizationFeatures('your-problem-slug') || [], [])
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  // Current step
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  // Apply example
  const applyExample = useCallback((exampleInputs) => {
    setInputs(exampleInputs.inputs || exampleInputs)
    handleReset()
  }, [handleReset])

  // Code-visual connectivity
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Handle input change
  const handleInputChange = useCallback((key, value) => {
    setInputs(prev => ({
      ...prev,
      [key]: value,
    }))
    handleReset()
  }, [handleReset])

  // Build dockable panels
  // LuminoDockPanel takes the panel shells; the content is portaled into the
  // divs it hands back via onPanelReady. Every panel docks relative to the
  // first, so dockMode describes where it sits next to panelConfigs[0].
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
    // Optional: Add variables panel
    { id: 'vars', title: 'Variables', dockMode: 'split-bottom' },
  ], [])

  const panelContents = useMemo(() => ({
    code: (
      <CodeTracePanel
        step={step}
        codeLines={codeLines}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
      />
    ),
    viz: (
      <VisualizationPanel
        inputs={validatedInputs.inputs}
        inputErrors={validatedInputs.errors}
        onInputChange={handleInputChange}
        applyExample={applyExample}
        examples={getExamples('your-problem-slug') || []}
        step={step}
        handleReset={handleReset}
      />
    ),
    vars: <VariablesPanel step={step} />,
  }), [step, codeLines, connectivity.highlightedLines, connectivity.handleLineSelect,
      autoScrollCode, validatedInputs, handleInputChange, applyExample, handleReset, setActiveLineDom])

  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
          {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          {panelDivs.vars && createPortal(panelContents.vars, panelDivs.vars)}
        </>
      )}
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
      <AnimatePresence>
        {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create styled variable card for variables panel
 * @param {string} name - Variable name
 * @param {*} value - Variable value
 * @param {string} description - Variable description
 * @param {string} type - Card type: 'default', 'active', 'success', 'warning', 'error'
 */
export function createVariableCard(name, value, description, type = 'default') {
  const typeStyles = {
    default: { background: '#1e293b', borderLeft: '4px solid #64748b' },
    active: { background: '#1e293b', borderLeft: '4px solid #0ea5e9' },
    success: { background: '#1e293b', borderLeft: '4px solid #10b981' },
    warning: { background: '#1e293b', borderLeft: '4px solid #f59e0b' },
    error: { background: '#1e293b', borderLeft: '4px solid #f87171' },
  }

  return (
    <motion.div
      style={{
        padding: 12,
        borderRadius: '4px',
        ...typeStyles[type] || typeStyles.default,
      }}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ color: '#627794', fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{name}</span>
      </div>
      <div style={{ color: '#5577a4', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 4 }}>
        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </div>
      {description && (
        <div style={{ color: '#64748b', fontSize: 11 }}>
          {description}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Create input controls for visualization panel
 * @param {object} schema - Input schema
 * @param {object} values - Current input values
 * @param {object} errors - Input errors
 * @param {function} onChange - Callback for input changes
 */
export function createInputControls(schema, values, errors, onChange) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      {Object.entries(schema).map(([key, fieldSchema]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor={`input-${key}`} style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>
            {fieldSchema.label || key}:
          </label>
          <input
            id={`input-${key}`}
            type={fieldSchema.type === 'number' ? 'number' : 'text'}
            value={values[key] ?? ''}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={fieldSchema.placeholder || String(fieldSchema.default)}
            style={{
              padding: '6px 8px',
              border: errors?.[key] ? '2px solid #f87171' : '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: 'monospace',
              width: fieldSchema.width || '100px',
            }}
            min={fieldSchema.min}
            max={fieldSchema.max}
          />
          {errors?.[key] && (
            <span style={{ color: '#ea0c0c', fontSize: 12 }}>{errors[key]}</span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Create example buttons
 * @param {array} examples - Array of example objects with label and inputs
 * @param {function} onExampleClick - Callback when example is clicked
 */
export function createExampleButtons(examples, onExampleClick) {
  if (!examples || examples.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {examples.map((ex) => (
        <button
          key={ex.label}
          onClick={() => onExampleClick(ex.inputs || ex)}
          style={{
            padding: '6px 12px',
            border: '1px solid #475569',
            borderRadius: '4px',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontSize: 12,
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1e293b'
            e.target.style.borderColor = '#64748b'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#0f172a'
            e.target.style.borderColor = '#475569'
          }}
        >
          {ex.label}
        </button>
      ))}
    </div>
  )
}

