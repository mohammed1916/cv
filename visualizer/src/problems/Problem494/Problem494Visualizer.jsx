import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem494Visualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('target-sum')

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


  3: 'done',


}

const EXAMPLES = getExamplesOr('target-sum', [
  { label: 'Example 1', nums: [1,1,1,1,1], target: 3 },
  { label: 'Example 2', nums: [1,0], target: 1 },
])

function generateSteps(nums, target) {
  const steps = []
  const results = []
  steps.push({ activeLine: 1, nums, target, count: 0, current: [], message: 'Use backtracking to try all +/- combinations' })

  function backtrack(idx, sum) {
    if (idx === nums.length) {
      if (sum === target) { results.push([...steps[steps.length-1].current || []]); steps.push({ activeLine: 2, nums, target, count: results.length, current: [...(steps[steps.length-1].current || [])], message: `Found: sum=${sum}` }) }
      return
    }
    steps.push({ activeLine: 1, nums, target, count: results.length, current: [], message: `Index ${idx}: try + and -` })
    backtrack(idx + 1, sum + nums[idx])
    backtrack(idx + 1, sum - nums[idx])
  }

  backtrack(0, 0)
  steps.push({ activeLine: 3, nums, target, count: results.length, done: true, message: `Total ways: ${results.length}` })
  return steps
}

function VisualizationPanel({ nums, target, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>Find count of ways to assign +/- operators to nums to reach target.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Array: [{nums.join(', ')}], Target: {target}</div></div>
      <motion.div style={{ padding: 16, backgroundColor: '#fce7f3', borderRadius: 6, border: '2px solid #ec4899', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#831843' }}>Ways to Reach Target</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ec4899' }}>{step?.count ?? 0}</div>
        <div style={{ fontSize: 12, color: '#ec4899', marginTop: 8 }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem494Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(() => generateSteps(ex.nums, ex.target).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const codePanel = (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />)
  const vizPanel = (<VisualizationPanel nums={ex.nums} target={ex.target} step={step} applyEx={applyEx} />)
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎯 Target Sum', dockMode: 'split-right' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (<div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(<FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>, document.body)}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>)
}

