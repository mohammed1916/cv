import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MaximumVacationDaysVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def maxVacationDays(flights, days):' },
  { line: 2, text: '    n = len(flights)' },
  { line: 3, text: '    k = len(days[0])' },
  { line: 4, text: '    dp = [[0]*k for _ in range(n)]' },
  { line: 5, text: '    for c in range(n):' },
  { line: 6, text: '        dp[c][0] = days[c][0] if (flights[0][c] or c==0) else 0' },
  { line: 7, text: '    for w in range(1, k):' },
  { line: 8, text: '        for c in range(n):' },
  { line: 9, text: '            for p in range(n):' },
  { line: 10, text: '                if flights[p][c] or p == c:' },
  { line: 11, text: '                    dp[c][w] = max(dp[c][w], dp[p][w-1] + days[c][w])' },
  { line: 12, text: '    return max(dp[c][-1] for c in range(n))' },
]

const EXAMPLES = getExamples('maximum-vacation-days')

function generateSteps(flights, days) {
  const steps = []
  const n = flights.length
  const k = days[0]?.length || 0

  const dp = Array(n).fill(0).map(() => Array(k).fill(0))

  steps.push({
    activeLine: 2,
    n, k, dp: dp.map(r => [...r]),
    message: `Init: ${n} cities, ${k} weeks`,
    relatedLines: [2, 3, 4],
  })

  for (let c = 0; c < n; c++) {
    const canReach = flights[0][c] || c === 0
    dp[c][0] = canReach ? days[c][0] : 0
  }

  steps.push({
    activeLine: 6,
    n, k, dp: dp.map(r => [...r]),
    message: 'Week 0: Compute initial vacation days',
    relatedLines: [5, 6],
  })

  for (let w = 1; w < k; w++) {
    for (let c = 0; c < n; c++) {
      for (let p = 0; p < n; p++) {
        const canReach = flights[p][c] || p === c
        if (canReach) {
          const newVal = dp[p][w - 1] + days[c][w]
          if (newVal > dp[c][w]) dp[c][w] = newVal
        }
      }
    }
    steps.push({
      activeLine: 11,
      n, k, w, dp: dp.map(r => [...r]),
      message: `Week ${w}: Update DP table`,
      relatedLines: [7, 8, 9, 10, 11],
    })
  }

  const result = Math.max(...dp.map(r => r[k - 1]))
  steps.push({
    activeLine: 12,
    n, k, dp: dp.map(r => [...r]),
    result,
    message: `Result: ${result} days`,
    relatedLines: [12],
  })

  return steps
}

function StatePanel({ flights, days, step }) {
  return (
    <div className="mvd-main-column">
      <div className="mvd-card">
        <div className="mvd-card-head">
          <div>
            <div className="mvd-section-label">Vacation Days DP</div>
            <div className="mvd-subtitle">Dynamic programming table for vacation planning.</div>
          </div>
          {step?.result !== undefined && (
            <div className="mvd-result-badge">{step.result} days</div>
          )}
        </div>

        {step?.dp && (
          <div className="mvd-table-container">
            <table className="mvd-table">
              <thead>
                <tr>
                  <th>City</th>
                  {Array(step.dp[0]?.length || 0).fill(0).map((_, i) => <th key={i}>W{i}</th>)}
                </tr>
              </thead>
              <tbody>
                {step.dp.map((row, i) => (
                  <tr key={i}>
                    <td>C{i}</td>
                    {row.map((v, j) => <td key={j}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mvd-info-grid">
          <div className="mvd-info-item">
            <span className="mvd-info-key">Cities</span>
            <span className="mono">{step?.n ?? 0}</span>
          </div>
          <div className="mvd-info-item">
            <span className="mvd-info-key">Weeks</span>
            <span className="mono">{step?.k ?? 0}</span>
          </div>
          <div className="mvd-info-item wide">
            <span className="mvd-info-key">Status</span>
            <span>{step?.message ?? 'Computing vacation days...'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MaximumVacationDaysVisualizer() {
  const defaultFlights = [[0, 1, 1], [1, 0, 1], [1, 1, 0]]
  const defaultDays = [[1, 3, 1], [6, 0, 3], [3, 3, 3]]

  const [flightsStr, setFlightsStr] = useState(JSON.stringify(defaultFlights))
  const [daysStr, setDaysStr] = useState(JSON.stringify(defaultDays))
  const [flights, setFlights] = useState(defaultFlights)
  const [days, setDays] = useState(defaultDays)
  const [steps, setSteps] = useState(() => generateSteps(defaultFlights, defaultDays))

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const handleVisualize = useCallback(() => {
    try {
      const f = JSON.parse(flightsStr)
      const d = JSON.parse(daysStr)
      setFlights(f)
      setDays(d)
      setSteps(generateSteps(f, d))
      setStepIndex(-1)
      setIsPlaying(false)
    } catch {}
  }, [flightsStr, daysStr, setIsPlaying, setStepIndex])

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: <StatePanel flights={flights} days={days} step={currentStep} />,
      },
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [flights, days, currentStep]
  )

  return (
    <div className="mvd-root">
      <div className="mvd-card mvd-input-card">
        <div className="mvd-input-row">
          <div className="mvd-field-group">
            <label className="mvd-input-label">Flights</label>
            <textarea className="mvd-input" value={flightsStr} onChange={(e) => setFlightsStr(e.target.value)} rows="3" />
          </div>
          <div className="mvd-field-group">
            <label className="mvd-input-label">Days</label>
            <textarea className="mvd-input" value={daysStr} onChange={(e) => setDaysStr(e.target.value)} rows="3" />
          </div>
          <button className="mvd-btn mvd-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>
      </div>

      <DockableWorkspace panels={dockPanels}>
        <FloatingPanel>
          <PlaybackControls isPlaying={isPlaying} onPlayToggle={togglePlay} onStepForward={stepForward} onStepBack={stepBack} onReset={handleReset} speed={speed} onSpeedChange={setSpeed} currentStep={stepIndex + 1} totalSteps={steps.length} />
        </FloatingPanel>
      </DockableWorkspace>

      {showPatternOverlay && <PatternOverlay activeLineDom={activeLineDom} />}
    </div>
  )
}
