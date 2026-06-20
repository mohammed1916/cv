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
import './PermutationInStringVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def checkInclusion(s1, s2):' },
  { line: 2, text: '    if len(s1) > len(s2):' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    ' },
  { line: 5, text: '    s1_count = {}' },
  { line: 6, text: '    for c in s1:' },
  { line: 7, text: '        s1_count[c] = s1_count.get(c, 0) + 1' },
  { line: 8, text: '    ' },
  { line: 9, text: '    window_count = {}' },
  { line: 10, text: '    for i in range(len(s2)):' },
  { line: 11, text: '        c = s2[i]' },
  { line: 12, text: '        window_count[c] = window_count.get(c, 0) + 1' },
  { line: 13, text: '        ' },
  { line: 14, text: '        if i >= len(s1):' },
  { line: 15, text: '            old_c = s2[i - len(s1)]' },
  { line: 16, text: '            window_count[old_c] -= 1' },
  { line: 17, text: '            if window_count[old_c] == 0:' },
  { line: 18, text: '                del window_count[old_c]' },
  { line: 19, text: '        ' },
  { line: 20, text: '        if window_count == s1_count:' },
  { line: 21, text: '            return True' },
  { line: 22, text: '    ' },
  { line: 23, text: '    return False' },
]

const EXAMPLES = getExamples('permutation-in-string')

function generateSteps(s1, s2) {
  const steps = []

  if (s1.length > s2.length) {
    steps.push({
      activeLine: 3,
      s1_count: {},
      window_count: {},
      windowStart: 0,
      windowEnd: 0,
      message: 's1 is longer than s2, impossible permutation exists',
      relatedLines: [2, 3],
      found: false,
    })
    return steps
  }

  const s1_count = {}
  for (let c of s1) {
    s1_count[c] = (s1_count[c] || 0) + 1
  }

  steps.push({
    activeLine: 7,
    s1_count,
    window_count: {},
    windowStart: 0,
    windowEnd: 0,
    message: `Count s1 chars: ${JSON.stringify(s1_count)}`,
    relatedLines: [5, 6, 7],
    found: false,
  })

  let window_count = {}
  for (let i = 0; i < s2.length; i++) {
    const c = s2[i]
    window_count[c] = (window_count[c] || 0) + 1

    steps.push({
      activeLine: 12,
      s1_count,
      window_count: { ...window_count },
      windowStart: Math.max(0, i - s1.length + 1),
      windowEnd: i,
      message: `Add '${c}' at index ${i}. Window: [${i - s1.length + 1}, ${i}]`,
      relatedLines: [10, 11, 12],
      found: false,
    })

    if (i >= s1.length) {
      const old_c = s2[i - s1.length]
      window_count[old_c]--
      if (window_count[old_c] === 0) {
        delete window_count[old_c]
      }

      steps.push({
        activeLine: 18,
        s1_count,
        window_count: { ...window_count },
        windowStart: i - s1.length + 1,
        windowEnd: i,
        message: `Remove '${old_c}' from index ${i - s1.length}. Window: [${i - s1.length + 1}, ${i}]`,
        relatedLines: [14, 15, 16, 17, 18],
        found: false,
      })
    }

    if (JSON.stringify(window_count) === JSON.stringify(s1_count)) {
      steps.push({
        activeLine: 21,
        s1_count,
        window_count: { ...window_count },
        windowStart: Math.max(0, i - s1.length + 1),
        windowEnd: i,
        message: `Permutation found at index ${i - s1.length + 1}!`,
        relatedLines: [20, 21],
        found: true,
      })
      return steps
    }
  }

  steps.push({
    activeLine: 23,
    s1_count,
    window_count,
    windowStart: 0,
    windowEnd: s2.length,
    message: 'No permutation found in s2',
    relatedLines: [23],
    found: false,
  })

  return steps
}

function StringVisualization({ s1, s2, step }) {
  const windowStart = step?.windowStart ?? -1
  const windowEnd = step?.windowEnd ?? -1

  return (
    <div className="ps-visualization">
      <div className="ps-string-section">
        <div className="ps-label">s1 (pattern)</div>
        <div className="ps-string-display">
          {s1.split('').map((c, idx) => (
            <div key={idx} className="ps-char">
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="ps-string-section">
        <div className="ps-label">s2 (search)</div>
        <div className="ps-string-display">
          {s2.split('').map((c, idx) => {
            const inWindow = idx >= windowStart && idx <= windowEnd
            return (
              <motion.div
                key={idx}
                className={`ps-char ${inWindow ? 'in-window' : ''}`}
                animate={{
                  scale: inWindow ? 1.1 : 1,
                  backgroundColor: inWindow ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                }}
              >
                {c}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatePanel({ s1, s2, step }) {
  const s1_count = step?.s1_count || {}
  const window_count = step?.window_count || {}

  return (
    <div className="ps-main-column">
      <div className="ps-card">
        <div className="ps-card-head">
          <div>
            <div className="ps-section-label">Permutation Detection</div>
            <div className="ps-subtitle">Sliding window with character frequency matching.</div>
          </div>
          {step?.found && (
            <div className="ps-found-badge">
              <span>✓</span> Found
            </div>
          )}
        </div>

        <StringVisualization s1={s1} s2={s2} step={step} />

        <div className="ps-counts-row">
          <div className="ps-count-section">
            <div className="ps-count-label">s1 Counts</div>
            <div className="ps-count-display">
              {Object.entries(s1_count).map(([c, count]) => (
                <span key={c} className="ps-count-item">
                  {c}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="ps-count-section">
            <div className="ps-count-label">Window Counts</div>
            <div className="ps-count-display">
              {Object.entries(window_count).map(([c, count]) => (
                <span key={c} className={`ps-count-item ${s1_count[c] === count ? 'match' : ''}`}>
                  {c}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ps-info-grid">
          <div className="ps-info-item">
            <span className="ps-info-key">Window Size</span>
            <span className="mono ps-info-value">{s1.length}</span>
          </div>
          <div className="ps-info-item">
            <span className="ps-info-key">s2 Position</span>
            <span className="mono ps-info-value">
              {step?.windowEnd ?? 0}/{s2.length}
            </span>
          </div>
          <div className="ps-info-item wide">
            <span className="ps-info-key">Status</span>
            <span className="ps-info-value">{step?.message ?? 'Starting permutation check.'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PermutationInStringVisualizer() {
  const [s1Input, setS1Input] = useState('ab')
  const [s2Input, setS2Input] = useState('eidbaooo')
  const [source1, setSource1] = useState('ab')
  const [source2, setSource2] = useState('eidbaooo')
  const [steps, setSteps] = useState(() => generateSteps('ab', 'eidbaooo'))

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const handleVisualize = useCallback(() => {
    if (s1Input.trim().length === 0 || s2Input.trim().length === 0) return
    setSource1(s1Input.trim())
    setSource2(s2Input.trim())
    setSteps(generateSteps(s1Input.trim(), s2Input.trim()))
    setStepIndex(-1)
    setIsPlaying(false)
  }, [s1Input, s2Input, setIsPlaying, setStepIndex])

  const applyExample = useCallback(
    (example) => {
      setS1Input(example.s1)
      setS2Input(example.s2)
      setSource1(example.s1)
      setSource2(example.s2)
      setSteps(generateSteps(example.s1, example.s2))
      setStepIndex(-1)
      setIsPlaying(false)
    },
    [setIsPlaying, setStepIndex]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: <StatePanel s1={source1} s2={source2} step={currentStep} />,
      },
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [source1, source2, currentStep]
  )

  return (
    <div className="ps-root">
      <div className="ps-card ps-input-card">
        <div className="ps-input-row">
          <div className="ps-field-group">
            <label className="ps-input-label">s1 (pattern)</label>
            <input
              className="ps-input mono"
              value={s1Input}
              onChange={(e) => setS1Input(e.target.value)}
              placeholder="ab"
              maxLength={20}
            />
          </div>
          <div className="ps-field-group">
            <label className="ps-input-label">s2 (text)</label>
            <input
              className="ps-input mono"
              value={s2Input}
              onChange={(e) => setS2Input(e.target.value)}
              placeholder="eidbaooo"
              maxLength={30}
            />
          </div>
          <button className="ps-btn ps-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>

        <div className="ps-example-grid">
          {EXAMPLES.map((example, idx) => (
            <button key={idx} className="ps-example-card" onClick={() => applyExample(example)}>
              <span className="ps-example-label">{example.label}</span>
            </button>
          ))}
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
