import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './PalindromeSubsequenceVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'def longestPalindromeSubseq(s: str) -> int:' },
  { line: 2, text: '    n = len(s)' },
  { line: 3, text: '    dp = [[0] * n for _ in range(n)]' },
  { line: 4, text: '    ' },
  { line: 5, text: '    for i in range(n):' },
  { line: 6, text: '        dp[i][i] = 1' },
  { line: 7, text: '    ' },
  { line: 8, text: '    for length in range(2, n + 1):' },
  { line: 9, text: '        for i in range(n - length + 1):' },
  { line: 10, text: '            j = i + length - 1' },
  { line: 11, text: '            if s[i] == s[j]:' },
  { line: 12, text: '                dp[i][j] = dp[i+1][j-1] + 2' },
  { line: 13, text: '            else:' },
  { line: 14, text: '                dp[i][j] = max(dp[i+1][j], dp[i][j-1])' },
  { line: 15, text: '    ' },
  { line: 16, text: '    return dp[0][n-1]' },
]

const PATTERNS = ['initialization', 'base_case', 'fill_table', 'compare', 'match', 'no_match', 'return_result']
const LINE_PATTERN_MAP = {
  5: 'initialization',
  6: 'base_case',
  8: 'fill_table',
  11: 'compare',
  12: 'match',
  14: 'no_match',
  16: 'return_result',
}

function generateSteps(s) {
  const steps = []

  if (!s || typeof s !== 'string' || s.length === 0) {
    steps.push({
      phase: 'return_result',
      activeLine: 16,
      relatedLines: [16],
      message: 'Invalid input: string is empty.',
      result: 0,
      done: true,
    })
    return steps
  }

  const n = s.length

  // Phase 0: Initialize
  steps.push({
    phase: 'initialization',
    activeLine: 2,
    relatedLines: [2, 3],
    message: `Initialize: n=${n}, create DP table [${n}x${n}]`,
    tableState: Array(n).fill(null).map(() => Array(n).fill(0)),
    currentString: s,
  })

  // Phase 1: Base case - single characters
  steps.push({
    phase: 'base_case',
    activeLine: 6,
    relatedLines: [5, 6],
    message: 'Base case: all single characters have palindrome length 1',
    tableState: (() => {
      const t = Array(n).fill(null).map(() => Array(n).fill(0))
      for (let i = 0; i < n; i++) {
        t[i][i] = 1
      }
      return t
    })(),
    currentString: s,
    highlightCells: Array(n).fill(null).map((_, i) => [i, i]),
  })

  // Phase 2: Fill table by length
  const dpTable = Array(n).fill(null).map(() => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    dpTable[i][i] = 1
  }

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i <= n - length; i++) {
      const j = i + length - 1

      steps.push({
        phase: 'fill_table',
        activeLine: 9,
        relatedLines: [9, 10],
        message: `Checking substring [${i}:${j+1}] = "${s.substring(i, j + 1)}"`,
        currentI: i,
        currentJ: j,
        tableState: dpTable.map(row => [...row]),
        currentString: s,
        highlightCells: [[i, j]],
      })

      steps.push({
        phase: 'compare',
        activeLine: 11,
        relatedLines: [11],
        message: `Compare s[${i}]="${s[i]}" with s[${j}]="${s[j]}"`,
        currentI: i,
        currentJ: j,
        tableState: dpTable.map(row => [...row]),
        currentString: s,
        highlightCells: [[i, j]],
        compareChars: [s[i], s[j]],
      })

      if (s[i] === s[j]) {
        steps.push({
          phase: 'match',
          activeLine: 12,
          relatedLines: [12],
          message: `Match! dp[${i}][${j}] = dp[${i+1}][${j-1}] + 2 = ${(i + 1 <= j - 1 ? dpTable[i + 1][j - 1] : 0)} + 2`,
          currentI: i,
          currentJ: j,
          tableState: dpTable.map(row => [...row]),
          currentString: s,
        })
        dpTable[i][j] = (i + 1 <= j - 1 ? dpTable[i + 1][j - 1] : 0) + 2
      } else {
        steps.push({
          phase: 'no_match',
          activeLine: 14,
          relatedLines: [14],
          message: `No match. dp[${i}][${j}] = max(dp[${i+1}][${j}], dp[${i}][${j-1}]) = max(${dpTable[i + 1][j]}, ${dpTable[i][j - 1]})`,
          currentI: i,
          currentJ: j,
          tableState: dpTable.map(row => [...row]),
          currentString: s,
        })
        dpTable[i][j] = Math.max(dpTable[i + 1][j], dpTable[i][j - 1])
      }

      steps.push({
        phase: 'fill_table',
        activeLine: 8,
        relatedLines: [8, 9],
        message: `dp[${i}][${j}] = ${dpTable[i][j]}`,
        currentI: i,
        currentJ: j,
        tableState: dpTable.map(row => [...row]),
        currentString: s,
        highlightCells: [[i, j]],
        cellValue: dpTable[i][j],
      })
    }
  }

  // Final result
  steps.push({
    phase: 'return_result',
    activeLine: 16,
    relatedLines: [16],
    message: `Longest palindromic subsequence length: ${dpTable[0][n - 1]}`,
    tableState: dpTable.map(row => [...row]),
    currentString: s,
    result: dpTable[0][n - 1],
    done: true,
  })

  return steps
}

function DPTableVisualization({ tableState, currentString, highlightCells = [], cellValue = null }) {
  if (!tableState || tableState.length === 0) return null

  const n = tableState.length

  return (
    <div style={{ overflow: 'auto', padding: 12 }}>
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        {/* String header */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40 }} />
          {currentString.split('').map((char, idx) => (
            <div
              key={idx}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface2)',
                border: '1px solid var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* DP table */}
        {tableState.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
            {/* Row header */}
            <div
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--surface2)',
                border: '1px solid var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {currentString[i]}
            </div>

            {/* Table cells */}
            {row.map((val, j) => {
              const isHighlighted = highlightCells.some(([hi, hj]) => hi === i && hj === j)
              const isUpperTriangle = j >= i

              return (
                <motion.div
                  key={`${i}-${j}`}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: !isUpperTriangle
                      ? 'var(--code-bg)'
                      : isHighlighted
                      ? '#22c55e'
                      : val === 0
                      ? 'var(--surface2)'
                      : 'var(--text-muted)',
                    border: isHighlighted ? '2px solid #a78bfa' : '1px solid var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: isHighlighted ? '#000' : isUpperTriangle && val > 0 ? '#a78bfa' : 'var(--text-muted)',
                    cursor: isUpperTriangle ? 'default' : 'not-allowed',
                  }}
                  animate={{
                    backgroundColor: !isUpperTriangle
                      ? 'var(--code-bg)'
                      : isHighlighted
                      ? '#a78bfa'
                      : val === 0
                      ? 'var(--surface2)'
                      : 'var(--text-muted)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isUpperTriangle && val > 0 && val}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.currentString && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Input String</div>
          <div style={{ fontSize: 16, color: '#067db1', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
            "{step.currentString}"
          </div>
        </div>
      )}

      {step?.compareChars && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Character Comparison</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: '#5577a4' }}>
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--text-muted)',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {step.compareChars[0]}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>vs</div>
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--text-muted)',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {step.compareChars[1]}
            </div>
          </div>
        </div>
      )}

      {step?.cellValue !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Cell Value</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#a36907' }}>
            {step.cellValue}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#178740', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 24,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#178740',
            }}
          >
            {step.result}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Longest palindromic subsequence length
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function PalindromeSubsequenceVisualizer() {
  const examples = useMemo(
    () =>
      getExamplesOr('palindrome-subsequence', [
        { label: 'bbbab', s: 'bbbab' },
        { label: 'cbbd', s: 'cbbd' },
        { label: 'a', s: 'a' },
        { label: 'ac', s: 'ac' },
        { label: 'racecar', s: 'racecar' },
      ]),
    []
  )

  const [s, setS] = useState('bbbab')

  const steps = useMemo(() => generateSteps(s), [s])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setS(ex.s || ex)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📊 DP Table', dockMode: 'split-right' },
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Input String</div>
              <input
                type="text"
                value={s}
                onChange={(e) => {
                  setS(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--code-bg)', borderRadius: 6 }}>
              <DPTableVisualization
                tableState={step?.tableState}
                currentString={step?.currentString || s}
                highlightCells={step?.highlightCells || []}
                cellValue={step?.cellValue}
              />
            </div>

            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, s, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
