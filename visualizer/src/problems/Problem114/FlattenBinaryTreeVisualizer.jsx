import { getExamples } from "../../config/examplesRegistry";
﻿import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom'
import { buildFlattenStory } from './algorithm';
import FlattenStory from './FlattenStory';
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import "./FlattenBinaryTreeVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 2: 'init', 4: 'check', 6: 'visit', 7: 'visit', 9: 'update', 11: 'update', 12: 'update', 13: 'visit' }
const PATTERNS = ['init', 'check', 'visit', 'update', 'done']
const SOLUTION_CODE = [
  { line: 1, text: "def flatten(root):" },
  { line: 2, text: "    cur = root" },
  { line: 3, text: "    while cur:" },
  { line: 4, text: "        if cur.left:" },
  { line: 5, text: "            # find rightmost of left subtree" },
  { line: 6, text: "            pre = cur.left" },
  { line: 7, text: "            while pre.right: pre = pre.right" },
  { line: 8, text: "            # rewire: pre.right = cur.right" },
  { line: 9, text: "            pre.right = cur.right" },
  { line: 10, text: "            # cur.right = cur.left; cur.left = None" },
  { line: 11, text: "            cur.right = cur.left" },
  { line: 12, text: "            cur.left = None" },
  { line: 13, text: "        cur = cur.right" },
];

const EXAMPLES = getExamples("flatten-binary-tree-to-linked-list");

export default function FlattenBinaryTreeVisualizer() {
  const [arrInput, setArrInput] = useState('[1,2,5,3,4,null,6]');
  const {story,inputError} = useMemo(()=>{
    try {return {story:buildFlattenStory(arrInput),inputError:''};}
    catch(error){return {story:null,inputError:error.message};}
  },[arrInput]);
  const steps = story?.frames ?? [];
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setArrInput(JSON.stringify(ex.arr))
    handleReset()
  }, [handleReset])

  const primaryPanel = <>
    <ManualInputPanel fields={[{key:'arr',label:'Level-order tree',type:'array'}]}
      values={{arr:arrInput}} onChange={(key,value)=>{setArrInput(value);handleReset();}}
      examples={EXAMPLES} applyExample={applyExample} inputError={inputError}/>
    {story && <FlattenStory story={story} stepIndex={stepIndex}/>}
  </>;

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLine={step?.activeLine} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="fbt-status">{step?.message ?? "Press Play to begin."}</div>
  )

  const playbackPanel = (
    <>
      <PlaybackControls
        isPlaying={isPlaying} isDone={isDone} speed={speed}
        onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
        prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />}
    </>
  )

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Tree & Linked List', dockMode: 'split-right' },
      { id: 'code',    title: 'Code', dockMode: 'split-right' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="vis-shell fbt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  );
}
