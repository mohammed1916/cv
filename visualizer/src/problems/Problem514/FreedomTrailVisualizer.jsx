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
import { getExamples } from '../../config/examplesRegistry'
import './FreedomTrailVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('freedom-trail')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'done',


}

const EXAMPLES = getExamples('freedom-trail')

function generateSteps(ring, key) {
  const steps = []

  steps.push({
    activeLine: 1,
    ring,
    key,
    currentPos: 0,
    currentKeyIdx: 0,
    steps_taken: 0,
    message: `Start at position 0 ('${ring[0]}'), need to spell '${key}'`,
    relatedLines: [1]
  })

  let currentPos = 0
  let totalSteps = 0

  for (let keyIdx = 0; keyIdx < key.length; keyIdx++) {
    const target = key[keyIdx]
    const positions = []

    for (let i = 0; i < ring.length; i++) {
      if (ring[i] === target) {
        positions.push(i)
      }
    }

    steps.push({
      activeLine: 2,
      ring,
      key,
      currentPos,
      currentKeyIdx: keyIdx,
      targetChar: target,
      targetPositions: positions,
      steps_taken: totalSteps,
      message: `Find positions of '${target}' in ring`,
      relatedLines: [2]
    })

    let minDist = Infinity
    let bestPos = positions[0]

    for (const pos of positions) {
      const clockwise = (pos - currentPos + ring.length) % ring.length
      const counterClockwise = (currentPos - pos + ring.length) % ring.length
      const dist = Math.min(clockwise, counterClockwise)

      if (dist < minDist) {
        minDist = dist
        bestPos = pos
      }

      steps.push({
        activeLine: 3,
        ring,
        key,
        currentPos,
        currentKeyIdx: keyIdx,
        targetPos: pos,
        clockwise,
        counterClockwise,
        dist,
        steps_taken: totalSteps,
        message: `Position ${pos}: clockwise ${clockwise}, counter-clockwise ${counterClockwise}, min ${dist}`,
        relatedLines: [3]
      })
    }

    steps.push({
      activeLine: 4,
      ring,
      key,
      currentPos,
      currentKeyIdx: keyIdx,
      targetPos: bestPos,
      minDist,
      steps_taken: totalSteps,
      message: `Best position: ${bestPos} with distance ${minDist}`,
      relatedLines: [4]
    })

    totalSteps += minDist + 1
    currentPos = bestPos

    steps.push({
      activeLine: 5,
      ring,
      key,
      currentPos,
      currentKeyIdx: keyIdx + 1,
      steps_taken: totalSteps,
      message: `Spelled '${key.substring(0, keyIdx + 1)}', total steps: ${totalSteps}`,
      relatedLines: [5]
    })
  }

  steps.push({
    activeLine: 6,
    ring,
    key,
    currentPos,
    currentKeyIdx: key.length,
    steps_taken: totalSteps,
    done: true,
    result: totalSteps,
    message: `Complete! Total steps: ${totalSteps}`,
    relatedLines: [6]
  })

  return steps
}

function VisualizationPanel({ ring, key, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#faf5ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>
          "A rotational dial with letters. Spell the keyword by rotating and pressing the button. Count minimum steps."
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

      {/* Ring Visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Ring: {ring}</div>
        <svg width="100%" height="250" viewBox="0 0 250 250" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <circle cx="125" cy="125" r="80" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          {ring.split('').map((char, idx) => {
            const angle = (idx / ring.length) * 2 * Math.PI - Math.PI / 2
            const x = 125 + 80 * Math.cos(angle)
            const y = 125 + 80 * Math.sin(angle)
            const isActive = step && idx === step.currentPos
            const isTarget = step && step.targetPositions?.includes(idx)

            return (
              <g key={`ring-${idx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={isActive ? '#e9d5ff' : isTarget ? '#dbeafe' : '#f1f5f9'}
                  stroke={isActive ? '#8b5cf6' : isTarget ? '#0284c7' : '#cbd5e1'}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontFamily="monospace"
                  fontSize="16"
                  fontWeight="700"
                  fill={isActive ? '#5b21b6' : isTarget ? '#0c4a6e' : '#334155'}
                >
                  {char}
                </text>
              </g>
            )
          })}
          <circle cx="125" cy="125" r="20" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
          <text x="125" y="130" textAnchor="middle" fontSize="12" fill="#8b5cf6" fontWeight="600">
            {step?.currentPos !== undefined ? ring[step.currentPos] : ring[0]}
          </text>
        </svg>
      </div>

      {/* Key Progress */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Spelling Progress
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {key.split('').map((char, idx) => {
            const isSpelled = step && idx < step.currentKeyIdx
            const isCurrent = step && idx === step.currentKeyIdx
            return (
              <motion.div
                key={`key-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#ede9fe' : isSpelled ? '#e9d5ff' : '#f1f5f9',
                  borderColor: isCurrent ? '#8b5cf6' : isSpelled ? '#c084fc' : '#cbd5e1',
                  color: isCurrent ? '#5b21b6' : isSpelled ? '#7c3aed' : '#334155'
                }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Steps */}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Total Steps</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#8b5cf6' }}>
          {step?.steps_taken ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function FreedomTrailVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [ringInput, setRingInput] = useState("godding");
  const [keyInput, setKeyInput] = useState("gd");
  const { ring, key, inputError } = useMemo(() => {
    try {
      const parsedRing = ringInput;
      const parsedKey = keyInput;
      return { ring: parsedRing, key: parsedKey, inputError: '' };
    } catch (e) {
      return { ring: "godding", key: "gd", inputError: e.message };
    }
  }, [ringInput, keyInput]);

  const steps = useMemo(
    () =>
      generateSteps(ring, key).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ring, key]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setRingInput(String(e.ring)); setKeyInput(String(e.key)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔑 Freedom Trail', dockMode: 'split-right' },
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
          ring={ring}
          key={key}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"ring","label":"ring","type":"string"},{"key":"key","label":"key","type":"string"}]}
          values={{ ring: ringInput, key: keyInput }}
          onChange={(k, v) => { if (k === 'ring') setRingInput(v); if (k === 'key') setKeyInput(v); handleReset() }}
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

