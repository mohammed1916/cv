import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './PathSumVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { buildPathSum, parsePathSum } from './algorithm'
import PathSumStory from './PathSumStory'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 1: 'init', 2: 'done', 3: 'visit', 4: 'check', 5: 'recurse', 6: 'recurse', 7: 'backtrack' }
const PATTERNS = ['init', 'visit', 'descend', 'reject', 'found', 'backtrack', 'done']
const EXAMPLES = getExamplesOr('path-sum', [
  { label: 'Example 1', root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, 1], targetSum: 22 },
  { label: 'Example 2', root: [1, 2, 3], targetSum: 5 },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def hasPathSum(root, targetSum):' },
  { line: 2, text: '    if not root: return False' },
  { line: 3, text: '    if not root.left and not root.right:' },
  { line: 4, text: '        return root.val == targetSum' },
  { line: 5, text: '    target_left = targetSum - root.val' },
  { line: 6, text: '    return (hasPathSum(root.left, target_left) or' },
  { line: 7, text: '            hasPathSum(root.right, target_left))' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

export default function PathSumVisualizer() {
  const [rootInput, setRootInput] = useState(JSON.stringify(EXAMPLES[0].root));
  const [targetSumInput, setTargetSumInput] = useState(String(EXAMPLES[0].targetSum));
  const { run, inputError } = useMemo(() => {
    try {
      const { values, target } = parsePathSum(rootInput, targetSumInput);
      return { run: buildPathSum(values, target), inputError: '' };
    } catch (error) {
      return { run: null, inputError: error.message };
    }
  }, [rootInput, targetSumInput]);
  const steps = useMemo(() => run?.frames || [], [run]);

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setRootInput(JSON.stringify(e.root)); setTargetSumInput(String(e.targetSum)); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panel consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"root","label":"root","type":"array"},{"key":"targetSum","label":"targetSum","type":"number"}]}
        values={{ root: rootInput, targetSum: targetSumInput }}
        onChange={(k, v) => { if (k === 'root') setRootInput(v); if (k === 'targetSum') setTargetSumInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="ps-panel">
      {run ? <PathSumStory run={run} stepIndex={stepIndex} /> : <p role="alert">Correct the input above to explore the tree.</p>}
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && (
        <CodePatternAnnotations
          currentPhase={step?.phase}
          activeLine={step?.activeLine}
          linePatterns={LINE_PATTERN_MAP}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div className="ps-status">
      <div style={{ fontSize: 12, color: '#627794', padding: '4px 8px' }}>
        Step {stepIndex + 1} / {steps.length}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
      <PlaybackControls
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onPlayToggle={() => { if (run) togglePlay() }}
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
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
    </>
  )

  // Step 3: Panel configs with status panel at split-bottom ratio 0.08
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🌳 Path Sum', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-right', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Return with portals
  return (
    <div className="vis-shell ps-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
