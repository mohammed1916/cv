import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './AtoiVisualizer.css'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'

import { INT_MIN, INT_MAX, ATOI_PATTERNS, LINE_PATTERN_MAP, SOLUTION_CODE, generateAtoiSteps, isDigit } from './algorithm'
const EXAMPLES = getExamples('string-to-integer-atoi')
const DEFAULT_INPUT = '   -042'

function Scanner({ input, step }) {
  return (
    <div className="atoi-scanner">
      {input.length === 0 ? (
        <div className="atoi-empty">Empty string</div>
      ) : (
        input.split('').map((char, index) => {
          const isActive = step && step.index === index && step.phase !== 'final'
          const isConsumed = step && index < step.index
          const isDigitRead = step?.digits && index >= step.index - step.digits.length && index < step.index && isDigit(input[index])

          return (
            <motion.div
              key={`${char}-${index}`}
              className={`atoi-char ${isActive ? 'active' : ''} ${isConsumed ? 'consumed' : ''} ${isDigitRead ? 'digit-read' : ''} ${char === ' ' ? 'space' : ''}`}
              animate={{ y: isActive ? -6 : 0, scale: isActive ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <span className="atoi-char-value mono">{char === ' ' ? '␠' : char}</span>
              <span className="atoi-char-index">{index}</span>
            </motion.div>
          )
        })
      )}
      {step?.index === input.length && <div className="atoi-char active"><span className="atoi-char-value">End</span><span className="atoi-char-index">{input.length}</span></div>}
    </div>
  )
}

export default function AtoiVisualizer() {
  const [inputValue, setInputValue] = useState(DEFAULT_INPUT)
  const [source, setSource] = useState(DEFAULT_INPUT)
  const [steps, setSteps] = useState(() => generateAtoiSteps(DEFAULT_INPUT))
  const [showCode, setShowCode] = useState(true)
  const [panelDivs, setPanelDivs] = useState(null)

  // Pattern overlay hook
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Playback state hook
  const {
    stepIndex,
    setStepIndex,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isDone,
  } = usePlaybackState(steps.length, 520)

  const sanitizedInput = inputValue.slice(0, 200)
  const inputError = null

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null
  const progress = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0

  const handleVisualize = useCallback(() => {

    setSource(sanitizedInput)
    setSteps(generateAtoiSteps(sanitizedInput))
    setStepIndex(-1)
    setIsPlaying(false)
  }, [sanitizedInput, setStepIndex, setIsPlaying])

  const applyExample = useCallback((example) => {
    setInputValue(example.value)
    setSource(example.value)
    setSteps(generateAtoiSteps(example.value))
    setStepIndex(-1)
    setIsPlaying(false)
  }, [setStepIndex, setIsPlaying])

  const panelConfigs = useMemo(() => [
    { id: 'main', title: 'Visualizer', dockMode: 'split-right' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
    { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
  ], [])

  const mainPanel = (
    <div className="atoi-main-column">
      <div className="atoi-card">
        <div className="atoi-card-head">
          <div>
            <div className="atoi-section-label">Input Scanner</div>
            <div className="atoi-subtitle">The active reader position advances through whitespace, sign, digits, and stop characters.</div>
          </div>
          <div className="atoi-output-preview">
            <span className="atoi-output-label">Current result</span>
            <span className={`mono atoi-output-text ${currentStep?.clamped ? 'clamped' : ''}`}>{currentStep?.result ?? 0}</span>
          </div>
        </div>
        <Scanner input={source} step={currentStep} />
      </div>

      <div className="atoi-state-grid">
        <div className="atoi-card atoi-state-card">
          <div className="atoi-section-label">Parser State</div>
          <div className="atoi-kv-grid">
            <div className="atoi-kv"><span className="atoi-kv-key">Index</span><span className="mono atoi-kv-value">{currentStep?.index ?? 0}</span></div>
            <div className="atoi-kv"><span className="atoi-kv-key">Current char</span><span className="mono atoi-kv-value">{currentStep?.currentChar == null ? '—' : currentStep.currentChar === ' ' ? '␠' : currentStep.currentChar}</span></div>
            <div className="atoi-kv"><span className="atoi-kv-key">Sign</span><span className="mono atoi-kv-value">{currentStep?.sign ?? 1}</span></div>
            <div className="atoi-kv"><span className="atoi-kv-key">Digits read</span><span className="mono atoi-kv-value">{currentStep?.digits || '—'}</span></div>
            <div className="atoi-kv"><span className="atoi-kv-key">Unsigned value</span><span className="mono atoi-kv-value">{currentStep?.unsignedValue ?? 0}</span></div>
            <div className="atoi-kv"><span className="atoi-kv-key">Clamped</span><span className="mono atoi-kv-value">{currentStep?.clamped || 'no'}</span></div>
          </div>
        </div>

        <div className="atoi-card atoi-state-card">
          <div className="atoi-section-label">Explanation</div>
          <div className="atoi-explanation">{currentStep?.description || 'Start the walkthrough to see each parsing phase.'}</div>
          {currentStep?.stopReason && <div className="atoi-stop-note">{currentStep.stopReason}</div>}
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative' }}>
      <CodeTracePanel playgroundInput={{ s: source }} playgroundDisabled={false} step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />

      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={currentStep?.phase}
          activeLineDom={activeLineDom}
          activeLine={currentStep?.activeLine}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {stepIndex < 0
            ? 'Not started — press Play or Next'
            : isDone
              ? `Done! Final result = ${currentStep?.result}`
              : `Step ${stepIndex + 1} / ${steps.length}`}
        </div>
      </div>
      <div style={{ height: '4px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #14b8a6)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.14 }}
        />
      </div>
    </div>
  )

  const playbackPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', overflow: 'auto' }}>
      <PlaybackControls
        className="atoi-controls"
        buttonClassName="atoi-btn"
        ghostButtonClassName="atoi-btn-ghost"
        playButtonClassName="atoi-btn-play"
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={stepIndex < 0}
        prevDisabled={stepIndex < 0}
        nextDisabled={isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speedWrapClassName="atoi-speed-wrap"
        speedLabelClassName="atoi-speed-label"
        speed={speed}
        speedRangeValue={1480 - speed}
        onSpeedChange={(event) => setSpeed(1480 - Number(event.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && (
        <PatternLegend currentPhase={currentStep?.phase} usedPatterns={ATOI_PATTERNS} />
      )}
    </div>
  )

  return (
    <div className="atoi">
      <div className="atoi-card atoi-input-card">
        <div className="atoi-input-row">
          <div className="atoi-field-group">
            <label className="atoi-input-label">Input string</label>
            <input
              className={`atoi-input mono ${inputError ? 'has-error' : ''}`}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
              }}
              onKeyDown={(event) => event.key === 'Enter' && handleVisualize()}
              placeholder="   -042"
              maxLength={200}
            />
          </div>
          <button className="atoi-btn atoi-btn-primary" onClick={handleVisualize}>Visualize</button>
        </div>

        <div className="atoi-support-row">
          <p className={`atoi-hint ${inputError ? 'error' : ''}`}>{inputError || 'Use examples that show whitespace, signs, early stops, and 32-bit clamping.'}</p>
          <div className="atoi-meta-row">
            <span className="atoi-pill mono">len {sanitizedInput.length}</span>
            <span className="atoi-pill mono">range [{INT_MIN}, {INT_MAX}]</span>
          </div>
        </div>

        <div className="atoi-example-grid">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example.label}
              className={`atoi-example-card ${source === example.value ? 'active' : ''}`}
              onClick={() => applyExample(example)}
            >
              <span className="atoi-example-top">
                <span className="atoi-example-label">{example.label}</span>
                <span className="atoi-example-chip mono">{example.value || '""'}</span>
              </span>
              <span className="atoi-example-note">{example.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="atoi-toolbar">
        <div className="atoi-toggle-group">
          <span className="atoi-toggle-label">View</span>
          <div className="atoi-toggle-pill">
            <button className={`atoi-toggle-btn ${!showCode ? 'active' : ''}`} onClick={() => setShowCode(false)}>Visual only</button>
            <button className={`atoi-toggle-btn ${showCode ? 'active' : ''}`} onClick={() => setShowCode(true)}>Visual + code</button>
          </div>
        </div>
      </div>

      <div className="atoi-shell">
        <LuminoDockPanel
          panels={panelConfigs}
          onPanelReady={(divs) => setPanelDivs(divs)}
        />
        {panelDivs && (
          <>
            {createPortal(mainPanel, panelDivs['main'])}
            {showCode && createPortal(codePanel, panelDivs['code'])}
            {createPortal(statusPanel, panelDivs['status'])}
          </>
        )}
      </div>
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
