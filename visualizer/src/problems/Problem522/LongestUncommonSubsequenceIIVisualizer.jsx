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
import './LongestUncommonSubsequenceIIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('longest-uncommon-subsequence-ii')

const PATTERNS = ['init', 'loop', 'process']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop',
  6: 'process'
}


const EXAMPLES = getExamples('longest-uncommon-subsequence-ii')

function generateSteps(strs) {
  const steps = []

  steps.push({
    activeLine: 1,
    strs: [...strs],
    candidates: [],
    currentIdx: -1,
    message: `Find uncommon subsequence among [${strs.join(', ')}]`,
    relatedLines: [1]
  })

  const sorted = [...strs].sort((a, b) => b.length - a.length)

  steps.push({
    activeLine: 2,
    strs: sorted,
    candidates: [],
    currentIdx: -1,
    message: 'Sort by length (descending)',
    relatedLines: [2]
  })

  function isSubsequence(s, t) {
    let i = 0
    for (let j = 0; j < t.length && i < s.length; j++) {
      if (s[i] === t[j]) i++
    }
    return i === s.length
  }

  let result = ''
  for (let i = 0; i < sorted.length; i++) {
    let isUncommon = true

    steps.push({
      activeLine: 3,
      strs: sorted,
      candidates: [],
      currentIdx: i,
      testStr: sorted[i],
      message: `Check if "${sorted[i]}" is uncommon`,
      relatedLines: [3]
    })

    for (let j = 0; j < sorted.length; j++) {
      if (i !== j && isSubsequence(sorted[i], sorted[j])) {
        isUncommon = false

        steps.push({
          activeLine: 4,
          strs: sorted,
          candidates: [],
          currentIdx: i,
          testIdx: j,
          testStr: sorted[i],
          message: `"${sorted[i]}" is subsequence of "${sorted[j]}"`,
          relatedLines: [4]
        })

        break
      }
    }

    if (isUncommon) {
      result = sorted[i]

      steps.push({
        activeLine: 5,
        strs: sorted,
        candidates: [result],
        currentIdx: i,
        testStr: sorted[i],
        message: `Found uncommon: "${result}" (length ${result.length})`,
        relatedLines: [5]
      })

      break
    }
  }

  steps.push({
    activeLine: 6,
    strs: sorted,
    candidates: [result],
    done: true,
    result,
    message: `Result: "${result}" (length ${result.length})`,
    relatedLines: [6]
  })

  return steps
}

function VisualizationPanel({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          "Find the longest string that is NOT a subsequence of any other string in the array."
        </div>
      </div>

      {/* Strings */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Strings</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.strs?.map((str, idx) => {
            const isActive = step && idx === step.currentIdx && !step.done
            const isTesting = step && (idx === step.currentIdx || idx === step.testIdx)
            return (
              <motion.div
                key={`str-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#a7f3d0' : isTesting ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#10b981' : isTesting ? '#6ee7b7' : '#cbd5e1',
                  color: isActive ? '#065f46' : isTesting ? '#059669' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                "{str}"
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Candidates */}
      {step?.candidates && step.candidates.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#d1fae5',
            borderRadius: 6,
            border: '1px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Candidates Found
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.candidates.map((cand, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                backgroundColor: '#a7f3d0',
                borderRadius: 4,
                border: '1px solid #10b981',
                fontSize: 12,
                fontWeight: 600,
                color: '#065f46'
              }}>
                "{cand}"
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#d1fae5',
          borderRadius: 6,
          border: '2px solid #10b981',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>
          "{step?.result !== undefined ? step.result : '...'}"
        </div>
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LongestUncommonSubsequenceIIVisualizer() {
  const [strsInput, setStrsInput] = useState(
    JSON.stringify(EXAMPLES?.[0]?.nums ?? EXAMPLES?.[0]?.strs ?? ['abcdefg', 'abc', 'abcd'])
  )
  const [activeLabel, setActiveLabel] = useState(EXAMPLES?.[0]?.label ?? '')

  const { strs, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(strsInput)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('strs must be a non-empty array, e.g. ["aba","cdc","eae"]')
      }
      if (!parsed.every((s) => typeof s === 'string')) {
        throw new Error('strs must contain only strings')
      }
      return { strs: parsed, inputError: '' }
    } catch (e) {
      return { strs: ['aba', 'cdc', 'eae'], inputError: e.message }
    }
  }, [strsInput])

  const steps = useMemo(
    () =>
      generateSteps(strs).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [strs]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setStrsInput(JSON.stringify(e.nums ?? e.strs ?? []))
    setActiveLabel(e.label ?? '')
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'strs') setStrsInput(text)
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
    { id: 'viz', title: '🔤 Longest Uncommon Subsequence II', dockMode: 'split-right' },
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
          fields={[{ key: 'strs', label: 'strs', type: 'array' }]}
          values={{ strs: strsInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          step={step}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, strsInput, activeLabel, inputError, applyEx, handleFieldChange])
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
