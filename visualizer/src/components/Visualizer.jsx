import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from './shared/DockableWorkspace'
import FloatingPanel from './shared/FloatingPanel'
import CodeTracePanel from './CodeTracePanel'
import PlaybackControls from './PlaybackControls'
import PatternOverlay from './PatternOverlay'
import VisualizationControls from './VisualizationControls'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../hooks/usePatternOverlay'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { useVisualizationFeatures } from '../hooks/useVisualizationFeatures'
import { useSolutionCode } from '../hooks/useSolutionCode'
import { getVisualizationFeatures } from '../config/visualizationRegistry'
import { getExamples } from '../config/examplesRegistry'
import './Visualizer.css'

/**
 * Generic Visualizer component that provides a reusable framework for algorithm visualization.
 *
 * Props:
 *   - problemId: string - Unique identifier for the problem (e.g., 'climbing-stairs')
 *   - generateSteps: function - Function that takes input parameters and returns an array of visualization steps
 *   - createVisualizationPanel: function - Function that renders the main visualization panel
 *   - createVariablesPanel: function - Optional function that renders the variables panel
 *   - inputSchema: object - Schema defining input parameters (name, type, min, max, default)
 *   - examples: array - Optional array of example inputs
 */
export default function Visualizer({
  problemId,
  generateSteps,
  createVisualizationPanel,
  createVariablesPanel,
  inputSchema = {},
  examples = [],
  defaultInputs = {},
}) {
  // Initialize input state based on schema
  const [inputs, setInputs] = useState(defaultInputs)

  // Load solution code from registry
  const SOLUTION_CODE = useSolutionCode(problemId)

  // Validate and normalize inputs
  const validatedInputs = useMemo(() => {
    const result = { ...inputs }
    const errors = {}

    Object.entries(inputSchema).forEach(([key, schema]) => {
      const value = result[key]

      if (schema.required && (value === undefined || value === null || value === '')) {
        errors[key] = `${schema.label || key} is required`
        result[key] = schema.default
        return
      }

      if (schema.type === 'number') {
        const num = Number(value)
        if (isNaN(num)) {
          errors[key] = `${schema.label || key} must be a number`
          result[key] = schema.default
          return
        }
        if (schema.min !== undefined && num < schema.min) {
          errors[key] = `${schema.label || key} must be at least ${schema.min}`
          result[key] = schema.default
          return
        }
        if (schema.max !== undefined && num > schema.max) {
          errors[key] = `${schema.label || key} must be at most ${schema.max}`
          result[key] = schema.default
          return
        }
        result[key] = num
      } else if (schema.type === 'string') {
        result[key] = String(value)
      } else if (schema.type === 'array') {
        if (typeof value === 'string') {
          try {
            result[key] = JSON.parse(value)
            if (!Array.isArray(result[key])) {
              throw new Error('Not an array')
            }
          } catch (e) {
            errors[key] = `${schema.label || key} must be a valid JSON array`
            result[key] = schema.default || []
          }
        } else if (Array.isArray(value)) {
          result[key] = value
        }
      }
    })

    return { inputs: result, errors }
  }, [inputs, inputSchema])

  // Generate steps based on current inputs
  const steps = useMemo(
    () => generateSteps(validatedInputs.inputs).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [generateSteps, validatedInputs.inputs],
  )

  // Playback controls
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  // Pattern overlay and auto-scroll
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  // Visualization features from registry
  const vizFeatureDefs = useMemo(() => getVisualizationFeatures(problemId) || [], [problemId])
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  // Current step data
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  // Apply example input
  const applyExample = useCallback((exampleInputs) => {
    setInputs(exampleInputs)
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
  const dockPanels = useMemo(() => {
    const panels = [
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
        content: createVisualizationPanel({
          inputs: validatedInputs.inputs,
          inputErrors: validatedInputs.errors,
          onInputChange: handleInputChange,
          applyExample,
          examples: examples,
          step,
          handleReset,
        }),
      },
    ]

    if (createVariablesPanel) {
      panels.push({
        id: 'vars',
        title: 'Variables',
        content: createVariablesPanel({ step }),
      })
    }

    return panels
  }, [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect,
      autoScrollCode, validatedInputs, handleInputChange, createVisualizationPanel,
      createVariablesPanel, applyExample, examples, handleReset, setActiveLineDom])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz'], createVariablesPanel ? ['vars'] : []], minimized: [] }}
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
      <AnimatePresence>
        {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
      </AnimatePresence>
    </div>
  )
}

/**
 * Utility function to create input controls for the visualization panel.
 * Usage: createInputControls(inputSchema, inputs, errors, onInputChange)
 */
export function createInputControls(inputSchema, inputs, errors, onInputChange) {
  return (
    <div className="visualizer-inputs" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      {Object.entries(inputSchema).map(([key, schema]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor={`input-${key}`} style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>
            {schema.label || key} {schema.type === 'array' ? '[]' : ''}:
          </label>
          <input
            id={`input-${key}`}
            type={schema.type === 'number' ? 'number' : 'text'}
            value={inputs[key] ?? ''}
            onChange={(e) => onInputChange(key, e.target.value)}
            placeholder={schema.placeholder || String(schema.default)}
            className="visualizer-input"
            style={{
              padding: '6px 8px',
              border: errors[key] ? '2px solid #f87171' : '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: 'monospace',
              width: schema.width || '100px',
            }}
            min={schema.min}
            max={schema.max}
          />
          {errors[key] && (
            <span style={{ color: '#f87171', fontSize: 12 }}>{errors[key]}</span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Utility function to create example buttons.
 * Usage: createExampleButtons(examples, onExampleClick)
 */
export function createExampleButtons(examples, onExampleClick) {
  if (!examples || examples.length === 0) return null

  return (
    <div className="visualizer-examples" style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {examples.map((ex) => (
        <button
          key={ex.label}
          onClick={() => onExampleClick(ex.inputs || ex)}
          className="visualizer-example-btn"
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

/**
 * Utility function to create a variable display card.
 * Usage: createVariableCard(name, value, description, type)
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
      className="visualizer-var-card"
      style={{
        padding: 12,
        borderRadius: '4px',
        ...typeStyles[type] || typeStyles.default,
      }}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{name}</span>
      </div>
      <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 4 }}>
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
