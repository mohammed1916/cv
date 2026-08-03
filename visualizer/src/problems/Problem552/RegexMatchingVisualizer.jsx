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
import { getExamples } from '../../config/examplesRegistry'
import './RegexMatchingVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isMatch(self, s: str, p: str) -> bool:' },
  { line: 3, text: '        m, n = len(s), len(p)' },
  { line: 4, text: '        dp = [[False] * (n + 1) for _ in range(m + 1)]' },
  { line: 5, text: '        dp[0][0] = True' },
  { line: 6, text: '        ' },
  { line: 7, text: '        # Handle patterns like a* or a*b*' },
  { line: 8, text: '        for j in range(1, n + 1):' },
  { line: 9, text: '            if p[j - 1] == \'*\':' },
  { line: 10, text: '                dp[0][j] = dp[0][j - 2]' },
  { line: 11, text: '        ' },
  { line: 12, text: '        for i in range(1, m + 1):' },
  { line: 13, text: '            for j in range(1, n + 1):' },
  { line: 14, text: '                if p[j - 1] == \'*\':' },
  { line: 15, text: '                    dp[i][j] = dp[i][j - 2]  # zero match' },
  { line: 16, text: '                    if p[j - 2] == \'.\' or p[j - 2] == s[i - 1]:' },
  { line: 17, text: '                        dp[i][j] |= dp[i - 1][j]  # one+ match' },
  { line: 18, text: '                else:' },
  { line: 19, text: '                    if p[j - 1] == \'.\' or p[j - 1] == s[i - 1]:' },
  { line: 20, text: '                        dp[i][j] = dp[i - 1][j - 1]' },
  { line: 21, text: '        ' },
  { line: 22, text: '        return dp[m][n]' },
]

const PATTERNS = ['init', 'pattern_star', 'match', 'iterate', 'wildcard', 'done']
const LINE_PATTERN_MAP = {
  4: 'init',
  8: 'iterate',
  9: 'pattern_star',
  14: 'pattern_star',
  16: 'wildcard',
  19: 'wildcard',
  22: 'done',
}

function generateSteps(s, p) {
  const steps = []

  if (typeof s !== 'string' || typeof p !== 'string') {
    steps.push({
      phase: 'done',
      activeLine: 22,
      relatedLines: [22],
      message: 'Invalid input.',
      result: false,
      done: true,
    })
    return steps
  }

  const m = s.length
  const n = p.length

  // Initialize DP table
  steps.push({
    phase: 'init',
    activeLine: 4,
    relatedLines: [3, 4, 5],
    message: `Initialize DP table (${m + 1}x${n + 1})`,
    dp: Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(false)),
    currentI: 0,
    currentJ: 0,
    s,
    p,
  })

  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(false))
  dp[0][0] = true

  steps.push({
    phase: 'init',
    activeLine: 5,
    relatedLines: [5],
    message: 'Base case: empty string matches empty pattern',
    dp: dp.map((row) => [...row]),
    currentI: 0,
    currentJ: 0,
    highlighted: [[0, 0]],
    s,
    p,
  })

  // Handle patterns like a*, ab*, abc*
  steps.push({
    phase: 'pattern_star',
    activeLine: 8,
    relatedLines: [8, 9, 10],
    message: 'Handle leading patterns with * (for empty string)',
    dp: dp.map((row) => [...row]),
    currentI: 0,
    currentJ: 0,
    s,
    p,
  })

  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2]

      steps.push({
        phase: 'pattern_star',
        activeLine: 10,
        relatedLines: [9, 10],
        message: `Pattern '${p.substring(0, j)}' matches empty string: ${dp[0][j]}`,
        dp: dp.map((row) => [...row]),
        currentI: 0,
        currentJ: j,
        highlighted: [[0, j], [0, j - 2]],
        s,
        p,
      })
    }
  }

  // Fill the DP table
  steps.push({
    phase: 'iterate',
    activeLine: 12,
    relatedLines: [12, 13],
    message: 'Iterate through string and pattern',
    dp: dp.map((row) => [...row]),
    currentI: 1,
    currentJ: 1,
    s,
    p,
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // Star pattern
        dp[i][j] = dp[i][j - 2] // zero match: ignore the char before *

        steps.push({
          phase: 'pattern_star',
          activeLine: 15,
          relatedLines: [14, 15],
          message: `'${s[i - 1]}' vs '*': try zero match from dp[${i}][${j - 2}]`,
          dp: dp.map((row) => [...row]),
          currentI: i,
          currentJ: j,
          highlighted: [[i, j], [i, j - 2]],
          s,
          p,
        })

        // one or more match
        if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {
          dp[i][j] = dp[i][j] || dp[i - 1][j]

          steps.push({
            phase: 'wildcard',
            activeLine: 17,
            relatedLines: [16, 17],
            message: `'${s[i - 1]}' matches '${p[j - 2]}*': try one+ match from dp[${i - 1}][${j}]`,
            dp: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            highlighted: [[i, j], [i - 1, j]],
            s,
            p,
          })
        }
      } else {
        // Regular character or dot
        if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
          dp[i][j] = dp[i - 1][j - 1]

          steps.push({
            phase: 'wildcard',
            activeLine: 20,
            relatedLines: [19, 20],
            message: `'${s[i - 1]}' matches '${p[j - 1]}': inherit from dp[${i - 1}][${j - 1}]`,
            dp: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            highlighted: [[i, j], [i - 1, j - 1]],
            s,
            p,
          })
        } else {
          steps.push({
            phase: 'match',
            activeLine: 19,
            relatedLines: [19, 20],
            message: `'${s[i - 1]}' does not match '${p[j - 1]}'`,
            dp: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            highlighted: [[i, j]],
            s,
            p,
          })
        }
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 22,
    relatedLines: [22],
    message: `Result: ${dp[m][n]}`,
    dp: dp.map((row) => [...row]),
    result: dp[m][n],
    done: true,
    s,
    p,
  })

  return steps
}

function DPTable({ step }) {
  if (!step?.dp) return null

  const { dp, currentI, currentJ, highlighted = [], s, p } = step

  const isCellHighlighted = (i, j) => highlighted.some((h) => h[0] === i && h[1] === j)

  return (
    <div style={{ overflowX: 'auto', padding: 12 }}>
      <div style={{ display: 'inline-block', minWidth: 'fit-content' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            fontFamily: 'monospace',
            fontSize: 11,
            border: '1px solid #475569',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: 6,
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#a78bfa',
                  textAlign: 'center',
                  minWidth: 28,
                }}
              >
                {'  '}
              </th>
              {Array(p.length + 1)
                .fill(null)
                .map((_, j) => (
                  <th
                    key={`header-${j}`}
                    style={{
                      padding: 6,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#a78bfa',
                      textAlign: 'center',
                      minWidth: 28,
                    }}
                  >
                    {j === 0 ? '' : p[j - 1]}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Array(s.length + 1)
              .fill(null)
              .map((_, i) => (
                <tr key={`row-${i}`}>
                  <td
                    style={{
                      padding: 6,
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#a78bfa',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {i === 0 ? '' : s[i - 1]}
                  </td>
                  {Array(p.length + 1)
                    .fill(null)
                    .map((_, j) => {
                      const isHighlighted = isCellHighlighted(i, j)
                      const isCurrent = i === currentI && j === currentJ

                      return (
                        <motion.td
                          key={`cell-${i}-${j}`}
                          style={{
                            padding: 6,
                            border: '1px solid #475569',
                            textAlign: 'center',
                            minWidth: 28,
                            backgroundColor: isCurrent
                              ? '#ec4899'
                              : isHighlighted
                                ? '#f59e0b'
                                : dp[i][j]
                                  ? '#22c55e'
                                  : '#1e293b',
                            color: isCurrent || isHighlighted || dp[i][j] ? '#fff' : '#94a3b8',
                            fontWeight: isHighlighted || isCurrent ? 600 : 400,
                          }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {dp[i][j] ? 'T' : 'F'}
                        </motion.td>
                      )
                    })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyExample, examples }) {
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

      {step?.s !== undefined && step?.p !== undefined && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '2px solid #38bdf8' }}>
              <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>String (s)</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>"{step.s}"</div>
            </div>
            <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 4, border: '2px solid #a78bfa' }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>Pattern (p)</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>"{step.p}"</div>
            </div>
          </div>
        </div>
      )}

      {step?.dp && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>DP Table (T=true, F=false)</div>
          <DPTable step={step} />
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: `2px solid ${step.result ? '#22c55e' : '#f87171'}`,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Match Result</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: step.result ? '#22c55e' : '#f87171',
            }}
          >
            {step.result ? 'TRUE' : 'FALSE'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function RegexMatchingVisualizer() {
  const examples = useMemo(() => getExamples('regex-matching') || [], [])
  const [sInput, setSInput] = useState('aa')
  const [pInput, setPInput] = useState('a')

  const { s, sError } = useMemo(() => {
    try {
      if (typeof sInput !== 'string') throw new Error('String required')
      return { s: sInput, sError: '' }
    } catch (e) {
      return { s: '', sError: e.message }
    }
  }, [sInput])

  const { p, pError } = useMemo(() => {
    try {
      if (typeof pInput !== 'string') throw new Error('Pattern required')
      return { p: pInput, pError: '' }
    } catch (e) {
      return { p: '', pError: e.message }
    }
  }, [pInput])

  const steps = useMemo(() => generateSteps(s, p), [s, p])

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
      setSInput(ex.s || ex)
      setPInput(ex.p || '')
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
        title: '🎯 Regex Matching',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>String (s)</div>
                <input
                  type="text"
                  value={sInput}
                  onChange={(e) => {
                    setSInput(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: sError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                  placeholder="Enter string"
                />
                {sError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{sError}</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Pattern (p)</div>
                <input
                  type="text"
                  value={pInput}
                  onChange={(e) => {
                    setPInput(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: pError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                  placeholder='e.g., "a.b*"'
                />
                {pError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{pError}</div>}
              </div>
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, sInput, pInput, sError, pError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
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
