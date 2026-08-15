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
import './LongestPalindromicSubsequenceVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('longest-palindromic-subsequence')

const PATTERNS = ['init', 'loop', 'process']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop',
  6: 'process',
  7: 'process'
}


const EXAMPLES = getExamples('longest-palindromic-subsequence')

function generateSteps(s) {
  const steps = []

  steps.push({
    activeLine: 1,
    s,
    n: s.length,
    dp: [],
    i: -1,
    j: -1,
    message: `Initialize DP for string: "${s}"`,
    relatedLines: [1]
  })

  if (s.length === 0) {
    steps.push({
      activeLine: 2,
      s,
      dp: [[]],
      done: true,
      result: 0,
      message: 'Empty string',
      relatedLines: [2]
    })
    return steps
  }

  const n = s.length
  const dp = Array(n).fill(0).map(() => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    dp[i][i] = 1
  }

  steps.push({
    activeLine: 3,
    s,
    dp: dp.map(row => [...row]),
    i: -1,
    j: -1,
    message: 'Single characters are palindromes of length 1',
    relatedLines: [3]
  })

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i < n - len + 1; i++) {
      const j = i + len - 1

      steps.push({
        activeLine: 4,
        s,
        dp: dp.map(row => [...row]),
        i,
        j,
        message: `Check substring s[${i}:${j + 1}] = "${s.substring(i, j + 1)}"`,
        relatedLines: [4]
      })

      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2

        steps.push({
          activeLine: 5,
          s,
          dp: dp.map(row => [...row]),
          i,
          j,
          message: `Chars match: s[${i}]='${s[i]}' === s[${j}]='${s[j]}', dp[${i}][${j}] = ${dp[i][j]}`,
          relatedLines: [5]
        })
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1])

        steps.push({
          activeLine: 6,
          s,
          dp: dp.map(row => [...row]),
          i,
          j,
          message: `No match: dp[${i}][${j}] = max(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`,
          relatedLines: [6]
        })
      }
    }
  }

  steps.push({
    activeLine: 7,
    s,
    dp,
    done: true,
    result: dp[0][n - 1],
    message: `Longest palindromic subsequence length: ${dp[0][n - 1]}`,
    relatedLines: [7]
  })

  return steps
}

function VisualizationPanel({ s, step, inputPanel }) {
  const n = s.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#78350f', fontStyle: 'italic' }}>
          "A palindromic subsequence reads the same forwards and backwards. Find the longest one using DP."
        </div>
      </div>

      {/* Manual input */}
      {inputPanel}

      {/* String */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>String: {s}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {s.split('').map((char, idx) => {
            const isInRange = step && idx >= step.i && idx <= step.j
            return (
              <motion.div
                key={`char-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  backgroundColor: isInRange ? '#fef08a' : '#f1f5f9',
                  borderColor: isInRange ? '#f59e0b' : '#cbd5e1',
                  color: isInRange ? '#78350f' : '#334155'
                }}
                animate={{ scale: isInRange ? 1.1 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* DP Table */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>DP Table</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 300 }}>
            <tbody>
              {step?.dp?.map((row, i) => (
                <tr key={`row-${i}`}>
                  <td style={{ padding: 4, border: '1px solid #e5e7eb', fontWeight: 600, backgroundColor: '#f3f4f6' }}>
                    {s[i]}
                  </td>
                  {row.map((val, j) => {
                    const isActive = step && i === step.i && j === step.j
                    return (
                      <td
                        key={`cell-${i}-${j}`}
                        style={{
                          padding: 6,
                          border: '1px solid #e5e7eb',
                          textAlign: 'center',
                          backgroundColor: isActive ? '#fef08a' : i > j ? '#f9fafb' : '#fff',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#78350f' : '#334155'
                        }}
                      >
                        {i <= j ? val : '-'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>
          {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LongestPalindromicSubsequenceVisualizer() {
  const [sInput, setSInput] = useState(EXAMPLES[0]?.s ?? 'bbbab')
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { s, inputError } = useMemo(() => {
    if (sInput.length > 24) return { s: '', inputError: 'Keep s at 24 characters or fewer' }
    return { s: sInput, inputError: '' }
  }, [sInput])

  const steps = useMemo(
    () =>
      generateSteps(s).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setSInput(e.s)
    setActiveLabel(e.label)
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
    { id: 'viz', title: '🔤 Longest Palindromic Subsequence', dockMode: 'split-right' },
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
    viz: (<VisualizationPanel
          s={s}
          step={step}
          inputPanel={(
            <ManualInputPanel
              fields={[{ key: 's', label: 's', type: 'string' }]}
              values={{ s: sInput }}
              onChange={(k, v) => { if (k === 's') setSInput(v); setActiveLabel(''); handleReset() }}
              examples={EXAMPLES}
              activeLabel={activeLabel}
              applyExample={applyEx}
              inputError={inputError}
            />
          )}
        />),
  }), [step, connectivity, setActiveLineDom, s, applyEx, sInput, activeLabel, inputError, handleReset, showPatternOverlay, activeLineDom])
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
