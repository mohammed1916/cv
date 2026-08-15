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
import './Problem475Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('heaters')

const PATTERNS = []

const EXAMPLES = getExamples('heaters')

function generateSteps(houses, heaters) {
  const steps = []

  steps.push({
    activeLine: 1,
    houses,
    heaters: [...heaters].sort((a, b) => a - b),
    index: 0,
    maxRadius: 0,
    message: 'Find minimum heater radius to cover all houses'
  })

  const sortedHeaters = [...heaters].sort((a, b) => a - b)

  for (let i = 0; i < Math.min(houses.length, 4); i++) {
    const house = houses[i]
    steps.push({
      activeLine: 2,
      houses,
      heaters: sortedHeaters,
      index: i,
      currentHouse: house,
      maxRadius: 0,
      message: `Find nearest heater for house at ${house}`
    })

    let minDist = Infinity
    for (let heater of sortedHeaters) {
      const dist = Math.abs(house - heater)
      if (dist < minDist) minDist = dist
    }

    steps.push({
      activeLine: 3,
      houses,
      heaters: sortedHeaters,
      index: i,
      currentHouse: house,
      maxRadius: minDist,
      message: `Minimum distance: ${minDist} to nearest heater`
    })
  }

  steps.push({
    activeLine: 4,
    houses,
    heaters: sortedHeaters,
    index: houses.length,
    maxRadius: 0,
    done: true,
    message: 'Minimum radius found'
  })

  return steps
}

function VisualizationPanel({ houses, heaters, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find minimum heater radius to cover all houses. Use binary search or distance calculation to find optimal placement."
        </div>
      </div>

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

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Number Line</div>
        <svg width="100%" height="80" style={{ border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <line x1="20" y1="40" x2="380" y2="40" stroke="#cbd5e1" strokeWidth="2" />
          {Math.min(...[...houses, ...heaters]) >= 0 && Math.max(...[...houses, ...heaters]) <= 50 && (
            <>
              {houses.map((h, idx) => (
                <circle
                  key={`house-${idx}`}
                  cx={20 + (h / 50) * 360}
                  cy="40"
                  r="6"
                  fill={step?.currentHouse === h ? '#fef08a' : '#3b82f6'}
                  stroke="#1f2937"
                  strokeWidth="2"
                />
              ))}
              {heaters.map((h, idx) => (
                <rect
                  key={`heater-${idx}`}
                  x={20 + (h / 50) * 360 - 6}
                  y="34"
                  width="12"
                  height="12"
                  fill="#f59e0b"
                  stroke="#1f2937"
                  strokeWidth="2"
                />
              ))}
            </>
          )}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current House</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>
            {step?.currentHouse ?? '-'}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Min Distance</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>
            {step?.maxRadius ?? 0}
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem475Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [housesInput, setHousesInput] = useState("[1,2,3]");
  const [heatersInput, setHeatersInput] = useState("[2]");
  const { houses, heaters, inputError } = useMemo(() => {
    try {
      const parsedHouses = JSON.parse(housesInput); if (!Array.isArray(parsedHouses)) throw new Error('houses must be an array');
      const parsedHeaters = JSON.parse(heatersInput); if (!Array.isArray(parsedHeaters)) throw new Error('heaters must be an array');
      return { houses: parsedHouses, heaters: parsedHeaters, inputError: '' };
    } catch (e) {
      return { houses: "[1,2,3]", heaters: "[2]", inputError: e.message };
    }
  }, [housesInput, heatersInput]);

  const steps = useMemo(
    () =>
      generateSteps(houses, heaters).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [houses, heaters]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setHousesInput(JSON.stringify(e.houses)); setHeatersInput(JSON.stringify(e.heaters)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔥 Heaters', dockMode: 'split-right' },
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
          houses={houses}
          heaters={heaters}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"houses","label":"houses","type":"array"},{"key":"heaters","label":"heaters","type":"array"}]}
          values={{ houses: housesInput, heaters: heatersInput }}
          onChange={(k, v) => { if (k === 'houses') setHousesInput(v); if (k === 'heaters') setHeatersInput(v); handleReset() }}
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
