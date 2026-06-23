import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem422Visualizer.css'

const EXAMPLES = [
  {
    label: 'Valid',
    words: ['abcd', 'bnrt', 'crmy', 'dtye'],
    expected: true
  },
  {
    label: 'Invalid',
    words: ['abcd', 'bnrt', 'crm', 'dt'],
    expected: false
  },
  {
    label: 'Single',
    words: ['a'],
    expected: true
  },
]

function generateSteps(words) {
  const steps = []
  const n = words.length

  steps.push({
    activeLine: 1,
    message: `Check word square validity. n=${n}`,
    phase: 'init',
    result: null,
    isValid: null,
    words,
  })

  steps.push({
    activeLine: 2,
    message: `Check symmetry: word[i][j] must equal word[j][i]`,
    phase: 'start',
    result: null,
    isValid: null,
    words,
  })

  let isValid = true
  let checkCount = 0

  for (let i = 0; i < n && isValid; i++) {
    for (let j = 0; j < words[i].length && isValid; j++) {
      steps.push({
        activeLine: 3,
        message: `Check [${i}][${j}]. words[${i}][${j}] = '${words[i][j]}'`,
        phase: 'check_pos',
        result: null,
        isValid: isValid,
        checkI: i,
        checkJ: j,
        words,
      })

      if (j < n && j < words.length) {
        const wordJ = words[j]
        const jChar = j < words[i].length ? words[i][j] : null
        const iChar = i < wordJ.length ? wordJ[i] : null

        steps.push({
          activeLine: 4,
          message: `Compare symmetry: words[${i}][${j}]='${jChar}' vs words[${j}][${i}]='${iChar}'`,
          phase: 'compare',
          result: null,
          isValid: isValid,
          checkI: i,
          checkJ: j,
          char1: jChar,
          char2: iChar,
          words,
        })

        if (jChar !== iChar) {
          isValid = false

          steps.push({
            activeLine: 5,
            message: `Mismatch! '${jChar}' != '${iChar}'. Invalid word square.`,
            phase: 'invalid',
            result: false,
            isValid: false,
            checkI: i,
            checkJ: j,
            char1: jChar,
            char2: iChar,
            words,
          })
        } else {
          checkCount++

          steps.push({
            activeLine: 6,
            message: `Match! '${jChar}' == '${iChar}'. Continue checking.`,
            phase: 'match',
            result: null,
            isValid: true,
            checkI: i,
            checkJ: j,
            char1: jChar,
            char2: iChar,
            words,
          })
        }
      }
    }
  }

  steps.push({
    activeLine: 7,
    message: `Complete. Word square is ${isValid ? 'valid' : 'invalid'}.`,
    phase: 'done',
    result: isValid,
    isValid,
    words,
  })

  return steps
}

function WordSquareVisualization({ words, step }) {
  const result = step?.result ?? null
  const n = words.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Valid Word Square</div>

      {/* Grid display */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Word Grid</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(...words.map(w => w.length))}, minmax(50px, 1fr))`,
          gap: 4,
          padding: 8,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
          width: 'fit-content',
        }}>
          {words.map((word, i) =>
            word.split('').map((char, j) => {
              const isCheckPos = step?.checkI === i && step?.checkJ === j
              const isMirrorPos = step?.checkI === j && step?.checkJ === i
              const mismatch = step?.char1 !== step?.char2 && step?.char1 !== undefined

              let bgColor = '#f1f5f9'
              let borderColor = '#cbd5e1'
              let textColor = '#334155'

              if (isCheckPos) {
                bgColor = '#c7d2fe'
                borderColor = '#6366f1'
                textColor = '#4f46e5'
              } else if (isMirrorPos) {
                bgColor = '#dbeafe'
                borderColor = '#0284c7'
                textColor = '#0284c7'
              } else if (mismatch && isCheckPos) {
                bgColor = '#fee2e2'
                borderColor = '#ef4444'
                textColor = '#ef4444'
              }

              return (
                <motion.div
                  key={`${i}-${j}`}
                  style={{
                    padding: '8px',
                    backgroundColor: bgColor,
                    borderRadius: 4,
                    border: `2px solid ${borderColor}`,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: textColor,
                    minWidth: 45,
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  animate={{
                    scale: isCheckPos ? 1.15 : 1,
                    boxShadow: isCheckPos ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                  }}
                >
                  {char}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Current check display */}
      {step?.checkI !== undefined && step?.char1 !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step?.char1 === step?.char2 ? '#f0fdf4' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${step?.char1 === step?.char2 ? '#10b981' : '#ef4444'}`,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: step?.char1 === step?.char2 ? '#065f46' : '#7f1d1d',
            marginBottom: 8
          }}>
            {step?.char1 === step?.char2 ? '✓ Match' : '✗ Mismatch'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>words[{step?.checkI}][{step?.checkJ}]</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 4 }}>
                '{step?.char1}'
              </div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b' }}>
                {step?.char1 === step?.char2 ? '==' : '!='}
              </div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>words[{step?.checkJ}][{step?.checkI}]</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 4 }}>
                '{step?.char2}'
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Words list */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Words</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {words.map((word, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                backgroundColor: step?.checkI === idx ? '#c7d2fe' : '#f1f5f9',
                borderRadius: 4,
                border: `2px solid ${step?.checkI === idx ? '#6366f1' : '#cbd5e1'}`,
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#1e293b',
              }}
            >
              words[{idx}] = "{word}"
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div style={{
        padding: 12,
        backgroundColor: result ? '#f0fdf4' : result === false ? '#fee2e2' : '#f1f5f9',
        borderRadius: 6,
        border: `2px solid ${result ? '#10b981' : result === false ? '#ef4444' : '#cbd5e1'}`,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: result ? '#065f46' : result === false ? '#7f1d1d' : '#64748b',
          marginBottom: 4
        }}>
          Result
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: result ? '#10b981' : result === false ? '#ef4444' : '#cbd5e1',
        }}>
          {result === null ? '—' : result ? 'Valid Square' : 'Invalid Square'}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem422Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.words).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

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
      title: '🎯 Word Square',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #10b981' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#d1fae5' : '#f1f5f9',
                    color: exIdx === idx ? '#065f46' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <WordSquareVisualization words={example.words} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
