import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PATTERNS = ['calc', 'complete', 'init', 'rotate', 'traverse'];

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'calc',
  3: 'traverse',
  4: 'rotate',
  5: 'complete',
};

function generateSteps(list, k) {
  const steps = [];
  if (!list || list.length === 0) return steps;

  const arr = [...list];
  const n = arr.length;
  const rotations = k % n;

  steps.push({ activeLine: 1, phase: 'init', arr: [...arr], k, rotations, idx: -1, message: `Initialize: rotate list by k=${k} (effective: ${rotations})` });
  steps.push({ activeLine: 2, phase: 'calc', arr: [...arr], k, rotations, idx: -1, message: `Calculate effective rotations: k % n = ${k} % ${n} = ${rotations}` });

  for (let i = 0; i < Math.min(n, 5); i++) {
    steps.push({ activeLine: 3, phase: 'traverse', arr: [...arr], k, rotations, idx: i, message: `Traverse position ${i}: value ${arr[i]}` });
  }

  const rotated = [...arr.slice(-rotations), ...arr.slice(0, n - rotations)];
  steps.push({ activeLine: 4, phase: 'rotate', arr: rotated, k, rotations, idx: -1, message: `Rotate: move last ${rotations} elements to front` });
  steps.push({ activeLine: 5, phase: 'complete', arr: rotated, k, rotations, idx: -1, message: `Complete: [${rotated.join(', ')}]` });

  return steps;
}

function CarouselVisualization({ arr, step }) {
  const nodes = arr || [];
  const rotations = step?.rotations || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16, height: '100%', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto' }}>
        <svg width="280" height="280" style={{ position: 'absolute' }}>
          <circle cx="140" cy="140" r="110" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

        <AnimatePresence>
          {nodes.map((val, idx) => {
            const totalAngle = (360 / Math.max(nodes.length, 1)) * idx;
            const rad = (totalAngle * Math.PI) / 180;
            const x = 140 + Math.cos(rad) * 110;
            const y = 140 + Math.sin(rad) * 110;
            const isActive = idx === step?.idx;
            const isMoving = step?.phase === 'rotate' && idx >= nodes.length - rotations;

            return (
              <motion.div
                key={`${idx}-${val}`}
                animate={{ x: x - 20, y: y - 20, scale: isActive ? 1.3 : 1, opacity: 1 }}
                initial={{ scale: 0.5, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  position: 'absolute',
                  width: 40,
                  height: 40,
                  background: isMoving ? '#f97316' : isActive ? '#fbbf24' : '#dbeafe',
                  border: isActive ? '3px solid #0ea5e9' : '2px solid #94a3b8',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#1e293b',
                  boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                }}
              >
                {val}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 12 }}>
        {step?.message}
      </div>
    </div>
  );
}

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def rotateRight(self, head, k):' },
  { line: 3, text: '        if not head or not head.next: return head' },
  { line: 4, text: '        n = 1; tail = head' },
  { line: 5, text: '        while tail.next: n += 1; tail = tail.next' },
];

export default function Problem61Visualizer() {
  const [listInput, setListInput] = useState('[1, 2, 3, 4, 5]');
  const [kInput, setKInput] = useState('2');

  const { list, k, inputError } = useMemo(() => {
    try {
      const l = JSON.parse(listInput);
      const kVal = Number(kInput);
      if (!Array.isArray(l)) throw new Error('Must be array');
      if (isNaN(kVal)) throw new Error('k must be number');
      return { list: l, k: kVal, inputError: '' };
    } catch (e) {
      return { list: [], k: 0, inputError: e.message };
    }
  }, [listInput, kInput]);

  const { steps, currentStep } = usePlaybackState(useMemo(() => generateSteps(list, k), [list, k]));
  const { showPatternOverlay, activeLineDom } = usePatternOverlay();
  const { connectivity } = useCodeVisualConnectivity(steps[currentStep]?.activeLine);
  const step = steps[currentStep];

  return (
    <DockableWorkspace title="Rotate List - Carousel" accentColor="#f97316" defaultLayout="equal">
      <FloatingPanel title="Carousel Rotation" icon="🎡" dockId="viz" defaultWidth="50%">
        <CarouselVisualization arr={steps[currentStep]?.arr} step={steps[currentStep]} />
      </FloatingPanel>

      <FloatingPanel title="Code Trace" icon="📝" dockId="code" defaultWidth="50%">
        <div style={{ position: 'relative' }}>
          <CodeTracePanel code={SOLUTION_CODE} activeLine={steps[currentStep]?.activeLine} connectivity={connectivity} />
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

      <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>List:</label>
            <input type="text" value={listInput} onChange={(e) => setListInput(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: 12 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>k:</label>
            <input type="text" value={kInput} onChange={(e) => setKInput(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        </div>
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

