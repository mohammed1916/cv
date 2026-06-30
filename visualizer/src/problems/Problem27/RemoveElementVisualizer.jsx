import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './RemoveElementVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def removeElement(self, nums: List[int], val: int) -> int:' },
  { line: 3, text: '        k = 0' },
  { line: 4, text: '        for i in range(len(nums)):' },
  { line: 5, text: '            if nums[i] != val:' },
  { line: 6, text: '                nums[k] = nums[i]' },
  { line: 7, text: '                k += 1' },
  { line: 8, text: '        return k' },
]

function generateSteps(nums, val) {
  const steps = []
  const arr = [...nums]
  let k = 0

  steps.push({ phase: 'init', i: -1, k: 0, arr: [...arr], val, activeLine: 3, message: 'Initialize k=0 as pointer for kept elements.' })

  for (let i = 0; i < arr.length; i++) {
    steps.push({ phase: 'check', i, k, arr: [...arr], val, activeLine: 4, message: `Check index ${i}: value=${arr[i]}` })

    if (arr[i] !== val) {
      steps.push({ phase: 'keep', i, k, arr: [...arr], val, activeLine: 5, message: `${arr[i]} != ${val}, keep it.` })
      arr[k] = arr[i]
      steps.push({ phase: 'place', i, k, arr: [...arr], val, activeLine: 6, message: `Place ${arr[i]} at position ${k}.` })
      k++
      steps.push({ phase: 'increment', i, k, arr: [...arr], val, activeLine: 7, message: `Increment k to ${k}.` })
    } else {
      steps.push({ phase: 'skip', i, k, arr: [...arr], val, activeLine: 5, message: `${arr[i]} == ${val}, skip.` })
    }
  }

  steps.push({ phase: 'done', i: arr.length, k, arr: [...arr], val, activeLine: 8, message: `Done! k=${k} elements kept.` })
  return steps
}

const EXAMPLES = getExamples('remove-element')

const REMOVEELEMENT_PATTERNS = ['check', 'done', 'increment', 'init', 'keep', 'place', 'skip']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'check',
  5: 'keep',
  6: 'place',
  7: 'increment',
  8: 'done',
}

export default function RemoveElementVisualizer() {
  const [numsInput, setNumsInput] = useState('[3, 2, 2, 3]')
  const [valInput, setValInput] = useState('3')

  const { nums, val } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      const v = Number(valInput)
      return { nums: Array.isArray(n) ? n : [3, 2, 2, 3], val: isNaN(v) ? 3 : v }
    } catch {
      return { nums: [3, 2, 2, 3], val: 3 }
    }
  }, [numsInput, valInput])

  const steps = useMemo(() => generateSteps(nums, val).map((current) => ({
    ...current, relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
  })), [nums, val])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => { setNumsInput(JSON.stringify(ex.nums)); setValInput(String(ex.val)); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  return (
    <div className="removeel-shell">
      <ResizableSplitPanels className="removeel-top-split" storageKey="cpviz.split.removeel.top" initialLeftPercent={60} minLeftPx={360} minRightPx={280}
        left={(<div className="removeel-panel"><div className="removeel-panel-head">Array Cleanup</div><div className="removeel-panel-body">
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>{EXAMPLES.map((ex) => (<button key={ex.label} onClick={() => applyExample(ex)} className="removeel-example-btn">{ex.label}</button>))}</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}><input value={numsInput} onChange={(e) => { setNumsInput(e.target.value); handleReset() }} className="removeel-input" style={{ flex: 1 }} /><input value={valInput} onChange={(e) => { setValInput(e.target.value); handleReset() }} className="removeel-input" style={{ width: '60px' }} /></div>
          <div className="removeel-array-container">{nums.map((num, idx) => {
            const isActive = step?.i === idx
            const isRemoved = idx >= step?.k && step?.phase === 'done'
            return (<div key={idx} className="removeel-cell-wrapper"><span className="removeel-index">{idx}</span><motion.div className={`removeel-cell ${isActive ? 'active' : ''} ${isRemoved ? 'removed' : ''}`} animate={isActive ? { scale: 1.2 } : { scale: 1 }}>{num}</motion.div></div>)
          })}</div>
          {step?.message && <div className="removeel-narrative">{step.message}</div>}
        </div></div>)}
        right={(<div className="removeel-panel"><div className="removeel-panel-head">State</div><div className="removeel-panel-body">
          <div className="removeel-stats">
            <div className="removeel-stat"><span className="stat-label">Value:</span><span className="stat-value">{val}</span></div>
            <div className="removeel-stat"><span className="stat-label">Position (k):</span><span className="stat-value">{step?.k ?? 0}</span></div>
            <div className="removeel-stat"><span className="stat-label">Index (i):</span><span className="stat-value">{step?.i ?? -1}</span></div>
          </div>
        </div></div>)}
      />
      <div style={{ position: 'relative' }}>
        <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>
      <div className="removeel-status">{step?.message ?? 'Play!'}</div>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={REMOVEELEMENT_PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle />
      </FloatingPanel>
    </div>
  )
}
