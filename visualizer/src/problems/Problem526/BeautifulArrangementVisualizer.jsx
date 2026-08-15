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
import './BeautifulArrangementVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('beautiful-arrangement')

const PATTERNS = ['backtrack', 'check', 'done', 'found', 'init', 'loop', 'recurse']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'loop',
  5: 'loop',
  6: 'process',
  7: 'process',
  9: 'process'
}

const EXAMPLES = getExamples('beautiful-arrangement')

function generateSteps(n) {
  const steps = []
  const recursionStack = []
  const validArrangements = []

  steps.push({
    activeLine: 1,
    n,
    pos: 0,
    available: (1 << (n + 1)) - 1,
    arrangement: [],
    count: 0,
    phase: 'init',
    message: `Find beautiful arrangements for n=${n}. Numbers must satisfy: i % pos == 0 or pos % i == 0`,
    relatedLines: [1]
  })

  function backtrack(pos, available, arrangement, depth) {
    if (pos === n + 1) {
      steps.push({
        activeLine: 3,
        n,
        pos,
        available,
        arrangement: [...arrangement],
        count: validArrangements.length + 1,
        phase: 'found',
        message: `Found valid arrangement: [${arrangement.join(', ')}]`,
        relatedLines: [3],
        valid: true
      })
      validArrangements.push([...arrangement])
      return
    }

    steps.push({
      activeLine: 5,
      n,
      pos,
      available,
      arrangement: [...arrangement],
      count: validArrangements.length,
      phase: 'loop',
      message: `Position ${pos}: trying candidates from 1 to ${n}`,
      relatedLines: [5],
      depth
    })

    for (let i = 1; i <= n; i++) {
      const isBitSet = available & (1 << i)
      const isDivisible = i % pos === 0 || pos % i === 0

      steps.push({
        activeLine: 6,
        n,
        pos,
        i,
        available,
        arrangement: [...arrangement],
        count: validArrangements.length,
        phase: 'check',
        message: `Check i=${i}: available=${isBitSet > 0}, divisible=${isDivisible}`,
        relatedLines: [6],
        depth,
        candidate: i,
        valid: isDivisible && isBitSet > 0
      })

      if (isBitSet && isDivisible) {
        const newAvailable = available ^ (1 << i)
        const newArrangement = [...arrangement, i]

        steps.push({
          activeLine: 7,
          n,
          pos,
          i,
          available: newAvailable,
          arrangement: newArrangement,
          count: validArrangements.length,
          phase: 'recurse',
          message: `Place ${i} at position ${pos}, recurse to position ${pos + 1}`,
          relatedLines: [7],
          depth
        })

        backtrack(pos + 1, newAvailable, newArrangement, depth + 1)

        steps.push({
          activeLine: 7,
          n,
          pos,
          i,
          available,
          arrangement: [...arrangement],
          count: validArrangements.length,
          phase: 'backtrack',
          message: `Backtrack from i=${i} at position ${pos}`,
          relatedLines: [7],
          depth
        })
      }
    }
  }

  backtrack(1, (1 << (n + 1)) - 1, [], 0)

  steps.push({
    activeLine: 9,
    n,
    pos: n + 1,
    available: 0,
    arrangement: [],
    count: validArrangements.length,
    phase: 'done',
    message: `Total beautiful arrangements: ${validArrangements.length}`,
    relatedLines: [9],
    result: validArrangements.length,
    done: true
  })

  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Arrange numbers 1 to n where each position i is divisible by the number placed there."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Arrangement */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Current Arrangement (Position {step?.pos || 0}/{n})
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.arrangement?.map((num, idx) => (
            <motion.div
              key={`pos-${idx}`}
              style={{
                padding: '12px 16px',
                borderRadius: 6,
                border: '2px solid',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: '#dbeafe',
                borderColor: '#0284c7',
                color: '#0c4a6e',
                textAlign: 'center'
              }}
              animate={{ scale: 1 }}
            >
              <div style={{ fontSize: 10, color: '#0c4a6e' }}>pos {idx + 1}</div>
              <div>{num}</div>
            </motion.div>
          ))}
          {step?.pos && step?.pos <= n && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 6,
              border: '2px dashed #cbd5e1',
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 600,
              color: '#94a3b8',
              textAlign: 'center',
              minWidth: 50
            }}>
              <div style={{ fontSize: 10 }}>pos {step.pos}</div>
              <div>?</div>
            </div>
          )}
        </div>
      </div>

      {/* Available Numbers */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Available Numbers</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: n }, (_, i) => i + 1).map(num => {
            const isAvailable = step && (step.available & (1 << num)) > 0
            const isCandidate = step?.candidate === num
            return (
              <motion.div
                key={`num-${num}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  minWidth: 40,
                  textAlign: 'center',
                  backgroundColor: isCandidate ? '#fecaca' : isAvailable ? '#f1f5f9' : '#f8fafc',
                  borderColor: isCandidate ? '#f87171' : isAvailable ? '#cbd5e1' : '#e2e8f0',
                  color: isCandidate ? '#7f1d1d' : isAvailable ? '#1e293b' : '#94a3b8',
                  opacity: isAvailable ? 1 : 0.5
                }}
                animate={{ scale: isCandidate ? 1.2 : 1 }}
              >
                {num}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Phase Info */}
      {step?.phase === 'check' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '1px solid #fbbf24',
            fontFamily: 'monospace',
            fontSize: 12
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#92400e', marginBottom: 4 }}>
            Checking i={step.candidate} at position {step.pos}:
          </div>
          <div style={{ color: '#b45309', fontSize: 11 }}>
            • {step.candidate} % {step.pos} = {step.candidate % step.pos}
          </div>
          <div style={{ color: '#b45309', fontSize: 11 }}>
            • {step.pos} % {step.candidate} = {step.pos % step.candidate}
          </div>
          <div style={{ color: step.valid ? '#10b981' : '#ef4444', fontWeight: 600, marginTop: 4 }}>
            {step.valid ? '✓ VALID' : '✗ INVALID'}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Arrangements Found</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.count !== undefined ? step.count : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function BeautifulArrangementVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 2 })

  const steps = useMemo(
    () =>
      generateSteps(ex.n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '↔ Beautiful Arrangement', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

          <div style={{ position: 'relative' }}>


            <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />



            {showPatternOverlay && (


              <CodePatternAnnotations


                linePatterns={LINE_PATTERN_MAP}


                currentPhase={step?.phase}


                activeLineDom={activeLineDom}


                activeLine={step?.activeLine}


              />


            )}


          </div>
          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<VisualizationPanel
          n={ex.n}
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
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
      
    </div>
  )
}
