import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
;
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import "./Problem360Visualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'
const PATTERNS = ['done', 'init', 'merge', 'transform']

const EXAMPLES = [
  {
    label: "U-shaped (a=1, b=-4, c=3)",
    nums: [-4, -2, 2, 4],
    a: 1,
    b: -4,
    c: 3,
    description: "Positive parabola: largest values at edges"
  },
  {
    label: "Inverted (a=-1, b=4, c=-3)",
    nums: [-4, -2, 2, 4],
    a: -1,
    b: 4,
    c: -3,
    description: "Negative parabola: largest values in middle"
  },
  {
    label: "Linear (a=0, b=2, c=0)",
    nums: [-2, -1, 0, 1, 2],
    a: 0,
    b: 2,
    c: 0,
    description: "Linear transformation: monotonic"
  }
];

function generateSteps(nums, a, b, c) {
  const steps = [];
  const n = nums.length;

  // Step 1: Transform array
  const transformed = nums.map(x => a * x * x + b * x + c);
  steps.push({
    activeLine: 1,
    nums,
    transformed,
    left: 0,
    right: n - 1,
    result: [],
    message: `Transform nums using f(x) = ${a}x² + ${b}x + ${c}`,
    phase: "transform"
  });

  // Step 2-4: Show each transformation
  transformed.forEach((val, idx) => {
    steps.push({
      activeLine: 2,
      nums,
      transformed,
      left: 0,
      right: n - 1,
      result: [],
      message: `f(${nums[idx]}) = ${a}·${nums[idx]}² + ${b}·${nums[idx]} + ${c} = ${val}`,
      highlightIdx: idx,
      phase: "transform"
    });
  });

  // Step 5: Initialize two pointers
  steps.push({
    activeLine: 3,
    nums,
    transformed,
    left: 0,
    right: n - 1,
    result: [],
    message: `Initialize: left=0, right=${n - 1}. Parabola extrema at edges.`,
    phase: "init"
  });

  // Step 6+: Two-pointer merge
  let left = 0, right = n - 1;
  const result = new Array(n);

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      activeLine: 4,
      nums,
      transformed,
      left,
      right,
      result: [...result],
      fillIdx: i,
      message: `Compare edges: left=${left} (${transformed[left]}) vs right=${right} (${transformed[right]})`,
      phase: "merge"
    });

    if (transformed[left] > transformed[right]) {
      result[i] = transformed[left];
      steps.push({
        activeLine: 5,
        nums,
        transformed,
        left,
        right,
        result: [...result],
        fillIdx: i,
        message: `transformed[left]=${transformed[left]} > transformed[right]=${transformed[right]} → place ${transformed[left]} at result[${i}], move left++`,
        phase: "merge"
      });
      left++;
    } else {
      result[i] = transformed[right];
      steps.push({
        activeLine: 6,
        nums,
        transformed,
        left,
        right,
        result: [...result],
        fillIdx: i,
        message: `transformed[right]=${transformed[right]} >= transformed[left]=${transformed[left]} → place ${transformed[right]} at result[${i}], move right--`,
        phase: "merge"
      });
      right--;
    }
  }

  // Step final: Done
  steps.push({
    activeLine: 7,
    nums,
    transformed,
    left,
    right,
    result: [...result],
    message: `Done! Result: [${result.join(", ")}]`,
    phase: "done",
    done: true
  });

  return steps;
}

function ParabolaVisualization({ a, b, c, transformed, highlightIdx }) {
  const graphWidth = 300;
  const graphHeight = 200;
  const padding = 20;

  // Find min/max for scaling
  const minVal = Math.min(...transformed);
  const maxVal = Math.max(...transformed);
  const range = maxVal - minVal || 1;

  // SVG parabola path
  const points = transformed.map((val, idx) => {
    const x = padding + (idx / (transformed.length - 1 || 1)) * (graphWidth - 2 * padding);
    const y = graphHeight - padding - ((val - minVal) / range) * (graphHeight - 2 * padding);
    return [x, y];
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <svg width={graphWidth} height={graphHeight} style={{ border: '1px solid #cbd5e1', borderRadius: 6, backgroundColor: '#f8fafc' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(frac => (
        <line key={`h-${frac}`} x1={padding} y1={graphHeight - padding - frac * (graphHeight - 2 * padding)} x2={graphWidth - padding} y2={graphHeight - padding - frac * (graphHeight - 2 * padding)} stroke="#e2e8f0" strokeDasharray="2,2" strokeWidth="0.5" />
      ))}

      {/* Parabola curve */}
      <path d={pathData} stroke="#3b82f6" strokeWidth="2" fill="none" />

      {/* Points */}
      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={p[0]}
          cy={p[1]}
          r={highlightIdx === idx ? 5 : 3}
          fill={highlightIdx === idx ? '#ef4444' : '#3b82f6'}
          stroke={highlightIdx === idx ? '#991b1b' : '#1e40af'}
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      <line x1={padding} y1={graphHeight - padding} x2={graphWidth - padding} y2={graphHeight - padding} stroke="#1f2937" strokeWidth="1" />
      <line x1={padding} y1={graphHeight - padding} x2={padding} y2={padding} stroke="#1f2937" strokeWidth="1" />

      {/* Labels */}
      <text x={graphWidth / 2} y={graphHeight - 2} fontSize="11" textAnchor="middle" fill="#6b7280">x</text>
      <text x={10} y={padding + 10} fontSize="11" fill="#6b7280">f(x)</text>
    </svg>
  );
}

function ArrayVisualization({ nums, transformed, left, right, result, fillIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Input array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Input Array (nums)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map((val, idx) => (
            <div key={`input-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: '#dbeafe',
                  border: '2px solid #3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1e40af'
                }}
                animate={{ scale: 1 }}
              >
                {val}
              </motion.div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>i={idx}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transformed array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Transformed Array (f(x))</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {transformed.map((val, idx) => (
            <div key={`trans-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: idx === left ? '#fca5a5' : idx === right ? '#a5f3fc' : '#e0e7ff',
                  border: idx === left ? '2px solid #dc2626' : idx === right ? '2px solid #0891b2' : '2px solid #818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: idx === left ? '#7f1d1d' : idx === right ? '#164e63' : '#312e81'
                }}
                animate={{ scale: idx === left || idx === right ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                {val}
              </motion.div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>
                {idx === left && '← L'} {idx === right && 'R →'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result array */}
      {result.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Result (sorted)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {result.map((val, idx) => (
              <div key={`result-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: idx === fillIdx ? '#fbbf24' : val !== undefined ? '#bbf7d0' : '#f3f4f6',
                    border: idx === fillIdx ? '2px solid #d97706' : val !== undefined ? '2px solid #10b981' : '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: idx === fillIdx ? '#92400e' : val !== undefined ? '#065f46' : '#6b7280'
                  }}
                  animate={{ scale: idx === fillIdx ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {val !== undefined ? val : '-'}
                </motion.div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>i={idx}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VariablesPanel({ step, a, b, c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 8 }}>Formula</div>
        <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#166534', fontWeight: 600 }}>
          f(x) = {a}x² + {b}x + {c}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 8, backgroundColor: '#fed7aa', borderRadius: 6, border: '1px solid #fb923c' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>LEFT</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7c2d12' }}>{step?.left ?? 0}</div>
          <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>
            f({step?.nums?.[step?.left] ?? '-'}) = {step?.transformed?.[step?.left] ?? '-'}
          </div>
        </div>
        <div style={{ padding: 8, backgroundColor: '#cffafe', borderRadius: 6, border: '1px solid #06b6d4' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#164e63', marginBottom: 4 }}>RIGHT</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{step?.right ?? 0}</div>
          <div style={{ fontSize: 11, color: '#0e7490', marginTop: 4 }}>
            f({step?.nums?.[step?.right] ?? '-'}) = {step?.transformed?.[step?.right] ?? '-'}
          </div>
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, color: '#374151', flex: 1, overflow: 'auto' }}>
        <div style={{ marginBottom: 6, color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Message</div>
        {step?.message || "Initialize two pointers at edges"}
      </div>
    </div>
  );
}

function VisualizationPanel({ step, ex, setEx, applyExample }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              onClick={() => applyExample(i)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 11,
                backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9',
                fontWeight: ex.label === e.label ? 600 : 400,
                color: ex.label === e.label ? '#0c4a6e' : '#475569'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Parabola Graph</div>
          <ParabolaVisualization
            a={ex.a}
            b={ex.b}
            c={ex.c}
            transformed={step?.transformed || ex.nums.map(x => ex.a * x * x + ex.b * x + ex.c)}
            highlightIdx={step?.highlightIdx}
          />
        </div>

        <div>
          <ArrayVisualization
            nums={step?.nums || ex.nums}
            transformed={step?.transformed || ex.nums.map(x => ex.a * x * x + ex.b * x + ex.c)}
            left={step?.left ?? 0}
            right={step?.right ?? (ex.nums.length - 1)}
            result={step?.result || []}
            fillIdx={step?.fillIdx}
          />
        </div>
      </div>

      {step?.done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 8,
            border: '2px solid #86efac',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>✓ Sorted Result</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#166534' }}>
            [{(step?.result || []).join(", ")}]
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Problem360Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [numsInput, setNumsInput] = useState(JSON.stringify(EXAMPLES[0]?.nums ?? []));
  const [aInput, setAInput] = useState("");
  const [bInput, setBInput] = useState("");
  const [cInput, setCInput] = useState("");
  const { nums, a, b, c, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      const parsedA = JSON.parse(aInput); if (!Array.isArray(parsedA)) throw new Error('a must be an array');
      const parsedB = JSON.parse(bInput); if (!Array.isArray(parsedB)) throw new Error('b must be an array');
      const parsedC = JSON.parse(cInput); if (!Array.isArray(parsedC)) throw new Error('c must be an array');
      return { nums: parsedNums, a: parsedA, b: parsedB, c: parsedC, inputError: '' };
    } catch (e) {
      return { nums: EXAMPLES[exIdx]?.nums ?? '', a: EXAMPLES[exIdx]?.a ?? '', b: EXAMPLES[exIdx]?.b ?? '', c: EXAMPLES[exIdx]?.c ?? '', inputError: e.message };
    }
  }, [numsInput, aInput, bInput, cInput]);;
  const ex = EXAMPLES[exIdx];

  const SOLUTION_CODE = [
    { line: 1, text: "def sortTransformedArray(nums, a, b, c):" },
    { line: 2, text: "    # Transform: f(x) = ax² + bx + c" },
    { line: 3, text: "    n = len(nums)" },
    { line: 4, text: "    result = [0] * n" },
    { line: 5, text: "    left, right = 0, n - 1" },
    { line: 6, text: "    # Parabola extrema at edges (U or inverted-U)" },
    { line: 7, text: "    for i in range(n - 1, -1, -1):" },
    { line: 8, text: "        fLeft = a * nums[left]² + b * nums[left] + c" },
    { line: 9, text: "        fRight = a * nums[right]² + b * nums[right] + c" },
    { line: 10, text: "        if fLeft > fRight:" },
    { line: 11, text: "            result[i] = fLeft" },
    { line: 12, text: "            left += 1" },
    { line: 13, text: "        else:" },
    { line: 14, text: "            result[i] = fRight" },
    { line: 15, text: "            right -= 1" },
    { line: 16, text: "    return result" }
  ];

  const steps = useMemo(() => generateSteps(nums, a, b, c), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyExample = useCallback((i) => { setExIdx(i); setNumsInput(JSON.stringify(EXAMPLES[i].nums)); setAInput(JSON.stringify(EXAMPLES[i].a)); setBInput(JSON.stringify(EXAMPLES[i].b)); setCInput(JSON.stringify(EXAMPLES[i].c)); handleReset(); }, [handleReset]);;

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
    { id: 'vars', title: 'Variables', dockMode: 'split-bottom' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          step={step}
          ex={ex}
          setEx={() => {}}
          applyExample={applyExample}
        />),
    vars: (<VariablesPanel step={step} a={a} b={b} c={c} />),
  }), [step, connectivity.highlightedLines, connectivity.handleLineSelect, setActiveLineDom, ex, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"nums","label":"nums","type":"array"},{"key":"a","label":"a","type":"number"},{"key":"b","label":"b","type":"number"},{"key":"c","label":"c","type":"number"}]}
          values={{ nums: numsInput, a: aInput, b: bInput, c: cInput }}
          onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'a') setAInput(v); if (k === 'b') setBInput(v); if (k === 'c') setCInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
            {panelDivs.vars && createPortal(panelContents.vars, panelDivs.vars)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
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
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}

