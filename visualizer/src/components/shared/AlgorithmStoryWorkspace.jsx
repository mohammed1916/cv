import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom'
import CodeTracePanel from "../CodeTracePanel";
import PlaybackControls from "../PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import ManualInputPanel from './ManualInputPanel'
import FloatingPanel from './FloatingPanel'
import CodePatternAnnotations from '../CodePatternAnnotations'
import PatternLegend from '../PatternLegend'
import LuminoDockPanel from '../LuminoDockPanel'


// The shell owns inputs, docking and playback; each definition owns its algorithm and scene.
export default function AlgorithmStoryWorkspace({ definition }) {
  const {code:SOLUTION_CODE,linePatterns:LINE_PATTERN_MAP,patterns:PATTERNS,examples:EXAMPLES}=definition;
  const [arrInput, setArrInput] = useState(definition.initialInput);
  const {story,inputError} = useMemo(()=>{
    try {return {story:definition.build(arrInput),inputError:''};}
    catch(error){return {story:null,inputError:error.message};}
  },[arrInput,definition]);
  const steps = story?.frames ?? [];
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setArrInput(ex.input)
    handleReset()
  }, [handleReset])

  const primaryPanel = <>
    <ManualInputPanel fields={[{key:'arr',label:definition.inputLabel,type:definition.inputType ?? 'string'}]}
      values={{arr:arrInput}} onChange={(key,value)=>{setArrInput(value);handleReset();}}
      examples={EXAMPLES} applyExample={applyExample} inputError={inputError}/>
    {story && definition.renderStory({story,step:story.frames[Math.max(0,stepIndex)],stepIndex})}
  </>;

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
      {showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLine={step?.activeLine} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="story-panel">{step?.message ?? "Press Play to begin."}</div>
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
      { id: 'primary', title: definition.title, dockMode: 'split-right' },
      { id: 'code',    title: 'Code', dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [definition.title]
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="vis-shell">
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
