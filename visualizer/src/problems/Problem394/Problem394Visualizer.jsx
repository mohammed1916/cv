import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def decodeString(self, s: str) -> str:' },
  { line: 3, text: '        stack = []' },
  { line: 4, text: '        current_num = 0' },
  { line: 5, text: '        current_str = ""' },
  { line: 6, text: '        ' },
  { line: 7, text: '        for char in s:' },
  { line: 8, text: '            if char.isdigit():' },
  { line: 9, text: '                current_num = current_num * 10 + int(char)' },
  { line: 10, text: '            elif char == "[":' },
  { line: 11, text: '                stack.append((current_str, current_num))' },
  { line: 12, text: '                current_str = ""' },
  { line: 13, text: '                current_num = 0' },
  { line: 14, text: '            elif char == "]":' },
  { line: 15, text: '                prev_str, num = stack.pop()' },
  { line: 16, text: '                current_str = prev_str + num * current_str' },
  { line: 17, text: '            else:' },
  { line: 18, text: '                current_str += char' },
  { line: 19, text: '        ' },
  { line: 20, text: '        return current_str' },
]

function generateSteps(s) {
  const steps = []

  if (!s) {
    steps.push({
      phase: 'done', activeLine: 20, message: 'Empty string. Return "".',
      result: '', stack: [], currentNum: 0, currentStr: '', position: 0
    })
    return steps
  }

  steps.push({
    phase: 'init', activeLine: 3, message: 'Initialize: stack=[], current_num=0, current_str=""',
    stack: [], currentNum: 0, currentStr: '', position: 0, s
  })

  let stack = []
  let currentNum = 0
  let currentStr = ''

  for (let i = 0; i < s.length; i++) {
    const char = s[i]

    steps.push({
      phase: 'loop', activeLine: 7,
      message: `Process character: '${char}' at position ${i}`,
      s, position: i, char, stack: [...stack], currentNum, currentStr
    })

    if (/\d/.test(char)) {
      const prevNum = currentNum
      currentNum = currentNum * 10 + parseInt(char)

      steps.push({
        phase: 'digit', activeLine: 8,
        message: `Digit found. current_num = ${prevNum} * 10 + ${parseInt(char)} = ${currentNum}`,
        s, position: i, char, stack: [...stack], currentNum, currentStr
      })
    } else if (char === '[') {
      stack.push({ str: currentStr, num: currentNum })

      steps.push({
        phase: 'open_bracket', activeLine: 10,
        message: `'[' found. Push ("${currentStr}", ${currentNum}) to stack.`,
        s, position: i, char, stack: [...stack], currentNum, currentStr
      })

      currentStr = ''
      currentNum = 0

      steps.push({
        phase: 'reset', activeLine: 11,
        message: `Reset: current_str="", current_num=0`,
        s, position: i, char, stack: [...stack], currentNum, currentStr
      })
    } else if (char === ']') {
      const { str: prevStr, num } = stack.pop()

      steps.push({
        phase: 'close_bracket', activeLine: 14,
        message: `']' found. Pop from stack: ("${prevStr}", ${num})`,
        s, position: i, char, stack: [...stack, { str: prevStr, num }], currentNum, currentStr
      })

      const newStr = prevStr + currentStr.repeat(num)

      steps.push({
        phase: 'expand', activeLine: 15,
        message: `Expand: current_str = "${prevStr}" + "${currentStr}".repeat(${num}) = "${newStr}"`,
        s, position: i, char, stack: [...stack], currentNum, currentStr: newStr
      })

      currentStr = newStr
    } else {
      currentStr += char

      steps.push({
        phase: 'letter', activeLine: 17,
        message: `Letter found. current_str += "${char}" -> "${currentStr}"`,
        s, position: i, char, stack: [...stack], currentNum, currentStr
      })
    }
  }

  steps.push({
    phase: 'done', activeLine: 20,
    message: `Done. Return result: "${currentStr}"`,
    s, stack: [...stack], currentNum, currentStr, result: currentStr, position: s.length
  })

  return steps
}

const EXAMPLES = getExamples('decode-string') || [
  { label: 'Example 1', s: '2[abc]3[cd]' },
  { label: 'Example 2', s: '3[a2[c]]' },
  { label: 'Example 3', s: '2[abc]3[cd]ef' },
]

export default function Problem394Visualizer() {
  const [sInput, setSInput] = useState('2[abc]3[cd]')

  const { s, inputError } = useMemo(() => {
    try {
      return { s: sInput, inputError: '' }
    } catch (e) {
      return { s: '2[abc]3[cd]', inputError: e.message || 'Invalid input' }
    }
  }, [sInput])

  const steps = useMemo(
    () => generateSteps(s).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSInput(ex.s)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
              Encoded String {inputError && <span style={{ color: '#f87171' }}>— {inputError}</span>}
            </div>
            <input
              value={sInput}
              onChange={(e) => { setSInput(e.target.value); handleReset() }}
              placeholder="2[abc]3[cd]"
              style={{
                width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px', backgroundColor: '#334155', color: '#e2e8f0',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Input String</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {s.split('').map((char, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: idx === step?.position ? '#f59e0b' : idx < (step?.position ?? 0) ? '#64748b' : '#334155',
                    color: '#e2e8f0', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                    border: idx === step?.position ? '2px solid #fbbf24' : 'none'
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Stack</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 60 }}>
                {step?.stack?.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>Empty</div>
                ) : (
                  step?.stack?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#334155', padding: '6px', borderRadius: '3px',
                        color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace'
                      }}
                    >
                      ({'"' + item.str + '"'}, {item.num})
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Current String</div>
              <div style={{
                backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px',
                color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace', minHeight: '32px',
                wordBreak: 'break-all'
              }}>
                "{step?.currentStr ?? ''}"
              </div>
            </div>
          </div>

          {step && (
            <div style={{ display: 'flex', gap: 12, fontSize: '13px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: '#64748b' }}>Num: </span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{step.currentNum}</span>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: '#64748b' }}>Position: </span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{step.position}/{s.length}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: '#1e293b',
        padding: '12px', borderRadius: '6px', color: '#cbd5e1',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div>
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
      </div>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
