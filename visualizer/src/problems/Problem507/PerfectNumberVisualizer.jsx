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
import './PerfectNumberVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('perfect-number')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'done',


}

function generateSteps(n) {
  const steps = []

  steps.push({
    activeLine: 1,
    n,
    divisors: [],
    sum: 0,
    i: 1,
    message: `Check if ${n} is a perfect number`
  })

  const divisors = []
  let sum = 0

  for (let i = 1; i < n; i++) {
    if (n % i === 0) {
      divisors.push(i)
      sum += i

      steps.push({
        activeLine: 2,
        n,
        divisors: [...divisors],
        sum,
        i,
        message: `${i} divides ${n}. Found divisor! Sum: ${sum}`
      })
    }
  }

  const isPerfect = sum === n
  steps.push({
    activeLine: 3,
    n,
    divisors,
    sum,
    i: n,
    isPerfect,
    done: true,
    message: `All divisors: ${divisors.join(', ')}. Sum: ${sum}. ${isPerfect ? '✓ Perfect!' : '✗ Not perfect'}`
  })

  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  const examples = [
    { label: '6 (perfect)', n: 6 },
    { label: '28 (perfect)', n: 28 },
    { label: '10 (not perfect)', n: 10 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          "A perfect number equals the sum of its proper divisors. For example, 6 = 1 + 2 + 3."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {examples.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: 12, color: '#065f46' }}>Number to check</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0c865d' }}>{n}</div>
      </motion.div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Proper Divisors Found
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(step?.divisors || []).map((div, idx) => (
            <motion.div
              key={`div-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '2px solid #10b981',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: '#dcfce7',
                color: '#065f46'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {div}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f3e8ff',
          borderRadius: 6,
          border: '2px solid #a78bfa'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Sum Calculation</div>
        <div style={{ fontSize: 12, color: '#6b21b6', marginBottom: 8 }}>
          {(step?.divisors || []).join(' + ') || '...'} = <strong>{step?.sum ?? 0}</strong>
        </div>
        {step?.done && (
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: step.isPerfect ? '#047857' : '#991b1b',
            padding: 8,
            backgroundColor: step.isPerfect ? '#dcfce7' : '#fee2e2',
            borderRadius: 4,
            marginTop: 8
          }}>
            {step.isPerfect ? '✓ PERFECT NUMBER' : '✗ NOT A PERFECT NUMBER'}
          </div>
        )}
      </motion.div>

      {step && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '1px solid #10b981',
            fontSize: 12,
            color: '#065f46'
          }}
        >
          {step.message}
        </div>
      )}
    </div>
  )
}

export default function PerfectNumberVisualizer() {
  const [nInput, setNInput] = useState(6);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 6, inputError: e.message };
    }
  }, [nInput]);

  const steps = useMemo(
    () =>
      generateSteps(n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [n]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setNInput(e.n); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔢 Perfect Number', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          n={n}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, n, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"string"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
          showExamples={false}
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
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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

