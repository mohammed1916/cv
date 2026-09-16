import { createPortal } from 'react-dom'
import LuminoDockPanel from "../../components/LuminoDockPanel"
import FloatingPanel from "../../components/shared/FloatingPanel"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { useState, useMemo, useCallback } from "react";
import { buildSubsequenceStory } from './algorithm';
import SubsequenceStory from './SubsequenceStory';
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./DistinctSubsequencesVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {4:'init',7:'update',8:'compare',9:'update',10:'done'}
const PATTERNS = ['init','update','compare','done']
const SOLUTION_CODE_INLINE = [
  { line: 1,  text: "def numDistinct(s, t):" },
  { line: 2,  text: "    m, n = len(s), len(t)" },
  { line: 3,  text: "    dp = [[0]*(n+1) for _ in range(m+1)]" },
  { line: 4,  text: "    for i in range(m+1): dp[i][0] = 1" },
  { line: 5,  text: "    for i in range(1, m+1):" },
  { line: 6,  text: "        for j in range(1, n+1):" },
  { line: 7,  text: "            dp[i][j] = dp[i-1][j]  # skip s[i-1]" },
  { line: 8,  text: "            if s[i-1] == t[j-1]:" },
  { line: 9,  text: "                dp[i][j] += dp[i-1][j-1]  # use s[i-1]" },
  { line: 10, text: "    return dp[m][n]" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('distinct-subsequences');

export default function DistinctSubsequencesVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("rabbbit");
  const [tInput, setTInput] = useState("rabbit");
  const {story,inputError}=useMemo(()=>{
    try{return {story:buildSubsequenceStory(sInput,tInput),inputError:''};}
    catch(error){return {story:null,inputError:error.message};}
  },[sInput,tInput]);
  const steps=story?.frames ?? [];
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); setTInput(String(e.t)); handleReset(); }, [handleReset]);;

  // Extract panels as consts (Step 2)
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
  );

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"},{"key":"t","label":"t","type":"string"}]}
        values={{ s: sInput, t: tInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 't') setTInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
      {story && <SubsequenceStory story={story} stepIndex={stepIndex}/>}
    </>);

  const statusPanel = (
    <div className="ds-status" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text)', minHeight: '36px' }}>
      {step?.message || 'Ready'}
    </div>
  );

  const playbackPanel = (
    <>
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
        onSpeedChange={e => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />}
    </>
  );

  // Add state + config (Step 3)
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '📝 Distinct Subsequences', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Replace return block (Step 4)
  return (
    <div className="vis-shell ds-shell">
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
  );
}

