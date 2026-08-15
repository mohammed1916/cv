import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem385Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['complete', 'init', 'list_complete', 'list_start', 'parse', 'parse_number']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'parse',
  3: 'list_start',
  10: 'parse_number',
  12: 'list_complete',
  14: 'parse_number',
  18: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def deserialize(s):' },
  { line: 2, text: '    def parse(s, idx):' },
  { line: 3, text: '        if s[idx] == "[":' },
  { line: 4, text: '            nested_list = []' },
  { line: 5, text: '            idx += 1  # skip "[" ' },
  { line: 6, text: '            while s[idx] != "]":' },
  { line: 7, text: '                if s[idx] == ",":' },
  { line: 8, text: '                    idx += 1' },
  { line: 9, text: '                else:' },
  { line: 10, text: '                    item, idx = parse(s, idx)' },
  { line: 11, text: '                    nested_list.append(item)' },
  { line: 12, text: '            return nested_list, idx + 1' },
  { line: 13, text: '        else:' },
  { line: 14, text: '            num = 0' },
  { line: 15, text: '            while idx < len(s) and s[idx].isdigit():' },
  { line: 16, text: '                num = num * 10 + int(s[idx])' },
  { line: 17, text: '                idx += 1' },
  { line: 18, text: '            return num, idx' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(input) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    input,
    currentIdx: 0,
    stack: [],
    currentValue: null,
    message: 'Initialize parser for nested integer notation',
  })

  steps.push({
    activeLine: 2,
    phase: 'parse',
    input,
    currentIdx: 0,
    stack: [],
    currentValue: null,
    message: 'Begin parsing from index 0',
  })

  let idx = 0
  const parseString = (s, startIdx) => {
    const stepsLocal = []

    if (s[startIdx] === '[') {
      stepsLocal.push({
        activeLine: 3,
        phase: 'list_start',
        input,
        currentIdx: startIdx,
        stack: [],
        currentValue: '[]',
        message: `Found list bracket at position ${startIdx}`,
      })

      idx = startIdx + 1

      const listItems = []
      while (startIdx + 1 < s.length && s[startIdx + 1] !== ']') {
        startIdx++
        if (s[startIdx].match(/\d/)) {
          let num = 0
          while (startIdx < s.length && s[startIdx].match(/\d/)) {
            num = num * 10 + parseInt(s[startIdx])
            startIdx++
          }
          listItems.push(num)

          stepsLocal.push({
            activeLine: 10,
            phase: 'parse_number',
            input,
            currentIdx: startIdx,
            stack: [...listItems],
            currentValue: num,
            message: `Parsed number: ${num}`,
          })
        } else if (s[startIdx] === ',') {
          // Skip comma
        }
      }

      stepsLocal.push({
        activeLine: 12,
        phase: 'list_complete',
        input,
        currentIdx: startIdx + 1,
        stack: listItems,
        currentValue: `[${listItems.join(', ')}]`,
        message: `List complete: [${listItems.join(', ')}]`,
      })
    } else if (input[startIdx].match(/\d/)) {
      let num = 0
      while (startIdx < input.length && input[startIdx].match(/\d/)) {
        num = num * 10 + parseInt(input[startIdx])
        startIdx++
      }

      stepsLocal.push({
        activeLine: 14,
        phase: 'parse_number',
        input,
        currentIdx: startIdx,
        stack: [],
        currentValue: num,
        message: `Parsed number: ${num}`,
      })
    }

    return stepsLocal
  }

  if (input.startsWith('[')) {
    const parseSteps = parseString(input, 0)
    steps.push(...parseSteps)
  } else {
    let num = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i].match(/\d/)) {
        num = num * 10 + parseInt(input[i])
      }
    }
    steps.push({
      activeLine: 14,
      phase: 'parse_number',
      input,
      currentIdx: input.length,
      stack: [],
      currentValue: num,
      message: `Parsed number: ${num}`,
    })
  }

  steps.push({
    activeLine: 18,
    phase: 'complete',
    input,
    currentIdx: input.length,
    stack: [],
    currentValue: null,
    message: 'Parsing complete!',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple Number',
    input: '324',
  },
  {
    label: 'Simple List',
    input: '[123,456]',
  },
  {
    label: 'Nested List',
    input: '[123,[456,789]]',
  },
]

export default function Problem385Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [inputInput, setInputInput] = useState(EXAMPLES[0]?.input ?? '');
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = inputInput;
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: EXAMPLES[exIdx]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setInputInput(String(EXAMPLES[i].input)); handleReset(); }, [handleReset]);

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
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
      title: '📋 Nested Integer Parser',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
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
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Input String */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Input String</div>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {step.input.split('').map((char, idx) => (
                    <motion.div
                      key={`char-${idx}`}
                      animate={{
                        scale: step.currentIdx === idx ? 1.25 : 1,
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 4,
                        backgroundColor: step.currentIdx === idx ? '#fed7aa' : '#fef3c7',
                        border: step.currentIdx === idx ? '2px solid #f59e0b' : '1px solid #fcd34d',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#92400e',
                        minWidth: 30,
                        textAlign: 'center',
                      }}
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Current Position */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>Index</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.currentIdx}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Current Value</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                    {step.currentValue !== null ? String(step.currentValue) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Stack/Result */}
              {step.stack.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Parsed Items</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.stack.map((val, idx) => (
                      <motion.div
                        key={`item-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: '#dcfce7',
                          border: '2px solid #10b981',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#047857',
                        }}
                      >
                        {val}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase indicators */}
              {step.phase === 'list_start' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#1e40af',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>List Detected:</div>
                  <div>Begin parsing list elements recursively</div>
                </motion.div>
              )}

              {step.phase === 'parse_number' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Parsing Number:</div>
                  <div>Read digits and convert to integer</div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Parsing complete! Result: {String(step.currentValue)}
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"input","label":"input","type":"string"}]}
          values={{ input: inputInput }}
          onChange={(k, v) => { if (k === 'input') setInputInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
    </div>
  )
}
