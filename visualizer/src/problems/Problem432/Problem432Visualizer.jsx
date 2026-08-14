import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem432Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('all-o1-data-structure', [
  { label: 'Example 1', operations: ['add-2', 'add-3', 'add-5', 'getRandom', 'remove-3'] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class RandomizedSet:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.map = {}' },
  { line: 4, text: '        self.list = []' },
  { line: 5, text: '    def add(self, val):' },
  { line: 6, text: '        if val in self.map: return False' },
  { line: 7, text: '        self.map[val] = len(self.list)' },
  { line: 8, text: '        self.list.append(val)' },
  { line: 9, text: '        return True' },
  { line: 10, text: '    def remove(self, val):' },
  { line: 11, text: '        if val not in self.map: return False' },
  { line: 12, text: '        last = self.list[-1]' },
  { line: 13, text: '        self.list[self.map[val]] = last' },
  { line: 14, text: '        del self.map[val]' },
]

function generateSteps(operations) {
  const steps = []

  steps.push({ activeLine: 1, message: `Initialize O(1) RandomSet: map for val→idx, array for values`, map: new Map(), array: [] })

  const map = new Map()
  const array = []

  for (let i = 0; i < Math.min(operations.length, 6); i++) {
    const op = operations[i]

    steps.push({ activeLine: 2, message: `Process operation: ${op}`, currentOp: op })

    if (op.startsWith('add')) {
      const val = parseInt(op.split('-')[1])
      steps.push({ activeLine: 3, message: `add(${val}): check if exists in map`, val, inMap: map.has(val) })

      if (!map.has(val)) {
        map.set(val, array.length)
        array.push(val)
        steps.push({ activeLine: 4, message: `Not in map → append to array at idx ${array.length - 1}`, val, array: [...array], map: new Map(map) })
        steps.push({ activeLine: 5, message: `Map[${val}] = ${array.length - 1}`, val, array: [...array], map: new Map(map) })
      } else {
        steps.push({ activeLine: 6, message: `Already exists → skip (return false)`, val })
      }
    } else if (op === 'getRandom') {
      steps.push({ activeLine: 7, message: `getRandom(): generate random index [0, ${array.length - 1}]`, array: [...array] })
      const randomIdx = Math.floor(Math.random() * array.length)
      steps.push({ activeLine: 8, message: `Random idx=${randomIdx} → return array[${randomIdx}] = ${array[randomIdx]}`, randomVal: array[randomIdx], array: [...array] })
    } else if (op.startsWith('remove')) {
      const val = parseInt(op.split('-')[1])
      steps.push({ activeLine: 9, message: `remove(${val}): check if in map`, val, inMap: map.has(val) })

      if (map.has(val)) {
        const idx = map.get(val)
        steps.push({ activeLine: 10, message: `Found at idx ${idx} → swap with last element`, val, idx, lastVal: array[array.length - 1] })

        const last = array[array.length - 1]
        array[idx] = last
        map.set(last, idx)
        steps.push({ activeLine: 11, message: `After swap: array[${idx}] = ${last}, update map[${last}] = ${idx}`, array: [...array], map: new Map(map) })

        array.pop()
        map.delete(val)
        steps.push({ activeLine: 12, message: `Remove last and delete from map`, array: [...array], map: new Map(map) })
      } else {
        steps.push({ activeLine: 13, message: `Not in map → skip (return false)`, val })
      }
    }
  }

  steps.push({ activeLine: 14, message: `Final state: array=${JSON.stringify(array)}, map=${JSON.stringify(Array.from(map.entries()))}`, done: true, array: [...array], map: new Map(map) })
  return steps
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Key Insight</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Use a map (val→index) and array. On remove, swap target with last element, update map, then pop array.
        </div>
      </div>

      {step?.array && step.array.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Array (Values)</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.array.map((val, i) => (
              <motion.div
                key={i}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 6,
                  backgroundColor: step.val === val ? '#dbeafe' : step.randomVal === val ? '#fef08a' : '#f1f5f9',
                  border: step.val === val ? '3px solid #0284c7' : step.randomVal === val ? '3px solid #eab308' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: step.val === val ? '#0c4a6e' : step.randomVal === val ? '#713f12' : '#475569',
                  flexDirection: 'column',
                  gap: 2,
                }}
                animate={{ scale: step.val === val || step.randomVal === val ? 1.15 : 1 }}
              >
                <div>{val}</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>idx:{i}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.map && step.map.size > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Map (val → idx)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from(step.map.entries()).slice(0, 5).map(([val, idx], i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  backgroundColor: step.val === val ? '#fef3c7' : '#f3e8ff',
                  borderRadius: 4,
                  border: step.val === val ? '2px solid #f59e0b' : '1px solid #d8b4fe',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: step.val === val ? '#92400e' : '#6b21a8',
                }}
              >
                {val} → {idx}
              </div>
            ))}
            {step.map.size > 5 && (
              <div style={{ fontSize: 11, color: '#94a3b8' }}>... and {step.map.size - 5} more</div>
            )}
          </div>
        </div>
      )}

      {step?.currentOp && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Current Operation</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
            {step.currentOp}
          </div>
        </div>
      )}

      {step?.inMap !== undefined && (
        <div style={{ padding: 12, backgroundColor: step.inMap ? '#dcfce7' : '#fee2e2', borderRadius: 6, border: `2px solid ${step.inMap ? '#22c55e' : '#ef4444'}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: step.inMap ? '#166534' : '#991b1b' }}>
            In Map: {step.inMap ? '✓ Yes' : '✗ No'}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem432Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [operationsInput, setOperationsInput] = useState("[[\"inc\",\"a\"],[\"inc\",\"b\"],[\"getMaxKey\"],[\"getMinKey\"],[\"inc\",\"a\"],[\"getMaxKey\"],[\"getMinKey\"]]");
  const { operations, inputError } = useMemo(() => {
    try {
      const parsedOperations = JSON.parse(operationsInput); if (!Array.isArray(parsedOperations)) throw new Error('operations must be an array');
      return { operations: parsedOperations, inputError: '' };
    } catch (e) {
      return { operations: "[[\"inc\",\"a\"],[\"inc\",\"b\"],[\"getMaxKey\"],[\"getMinKey\"],[\"inc\",\"a\"],[\"getMaxKey\"],[\"getMinKey\"]]", inputError: e.message };
    }
  }, [operationsInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(operations).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [operations]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setOperationsInput(JSON.stringify(e.operations)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '💾 O(1) RandomSet',
      content: <VisualizationPanel step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
      
    </div>
  )
}
