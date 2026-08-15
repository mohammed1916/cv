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
import './SquirrelDistributionVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'def maxDistToChairs(trees, squirrel, chairs):' },
  { line: 2, text: '    trees.sort()' },
  { line: 3, text: '    chairs.sort()' },
  { line: 4, text: '    n = len(chairs)' },
  { line: 5, text: '    ' },
  { line: 6, text: '    # DP[i] = min dist to visit all chairs[0..i]' },
  { line: 7, text: '    dp = [float("inf")] * n' },
  { line: 8, text: '    ' },
  { line: 9, text: '    # From left: each tree to all chairs' },
  { line: 10, text: '    for i in range(n):' },
  { line: 11, text: '        for j in range(i + 1):' },
  { line: 12, text: '            dist = abs(trees[i] - chairs[j])' },
  { line: 13, text: '            if j == 0:' },
  { line: 14, text: '                dp[j] = min(dp[j], dist)' },
  { line: 15, text: '            else:' },
  { line: 16, text: '                dp[j] = min(dp[j], dp[j-1] + dist)' },
  { line: 17, text: '    ' },
  { line: 18, text: '    result = float("inf")' },
  { line: 19, text: '    for i in range(n):' },
  { line: 20, text: '        dist = abs(squirrel - chairs[i])' },
  { line: 21, text: '        result = min(result, dp[i] + dist)' },
  { line: 22, text: '    ' },
  { line: 23, text: '    return result' },
]

const PATTERNS = ['input_sort', 'initialize', 'iterate', 'calculate_dist', 'dynamic_prog', 'final_calc', 'return']
const LINE_PATTERN_MAP = {
  2: 'input_sort',
  3: 'input_sort',
  7: 'initialize',
  10: 'iterate',
  12: 'calculate_dist',
  14: 'dynamic_prog',
  16: 'dynamic_prog',
  20: 'final_calc',
  21: 'final_calc',
  23: 'return',
}

function generateSteps(trees, squirrel, chairs) {
  const steps = []

  if (!Array.isArray(trees) || !Array.isArray(chairs) || squirrel === undefined) {
    steps.push({
      phase: 'return',
      activeLine: 23,
      relatedLines: [23],
      message: 'Invalid input.',
      result: -1,
      done: true,
    })
    return steps
  }

  const sortedTrees = [...trees].sort((a, b) => a - b)
  const sortedChairs = [...chairs].sort((a, b) => a - b)
  const n = sortedChairs.length

  steps.push({
    phase: 'input_sort',
    activeLine: 2,
    relatedLines: [2, 3],
    message: `Sort trees: ${JSON.stringify(sortedTrees)}, chairs: ${JSON.stringify(sortedChairs)}`,
    trees: sortedTrees,
    chairs: sortedChairs,
    squirrel,
  })

  const dp = new Array(n).fill(Infinity)

  steps.push({
    phase: 'initialize',
    activeLine: 7,
    relatedLines: [7],
    message: `Initialize DP array of size ${n}`,
    dp: [...dp],
    trees: sortedTrees,
    chairs: sortedChairs,
  })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      steps.push({
        phase: 'iterate',
        activeLine: 10,
        relatedLines: [10, 11],
        message: `Processing tree ${i}, chair ${j}`,
        treeIdx: i,
        chairIdx: j,
        trees: sortedTrees,
        chairs: sortedChairs,
        dp: [...dp],
      })

      const dist = Math.abs(sortedTrees[i] - sortedChairs[j])

      steps.push({
        phase: 'calculate_dist',
        activeLine: 12,
        relatedLines: [12],
        message: `Distance from tree[${i}]=${sortedTrees[i]} to chair[${j}]=${sortedChairs[j]}: ${dist}`,
        distance: dist,
        fromPos: sortedTrees[i],
        toPos: sortedChairs[j],
        trees: sortedTrees,
        chairs: sortedChairs,
        dp: [...dp],
      })

      if (j === 0) {
        dp[j] = Math.min(dp[j], dist)
        steps.push({
          phase: 'dynamic_prog',
          activeLine: 14,
          relatedLines: [14],
          message: `First chair: dp[0] = ${dp[0]}`,
          updated: true,
          updatedIdx: 0,
          updatedVal: dp[0],
          trees: sortedTrees,
          chairs: sortedChairs,
          dp: [...dp],
        })
      } else {
        dp[j] = Math.min(dp[j], dp[j - 1] + dist)
        steps.push({
          phase: 'dynamic_prog',
          activeLine: 16,
          relatedLines: [16],
          message: `Chain assignment: dp[${j}] = min(inf, dp[${j - 1}] + ${dist}) = ${dp[j]}`,
          updated: true,
          updatedIdx: j,
          updatedVal: dp[j],
          prevDp: dp[j - 1],
          trees: sortedTrees,
          chairs: sortedChairs,
          dp: [...dp],
        })
      }
    }
  }

  let result = Infinity

  steps.push({
    phase: 'final_calc',
    activeLine: 19,
    relatedLines: [19],
    message: `Find minimum from squirrel to last chair`,
    trees: sortedTrees,
    chairs: sortedChairs,
    dp: [...dp],
  })

  for (let i = 0; i < n; i++) {
    const dist = Math.abs(squirrel - sortedChairs[i])
    result = Math.min(result, dp[i] + dist)

    steps.push({
      phase: 'final_calc',
      activeLine: 20,
      relatedLines: [20, 21],
      message: `Distance from squirrel=${squirrel} to chair[${i}]=${sortedChairs[i]}: ${dist}, total=${dp[i]} + ${dist} = ${dp[i] + dist}`,
      squirrel,
      chairIdx: i,
      distToChair: dist,
      totalDist: dp[i] + dist,
      trees: sortedTrees,
      chairs: sortedChairs,
      dp: [...dp],
      currentMin: result,
    })
  }

  steps.push({
    phase: 'return',
    activeLine: 23,
    relatedLines: [23],
    message: `Minimum distance: ${result}`,
    result,
    done: true,
    trees: sortedTrees,
    chairs: sortedChairs,
    dp: [...dp],
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
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

      {step?.trees && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Trees (Positions)</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.trees.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  backgroundColor: i === step.treeIdx ? '#38bdf8' : '#334155',
                  color: i === step.treeIdx ? '#000' : '#e2e8f0',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.chairs && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Chairs (Positions)</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.chairs.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  backgroundColor: i === step.chairIdx ? '#f97316' : '#334155',
                  color: i === step.chairIdx ? '#000' : '#e2e8f0',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.squirrel !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Squirrel Position</div>
          <div style={{ fontSize: 16, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.squirrel}
          </div>
        </div>
      )}

      {step?.distance !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Distance Calculation</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
            |{step.fromPos} - {step.toPos}| = {step.distance}
          </div>
        </div>
      )}

      {step?.dp && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>DP State</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.dp.map((val, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  backgroundColor: step.updatedIdx === i ? '#38bdf8' : '#334155',
                  color: step.updatedIdx === i ? '#000' : '#e2e8f0',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {val === Infinity ? '∞' : val}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.totalDist !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Current Path Distance</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>
            DP[{step.chairIdx}] + Distance = {step.totalDist}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid',
            borderColor: '#22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Minimum Distance</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#22c55e',
            }}
          >
            {step.result === Infinity ? '∞' : step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function SquirrelDistributionVisualizer() {
  const examples = useMemo(() => getExamplesOr('squirrel-distribution', []), [])
  const [trees, setTrees] = useState('[1,3]')
  const [chairs, setChairs] = useState('[1,3]')
  const [squirrel, setSquirrel] = useState('2')

  const { treesArray, chairsArray, squirrelVal, inputError } = useMemo(() => {
    try {
      const t = JSON.parse(trees)
      const c = JSON.parse(chairs)
      const s = Number(squirrel)
      if (!Array.isArray(t)) throw new Error('Trees must be array')
      if (!Array.isArray(c)) throw new Error('Chairs must be array')
      if (isNaN(s)) throw new Error('Squirrel must be number')
      return { treesArray: t, chairsArray: c, squirrelVal: s, inputError: '' }
    } catch (e) {
      return { treesArray: [], chairsArray: [], squirrelVal: 0, inputError: e.message }
    }
  }, [trees, chairs, squirrel])

  const steps = useMemo(() => generateSteps(treesArray, squirrelVal, chairsArray), [treesArray, squirrelVal, chairsArray])

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
      setTrees(JSON.stringify(ex.trees || [1, 3]))
      setChairs(JSON.stringify(ex.chairs || [1, 3]))
      setSquirrel((ex.squirrel || 2).toString())
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🐿️ Squirrel Distribution', dockMode: 'split-right' },
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Trees (JSON)</div>
                <input
                  type="text"
                  value={trees}
                  onChange={(e) => {
                    setTrees(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: inputError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Chairs (JSON)</div>
                <input
                  type="text"
                  value={chairs}
                  onChange={(e) => {
                    setChairs(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: inputError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Squirrel Position</div>
                <input
                  type="number"
                  value={squirrel}
                  onChange={(e) => {
                    setSquirrel(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: inputError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
            {inputError && <div style={{ color: '#f87171', fontSize: 11 }}>{inputError}</div>}
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, trees, chairs, squirrel, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
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
