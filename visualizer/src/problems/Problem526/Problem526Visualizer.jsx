import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem526Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def countArrangement(n):' },
  { line: 2, text: '    def backtrack(pos, used):' },
  { line: 3, text: '        if pos > n: return 1' },
  { line: 4, text: '        count = 0' },
  { line: 5, text: '        for num in range(1, n+1):' },
  { line: 6, text: '            if num not in used:' },
  { line: 7, text: '                if pos % num == 0 or num % pos == 0:' },
  { line: 8, text: '                    used.add(num)' },
  { line: 9, text: '                    count += backtrack(pos+1, used)' },
  { line: 10, text: '                    used.remove(num)' },
  { line: 11, text: '        return count' },
  { line: 12, text: '    return backtrack(1, set())' },
]

function generateSteps(n) {
  const steps = []
  const arrangements = []
  const callStack = []

  function backtrack(pos, used, path) {
    steps.push({
      activeLine: 2,
      pos,
      used: new Set(used),
      path: [...path],
      callStack: [...callStack],
      message: `Enter backtrack: pos=${pos}, used={${Array.from(used).sort((a,b)=>a-b).join(',')}}`,
    })

    if (pos > n) {
      arrangements.push([...path])
      steps.push({
        activeLine: 3,
        pos,
        used: new Set(used),
        path: [...path],
        callStack: [...callStack],
        found: true,
        message: `Found valid arrangement: [${path.join(', ')}]`,
      })
      return 1
    }

    let count = 0
    for (let num = 1; num <= n; num++) {
      if (!used.has(num)) {
        steps.push({
          activeLine: 6,
          pos,
          used: new Set(used),
          path: [...path],
          candidate: num,
          callStack: [...callStack],
          message: `Try num=${num} at pos=${pos}`,
        })

        if (pos % num === 0 || num % pos === 0) {
          steps.push({
            activeLine: 8,
            pos,
            used: new Set(used),
            path: [...path],
            candidate: num,
            callStack: [...callStack],
            valid: true,
            message: `Valid: ${pos} % ${num} == 0 or ${num} % ${pos} == 0. Place ${num} at pos ${pos}.`,
          })

          used.add(num)
          path.push(num)
          callStack.push(`backtrack(${pos + 1})`)

          count += backtrack(pos + 1, used, path)

          callStack.pop()
          path.pop()
          used.delete(num)

          steps.push({
            activeLine: 10,
            pos,
            used: new Set(used),
            path: [...path],
            candidate: num,
            callStack: [...callStack],
            message: `Backtrack: removed ${num} from pos ${pos}`,
          })
        } else {
          steps.push({
            activeLine: 7,
            pos,
            used: new Set(used),
            path: [...path],
            candidate: num,
            callStack: [...callStack],
            invalid: true,
            message: `Invalid: ${num} doesn't divide or divisible by ${pos}`,
          })
        }
      }
    }

    steps.push({
      activeLine: 11,
      pos,
      used: new Set(used),
      path: [...path],
      callStack: [...callStack],
      message: `Return count=${count}`,
    })

    return count
  }

  backtrack(1, new Set(), [])

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: n=2', n: 2 },
  { label: 'Example 2: n=3', n: 3 },
  { label: 'Example 3: n=4', n: 4 },
]

export default function Problem526Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.n), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '🎯 Backtracking Tree',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Position info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Position</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.pos}</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Used</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                        {Array.from(step.used).sort((a, b) => a - b).join(',')}
                      </div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Current Path</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                        {step.path.length === 0 ? '[]' : `[${step.path.join(',')}]`}
                      </div>
                    </div>
                  </div>

                  {/* Candidates */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Candidates:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Array.from({ length: ex.n }, (_, i) => i + 1).map((num) => {
                        const isUsed = step.used.has(num)
                        const isCandidate = num === step.candidate
                        const isValid = step.valid && num === step.candidate
                        const isInvalid = step.invalid && num === step.candidate

                        return (
                          <motion.div
                            key={num}
                            animate={{
                              scale: isCandidate ? 1.2 : 1,
                              backgroundColor: isInvalid ? '#fee2e2' : isValid ? '#dcfce7' : isUsed ? '#f1f5f9' : '#ffffff',
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              fontWeight: 600,
                              fontSize: 14,
                              border: `2px solid ${isCandidate ? '#0ea5e9' : '#cbd5e1'}`,
                              color: isUsed ? '#9ca3af' : '#1e293b',
                              opacity: isUsed ? 0.5 : 1,
                            }}
                          >
                            {num}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Call Stack */}
                  {step.callStack.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Call Stack:</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', padding: 4 }}>
                        {step.callStack.map((call, i) => (
                          <div key={i}>{call}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.n]
  )

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
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
