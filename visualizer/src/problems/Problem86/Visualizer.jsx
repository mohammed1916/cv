import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import { usePlaybackState } from '../../usePlaybackState';
import { usePatternOverlay } from '../../usePatternOverlay';
import { useCodeVisualConnectivity } from '../../useCodeVisualConnectivity';
import { getExamples } from '../../examplesRegistry'
import "./Visualizer.css";

function generateSteps(input) {
  const steps = [];
  steps.push({ activeLine: 1, phase: 'init', message: 'Initialize algorithm' });
  for (let i = 0; i < 6; i++) {
    steps.push({ activeLine: 2, phase: 'process', message: 'Process step ' + (i+1) });
  }
  steps.push({ activeLine: 3, phase: 'complete', message: 'Algorithm complete' });
  return steps;
}

export default function Problem86Visualizer() {
  const [input, setInput] = useState('');
  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(input), [input]));
  const { showPattern } = usePatternOverlay();

  return (
    <DockableWorkspace title="Problem 86" accentColor="#06b6d4" defaultLayout="equal">
      <FloatingPanel title="Visualization" icon="ðŸŽ¬" dockId="viz" defaultWidth="50%">
        <div style={{padding: 20, textAlign: 'center', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
          {steps[currentStep]?.message}
        </div>
      </FloatingPanel>
      <FloatingPanel title="Code" icon="ðŸ“" dockId="code" defaultWidth="50%">
        <div style={{padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#64748b'}}>Algorithm code here</div>
      </FloatingPanel>
      <div style={{marginTop: 16, padding: 12}}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: 12}} />
        <PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
      </div>
      {showPattern && <PatternOverlay />}
    </DockableWorkspace>
  );
}

