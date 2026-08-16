import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FibonacciNumberVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('fibonacci-number')

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


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'loop',


  7: 'done',


}

const EXAMPLES = getExamples('fibonacci-number')

function generateSteps(n) {
  const steps = []

  steps.push({
    activeLine: 1,
    n,
    dp: [],
    currentIdx: -1,
    message: `Initialize: Computing Fibonacci(${n})`,
    relatedLines: [1]
  })

  if (n === 0) {
    steps.push({
      activeLine: 2,
      n,
      dp: [0],
      currentIdx: 0,
      done: true,
      result: 0,
      message: 'Base case: F(0) = 0',
      relatedLines: [2]
    })
    return steps
  }

  if (n === 1) {
    steps.push({
      activeLine: 3,
      n,
      dp: [0, 1],
      currentIdx: 1,
      done: true,
      result: 1,
      message: 'Base case: F(1) = 1',
      relatedLines: [3]
    })
    return steps
  }

  const dp = [0, 1]

  steps.push({
    activeLine: 4,
    n,
    dp: [...dp],
    currentIdx: 1,
    message: 'Base cases initialized: F(0)=0, F(1)=1',
    relatedLines: [4]
  })

  for (let i = 2; i <= n; i++) {
    steps.push({
      activeLine: 5,
      n,
      dp: [...dp],
      currentIdx: i - 1,
      message: `Computing F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]}`,
      relatedLines: [5]
    })

    dp.push(dp[i - 1] + dp[i - 2])

    steps.push({
      activeLine: 6,
      n,
      dp: [...dp],
      currentIdx: i,
      message: `F(${i}) = ${dp[i]}`,
      relatedLines: [6]
    })
  }

  steps.push({
    activeLine: 7,
    n,
    dp,
    currentIdx: n,
    done: true,
    result: dp[n],
    message: `Result: F(${n}) = ${dp[n]}`,
    relatedLines: [7]
  })

  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#faf5ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>
          "The Fibonacci sequence: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). Build up from the base cases using dynamic programming to avoid redundant calculations."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* DP Table */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
          DP Array: F[0..{step?.n || n}]
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 8 }}>
          {step?.dp?.map((val, idx) => {
            const isActive = step && idx === step.currentIdx && !step.done
            const isProcessed = step && idx < step.currentIdx
            return (
              <motion.div
                key={`dp-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 60,
                  textAlign: 'center',
                  backgroundColor: isActive ? '#ede9fe' : isProcessed ? '#e9d5ff' : 'var(--surface2)',
                  borderColor: isActive ? '#8b5cf6' : isProcessed ? '#c084fc' : 'var(--border)',
                  color: isActive ? '#5b21b6' : isProcessed ? '#7c3aed' : 'var(--border)'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 11, color: '#6b7280' }}>F({idx})</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Computation Steps */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Building Sequence</div>
        <div style={{
          padding: 12,
          backgroundColor: '#faf5ff',
          borderRadius: 6,
          border: '1px solid #e9d5ff',
          fontFamily: 'monospace',
          fontSize: 12,
          whiteSpace: 'pre-wrap'
        }}>
          {step?.dp && step.dp.length > 0 ? (
            <>
              F(0) = 0
              <br />
              {step.dp.length > 1 && `F(1) = 1`}
              <br />
              {step.dp.map((_, i) => i >= 2 ? `F(${i}) = F(${i-1}) + F(${i-2}) = ${step.dp[i-1]} + ${step.dp[i-2]} = ${step.dp[i]}` : '').filter(Boolean).join('\n')}
            </>
          ) : 'Building...'}
        </div>
      </div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#faf5ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#8553f6' }}>
          F({step?.n || n}) = {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#8553f6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function FibonacciNumberVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(2);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 2, inputError: e.message };
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

  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔢 Fibonacci Number', dockMode: 'split-right' },
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
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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

