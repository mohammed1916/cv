import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import { getExamples } from '../../config/examplesRegistry'
import "./Visualizer.css";

function generateSteps(input) {
  const steps = [];
  const states = ['START', 'SIGN', 'DIGIT', 'DOT', 'EXP', 'EXP_SIGN', 'EXP_DIGIT'];
  
  steps.push({ activeLine: 1, phase: 'init', state: states[0], idx: 0, valid: true, message: 'Initialize state machine' });
  
  for (let i = 0; i < Math.min(input.length, 8); i++) {
    const char = input[i];
    const state = states[Math.min(i, states.length - 1)];
    steps.push({ activeLine: 2, phase: 'scan', state, idx: i, char, valid: true, message: `Process '${char}' - transition to next state` });
  }
  
  steps.push({ activeLine: 3, phase: 'complete', state: 'VALID', idx: -1, valid: true, message: 'Valid number!' });
  return steps;
}

const SOLUTION_CODE = [
  { line: 1, text: 'def isNumber(s: str) -> bool:' },
  { line: 2, text: '    states = [...]  # state machine' },
  { line: 3, text: '    for c in s.strip():' },
  { line: 4, text: '        if current_state not in states: return False' },
  { line: 5, text: '    return is_final_state' },
];

export default function Problem65Visualizer() {
  const [input, setInput] = useState('3.14e-2');
  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(input), [input]));
  const { showPattern } = usePatternOverlay();
  const { connectivity } = useCodeVisualConnectivity(steps[currentStep]?.activeLine);

  return (
    <DockableWorkspace title="Valid Number" accentColor="#8b5cf6" defaultLayout="equal">
      <FloatingPanel title="State Machine Scanner" icon="🤖" dockId="viz" defaultWidth="50%">
        <div style={{padding: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 24, fontWeight: 'bold', color: '#8b5cf6', marginBottom: 12}}>
              {steps[currentStep]?.state || 'START'}
            </div>
            <div style={{fontSize: 12, color: '#94a3b8', marginBottom: 8}}>
              Char: {steps[currentStep]?.char || '-'}
            </div>
          </div>
          <div style={{textAlign: 'center', fontSize: 12, color: '#64748b'}}>
            {steps[currentStep]?.message}
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel title="Code Trace" icon="📝" dockId="code" defaultWidth="50%">
        <CodeTracePanel code={SOLUTION_CODE} activeLine={steps[currentStep]?.activeLine} connectivity={connectivity} />
      </FloatingPanel>

      <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #cbd5e1' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., 3.14e-2" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'monospace', marginBottom: 12 }} />
        <PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
      </div>

      {showPattern && <PatternOverlay />}
    </DockableWorkspace>
  );
}

