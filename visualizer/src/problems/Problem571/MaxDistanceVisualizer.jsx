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
import { getExamplesOr } from '../../config/examplesRegistry'
import './MaxDistanceVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maxDistance(self, arrays: List[List[int]]) -> int:' },
  { line: 3, text: '        minVal = arrays[0][0]' },
  { line: 4, text: '        maxVal = arrays[0][-1]' },
  { line: 5, text: '        maxDistance = 0' },
  { line: 6, text: '        ' },
  { line: 7, text: '        for i in range(1, len(arrays)):' },
  { line: 8, text: '            currMin = arrays[i][0]' },
  { line: 9, text: '            currMax = arrays[i][-1]' },
  { line: 10, text: '            ' },
  { line: 11, text: '            maxDistance = max(maxDistance,' },
  { line: 12, text: '                currMax - minVal, maxVal - currMin)' },
  { line: 13, text: '            ' },
  { line: 14, text: '            minVal = min(minVal, currMin)' },
  { line: 15, text: '            maxVal = max(maxVal, currMax)' },
  { line: 16, text: '        ' },
  { line: 17, text: '        return maxDistance' },
]

const PATTERNS = ['init', 'iterate', 'calculate', 'update', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'init',
  7: 'iterate',
  8: 'calculate',
  9: 'calculate',
  11: 'calculate',
  12: 'calculate',
  14: 'update',
  15: 'update',
  17: 'done',
}

function generateSteps(arrays) {
  const steps = []

  if (!Array.isArray(arrays) || arrays.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 17,
      relatedLines: [17],
      message: 'Invalid input: empty arrays',
      result: 0,
      done: true,
    })
    return steps
  }

  if (!arrays[0] || arrays[0].length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 17,
      relatedLines: [17],
      message: 'Invalid input: first array is empty',
      result: 0,
      done: true,
    })
    return steps
  }

  // Initialize
  const firstArray = arrays[0]
  const minVal = firstArray[0]
  const maxVal = firstArray[firstArray.length - 1]

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5],
    message: `Initialize: minVal=${minVal}, maxVal=${maxVal}, maxDistance=0`,
    minVal,
    maxVal,
    maxDistance: 0,
    currentArrayIndex: 0,
    currentArrayMin: minVal,
    currentArrayMax: maxVal,
    arrays,
  })

  let globalMin = minVal
  let globalMax = maxVal
  let maxDistance = 0

  // Process remaining arrays
  for (let i = 1; i < arrays.length; i++) {
    if (!arrays[i] || arrays[i].length === 0) continue

    const currMin = arrays[i][0]
    const currMax = arrays[i][arrays[i].length - 1]

    // Calculate distances
    steps.push({
      phase: 'calculate',
      activeLine: 8,
      relatedLines: [8, 9],
      message: `Array[${i}]: min=${currMin}, max=${currMax}`,
      minVal: globalMin,
      maxVal: globalMax,
      currentArrayIndex: i,
      currentArrayMin: currMin,
      currentArrayMax: currMax,
      arrays,
    })

    const dist1 = currMax - globalMin
    const dist2 = globalMax - currMin

    steps.push({
      phase: 'calculate',
      activeLine: 11,
      relatedLines: [11, 12],
      message: `Calculate distances: ${currMax} - ${globalMin} = ${dist1}, ${globalMax} - ${currMin} = ${dist2}`,
      minVal: globalMin,
      maxVal: globalMax,
      currentArrayIndex: i,
      currentArrayMin: currMin,
      currentArrayMax: currMax,
      distance1: dist1,
      distance2: dist2,
      arrays,
    })

    maxDistance = Math.max(maxDistance, dist1, dist2)

    steps.push({
      phase: 'calculate',
      activeLine: 11,
      relatedLines: [11, 12],
      message: `Max distance so far: ${maxDistance}`,
      minVal: globalMin,
      maxVal: globalMax,
      maxDistance,
      currentArrayIndex: i,
      currentArrayMin: currMin,
      currentArrayMax: currMax,
      arrays,
    })

    // Update global min/max
    globalMin = Math.min(globalMin, currMin)
    globalMax = Math.max(globalMax, currMax)

    steps.push({
      phase: 'update',
      activeLine: 14,
      relatedLines: [14, 15],
      message: `Update global: minVal=${globalMin}, maxVal=${globalMax}`,
      minVal: globalMin,
      maxVal: globalMax,
      maxDistance,
      currentArrayIndex: i,
      currentArrayMin: currMin,
      currentArrayMax: currMax,
      arrays,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 17,
    relatedLines: [17],
    message: `Maximum distance found: ${maxDistance}`,
    result: maxDistance,
    maxDistance,
    done: true,
    arrays,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Array visualization */}
      {step?.arrays && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {step.arrays.map((arr, arrIdx) => (
            <div key={arrIdx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5577a4' }}>Array[{arrIdx}]</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                {arr.map((val, valIdx) => {
                  const isCurrentMin = step.currentArrayIndex === arrIdx && val === step.currentArrayMin
                  const isCurrentMax = step.currentArrayIndex === arrIdx && val === step.currentArrayMax
                  const isGlobalMin = val === step.minVal && (arrIdx < step.currentArrayIndex || arrIdx === 0)
                  const isGlobalMax = val === step.maxVal && (arrIdx < step.currentArrayIndex || arrIdx === 0)

                  let bgColor = '#1e293b'
                  let borderColor = '#475569'
                  let textColor = '#e2e8f0'

                  if (isCurrentMin) {
                    bgColor = '#1e3a8a'
                    borderColor = '#3b82f6'
                    textColor = '#3b82f6'
                  } else if (isCurrentMax) {
                    bgColor = '#7c2d12'
                    borderColor = '#ea580c'
                    textColor = '#ea580c'
                  } else if (isGlobalMin) {
                    bgColor = '#0f172a'
                    borderColor = '#0ea5e9'
                    textColor = '#0ea5e9'
                  } else if (isGlobalMax) {
                    bgColor = '#431407'
                    borderColor = '#f97316'
                    textColor = '#f97316'
                  }

                  return (
                    <div
                      key={valIdx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        color: textColor,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {val}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current values display */}
      {step?.minVal !== undefined && step?.maxVal !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #0ea5e9' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0b7db0', marginBottom: 6 }}>Global Min</div>
            <div style={{ fontSize: 16, color: '#0b7db0', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.minVal}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f97316' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#c35305', marginBottom: 6 }}>Global Max</div>
            <div style={{ fontSize: 16, color: '#c35305', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.maxVal}
            </div>
          </div>
        </div>
      )}

      {/* Distance calculation */}
      {step?.distance1 !== undefined && step?.distance2 !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Distance Calculations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#5577a4' }}>
            <div>
              <span style={{ color: '#ca4c0a', fontWeight: 600 }}>{step.currentArrayMax}</span>
              {' - '}
              <span style={{ color: '#0b7db0', fontWeight: 600 }}>{step.minVal}</span>
              {' = '}
              <span style={{ color: '#178740', fontWeight: 700 }}>{step.distance1}</span>
            </div>
            <div>
              <span style={{ color: '#c35305', fontWeight: 600 }}>{step.maxVal}</span>
              {' - '}
              <span style={{ color: '#1b6df5', fontWeight: 600 }}>{step.currentArrayMin}</span>
              {' = '}
              <span style={{ color: '#178740', fontWeight: 700 }}>{step.distance2}</span>
            </div>
          </div>
        </div>
      )}

      {/* Max distance display */}
      {step?.maxDistance !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #38bdf8',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Maximum Distance</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#067db1',
            }}
          >
            {step.maxDistance}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function MaxDistanceVisualizer() {
  const examples = useMemo(() => getExamplesOr('max-distance', []), [])
  const [arrayInput, setArrayInput] = useState('[[1,2,3,4,5],[3,4,5,8],[1,7,8,9]]')

  const { arrays, inputError } = useMemo(() => {
    try {
      const arr = JSON.parse(arrayInput)
      if (!Array.isArray(arr)) throw new Error('Input must be array of arrays')
      if (!arr.every(a => Array.isArray(a))) throw new Error('All elements must be arrays')
      return { arrays: arr, inputError: '' }
    } catch (e) {
      return { arrays: [], inputError: e.message }
    }
  }, [arrayInput])

  const steps = useMemo(() => generateSteps(arrays), [arrays])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setArrayInput(JSON.stringify(ex.arrays || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📊 Max Distance', dockMode: 'split-right' },
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>
                Arrays (JSON)
              </div>
              <textarea
                value={arrayInput}
                onChange={(e) => {
                  setArrayInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 80,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, arrayInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"array","label":"array","type":"array"}]}
        values={{ array: arrayInput }}
        onChange={(k, v) => { if (k === 'array') setArrayInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
        />
      </FloatingPanel>
    </div>
  )
}
