import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ScrambleStringVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('scramble-string')

const EXAMPLES = getExamples('scramble-string')

const SCRAMBLESTRING_PATTERNS = ['check', 'memo', 'base', 'char_check', 'recurse', 'not_found']

const LINE_PATTERN_MAP = {
  1: 'check',
  2: 'memo',
  3: 'base',
  5: 'char_check',
  7: 'recurse',
}

function isScramble(s1, s2, memo = {}) {
  const steps = []

  function helper(s1, s2, depth = 0) {
    const key = `${s1}|${s2}`

    steps.push({
      activeLine: 1,
      s1,
      s2,
      depth,
      message: `Check if "${s1}" can be scrambled to "${s2}"`,
      baseCase: false,
      memoHit: false
    })

    if (key in memo) {
      steps.push({
        activeLine: 2,
        s1,
        s2,
        depth,
        message: `Memo hit: "${s1}" → "${s2}" = ${memo[key]}`,
        baseCase: false,
        memoHit: true,
        result: memo[key]
      })
      return memo[key]
    }

    if (s1 === s2) {
      steps.push({
        activeLine: 3,
        s1,
        s2,
        depth,
        message: `Base case: "${s1}" == "${s2}" → true`,
        baseCase: true,
        result: true
      })
      memo[key] = true
      return true
    }

    const sorted1 = s1.split('').sort().join('')
    const sorted2 = s2.split('').sort().join('')

    if (sorted1 !== sorted2) {
      steps.push({
        activeLine: 5,
        s1,
        s2,
        depth,
        message: `Character check: sort("${s1}")="${sorted1}" ≠ sort("${s2}")="${sorted2}" → false`,
        baseCase: true,
        result: false
      })
      memo[key] = false
      return false
    }

    const n = s1.length
    for (let i = 1; i < n; i++) {
      steps.push({
        activeLine: 7,
        s1,
        s2,
        depth,
        splitIndex: i,
        message: `Try split at index ${i}: "${s1.substring(0, i)}" + "${s1.substring(i)}"`,
        tryingSplit: true
      })

      const case1Left = s1.substring(0, i)
      const case1Right = s1.substring(i)
      const case2Left = s2.substring(0, i)
      const case2Right = s2.substring(i)

      // Case 1: No swap
      const case1LeftResult = helper(case1Left, case2Left, depth + 1)
      const case1Pass = case1LeftResult && helper(case1Right, case2Right, depth + 1)

      if (case1Pass) {
        steps.push({
          activeLine: 8,
          s1,
          s2,
          depth,
          splitIndex: i,
          message: `Case 1 (no swap): "${case1Left}"→"${case2Left}" and "${case1Right}"→"${case2Right}" both true → return true`,
          casePass: true,
          result: true
        })
        memo[key] = true
        return true
      }

      // Case 2: With swap
      const case2LeftSwapped = s2.substring(n - i)
      const case2RightSwapped = s2.substring(0, n - i)

      const case2LeftResult = helper(case1Left, case2LeftSwapped, depth + 1)
      const case2Pass = case2LeftResult && helper(case1Right, case2RightSwapped, depth + 1)

      if (case2Pass) {
        steps.push({
          activeLine: 10,
          s1,
          s2,
          depth,
          splitIndex: i,
          message: `Case 2 (with swap): "${case1Left}"→"${case2LeftSwapped}" and "${case1Right}"→"${case2RightSwapped}" both true → return true`,
          casePass: true,
          result: true
        })
        memo[key] = true
        return true
      }
    }

    steps.push({
      activeLine: 12,
      s1,
      s2,
      depth,
      message: `All splits failed → return false`,
      baseCase: true,
      result: false
    })

    memo[key] = false
    return false
  }

  helper(s1, s2)
  return { result: s1 === s2 ? true : isScramble(s1, s2), steps }
}

function generateSteps(s1, s2) {
  if (s1.length !== s2.length) {
    return [{
      activeLine: 0,
      s1,
      s2,
      message: `Length mismatch: "${s1}".length=${s1.length} ≠ "${s2}".length=${s2.length} → false`,
      baseCase: true,
      result: false
    }]
  }

  const memo = {}
  const steps = []

  function helper(s1, s2, depth = 0) {
    const key = `${s1}|${s2}`

    steps.push({
      activeLine: 1,
      s1,
      s2,
      depth,
      message: `Check if "${s1}" can be scrambled to "${s2}"`,
      baseCase: false,
      memoHit: false
    })

    if (key in memo) {
      steps.push({
        activeLine: 2,
        s1,
        s2,
        depth,
        message: `Memo hit: "${s1}" → "${s2}" = ${memo[key]}`,
        baseCase: false,
        memoHit: true,
        result: memo[key]
      })
      return memo[key]
    }

    if (s1 === s2) {
      steps.push({
        activeLine: 3,
        s1,
        s2,
        depth,
        message: `Base case: "${s1}" == "${s2}" → true`,
        baseCase: true,
        result: true
      })
      memo[key] = true
      return true
    }

    const sorted1 = s1.split('').sort().join('')
    const sorted2 = s2.split('').sort().join('')

    if (sorted1 !== sorted2) {
      steps.push({
        activeLine: 5,
        s1,
        s2,
        depth,
        message: `Character check: sort("${s1}")="${sorted1}" ≠ sort("${s2}")="${sorted2}" → false`,
        baseCase: true,
        result: false
      })
      memo[key] = false
      return false
    }

    const n = s1.length
    for (let i = 1; i < n; i++) {
      steps.push({
        activeLine: 7,
        s1,
        s2,
        depth,
        splitIndex: i,
        message: `Try split at index ${i}: "${s1.substring(0, i)}" + "${s1.substring(i)}"`,
        tryingSplit: true
      })

      const case1Left = s1.substring(0, i)
      const case1Right = s1.substring(i)
      const case2Left = s2.substring(0, i)
      const case2Right = s2.substring(i)

      // Case 1: No swap
      const case1LeftResult = helper(case1Left, case2Left, depth + 1)
      const case1Pass = case1LeftResult && helper(case1Right, case2Right, depth + 1)

      if (case1Pass) {
        steps.push({
          activeLine: 8,
          s1,
          s2,
          depth,
          splitIndex: i,
          message: `Case 1 (no swap): "${case1Left}"→"${case2Left}" and "${case1Right}"→"${case2Right}" both true → return true`,
          casePass: true,
          result: true
        })
        memo[key] = true
        return true
      }

      // Case 2: With swap
      const case2LeftSwapped = s2.substring(n - i)
      const case2RightSwapped = s2.substring(0, n - i)

      const case2LeftResult = helper(case1Left, case2LeftSwapped, depth + 1)
      const case2Pass = case2LeftResult && helper(case1Right, case2RightSwapped, depth + 1)

      if (case2Pass) {
        steps.push({
          activeLine: 10,
          s1,
          s2,
          depth,
          splitIndex: i,
          message: `Case 2 (with swap): "${case1Left}"→"${case2LeftSwapped}" and "${case1Right}"→"${case2RightSwapped}" both true → return true`,
          casePass: true,
          result: true
        })
        memo[key] = true
        return true
      }
    }

    steps.push({
      activeLine: 12,
      s1,
      s2,
      depth,
      message: `All splits failed → return false`,
      baseCase: true,
      result: false
    })

    memo[key] = false
    return false
  }

  helper(s1, s2)
  return steps
}

function StringVisualization({ s1, s2, step }) {
  const isResult = step?.result !== undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Input strings */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Strings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* String s1 */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>s1 = "{s1}"</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {s1.split('').map((char, idx) => (
                <motion.div
                  key={`s1-${idx}`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '2px solid #0284c7',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: '#dbeafe',
                    color: '#0c4a6e'
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>

          {/* String s2 */}
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>s2 = "{s2}"</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {s2.split('').map((char, idx) => (
                <motion.div
                  key={`s2-${idx}`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '2px solid #dc2626',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b'
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current recursion context */}
      {step && !step.baseCase && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Current Check</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#1e40af' }}>s1</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0c4a6e', fontFamily: 'monospace' }}>"{step.s1}"</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fee2e2', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#991b1b' }}>s2</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#7f1d1d', fontFamily: 'monospace' }}>"{step.s2}"</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fce7f3', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#831843' }}>Depth</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#be185d' }}>{step.depth}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Split information */}
      {step?.tryingSplit && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Split Attempt</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>No Swap</div>
              <div style={{ display: 'flex', gap: 4, fontSize: 12 }}>
                <span style={{ padding: '4px 8px', backgroundColor: '#dbeafe', borderRadius: 3 }}>"
                  {step.s1.substring(0, step.splitIndex)}"
                </span>
                <span>→</span>
                <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', borderRadius: 3 }}>"
                  {step.s2.substring(0, step.splitIndex)}"
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>With Swap</div>
              <div style={{ display: 'flex', gap: 4, fontSize: 12 }}>
                <span style={{ padding: '4px 8px', backgroundColor: '#dbeafe', borderRadius: 3 }}>"
                  {step.s1.substring(0, step.splitIndex)}"
                </span>
                <span>→</span>
                <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', borderRadius: 3 }}>"
                  {step.s2.substring(step.s2.length - step.splitIndex)}"
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {isResult && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: step.result ? '#ecfdf5' : '#fef2f2',
            borderRadius: 6,
            border: `2px solid ${step.result ? '#10b981' : '#ef4444'}`,
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 'bold',
            color: step.result ? '#047857' : '#991b1b'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {step.result ? '✓ Is Scramble' : '✗ Not Scramble'}
        </motion.div>
      )}
    </div>
  )
}

function VisualizationPanel({ s1, s2, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <StringVisualization s1={s1} s2={s2} step={step} />

      {/* Status message */}
      {step && (
        <motion.div
          style={{
            padding: 10,
            backgroundColor: '#f1f5f9',
            borderRadius: 4,
            fontSize: 12,
            color: '#475569',
            fontFamily: 'monospace',
            minHeight: 40
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function ScrambleStringVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [s1Input, setS1Input] = useState("great");
  const [s2Input, setS2Input] = useState("rgeat");
  const { s1, s2, inputError } = useMemo(() => {
    try {
      const parsedS1 = s1Input;
      const parsedS2 = s2Input;
      return { s1: parsedS1, s2: parsedS2, inputError: '' };
    } catch (e) {
      return { s1: "great", s2: "rgeat", inputError: e.message };
    }
  }, [s1Input, s2Input]);

  const steps = useMemo(
    () =>
      generateSteps(s1, s2).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s1, s2]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setS1Input(String(e.s1)); setS2Input(String(e.s2)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const primaryPanel = (
    <>
    <div className="scramble-primary-panel">
      <VisualizationPanel
        s1={s1}
        s2={s2}
        step={step}
        applyEx={applyEx}
      />
    </div>
  
    </>)

  const statusPanel = (
    <div className="scramble-status">
      {step?.message || 'Ready'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={SCRAMBLESTRING_PATTERNS} />
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
    </>
  )

  // Lumino state and config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'String Scramble', dockMode: 'split-right' },
      { id: 'code',    title: 'Code', dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="scramble-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
