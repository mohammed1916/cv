import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel';
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
import ManualInputPanel from '../../components/shared/ManualInputPanel'

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

export default function Problem83Visualizer() {
  const [inputInput, setInputInput] = useState("");
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = inputInput;
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: '', inputError: e.message };
    }
  }, [inputInput]);
  const [panelDivs, setPanelDivs] = useState(null);
  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(input), [input]));
  const { showPatternOverlay, activeLineDom } = usePatternOverlay();
  const step = steps[currentStep];

  const primaryPanel = (
    <div className="problem83-panel">
      <div className="problem83-panel-head">Visualization</div>
      <div className="problem83-panel-body">
        <div style={{padding: 20, textAlign: 'center', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
          {step?.message}
        </div>
      </div>
    </div>
  
    </>);

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
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
  );

  const statusPanel = (
    <div className="problem83-status">
      <div style={{ padding: '8px 16px', fontSize: '12px', color: '#64748b' }}>
        Status: {step?.phase}
      </div>
    </div>
  );

  const playbackPanel = (
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
      <PlaybackControls />
    </>
  );

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'code',    title: 'Code', dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="problem83-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
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
