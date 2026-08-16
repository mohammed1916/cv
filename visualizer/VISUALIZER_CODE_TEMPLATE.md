# Visualizer Code Templates with Real Examples

## 1. Export File: index.jsx

```javascript
// src/problems/Problem565/index.jsx
export const meta = {
  number: '565',
  title: 'Array Nesting',
  slug: 'array-nesting',
  difficulty: 'Medium',
  tags: ['Array', 'Depth-First Search'],
  description: 'Find the length of the longest nesting chain.',
  accent: '#a855f7'
};
export { default } from './ArrayNestingVisualizer';
```

---

## 2. Complete Visualizer Component

### Simple Array-Based Example (Add Binary)

```javascript
// src/problems/AddBinary/AddBinaryVisualizer.jsx
import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './AddBinaryVisualizer.css'

// ============= STEP GENERATOR =============
function generateSteps(a, b) {
  const steps = []

  let i = a.length - 1
  let j = b.length - 1
  let carry = 0
  let result = []

  // Initialize
  steps.push({
    activeLine: 1,
    i, j, carry, result: [...result],
    a_idx: null, b_idx: null, a_bit: null, b_bit: null, sum: null,
    message: `Initialize: i=${i}, j=${j}, carry=0, result=[]`
  })

  // Main loop
  while (i >= 0 || j >= 0 || carry > 0) {
    steps.push({
      activeLine: 3,
      i, j, carry, result: [...result],
      a_idx: i, b_idx: j, a_bit: null, b_bit: null, sum: null,
      message: `Check loop condition: i=${i} >= 0 or j=${j} >= 0 or carry=${carry}`
    })

    const a_bit = i >= 0 ? parseInt(a[i]) : 0
    const b_bit = j >= 0 ? parseInt(b[j]) : 0

    steps.push({
      activeLine: 5,
      i, j, carry, result: [...result],
      a_idx: i, b_idx: j, a_bit, b_bit, sum: null,
      message: `Get bits: a[${i}]=${a_bit}, b[${j}]=${b_bit}`
    })

    const sum = a_bit + b_bit + carry

    steps.push({
      activeLine: 7,
      i, j, carry, result: [...result],
      a_idx: i, b_idx: j, a_bit, b_bit, sum,
      message: `Calculate: ${a_bit} + ${b_bit} + ${carry} = ${sum}`
    })

    const digit = sum % 2
    const new_carry = Math.floor(sum / 2)
    result.unshift(digit)

    steps.push({
      activeLine: 9,
      i, j, carry: new_carry, result: [...result],
      a_idx: i, b_idx: j, a_bit, b_bit, sum, digit,
      message: `Append digit: ${digit}, new carry: ${new_carry}, result=[${result.join('')}]`
    })

    carry = new_carry
    if (i >= 0) i--
    if (j >= 0) j--

    steps.push({
      activeLine: 11,
      i, j, carry, result: [...result],
      a_idx: i, b_idx: j, a_bit: null, b_bit: null, sum: null,
      message: `Advance pointers: i=${i}, j=${j}`
    })
  }

  steps.push({
    activeLine: 14,
    i, j, carry, result: [...result],
    a_idx: null, b_idx: null, a_bit: null, b_bit: null, sum: null,
    done: true,
    message: `Return result: ${result.join('')}`
  })

  return steps
}

// ============= VISUALIZATION COMPONENT =============
function BinaryVisualization({ a, b, step }) {
  const result = step?.result || []
  const i = step?.a_idx ?? -1
  const j = step?.b_idx ?? -1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Input strings */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Input Strings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* String a */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>a = "{a}"</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {a.split('').map((bit, idx) => {
                const isCurrent = idx === i && step && !step.done
                const isProcessed = idx < i && step
                return (
                  <motion.div
                    key={`a-${idx}`}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      backgroundColor: isCurrent ? '#dbeafe' : isProcessed ? '#d1fae5' : '#f1f5f9',
                      borderColor: isCurrent ? '#0284c7' : isProcessed ? '#10b981' : '#cbd5e1',
                      color: isCurrent ? '#0c4a6e' : isProcessed ? '#047857' : '#334155'
                    }}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                  >
                    {bit}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* String b */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>b = "{b}"</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {b.split('').map((bit, idx) => {
                const isCurrent = idx === j && step && !step.done
                const isProcessed = idx < j && step
                return (
                  <motion.div
                    key={`b-${idx}`}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      backgroundColor: isCurrent ? '#fee2e2' : isProcessed ? '#d1fae5' : '#f1f5f9',
                      borderColor: isCurrent ? '#dc2626' : isProcessed ? '#10b981' : '#cbd5e1',
                      color: isCurrent ? '#991b1b' : isProcessed ? '#047857' : '#334155'
                    }}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                  >
                    {bit}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current calculation */}
      {step && step.a_bit !== null && step.b_bit !== null && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Current Bit Addition
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#1e40af' }}>a[i]</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0c4a6e' }}>{step.a_bit}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fee2e2', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#991b1b' }}>b[j]</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#7f1d1d' }}>{step.b_bit}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fce7f3', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#831843' }}>carry</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#be185d' }}>{step.carry}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#15803d' }}>sum</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#166534' }}>{step.sum ?? '—'}</div>
            </div>
          </div>
          {step.sum !== null && (
            <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
              {step.a_bit} + {step.b_bit} + {step.carry} = {step.sum} → digit: {step.digit ?? '—'}, carry: {step.carry}
            </div>
          )}
        </motion.div>
      )}

      {/* Result */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Result</div>
        <div style={{
          padding: 16,
          backgroundColor: '#ecfdf5',
          borderRadius: 6,
          border: '2px solid #10b981',
          fontFamily: 'monospace',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#047857',
          letterSpacing: 2,
          textAlign: 'center'
        }}>
          {result.length > 0 ? result.join('') : '(building...)'}
        </div>
      </div>

      {/* State variables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#1e40af' }}>Pointer i</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0c4a6e' }}>{step?.i ?? -1}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#991b1b' }}>Pointer j</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#7f1d1d' }}>{step?.j ?? -1}</div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ a, b, step, applyEx }) {
  const EXAMPLES = getExamples('add-binary')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <BinaryVisualization a={a} b={b} step={step} />
    </div>
  )
}

// ============= MAIN COMPONENT =============
export default function AddBinaryVisualizer() {
  const EXAMPLES = getExamples('add-binary')
  const [ex, setEx] = useState(EXAMPLES[0] || { a: '11', b: '1' })
  const SOLUTION_CODE = useSolutionCode('add-binary')

  const steps = useMemo(
    () =>
      generateSteps(ex.a, ex.b).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '🔢 Binary Addition',
      content: (
        <VisualizationPanel
          a={ex.a}
          b={ex.b}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
  )
}
```

---

## 3. CSS File Template

```css
/* src/problems/AddBinary/AddBinaryVisualizer.css */

.ab-shell {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    font-family: inherit;
}

.ab-panel {
    background: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 10px;
    padding: 12px 14px;
}

.ab-panel-label {
    font-size: 11px;
    font-weight: 700;
    color: #6c7086;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
}

.ab-bits {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
    min-height: 60px;
}

.ab-bit-box {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    border-radius: 6px;
    border: 2px solid #45475a;
    background: #252535;
    color: #cdd6f4;
}

.ab-bit-box.active-a {
    border-color: #89b4fa;
    background: #001a30;
    color: #89b4fa;
}

.ab-bit-box.active-b {
    border-color: #f38ba8;
    background: #1a0010;
    color: #f38ba8;
}

.ab-bit-box.processed {
    border-color: #a6e3a1;
    background: #001a08;
    color: #a6e3a1;
}

.ab-result {
    padding: 16px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    background: #001a08;
    border: 2px solid #a6e3a1;
    color: #a6e3a1;
    letter-spacing: 2px;
    text-align: center;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.ab-pointer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 10px 0;
}

.ab-pointer.i {
    border-color: #89b4fa;
}

.ab-pointer.j {
    border-color: #f38ba8;
}
```

---

## 4. Examples Registry Entry

```javascript
// In src/config/examplesRegistry.js

"add-binary": [
  {
    "label": "11 + 1",
    "a": "11",
    "b": "1"
  },
  {
    "label": "1010 + 1011",
    "a": "1010",
    "b": "1011"
  },
  {
    "label": "0 + 0",
    "a": "0",
    "b": "0"
  },
  {
    "label": "1111 + 1111",
    "a": "1111",
    "b": "1111"
  },
  {
    "label": "1 + 111",
    "a": "1",
    "b": "111"
  }
]
```

---

## Key Takeaways for New Visualizers

### 1. Step Generation Function
- Takes problem inputs as parameters
- Simulates algorithm step-by-step
- Returns array of step objects
- Each step tracks relevant state variables and active code line

### 2. Visualization Component
- Shows current step state visually
- Uses motion.div for animations
- Color-codes different variables/states
- Updates as step changes

### 3. Main Component
- Manages playback state with usePlaybackState
- Loads examples from registry
- Connects code and visualization
- Renders DockableWorkspace with code + visualization panels

### 4. CSS
- Uses Catppuccin Mocha colors
- Semantic colors: blue (var A), red (var B), green (result)
- Dark backgrounds (#1e1e2e, #252535)
- Light text (#cdd6f4)

