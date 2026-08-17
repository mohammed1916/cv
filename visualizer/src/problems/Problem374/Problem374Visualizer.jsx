import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem374Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
const SOLUTION_CODE = getSolutionCode('guess-number-higher-or-lower')

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = ['adjust_left', 'adjust_right', 'calc_guess', 'call_guess', 'check_condition', 'done', 'equal', 'higher', 'init', 'lower']

const EXAMPLES = getExamples('guess-number-higher-or-lower')
const FALLBACK_EXAMPLES = [
  { label: 'Middle target', input: { n: 10, pick: 6 } },
  { label: 'Lower boundary', input: { n: 10, pick: 1 } },
  { label: 'Upper boundary', input: { n: 10, pick: 10 } },
  { label: 'Single number', input: { n: 1, pick: 1 } },
]

function generateSteps(n, pick) {
  const steps = []

  let left = 1
  let right = n

  steps.push({
    activeLine: 1,
    left,
    right,
    guess: null,
    response: null,
    message: `Initialize: left=1, right=${n} (search space: [1, ${n}])`,
    phase: 'init'
  })

  while (left <= right) {
    steps.push({
      activeLine: 3,
      left,
      right,
      guess: null,
      response: null,
      message: `Check loop condition: left (${left}) <= right (${right})? Yes, continue.`,
      phase: 'check_condition'
    })

    const guess = Math.floor(left + (right - left) / 2)

    steps.push({
      activeLine: 4,
      left,
      right,
      guess,
      response: null,
      message: `Calculate guess: mid = ${left} + (${right} - ${left}) / 2 = ${guess}`,
      phase: 'calc_guess'
    })

    steps.push({
      activeLine: 5,
      left,
      right,
      guess,
      response: null,
      message: `Call guess(${guess}). Oracle checks: is ${guess} the target (${pick})?`,
      phase: 'call_guess'
    })

    let response
    if (guess === pick) {
      response = 0
      steps.push({
        activeLine: 6,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: EQUAL (${guess} == ${pick}). Found the number!`,
        phase: 'equal',
        found: true
      })
      return steps
    } else if (guess < pick) {
      response = 1
      steps.push({
        activeLine: 8,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: HIGHER (target ${pick} > guess ${guess})`,
        phase: 'higher'
      })

      steps.push({
        activeLine: 9,
        left: guess + 1,
        right,
        guess,
        response,
        message: `Adjust left = ${guess} + 1 = ${guess + 1}. Search upper half.`,
        phase: 'adjust_left'
      })
      left = guess + 1
    } else {
      response = -1
      steps.push({
        activeLine: 11,
        left,
        right,
        guess,
        response,
        message: `Oracle responds: LOWER (target ${pick} < guess ${guess})`,
        phase: 'lower'
      })

      steps.push({
        activeLine: 12,
        left,
        right: guess - 1,
        guess,
        response,
        message: `Adjust right = ${guess} - 1 = ${guess - 1}. Search lower half.`,
        phase: 'adjust_right'
      })
      right = guess - 1
    }
  }

  steps.push({
    activeLine: 14,
    left,
    right,
    guess: null,
    response: null,
    message: `Loop ends: left (${left}) > right (${right}). Number not found (invalid input).`,
    phase: 'done',
    found: false
  })

  return steps
}

function GuessVisualization({ n, pick, step }) {
  const searchSpaceSize = step ? Math.max(0, step.right - step.left + 1) : n
  const isGuessed = step?.guess !== null && step?.guess !== undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Range display */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 12 }}>
          Search Space
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#dbeafe',
              borderRadius: 6,
              border: '2px solid #0284c7',
              textAlign: 'center'
            }}
            animate={{
              backgroundColor: step?.response === 1 ? '#bbf7d0' : '#dbeafe',
              borderColor: step?.response === 1 ? '#059669' : '#0284c7'
            }}
          >
            <div style={{ fontSize: 11, color: '#1e40af', marginBottom: 4 }}>Left</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0c4a6e' }}>
              {step?.left ?? 1}
            </div>
          </motion.div>

          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#fcd34d',
              borderRadius: 6,
              border: '2px solid #ca8a04',
              textAlign: 'center'
            }}
            animate={{
              scale: isGuessed ? 1.05 : 1,
              boxShadow: isGuessed ? '0 0 20px rgba(202, 138, 4, 0.5)' : '0 0 0px rgba(0,0,0,0)'
            }}
          >
            <div style={{ fontSize: 11, color: '#92400e', marginBottom: 4 }}>Guess</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#78350f' }}>
              {step?.guess ?? '—'}
            </div>
          </motion.div>

          <motion.div
            style={{
              padding: 12,
              backgroundColor: '#fecaca',
              borderRadius: 6,
              border: '2px solid #dc2626',
              textAlign: 'center'
            }}
            animate={{
              backgroundColor: step?.response === -1 ? '#bbf7d0' : '#fecaca',
              borderColor: step?.response === -1 ? '#059669' : '#dc2626'
            }}
          >
            <div style={{ fontSize: 11, color: '#991b1b', marginBottom: 4 }}>Right</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#7f1d1d' }}>
              {step?.right ?? n}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Number range visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 12 }}>
          Number Range [1, {n}]
        </div>
        <div style={{
          padding: 16,
          backgroundColor: 'var(--surface)',
          borderRadius: 6,
          border: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>1</div>
            <div style={{
              flex: 1,
              height: 8,
              backgroundColor: 'var(--text)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {step && step.left <= step.right && (
                <motion.div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    backgroundColor: '#0284c7',
                    left: `${((step.left - 1) / (n - 1)) * 100}%`,
                    right: `${(100 - (step.right / n) * 100)}%`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {step?.guess && (
                <motion.div
                  style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    backgroundColor: '#fbbf24',
                    borderRadius: '50%',
                    top: '50%',
                    left: `${((step.guess - 1) / (n - 1)) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid #d97706'
                  }}
                  animate={{
                    scale: step?.phase === 'equal' ? 1.5 : 1,
                    boxShadow: step?.phase === 'equal'
                      ? '0 0 20px rgba(217, 119, 6, 0.8)'
                      : '0 0 0px rgba(0,0,0,0)'
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            {step?.left && step?.right
              ? `Search space: ${searchSpaceSize} numbers [${step.left}, ${step.right}]`
              : `Full range: ${n} numbers [1, ${n}]`
            }
          </div>
        </div>
      </div>

      {/* Oracle response */}
      {step?.response !== null && step?.response !== undefined && (
        <motion.div
          style={{
            padding: 12,
            borderRadius: 6,
            border: '2px solid',
            backgroundColor: step.response === 0 ? '#dcfce7' : step.response === 1 ? '#dbeafe' : '#fee2e2',
            borderColor: step.response === 0 ? '#22c55e' : step.response === 1 ? '#0284c7' : '#ef4444'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 4 }}>
            Oracle Response
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: step.response === 0 ? '#166534' : step.response === 1 ? '#0c4a6e' : '#991b1b'
          }}>
            {step.response === 0 && '✓ EQUAL — Found!'}
            {step.response === 1 && '↑ HIGHER — Guess is too low'}
            {step.response === -1 && '↓ LOWER — Guess is too high'}
          </div>
        </motion.div>
      )}

      {/* Success indicator */}
      {step?.found === true && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dcfce7',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        >
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#166534' }}>
            🎉 Number Found: {pick}
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#e0e7ff', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#3730a3' }}>Target</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#4f46e5' }}>{pick}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Space Size</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#b45309' }}>{searchSpaceSize}</div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ n, pick, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(ev) => ev.target.style.backgroundColor = 'var(--text)'}
              onMouseLeave={(ev) => ev.target.style.backgroundColor = 'var(--surface2)'}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <GuessVisualization n={n} pick={pick} step={step} />
    </div>
  )
}

export default function Problem374Visualizer() {
  const examples = useMemo(() => EXAMPLES.length ? EXAMPLES.map(example => example.n ? { ...example, input: { n: example.n, pick: example.pick } } : example) : FALLBACK_EXAMPLES, [])
  const [inputText, setInputText] = useState(JSON.stringify(examples[0]?.input || { n: 10, pick: 6 }))
  const { ex, inputError } = useMemo(() => {
    try {
      const value = JSON.parse(inputText), n = Number(value.n), pick = Number(value.pick)
      if (!Number.isInteger(n) || !Number.isInteger(pick) || n < 1 || pick < 1 || pick > n) throw new Error('Use {"n": positive integer, "pick": integer from 1 to n}.')
      return { ex: { n, pick }, inputError: '' }
    } catch (error) { return { ex: { n: 10, pick: 6 }, inputError: error.message } }
  }, [inputText])

  const steps = useMemo(
    () =>
      generateSteps(ex.n, ex.pick).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setInputText(JSON.stringify(e.input || { n: e.n, pick: e.pick })); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: '🎯 Binary Search Guessing', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>),
    viz: (<VisualizationPanel
          n={ex.n}
          pick={ex.pick}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'guess', label: 'Search input (JSON)', type: 'string' }]} values={{ guess: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={examples} activeLabel={null} applyExample={applyEx} inputError={inputError} />, panelDivs.input)}
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
