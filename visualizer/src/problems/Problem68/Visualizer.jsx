import { useState, useMemo } from "react";
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import { usePlaybackState } from '../../from '../../$1//usePlaybackState';
import { usePatternOverlay } from '../../from '../../$1//usePatternOverlay';
import { useCodeVisualConnectivity } from '../../from '../../$1//useCodeVisualConnectivity';
import "./Visualizer.css";

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
  const { showPattern } = usePatternOverlay();

  return (
    <DockableWorkspace title="Text Justification" accentColor="#ec4899" defaultLayout="equal">
      <FloatingPanel title="Visualization" icon="🎬" dockId="viz" defaultWidth="50%">
        <div style={{padding: 20, textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center"}}>
          {steps[currentStep]?.message}
        </div>
      </FloatingPanel>
      <FloatingPanel title="Code" icon="📝" dockId="code" defaultWidth="50%">
        <div style={{padding: 12, fontSize: 12, fontFamily: "monospace"}}>def fullJustify(words, maxWidth):</div>
      </FloatingPanel>
      <div style={{marginTop: 16, padding: 12}}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{width: "100%", padding: "8px", marginBottom: 12}} />
        <PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
      </div>
      {showPattern && <PatternOverlay />}
    </DockableWorkspace>
  );
}
