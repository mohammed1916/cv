import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem382Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['check', 'complete', 'init', 'traverse', 'update']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',
  6: 'init',
  10: 'traverse',
  11: 'check',
  12: 'update',
  14: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self, head):' },
  { line: 3, text: '        self.head = head' },
  { line: 4, text: '    def getRandom(self):' },
  { line: 5, text: '        # Reservoir sampling' },
  { line: 6, text: '        result = None' },
  { line: 7, text: '        node = self.head' },
  { line: 8, text: '        count = 0' },
  { line: 9, text: '        while node:' },
  { line: 10, text: '            count += 1' },
  { line: 11, text: '            if random.randint(1, count) == 1:' },
  { line: 12, text: '                result = node.val' },
  { line: 13, text: '            node = node.next' },
  { line: 14, text: '        return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(values) {
  const steps = []

  // Step 1: Initialize
  steps.push({
    activeLine: 2,
    phase: 'init',
    values,
    currentIdx: -1,
    count: 0,
    result: null,
    message: 'Initialize linked list traversal with reservoir sampling',
  })

  // Step 2: Start traversal
  steps.push({
    activeLine: 6,
    phase: 'init',
    values,
    currentIdx: 0,
    count: 0,
    result: null,
    message: 'Begin traversing list from head',
  })

  // Step 3: Process each node
  values.forEach((val, idx) => {
    // Increment count
    steps.push({
      activeLine: 10,
      phase: 'traverse',
      values,
      currentIdx: idx,
      count: idx + 1,
      result,
      message: `Visit node ${idx}: count = ${idx + 1}`,
    })

    // Probability check
    const isSelected = Math.random() <= 1 / (idx + 1) // Simulate selection
    let result = isSelected ? val : (idx === 0 ? null : steps[steps.length - 1].result)

    steps.push({
      activeLine: 11,
      phase: 'check',
      values,
      currentIdx: idx,
      count: idx + 1,
      result,
      isSelected,
      message: `Random check: 1/${idx + 1} chance. Selected: ${isSelected ? 'YES' : 'NO'}`,
    })

    if (isSelected) {
      steps.push({
        activeLine: 12,
        phase: 'update',
        values,
        currentIdx: idx,
        count: idx + 1,
        result: val,
        isSelected: true,
        message: `Update result to node value: ${val}`,
      })
    }
  })

  // Final step
  steps.push({
    activeLine: 14,
    phase: 'complete',
    values,
    currentIdx: -1,
    count: values.length,
    result: steps[steps.length - 1].result,
    message: 'Traversal complete. Each node had equal probability of selection',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple List',
    values: [1, 2, 3],
  },
  {
    label: 'Longer List',
    values: [1, 2, 3, 4, 5],
  },
  {
    label: 'Single Node',
    values: [7],
  },
]

export default function Problem382Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [valuesInput, setValuesInput] = useState(JSON.stringify(EXAMPLES[0]?.values ?? []));
  const { values, inputError } = useMemo(() => {
    try {
      const parsedValues = JSON.parse(valuesInput); if (!Array.isArray(parsedValues)) throw new Error('values must be an array');
      return { values: parsedValues, inputError: '' };
    } catch (e) {
      return { values: EXAMPLES[exIdx]?.values ?? '', inputError: e.message };
    }
  }, [valuesInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(values).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setValuesInput(JSON.stringify(EXAMPLES[i].values)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔗 Reservoir Sampling', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Linked List */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Linked List</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {step.values.map((val, idx) => (
                    <div key={`node-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div
                        animate={{
                          scale: step.currentIdx === idx ? 1.15 : 1,
                          boxShadow: step.currentIdx === idx ? '0 0 0 3px #0284c7' : 'none',
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: step.currentIdx === idx ? '#dbeafe' : '#f1f5f9',
                          border: `2px solid ${step.currentIdx === idx ? '#0284c7' : '#cbd5e1'}`,
                          fontSize: 12,
                          fontWeight: 600,
                          color: step.currentIdx === idx ? '#0c4a6e' : '#334155',
                        }}
                      >
                        {val}
                      </motion.div>
                      {idx < step.values.length - 1 && (
                        <div style={{ fontSize: 14, color: '#cbd5e1' }}>→</div>
                      )}
                    </div>
                  ))}
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>null</div>
                </div>
              </div>

              {/* Reservoir Sampling State */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>Count</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.count}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Selected Value</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                    {step.result !== null ? step.result : 'pending'}
                  </div>
                </div>
              </div>

              {/* Selection Probability */}
              {step.phase === 'check' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.isSelected ? '#dcfce7' : '#fee2e2',
                    border: `2px solid ${step.isSelected ? '#10b981' : '#ef4444'}`,
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: step.isSelected ? '#166534' : '#991b1b' }}>
                    {step.isSelected ? '✓ Selected!' : '✗ Not selected'} Probability: 1/{step.count}
                  </div>
                </motion.div>
              )}

              {step.phase === 'update' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    New result = {step.result}
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Complete! Reservoir sampling ensures O(1) space, O(n) time, equal probability
                </motion.div>
              )}
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, exIdx, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"values","label":"values","type":"array"}]}
          values={{ values: valuesInput }}
          onChange={(k, v) => { if (k === 'values') setValuesInput(v); handleReset() }}
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
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
