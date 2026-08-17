import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './IntersectionofTwoArraysVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PointerRail from '../../components/shared/PointerRail'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'scan', 'done']
const LINE_PATTERN_MAP = {
  3: 'init', 5: 'scan', 8: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:' },
  { line: 3, text: '        seen, result = set(nums1), set()' },
  { line: 4, text: '        for value in nums2:' },
  { line: 5, text: '            if value in seen:' },
  { line: 6, text: '                result.add(value)' },
  { line: 7, text: '        return list(result)' },
]

function generateSteps({ nums1, nums2 }) {
  const seen = new Set(nums1); const result = new Set()
  const steps = [{ phase: 'init', activeLine: 3, nums1, nums2, seen: [...seen], result: [], message: 'Store every value from nums1 in a hash set.' }]
  nums2.forEach((value, index) => { const match = seen.has(value); if (match) result.add(value); steps.push({ phase: 'scan', activeLine: match ? 6 : 5, nums1, nums2, index, seen: [...seen], result: [...result], value, match, message: match ? `${value} is in the set; add it to the intersection.` : `${value} is absent from nums1.` }) })
  steps.push({ phase: 'done', activeLine: 7, nums1, nums2, seen: [...seen], result: [...result], message: `Unique intersection: [${[...result].join(', ')}].` })
  return steps
}

const EXAMPLES = getExamplesOr('intersection-of-two-arrays', [{ label: 'Classic', nums1: [1, 2, 2, 1], nums2: [2, 2] }, { label: 'Two matches', nums1: [4, 9, 5], nums2: [9, 4, 9, 8, 4] }])

export default function IntersectionofTwoArraysVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.nums1) || !Array.isArray(data.nums2) || ![...data.nums1, ...data.nums2].every(Number.isFinite)) throw new Error('Use { "nums1": [1,2], "nums2": [2,3] }.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })) : []
  }, [input])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const renderVisualization = () => {
    if (!input) return <div className="intersectionof-two-arrays-error">{inputError}</div>

    return (
      <div className="intersectionof-two-arrays-viz">
        <div className="intersectionof-two-arrays-step-info">
          <h3>{step?.message}</h3>
        </div><PointerRail title="Scan nums2" values={input.nums2} pointers={step?.index === undefined ? [] : [{ id: 'i', label: 'i', index: step.index, tone: step.match ? 'success' : 'warning' }]} /><div className="intersectionof-two-arrays-result">set(nums1): {'{' + (step?.seen || []).join(', ') + '}'} · intersection: [{' + (step?.result || []).join(', ') + '}]</div>
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="intersectionof-two-arrays-panel intersectionof-two-arrays-panel-input">
            <div className="intersectionof-two-arrays-panel-head">Input</div>
            <div className="intersectionof-two-arrays-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="intersectionof-two-arrays-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="intersectionof-two-arrays-panel intersectionof-two-arrays-panel-viz">
            <div className="intersectionof-two-arrays-panel-head">Visualization</div>
            <div className="intersectionof-two-arrays-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="intersectionof-two-arrays-shell">
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

      <div className="intersectionof-two-arrays-middle">
        <div className="intersectionof-two-arrays-panel" style={{ display: 'none' }}>
          <div className="intersectionof-two-arrays-panel-head">Code Trace</div>
          <div className="intersectionof-two-arrays-panel-body">
          </div>
        </div>

        <div className="intersectionof-two-arrays-panel">
          <div className="intersectionof-two-arrays-panel-head">Examples</div>
          <div className="intersectionof-two-arrays-panel-body intersectionof-two-arrays-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="intersectionof-two-arrays-example-btn"
                onClick={() => {
                  applyExample(example)
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="intersectionof-two-arrays-status" style={{ margin: '16px', color: 'var(--text-muted)' }}>
        {step?.message ?? 'Press Play or Step to begin.'}
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
