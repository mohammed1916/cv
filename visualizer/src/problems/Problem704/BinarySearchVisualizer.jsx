import SearchWindow from '../../components/shared/SearchWindow';
import { BINARY_SEARCH_CODE as SOLUTION_CODE, binarySearchSteps as generateSteps } from '../../algorithms/shared/binarySearch.js';
import authoredExamples0 from '../../config/examples/binary-search.js';

const AUTHORED_INITIAL = authoredExamples0[0];
import { useState, useCallback, useMemo } from 'react'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'

import './BinarySearchVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { createPortal } from 'react-dom'





const EXAMPLES = authoredExamples0

export default function BinarySearchVisualizer() {
  const [numsInput, setNumsInput] = useState(JSON.stringify(AUTHORED_INITIAL.nums))
  const [targetInput, setTargetInput] = useState(String(AUTHORED_INITIAL.target))

  const { nums, target, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      const t = Number(targetInput)
      if (!Array.isArray(n)) throw new Error('nums must be an array')
      if (isNaN(t)) throw new Error('target must be a number')

      // Binary search requires sorted array, we'll sort it if it isn't, but ideally users provide sorted input
      const isSorted = n.every((val, i, arr) => !i || val >= arr[i - 1])
      if (!isSorted) {
        return { nums: [...n].sort((a, b) => a - b), target: t, inputError: 'Input array was automatically sorted.' }
      }
      return { nums: n, target: t, inputError: '' }
    } catch (e) {
      return { nums: [-1, 0, 3, 5, 9, 12], target: 9, inputError: e.message || 'Invalid input' }
    }
  }, [numsInput, targetInput])

  const steps = useMemo(
    () => generateSteps(nums, target).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums, target],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    setTargetInput(String(ex.target))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input', dockMode: 'split-top' },
    { id: 'visualization', title: 'Visualization' },
    { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const inputPanel = <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"},{"key":"target","label":"target","type":"number"}]}
        values={{ nums: numsInput, target: targetInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'target') setTargetInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
  />
  const visualizationPanel = <div className="bs-shell"><div className="bs-top">
        <div className="bs-panel" style={{ flex: 1 }}>
          <div className="bs-panel-head">
            Array State & Search Space
            {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
          </div>
          <div className="bs-panel-body">
            <div className="bs-pointers-legend">
              <div className="bs-legend-item left"><div className="bs-legend-swatch" /> Left</div>
              <div className="bs-legend-item mid"><div className="bs-legend-swatch" /> Mid</div>
              <div className="bs-legend-item right"><div className="bs-legend-swatch" /> Right</div>
            </div>

            <SearchWindow nums={nums} target={target} step={step} />

            <div className="bs-stats">
              <div className="bs-stat-box">
                <span className="bs-stat-label">Search Space Size</span>
                <span className="bs-stat-val">{step ? Math.max(0, step.right - step.left + 1) : nums.length}</span>
              </div>
              <div className="bs-stat-box">
                <span className="bs-stat-label">Target</span>
                <span className="bs-stat-val" style={{ color: '#937005' }}>{target}</span>
              </div>
            </div>

          </div>
        </div>
  </div></div>
  const codePanel = <><div className="bs-middle">
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      </div>
      <div className={`bs-status \${step?.phase === 'found' ? 'success' : step?.phase === 'done' ? 'fail' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div></>
  return (
    <>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
      {panelDivs && <>
        {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
        {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
        {panelDivs.code && createPortal(codePanel, panelDivs.code)}
      </>}

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </>
  )
}
