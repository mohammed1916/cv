import { getExamples as getInitialExamples } from '../../config/examplesRegistry';
const AUTHORED_INITIAL = getInitialExamples('all-o1-data-structure')[0];
import { generateSteps, CODE as SOLUTION_CODE_INLINE } from './algorithm';
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
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
import { createPortal } from 'react-dom'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('all-o1-data-structure', [])





function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)',
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
          Keep keys in linked count buckets. Move a key to its neighboring bucket on each update; read the first or last bucket for an extreme count.
        </div>
      </div>

      {step?.array && step.array.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Active keys</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.array.map((val, i) => (
              <motion.div
                key={i}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 6,
                  backgroundColor: step.val === val ? '#dbeafe' : step.randomVal === val ? '#fef08a' : 'var(--surface2)',
                  border: step.val === val ? '3px solid #0284c7' : step.randomVal === val ? '3px solid #eab308' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: step.val === val ? '#0c4a6e' : step.randomVal === val ? '#713f12' : 'var(--text-muted)',
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Map (key → count)</div>
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
              <div style={{ fontSize: 11, color: '#627794' }}>... and {step.map.size - 5} more</div>
            )}
          </div>
        </div>
      )}

      {step?.currentOp && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Current Operation</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#a36907', marginTop: 4 }}>
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
  const [operationsInput, setOperationsInput] = useState(JSON.stringify(AUTHORED_INITIAL.operations));
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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '💾 O(1) RandomSet', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel step={step} applyEx={applyEx} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"operations","label":"operations","type":"array"}]}
          values={{ operations: operationsInput }}
          onChange={(k, v) => { if (k === 'operations') setOperationsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
