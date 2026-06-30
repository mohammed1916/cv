import { useState, useMemo } from "react";
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import CodePatternAnnotations from '../../components/CodePatternAnnotations';
import PatternLegend from '../../components/PatternLegend';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import "./Visualizer.css";

const PATTERNS = ['complete', 'expand', 'init'];

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'expand',
  3: 'complete',
};

function generateSteps(input) {
  const steps = [];
  steps.push({ activeLine: 1, phase: "init", message: "Initialize text justification" });
  for (let i = 0; i < 5; i++) {
    steps.push({ activeLine: 2, phase: "expand", message: "Distribute spaces on line" });
  }
  steps.push({ activeLine: 3, phase: "complete", message: "Text justified" });
  return steps;
}

export default function Problem68Visualizer() {
  const [input, setInput] = useState("");
  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(input), [input]));
  const { showPatternOverlay, activeLineDom } = usePatternOverlay();
  const step = steps[currentStep];

  return (
    <DockableWorkspace title="Text Justification" accentColor="#ec4899" defaultLayout="equal">
      <FloatingPanel title="Visualization" icon="🎬" dockId="viz" defaultWidth="50%">
        <div style={{padding: 20, textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center"}}>
          {steps[currentStep]?.message}
        </div>
      </FloatingPanel>
      <FloatingPanel title="Code" icon="📝" dockId="code" defaultWidth="50%">
        <div style={{ position: 'relative' }}>
          <div style={{padding: 12, fontSize: 12, fontFamily: "monospace"}}>def fullJustify(words, maxWidth):</div>
          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
              activeLine={step?.activeLine}
            />
          )}
        </div>
      </FloatingPanel>
      <div style={{marginTop: 16, padding: 12}}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{width: "100%", padding: "8px", marginBottom: 12}} />
        <PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
      </div>
      {showPatternOverlay && (
        <FloatingPanel title="Pattern Legend" icon="🎨" dockId="legend" defaultWidth="25%">
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        </FloatingPanel>
      )}
    </DockableWorkspace>
  );
}

