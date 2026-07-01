import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import CodePatternAnnotations from '../../components/CodePatternAnnotations';
import PatternLegend from '../../components/PatternLegend';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import { getExamples } from '../../config/examplesRegistry'
import "./Visualizer.css";

const PATTERNS = ['complete', 'init', 'process'];

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'process',
  3: 'complete',
};

function generateSteps(input) {
  const steps = [];
  steps.push({ activeLine: 1, phase: 'init', message: 'Initialize algorithm' });
  for (let i = 0; i < 6; i++) {
    steps.push({ activeLine: 2, phase: 'process', message: 'Process step ' + (i+1) });
  }
  steps.push({ activeLine: 3, phase: 'complete', message: 'Algorithm complete' });
  return steps;
}

export default function Problem94Visualizer() {
  const [input, setInput] = useState('');
  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(input), [input]));
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const step = steps[currentStep];

  return (
    <DockableWorkspace title="Problem 94" accentColor="#06b6d4" defaultLayout="equal">
      <FloatingPanel title="Visualization" icon="ðŸŽ¬" dockId="viz" defaultWidth="50%">
        <div style={{padding: 20, textAlign: 'center', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
          {step?.message}
        </div>
      </FloatingPanel>
      <FloatingPanel title="Code" icon="📄" dockId="code" defaultWidth="50%">
        <div style={{ position: 'relative' }}>
          <div style={{padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#64748b'}}>Algorithm code here</div>
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
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: 12}} />
        <PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
      </div>
    </DockableWorkspace>
  );
}
