import { useState, useCallback, useMemo } from 'react'
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
 * Generic Visualizer Component Template
 *
 * This component provides a complete visualization framework with:
 * - Code trace panel with line highlighting and code-visual connectivity
 * - Dockable workspace for arranging multiple panels
 * - Playback controls for step-by-step algorithm execution
 * - Pattern overlay support for visual pattern highlighting
 * - Visualization features toggle for conditional visualizations
 *
 * To create a new problem visualizer using this template:
 * 1. Create a problem slug and register examples in examplesRegistry.jsx
 * 2. Register visualization features in visualizationRegistry.jsx
 * 3. Implement generateSteps() function to simulate your algorithm
 * 4. Create custom VisualizationPanel and VariablesPanel implementations
 * 5. Update dockPanels array with your custom panels
 *
 * Example Usage:
 * export default function MyProblemVisualizer() {
 *   return <Visualizer problem="my-problem-slug" />
 * }
 */

/**
 * Generate algorithm execution steps
 *
 * This function simulates your algorithm and produces a step-by-step trace.
 * Each step represents a state change in the algorithm execution.
 *
 * @param {*} input - Input data to process
 * @returns {Array<Object>} Array of step objects with:
 *   - activeLine: Current line number in code (or null if not applicable)
 *   - relatedLines: Array of related line numbers (optional, defaults to [activeLine])
 *   - message: Descriptive message for this step
 *   - [custom fields]: Any algorithm-specific state (indices, values, data structures, etc.)
 *
 * @example
 * function generateSteps(input) {
 *   const steps = []
 *   const arr = input.split(',').map(Number)
 *
 *   steps.push({
 *     activeLine: 1,
 *     relatedLines: [1],
 *     message: 'Initialize array',
 *     array: arr,
 *     currentIndex: -1,
 *   })
 *
 *   for (let i = 0; i < arr.length; i++) {
 *     steps.push({
 *       activeLine: 5,
 *       relatedLines: [5, 6],
 *       message: `Processing element at index ${i}: ${arr[i]}`,
 *       array: arr,
 *       currentIndex: i,
 *     })
 *   }
 *
 *   steps.push({
 *     activeLine: null,
 *     relatedLines: [],
 *     message: 'Algorithm complete',
 *     array: arr,
 *     currentIndex: -1,
 *   })
 *
 *   return steps
 * }
 */
function generateSteps(input) {
  const steps = []

  // Initialize algorithm
  steps.push({
    activeLine: 1,
    relatedLines: [1],
    message: 'Algorithm initialization',
    // Add custom fields for your algorithm state here
  })

  // Add intermediate steps for your algorithm here
  // Example:
  // for (let i = 0; i < n; i++) {
  //   steps.push({
  //     activeLine: 5,
  //     relatedLines: [5, 6],
  //     message: `Processing step ${i}`,
  //     // Add algorithm-specific state
  //   })
  // }

  // Algorithm completion
  steps.push({
    activeLine: null,
    relatedLines: [],
    message: 'Algorithm complete',
  })

  return steps
}

/**
 * Variables Display Panel
 *
 * Displays the current values of algorithm variables and state.
 * This is typically rendered in a sidebar/panel during visualization.
 *
 * Customize this component to show relevant variables for your algorithm.
 *
 * @param {Object} props
 * @param {Object} props.step - Current step object from generateSteps()
 * @returns {JSX.Element}
 *
 * @example
 * function VariablesPanel({ step }) {
 *   return (
 *     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
 *       <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, color: '#f1f5f9' }}>
 *         Variables
 *       </div>
 *       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
 *         {step && (
 *           <>
 *             <VariableCard label="Current Index" value={step.currentIndex} />
 *             <VariableCard label="Target" value={step.target} />
 *             <VariableCard label="Array" value={JSON.stringify(step.array)} />
 *           </>
 *         )}
 *       </div>
 *     </div>
 *   )
 * }
 */
function VariablesPanel({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, color: '#f1f5f9' }}>
        Variables
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Replace this with custom variable cards for your algorithm */}
        {step && (
          <div
            style={{
              padding: 12,
              border: '1px solid #334155',
              borderRadius: 6,
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              fontSize: 12,
            }}
          >
            <div style={{ marginBottom: 4 }}>Step: {step.message}</div>
            <div>Active Line: {step.activeLine ?? 'N/A'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Main Visualization Panel
 *
 * Displays the algorithm visualization and input controls.
 * This is where you render your custom visualization for the algorithm.
 *
 * Features:
 * - Example input buttons (automatically generated from examplesRegistry)
 * - Text input field for custom input
 * - Visualization area (replace placeholder with your custom visualization)
 *
 * Customize this component to render your algorithm's visualization.
 *
 * @param {Object} props
 * @param {string} props.input - Current input string
 * @param {Function} props.setInput - Function to update input
 * @param {Object} props.step - Current step object
 * @param {Function} props.handleReset - Function to reset playback
 * @param {Function} props.applyExample - Function to apply an example
 * @param {Array<Object>} props.examples - Array of example objects from examplesRegistry
 * @returns {JSX.Element}
 *
 * @example
 * function VisualizationPanel({
 *   input,
 *   setInput,
 *   step,
 *   handleReset,
 *   applyExample,
 *   examples,
 * }) {
 *   return (
 *     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
 *       <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, color: '#f1f5f9' }}>
 *         Visualization
 *       </div>
 *
 *       {examples.length > 0 && (
 *         <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
 *           {examples.map((ex) => (
 *             <button
 *               key={ex.label}
 *               onClick={() => applyExample(ex)}
 *               style={buttonStyle}
 *             >
 *               {ex.label}
 *             </button>
 *           ))}
 *         </div>
 *       )}
 *
 *       <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
 *         <label style={{ color: '#94a3b8', fontSize: 12 }}>Input:</label>
 *         <input
 *           type="text"
 *           value={input}
 *           onChange={(e) => {
 *             setInput(e.target.value)
 *             handleReset()
 *           }}
 *           placeholder="Enter input"
 *           style={inputStyle}
 *         />
 *       </div>
 *
 *       <div style={{ flex: 1, border: '1px dashed #334155', borderRadius: 6, padding: 16 }}>
 *         {/* Render your custom visualization here */}
 *         <YourCustomVisualization step={step} />
 *       </div>
 *     </div>
 *   )
 * }
 */
function VisualizationPanel({
  input,
  setInput,
  step,
  handleReset,
  applyExample,
  examples,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, color: '#f1f5f9' }}>
        Visualization
      </div>

      {/* Example buttons - automatically generated from examplesRegistry */}
      {examples.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#334155',
                color: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      {/* Input control */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <label style={{ color: '#94a3b8', fontSize: 12 }}>Input:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            handleReset()
          }}
          placeholder="Enter input"
          style={{
            flex: 1,
            padding: '6px 8px',
            backgroundColor: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
      </div>

      {/* Visualization area - replace with your custom visualization */}
      <div
        style={{
          flex: 1,
          border: '1px dashed #334155',
          borderRadius: 6,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          backgroundColor: '#0f172a',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Visualization Area</div>
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Replace this with your custom visualization component
          </div>
          {step && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
              {step.message}
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
 * Orchestrates the entire visualization system:
 * - Loads and generates algorithm steps
 * - Manages playback state (current step, play/pause, speed)
 * - Provides code-visual connectivity (clicking code jumps to step)
 * - Handles pattern overlay visualization
 * - Manages dockable panel layout
 *
 * Props:
 * @param {string} problem - Problem slug (used to load examples and features)
 *
 * State Management:
 * - input: Current algorithm input
 * - steps: Generated algorithm steps
 * - stepIndex: Current step in execution
 * - isPlaying: Whether playback is active
 * - showPatternOverlay: Whether to show pattern overlay
 *
 * Customization Checklist:
 * 1. Update 'problemSlug' constant below
 * 2. Update 'input' initial state with appropriate default
 * 3. Customize generateSteps() function
 * 4. Customize VariablesPanel component
 * 5. Customize VisualizationPanel component
 * 6. Update dockPanels array layout if needed
 */
export default function Visualizer({ problem }) {
  // Configuration - update these for your problem
  const problemSlug = 'your-problem-slug' // TODO: Replace with your problem slug
  const [input, setInput] = useState('') // TODO: Initialize with appropriate default

  // Load solution code and examples from registries
  const SOLUTION_CODE = useSolutionCode(problemSlug)
  const EXAMPLES = useMemo(() => getExamples(problemSlug), [])

  // Generate execution steps from input
  const steps = useMemo(
    () =>
      generateSteps(input).map((current) => ({
        ...current,
        // Ensure relatedLines is always an array
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [input],
  )

  // Playback state management
  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  // Pattern overlay and code-visual connectivity hooks
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } =
    usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Visualization features (conditional visualizations)
  const vizFeatureDefs = useMemo(() => getVisualizationFeatures(problemSlug), [])
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  // Current step
  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null

  // Code-visual connectivity: clicking code lines jumps to relevant steps
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Apply example input
  const applyExample = useCallback(
    (ex) => {
      setInput(ex.input ?? JSON.stringify(ex))
      handleReset()
    },
    [handleReset],
  )

  // Define dockable panels layout
  const dockPanels = useMemo(
    () => [
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
            input={input}
            setInput={setInput}
            step={step}
            handleReset={handleReset}
            applyExample={applyExample}
            examples={EXAMPLES}
          />
        ),
      },
      {
        id: 'vars',
        title: 'Variables',
        content: <VariablesPanel step={step} />,
      },
    ],
    [
      step,
      SOLUTION_CODE,
      connectivity.highlightedLines,
      connectivity.handleLineSelect,
      autoScrollCode,
      input,
      setInput,
      handleReset,
      applyExample,
      EXAMPLES,
      setActiveLineDom,
    ],
  )

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
