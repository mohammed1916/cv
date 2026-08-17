import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './PatchingArrayVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PointerRail from '../../components/shared/PointerRail'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'consume', 'patch', 'done']
const LINE_PATTERN_MAP = {
  3: 'init', 5: 'consume', 7: 'patch', 8: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def minPatches(self, nums: List[int], n: int) -> int:' },
  { line: 3, text: '        miss, i, patches = 1, 0, 0' },
  { line: 4, text: '        while miss <= n:' },
  { line: 5, text: '            if i < len(nums) and nums[i] <= miss:' },
  { line: 6, text: '                miss += nums[i]; i += 1' },
  { line: 7, text: '            else: patches += 1; miss += miss' },
  { line: 8, text: '        return patches' },
]

function generateSteps({ nums, n }) {
  const steps = []; let miss = 1; let index = 0; let patches = 0
  steps.push({ phase: 'init', activeLine: 3, nums, n, miss, index, patches, message: 'miss is the first uncovered value; initially only 0 is covered.' })
  while (miss <= n) {
    if (index < nums.length && nums[index] <= miss) { const value = nums[index]; miss += value; index += 1; steps.push({ phase: 'consume', activeLine: 6, nums, n, miss, index, patches, consumed: value, message: `Consume ${value}; coverage expands to [1, ${miss - 1}].` }) }
    else { const patch = miss; patches += 1; miss += patch; steps.push({ phase: 'patch', activeLine: 7, nums, n, miss, index, patches, patch, message: `Patch ${patch}; coverage doubles to [1, ${miss - 1}].` }) }
  }
  steps.push({ phase: 'done', activeLine: 8, nums, n, miss, index, patches, message: `${patches} patch${patches === 1 ? '' : 'es'} cover every value through ${n}.` })
  return steps
}

const EXAMPLES = getExamplesOr('patching-array', [{ label: '[1,3], n=6', nums: [1, 3], n: 6 }, { label: '[1,5,10], n=20', nums: [1, 5, 10], n: 20 }])

export default function PatchingArrayVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.nums) || !Number.isInteger(data.n) || data.n < 1 || !data.nums.every((value) => Number.isInteger(value) && value > 0)) throw new Error('Use { "nums": [1, 3], "n": 6 }.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(
    () => (input ? generateSteps(input) : []).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [input],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const renderVisualization = () => {
    if (!input) return <div className="patching-array-error">{inputError}</div>

    const currentStepData = step || {}

    return (
      <div className="patching-array-viz">
        <div className="patching-array-step-info">
          <h3>{currentStepData.message}</h3>
        </div><PointerRail title="Sorted input pointer" values={input.nums} pointers={step?.index < input.nums.length ? [{ id: 'i', label: 'i', index: step.index, tone: 'primary' }] : []} note={`covered range [1, ${(step?.miss ?? 1) - 1}] · patches ${step?.patches ?? 0}`} />
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="patching-array-panel patching-array-panel-input">
            <div className="patching-array-panel-head">Input</div>
            <div className="patching-array-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="patching-array-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="patching-array-panel patching-array-panel-viz">
            <div className="patching-array-panel-head">Visualization</div>
            <div className="patching-array-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="patching-array-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

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

      <div className="patching-array-middle">
        <div className="patching-array-panel">
          <div className="patching-array-panel-head">Examples</div>
          <div className="patching-array-panel-body patching-array-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="patching-array-example-btn"
                onClick={() => applyExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
