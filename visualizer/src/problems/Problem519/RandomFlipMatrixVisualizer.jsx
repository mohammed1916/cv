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
import './RandomFlipMatrixVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('random-flip-matrix')

const PATTERNS = ['init', 'loop']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop'
}


const EXAMPLES = getExamples('random-flip-matrix')

const FALLBACK = { m: 3, n: 2, flips: [[0, 0]] }

function generateSteps(m, n, flips) {
  const steps = []

  steps.push({
    activeLine: 1,
    m,
    n,
    flipped: new Set(),
    total: m * n,
    flipIdx: -1,
    message: `Initialize ${m}x${n} matrix with ${m * n} cells`,
    relatedLines: [1]
  })

  const flipped = new Set()

  flips.forEach((flip, flipIdx) => {
    const cell = flip[0] * n + flip[1]

    steps.push({
      activeLine: 2,
      m,
      n,
      flipped: new Set(flipped),
      total: m * n - flipped.size,
      flipIdx,
      currentFlip: flip,
      message: `Flip cell [${flip[0]}, ${flip[1]}]`,
      relatedLines: [2]
    })

    flipped.add(cell)

    steps.push({
      activeLine: 3,
      m,
      n,
      flipped: new Set(flipped),
      total: m * n - flipped.size,
      flipIdx,
      currentFlip: flip,
      message: `Cell [${flip[0]}, ${flip[1]}] flipped. Remaining: ${m * n - flipped.size}`,
      relatedLines: [3]
    })
  })

  steps.push({
    activeLine: 4,
    m,
    n,
    flipped,
    done: true,
    result: Array.from(flipped).map(cell => [Math.floor(cell / n), cell % n]),
    message: `All flips complete`,
    relatedLines: [4]
  })

  return steps
}

function VisualizationPanel({ m, n, flips, step }) {
  const flipped = step?.flipped || new Set()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#faf5ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>
          "Randomly flip cells in matrix without replacement. Use mapping to track flipped cells."
        </div>
      </div>

      {/* Matrix */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Matrix ({m}x{n})
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gap: 4,
          maxWidth: '300px'
        }}>
          {Array.from({ length: m * n }).map((_, idx) => {
            const row = Math.floor(idx / n)
            const col = idx % n
            const isCellFlipped = flipped.has(idx)
            const isCurrentFlip = step && step.currentFlip && step.currentFlip[0] === row && step.currentFlip[1] === col

            return (
              <motion.div
                key={`cell-${idx}`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 4,
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isCurrentFlip ? '#f472b6' : isCellFlipped ? '#e9d5ff' : '#f1f5f9',
                  borderColor: isCurrentFlip ? '#ec4899' : isCellFlipped ? '#c084fc' : '#cbd5e1',
                  color: isCurrentFlip ? '#fff' : isCellFlipped ? '#7c3aed' : '#334155'
                }}
                animate={{ scale: isCurrentFlip ? 1.2 : 1 }}
              >
                {isCellFlipped ? '1' : '0'}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Flip Log */}
      {flips.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#faf5ff',
            borderRadius: 6,
            border: '1px solid #e9d5ff'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>
            Flip History
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto' }}>
            {flips.map((flip, idx) => {
              const isActive = step && idx === step.flipIdx
              return (
                <div key={idx} style={{
                  padding: '6px 12px',
                  backgroundColor: isActive ? '#e9d5ff' : '#f3f4f6',
                  borderRadius: 4,
                  border: `1px solid ${isActive ? '#c084fc' : '#cbd5e1'}`,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? '#7c3aed' : '#334155'
                }}>
                  [{flip[0]}, {flip[1]}]
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Status */}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' }}>
          Flipped: {flipped.size} / Total: {m * n}
        </div>
        <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function RandomFlipMatrixVisualizer() {
  const [mInput, setMInput] = useState(String(EXAMPLES?.[0]?.m ?? FALLBACK.m))
  const [nInput, setNInput] = useState(String(EXAMPLES?.[0]?.n ?? FALLBACK.n))
  const [flipsInput, setFlipsInput] = useState(
    JSON.stringify(EXAMPLES?.[0]?.flips ?? FALLBACK.flips)
  )
  const [activeLabel, setActiveLabel] = useState(EXAMPLES?.[0]?.label ?? '')

  const { m, n, flips, inputError } = useMemo(() => {
    try {
      const parsedM = JSON.parse(mInput)
      const parsedN = JSON.parse(nInput)
      if (!Number.isInteger(parsedM) || parsedM < 1) throw new Error('m must be an integer >= 1')
      if (!Number.isInteger(parsedN) || parsedN < 1) throw new Error('n must be an integer >= 1')
      if (parsedM * parsedN > 400) throw new Error('m * n must be <= 400 for display')

      const parsedFlips = JSON.parse(flipsInput)
      if (!Array.isArray(parsedFlips)) throw new Error('flips must be an array of [row, col] pairs')
      parsedFlips.forEach((flip) => {
        if (!Array.isArray(flip) || flip.length !== 2 || !flip.every((v) => Number.isInteger(v))) {
          throw new Error('each flip must be a [row, col] pair of integers')
        }
        if (flip[0] < 0 || flip[0] >= parsedM || flip[1] < 0 || flip[1] >= parsedN) {
          throw new Error(`flip [${flip[0]}, ${flip[1]}] is outside the ${parsedM}x${parsedN} matrix`)
        }
      })

      return { m: parsedM, n: parsedN, flips: parsedFlips, inputError: '' }
    } catch (e) {
      return { m: FALLBACK.m, n: FALLBACK.n, flips: FALLBACK.flips, inputError: e.message }
    }
  }, [mInput, nInput, flipsInput])

  const steps = useMemo(
    () =>
      generateSteps(m, n, flips).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [m, n, flips]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setMInput(String(e.m ?? FALLBACK.m))
    setNInput(String(e.n ?? FALLBACK.n))
    setFlipsInput(JSON.stringify(e.flips ?? [[0, 0]]))
    setActiveLabel(e.label ?? '')
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'm') setMInput(text)
    else if (key === 'n') setNInput(text)
    else if (key === 'flips') setFlipsInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎲 Random Flip Matrix', dockMode: 'split-right' },
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


          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 'm', label: 'm (rows)', type: 'number' },
            { key: 'n', label: 'n (cols)', type: 'number' },
            { key: 'flips', label: 'flips', type: 'array' },
          ]}
          values={{ m: mInput, n: nInput, flips: flipsInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          m={m}
          n={n}
          flips={flips}
          step={step}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, m, n, flips, mInput, nInput, flipsInput, activeLabel, inputError, applyEx, handleFieldChange])
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
