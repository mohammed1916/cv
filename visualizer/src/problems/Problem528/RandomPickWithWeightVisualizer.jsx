import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './RandomPickWithWeightVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('random-pick-with-weight')

const PATTERNS = ['binary_search', 'compute_prefix', 'done', 'done_init', 'init', 'pick_result', 'pick_start']
const LINE_PATTERN_MAP = {
  1: 'init',
  5: 'loop',
  6: 'done_init',
  8: 'pick_start',
  9: 'process'
}


const EXAMPLES = getExamples('random-pick-with-weight')

function generateSteps(w) {
  const steps = []

  steps.push({
    activeLine: 1,
    w: [...w],
    prefix: [],
    total: 0,
    phase: 'init',
    message: `Initialize picker with weights [${w.join(', ')}]`,
    relatedLines: [1]
  })

  const prefix = []
  for (let i = 0; i < w.length; i++) {
    const prevSum = prefix.length > 0 ? prefix[prefix.length - 1] : 0
    const newVal = prevSum + w[i]
    prefix.push(newVal)

    steps.push({
      activeLine: 5,
      w,
      prefix: [...prefix],
      total: newVal,
      idx: i,
      prevSum,
      weight: w[i],
      phase: 'compute_prefix',
      message: `prefix[${i}] = ${prevSum} + ${w[i]} = ${newVal}`,
      relatedLines: [5]
    })
  }

  const total = prefix[prefix.length - 1] || 0

  steps.push({
    activeLine: 6,
    w,
    prefix,
    total,
    phase: 'done_init',
    message: `Prefix sum array complete. Total = ${total}`,
    relatedLines: [6]
  })

  // Simulate picking - use a few examples
  const pickExamples = [1, Math.floor(total / 2), total]
  for (const target of pickExamples) {
    steps.push({
      activeLine: 8,
      w,
      prefix,
      total,
      target,
      phase: 'pick_start',
      message: `Pick operation: generate random number in [1, ${total}]: ${target}`,
      relatedLines: [8]
    })

    let left = 0, right = prefix.length - 1
    let resultIdx = 0
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      steps.push({
        activeLine: 9,
        w,
        prefix,
        total,
        target,
        left,
        right,
        mid,
        midVal: prefix[mid],
        phase: 'binary_search',
        message: `Binary search: mid=${mid}, prefix[${mid}]=${prefix[mid]}, target=${target}`,
        relatedLines: [9]
      })

      if (prefix[mid] < target) {
        left = mid + 1
      } else {
        resultIdx = mid
        right = mid - 1
      }
    }

    steps.push({
      activeLine: 9,
      w,
      prefix,
      total,
      target,
      resultIdx,
      phase: 'pick_result',
      message: `Result: index ${resultIdx} (weight ${w[resultIdx]})`,
      relatedLines: [9]
    })
  }

  steps.push({
    activeLine: 9,
    w,
    prefix,
    total,
    phase: 'done',
    message: `Random picker ready. Can pick any index [0, ${w.length - 1}] based on weights`,
    relatedLines: [9],
    done: true
  })

  return steps
}

function VisualizationPanel({ w, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Build a prefix sum array to enable efficient weighted random index selection using binary search."
        </div>
      </div>

      {/* Weights */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Weights</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {w.map((weight, idx) => {
            const isProcessing = step?.idx === idx
            return (
              <motion.div
                key={`weight-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 60,
                  textAlign: 'center',
                  backgroundColor: isProcessing ? '#dbeafe' : '#f1f5f9',
                  borderColor: isProcessing ? '#0284c7' : '#cbd5e1',
                  color: isProcessing ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isProcessing ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 11, color: '#6b7280' }}>w[{idx}]</div>
                <div>{weight}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Prefix Sum Array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Prefix Sum Array</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 8 }}>
          {step?.prefix?.map((val, idx) => {
            const isCurrent = step?.idx === idx
            const isMid = step?.mid === idx
            return (
              <motion.div
                key={`prefix-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 70,
                  textAlign: 'center',
                  backgroundColor: isMid ? '#fecaca' : isCurrent ? '#dbeafe' : '#f1f5f9',
                  borderColor: isMid ? '#f87171' : isCurrent ? '#0284c7' : '#cbd5e1',
                  color: isMid ? '#7f1d1d' : isCurrent ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isMid ? 1.2 : isCurrent ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 11, color: '#6b7280' }}>p[{idx}]</div>
                <div>{val}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Binary Search Info */}
      {step?.phase === 'binary_search' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '1px solid #fbbf24'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#92400e', marginBottom: 8, fontWeight: 600 }}>
            Binary Search for target={step.target}
          </div>
          <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>
            Left={step.left}, Right={step.right}, Mid={step.mid}
          </div>
          <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>
            prefix[{step.mid}]={step.midVal}
          </div>
          <div style={{ color: step.midVal < step.target ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {step.midVal < step.target ? '→ Search right' : '← Search left'}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Total Weight</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.total || 0}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function RandomPickWithWeightVisualizer() {
  const [wInput, setWInput] = useState(JSON.stringify(EXAMPLES[0]?.w ?? [1]))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { w, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(wInput)
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('w must be a non-empty array')
      if (!parsed.every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0))
        throw new Error('w must contain positive numbers')
      return { w: parsed, inputError: '' }
    } catch (e) {
      return { w: [1], inputError: e.message }
    }
  }, [wInput])

  const steps = useMemo(
    () =>
      generateSteps(w).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [w]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setWInput(JSON.stringify(e.w))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'w') setWInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎲 Random Pick With Weight', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

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
    viz: (<>
        <ManualInputPanel
          fields={[{ key: 'w', label: 'w', type: 'array' }]}
          values={{ w: wInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          w={w}
          step={step}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, w, wInput, activeLabel, inputError, applyEx, handleFieldChange])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
