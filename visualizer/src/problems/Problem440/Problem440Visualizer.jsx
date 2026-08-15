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
import './Problem440Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('kth-smallest-lexicographical-order')

const PATTERNS = ['backtrack', 'check', 'complete', 'go_deeper', 'go_next', 'init']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'check',
  3: 'go_deeper',
  4: 'go_next',
  5: 'backtrack',
  6: 'complete'
}


const EXAMPLES = getExamples('kth-smallest-lexicographical-order')

function generateSteps(n, k) {
  const steps = []

  if (n < 1 || k < 1) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      n,
      k,
      current: 1,
      count: 0,
      result: -1,
      message: 'Invalid input',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    k,
    current: 1,
    count: 0,
    result: -1,
    message: `Find ${k}th number in lexicographical order [1, ${n}]`,
  })

  let current = 1
  let count = 0
  let result = -1

  for (let i = 0; i < k - 1; i++) {
    steps.push({
      activeLine: 2,
      phase: 'check',
      n,
      k,
      current,
      count,
      result: -1,
      iteration: i + 1,
      message: `Check number: ${current}`,
    })

    if (current * 10 <= n) {
      current *= 10
      steps.push({
        activeLine: 3,
        phase: 'go_deeper',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Go deeper: ${current}`,
      })
    } else if (current % 10 !== 9 && current + 1 <= n) {
      current += 1
      steps.push({
        activeLine: 4,
        phase: 'go_next',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Go to next: ${current}`,
      })
    } else {
      while (current / 10 % 10 === 9) {
        current = Math.floor(current / 10)
      }
      current = Math.floor(current / 10) * 10 + Math.floor(current / 10 % 10) + 1

      steps.push({
        activeLine: 5,
        phase: 'backtrack',
        n,
        k,
        current,
        count,
        result: -1,
        message: `Backtrack to: ${current}`,
      })
    }

    count++
  }

  result = current

  steps.push({
    activeLine: 6,
    phase: 'complete',
    n,
    k,
    current,
    count,
    result,
    isComplete: true,
    message: `Found: ${result}`,
  })

  return steps
}

function NumberSequenceVisualization({ n, current, k }) {
  const numsToShow = Math.min(12, Math.max(5, Math.floor(n / 2)))
  const nums = Array.from({ length: numsToShow }, (_, i) => i + 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Numbers 1 to {n} (showing first {numsToShow})
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map((num) => {
            const isCurrent = num === current

            return (
              <motion.div
                key={num}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: isCurrent ? '#dc2626' : '#dbeafe',
                  border: isCurrent ? '2px solid #991b1b' : '2px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: isCurrent ? 'white' : '#0c4a6e',
                }}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? '0 0 16px rgba(220, 38, 38, 0.5)' : 'none',
                }}
              >
                {num}
              </motion.div>
            )
          })}
          {numsToShow < n && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 13,
              color: '#64748b',
              fontWeight: 600,
            }}>
              ... {n}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LexicographicalTreeVisualization({ n, current }) {
  const renderLevel = () => {
    const currentStr = String(current)
    const levels = []

    for (let i = 0; i < currentStr.length; i++) {
      const prefix = currentStr.substring(0, i + 1)
      levels.push(prefix)
    }

    return levels
  }

  const levels = renderLevel()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Path in Lexicographical Tree</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        {levels.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {levels.map((level, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dbeafe',
                    borderRadius: 4,
                    border: '2px solid #0284c7',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                  animate={{ scale: 1 }}
                >
                  {level}
                </motion.div>
                {idx < levels.length - 1 && (
                  <div style={{ fontSize: 14, color: '#5a779b' }}>→</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#627794', fontSize: 12 }}>Building path...</div>
        )}
      </div>
    </div>
  )
}

function StatsVisualization({ k, current, result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Statistics</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
        }}>
          <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600 }}>Target (K)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#027bba', marginTop: 4 }}>
            {k}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: result !== -1 ? '#ecfdf5' : '#fee2e2',
          borderRadius: 6,
          border: result !== -1 ? '2px solid #10b981' : '2px solid #ef4444',
        }}>
          <div style={{ fontSize: 11, color: result !== -1 ? '#047857' : '#dc2626', fontWeight: 600 }}>
            Result
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: result !== -1 ? '#10b981' : '#ef4444',
            marginTop: 4,
          }}>
            {result !== -1 ? result : '...'}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <NumberSequenceVisualization
        n={step?.n || 10}
        current={step?.current}
        k={step?.k}
      />

      <LexicographicalTreeVisualization
        n={step?.n || 10}
        current={step?.current}
      />

      <StatsVisualization
        k={step?.k || 0}
        current={step?.current}
        result={step?.result || -1}
      />
    </div>
  )
}

export default function Problem440Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(13);
  const [kInput, setKInput] = useState(2);
  const { n, k, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      const parsedK = Number(kInput); if (isNaN(parsedK)) throw new Error('k must be a number');
      return { n: parsedN, k: parsedK, inputError: '' };
    } catch (e) {
      return { n: 13, k: 2, inputError: e.message };
    }
  }, [nInput, kInput]);

  const steps = useMemo(
    () =>
      generateSteps(n, k).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [n, k]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); setKInput(String(e.k)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '123️ Lexicographical', dockMode: 'split-right' },
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
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"},{"key":"k","label":"k","type":"number"}]}
          values={{ n: nInput, k: kInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); if (k === 'k') setKInput(v); handleReset() }}
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
      
    </div>
  )
}
