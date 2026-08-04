import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem474Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const EXAMPLES = getExamplesOr('ones-and-zeroes', [
  { label: 'Example 1', strs: ['10', '0001', '111001', '1', '0'], m: 5, n: 3 },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findMaxForm(strs, m, n):' },
  { line: 2, text: '    dp = [[0]*(n+1) for _ in range(m+1)]' },
  { line: 3, text: '    for s in strs:' },
  { line: 4, text: '        ones = s.count("1")' },
  { line: 5, text: '        zeros = len(s) - ones' },
  { line: 6, text: '        for i in range(m, zeros-1, -1):' },
  { line: 7, text: '            for j in range(n, ones-1, -1):' },
  { line: 8, text: '                dp[i][j] = max(dp[i][j], 1+dp[i-zeros][j-ones])' },
]

function generateSteps(strs, m, n) {
  const steps = []

  if (!strs || strs.length === 0) {
    steps.push({ activeLine: 1, message: 'Empty strings → max count = 0', done: true, result: 0 })
    return steps
  }

  steps.push({ activeLine: 1, message: `Initialize: strs=${strs.length} strings, m=${m} zeros max, n=${n} ones max` })

  steps.push({ activeLine: 2, message: `Create 2D DP table: [${m + 1}][${n + 1}]`, dpSize: `${m + 1}×${n + 1}` })

  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))
  steps.push({ activeLine: 3, message: 'DP[i][j] = max strings using ≤i zeros and ≤j ones', dp: dp.map(row => [...row]) })

  for (let idx = 0; idx < Math.min(strs.length, 4); idx++) {
    const str = strs[idx]
    let zeros = 0, ones = 0
    for (const c of str) {
      if (c === '0') zeros++
      else ones++
    }

    steps.push({ activeLine: 4, message: `Process str[${idx}]="${str}": zeros=${zeros}, ones=${ones}`, currentStr: str, zeros, ones })

    // Simulate DP update (reverse iteration)
    for (let i = m; i >= zeros; i--) {
      for (let j = n; j >= ones; j--) {
        const newVal = dp[i - zeros][j - ones] + 1
        if (newVal > dp[i][j]) {
          steps.push({ activeLine: 5, message: `DP[${i}][${j}] = max(${dp[i][j]}, ${dp[i - zeros][j - ones]} + 1) = ${newVal}`, updateRow: i, updateCol: j })
          dp[i][j] = newVal
        }
      }
    }

    steps.push({ activeLine: 6, message: `After str[${idx}]: DP[${m}][${n}] = ${dp[m][n]}`, dp: dp.map(row => [...row]) })
  }

  steps.push({ activeLine: 7, message: `Final DP state computed`, dp: dp.map(row => [...row]) })
  steps.push({ activeLine: 8, message: `Result: max strings = DP[${m}][${n}] = ${dp[m][n]}`, done: true, result: dp[m][n], dp: dp.map(row => [...row]) })
  return steps
}

function DPTableView({ dp, m, n, updateRow, updateCol }) {
  if (!dp || dp.length === 0) return null

  const maxCols = Math.min(n + 1, 6)
  const maxRows = Math.min(m + 1, 6)

  return (
    <div style={{ overflowX: 'auto', padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 10, minWidth: '100%' }}>
        <tbody>
          {dp.slice(0, maxRows).map((row, i) => (
            <tr key={i}>
              {row.slice(0, maxCols).map((val, j) => {
                const isUpdated = updateRow === i && updateCol === j
                return (
                  <td
                    key={`${i}-${j}`}
                    style={{
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'center',
                      fontWeight: 600,
                      backgroundColor: isUpdated ? '#fef08a' : i === 0 || j === 0 ? '#e0f2fe' : '#f8fafc',
                      color: isUpdated ? '#92400e' : '#1e293b',
                      minWidth: 35,
                    }}
                  >
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {maxRows < m + 1 && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>... (showing first {maxRows} rows)</div>}
    </div>
  )
}

function VisualizationPanel({ strs, m, n, step, applyEx }) {
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
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Problem</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Max strings that can be formed using ≤m zeros and ≤n ones. Use 2D DP with backward iteration to avoid reusing strings.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6b21a8', marginBottom: 4 }}>Strings</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b21a8' }}>{strs.length}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #10b981' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Max Zeros</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{m}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Max Ones</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{n}</div>
        </div>
      </div>

      {step?.currentStr && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>Current String</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>"{step.currentStr}"</div>
            <div style={{ fontSize: 11, color: '#92400e' }}>
              {step.zeros} zeros, {step.ones} ones
            </div>
          </div>
        </div>
      )}

      {step?.dp && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>DP Table (2D)</div>
          <DPTableView dp={step.dp} m={m} n={n} updateRow={step.updateRow} updateCol={step.updateCol} />
        </div>
      )}

      {step?.dpSize && (
        <div style={{ padding: 10, backgroundColor: '#ecfdf5', borderRadius: 6, border: '1px solid #10b981', fontSize: 11, color: '#047857' }}>
          Table size: {step.dpSize}
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Maximum Strings</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>{step.result}</div>
        </div>
      )}
    </div>
  )
}

export default function Problem474Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(ex.strs, ex.m, ex.n).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '📦 Ones and Zeroes',
      content: <VisualizationPanel strs={ex.strs} m={ex.m} n={ex.n} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
