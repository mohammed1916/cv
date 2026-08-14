import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './DeleteOperationVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def minDistance(self, s1: str, s2: str) -> int:' },
  { line: 3, text: '        m, n = len(s1), len(s2)' },
  { line: 4, text: '        # dp[i][j] = length of LCS' },
  { line: 5, text: '        dp = [[0] * (n + 1) for _ in range(m + 1)]' },
  { line: 6, text: '        ' },
  { line: 7, text: '        for i in range(1, m + 1):' },
  { line: 8, text: '            for j in range(1, n + 1):' },
  { line: 9, text: '                if s1[i-1] == s2[j-1]:' },
  { line: 10, text: '                    dp[i][j] = dp[i-1][j-1] + 1' },
  { line: 11, text: '                else:' },
  { line: 12, text: '                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])' },
  { line: 13, text: '        ' },
  { line: 14, text: '        lcs_len = dp[m][n]' },
  { line: 15, text: '        return m + n - 2 * lcs_len' },
]

const PATTERNS = ['init', 'check_char', 'char_match', 'char_nomatch', 'compute_lcs', 'done']
const LINE_PATTERN_MAP = {
  5: 'init',
  7: 'check_char',
  9: 'check_char',
  10: 'char_match',
  12: 'char_nomatch',
  14: 'compute_lcs',
  15: 'done',
}

function generateSteps(s1, s2) {
  const steps = []
  const m = s1.length
  const n = s2.length

  // Initialize DP table
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  steps.push({
    phase: 'init',
    i: null,
    j: null,
    char_s1: null,
    char_s2: null,
    match: null,
    activeLine: 5,
    relatedLines: [3, 4, 5],
    message: `Initialize DP table (${m + 1}x${n + 1}) with zeros. dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]`,
    dpTable: dp.map(row => [...row]),
  })

  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const s1_char = s1[i - 1]
      const s2_char = s2[j - 1]

      steps.push({
        phase: 'check_char',
        i,
        j,
        char_s1: s1_char,
        char_s2: s2_char,
        match: null,
        activeLine: 9,
        relatedLines: [8, 9],
        message: `Check dp[${i}][${j}]: s1[${i - 1}]='${s1_char}', s2[${j - 1}]='${s2_char}'`,
        dpTable: dp.map(row => [...row]),
      })

      if (s1_char === s2_char) {
        // Characters match: LCS length increases by 1
        steps.push({
          phase: 'char_match',
          i,
          j,
          char_s1: s1_char,
          char_s2: s2_char,
          match: true,
          activeLine: 10,
          relatedLines: [9, 10],
          message: `Match! s1[${i - 1}]='${s1_char}' == s2[${j - 1}]='${s2_char}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1]} + 1`,
          dpTable: dp.map(row => [...row]),
        })

        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        // Characters don't match: take max from left or top
        steps.push({
          phase: 'char_nomatch',
          i,
          j,
          char_s1: s1_char,
          char_s2: s2_char,
          match: false,
          activeLine: 12,
          relatedLines: [11, 12],
          message: `No match. s1[${i - 1}]='${s1_char}' != s2[${j - 1}]='${s2_char}'. dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]})`,
          dpTable: dp.map(row => [...row]),
        })

        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Final computation
  const lcsLen = dp[m][n]
  const deletions = m + n - 2 * lcsLen

  steps.push({
    phase: 'compute_lcs',
    i: m,
    j: n,
    char_s1: null,
    char_s2: null,
    match: null,
    activeLine: 14,
    relatedLines: [14, 15],
    message: `LCS length: dp[${m}][${n}] = ${lcsLen}`,
    dpTable: dp.map(row => [...row]),
    lcsLen,
  })

  steps.push({
    phase: 'done',
    i: m,
    j: n,
    char_s1: null,
    char_s2: null,
    match: null,
    activeLine: 15,
    relatedLines: [15],
    message: `Result: ${m} + ${n} - 2*${lcsLen} = ${deletions} deletions needed`,
    dpTable: dp.map(row => [...row]),
    lcsLen,
    deletions,
    done: true,
  })

  return steps
}

function DPTableDisplay({ dpTable, s1, s2, currentI, currentJ }) {
  if (!dpTable) return null

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dpTable.map((row, i) => (
              <div key={`row-${i}`} style={{ display: 'flex' }}>
                <div className="do-dp-cell header">
                  {i === 0 ? 'ε' : s1[i - 1]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dpTable.map((row, i) => (
              <div key={`row-${i}`} style={{ display: 'flex' }}>
                {row.map((val, j) => {
                  const isCurrent = currentI === i && currentJ === j
                  const isTarget = i === s1.length && j === s2.length && currentI !== null

                  return (
                    <motion.div
                      key={`cell-${i}-${j}`}
                      className={`do-dp-cell ${isCurrent ? 'current' : ''} ${isTarget ? 'lcs' : ''}`}
                      animate={isCurrent || isTarget ? { scale: 1.05 } : { scale: 1 }}
                    >
                      {val}
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Column headers */}
        <div style={{ display: 'flex', marginTop: 4 }}>
          <div className="do-dp-cell header" style={{ width: 40 }}>
            ε
          </div>
          {s2.split('').map((char, idx) => (
            <div key={`header-${idx}`} className="do-dp-cell header">
              {char}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, s1, s2, applyExample, examples, inputError }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* String comparison */}
      {s1 && s2 && (
        <div className="do-string-comparison">
          <div className="do-string-row">
            <div className="do-string-label">s1:</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {s1.split('').map((char, idx) => (
                <div
                  key={`s1-${idx}`}
                  className={`do-char ${step?.char_s1 === char && step?.i === idx + 1 ? 'highlight' : ''}`}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
          <div className="do-string-row">
            <div className="do-string-label">s2:</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {s2.split('').map((char, idx) => (
                <div
                  key={`s2-${idx}`}
                  className={`do-char ${step?.char_s2 === char && step?.j === idx + 1 ? 'highlight' : ''}`}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DP Table */}
      {step?.dpTable && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>DP Table (LCS)</div>
          <DPTableDisplay
            dpTable={step.dpTable}
            s1={s1}
            s2={s2}
            currentI={step.i}
            currentJ={step.j}
          />
        </div>
      )}

      {/* Result */}
      {step?.deletions !== undefined && (
        <motion.div
          className="do-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="do-result-label">Minimum Deletions</div>
          <div className="do-result-value">{step.deletions}</div>
          <div className="do-result-desc">
            LCS length: {step.lcsLen}
            <br />
            {s1.length} + {s2.length} - 2 × {step.lcsLen} = {step.deletions}
          </div>
        </motion.div>
      )}

      {/* LCS Length (intermediate) */}
      {step?.lcsLen !== undefined && step?.deletions === undefined && (
        <motion.div
          className="do-result"
          style={{ borderColor: '#22c55e', color: '#22c55e' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="do-result-label">LCS Length</div>
          <div className="do-result-value" style={{ color: '#22c55e' }}>{step.lcsLen}</div>
          <div className="do-result-desc">
            Computing final result...
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function DeleteOperationVisualizer() {
  const examples = useMemo(() => getExamplesOr('delete-operation', []), [])
  const [s1Input, setS1Input] = useState('"sea"')
  const [s2Input, setS2Input] = useState('"eat"')

  const { s1, s2, inputError } = useMemo(() => {
    try {
      const str1 = s1Input.startsWith('"') ? s1Input.slice(1, -1) : s1Input
      const str2 = s2Input.startsWith('"') ? s2Input.slice(1, -1) : s2Input

      if (str1.length > 30 || str2.length > 30) {
        return { s1: '', s2: '', inputError: 'Strings must be <= 30 characters' }
      }
      if (str1.length === 0 || str2.length === 0) {
        return { s1: '', s2: '', inputError: 'Strings must not be empty' }
      }
      return { s1: str1, s2: str2, inputError: '' }
    } catch (e) {
      return { s1: '', s2: '', inputError: e.message }
    }
  }, [s1Input, s2Input])

  const steps = useMemo(() => generateSteps(s1, s2), [s1, s2])

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
      setS1Input(`"${ex.s1 || ex[0]}"`)
      setS2Input(`"${ex.s2 || ex[1]}"`)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
          </div>
        ),
      },
      {
        id: 'viz',
        title: '🗑 Delete Operation',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>String 1</div>
              <textarea
                value={s1Input}
                onChange={(e) => {
                  setS1Input(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 50,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder='"sea"'
              />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>String 2</div>
              <textarea
                value={s2Input}
                onChange={(e) => {
                  setS2Input(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 50,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder='"eat"'
              />
            </div>
            {inputError && (
              <div style={{ color: '#f87171', fontSize: 11 }}>{inputError}</div>
            )}
            <VisualizationPanel
              step={step}
              s1={s1}
              s2={s2}
              applyExample={applyExample}
              examples={examples}
              inputError={inputError}
            />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, s1Input, s2Input, s1, s2, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"s1","label":"s1","type":"string"},{"key":"s2","label":"s2","type":"string"}]}
        values={{ s1: s1Input, s2: s2Input }}
        onChange={(k, v) => { if (k === 's1') setS1Input(v); if (k === 's2') setS2Input(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        
      />

      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
