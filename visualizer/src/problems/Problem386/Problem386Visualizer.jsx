import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem386Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['add_number', 'backtrack', 'complete', 'init', 'start_dfs', 'start_digit', 'try_digit']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'backtrack',
  6: 'add_number',
  8: 'try_digit',
  11: 'start_dfs',
  13: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def lexicalOrder(n):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    def dfs(num):' },
  { line: 4, text: '        if num > n:' },
  { line: 5, text: '            return' },
  { line: 6, text: '        result.append(num)' },
  { line: 7, text: '        # Try appending each digit 0-9' },
  { line: 8, text: '        for i in range(10):' },
  { line: 9, text: '            dfs(num * 10 + i)' },
  { line: 10, text: '    # Start DFS from 1-9' },
  { line: 11, text: '    for i in range(1, 10):' },
  { line: 12, text: '        dfs(i)' },
  { line: 13, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n) {
  const steps = []
  const result = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    result: [],
    current: null,
    depth: 0,
    message: `Generate lexicographical numbers up to ${n}`,
  })

  steps.push({
    activeLine: 11,
    phase: 'start_dfs',
    n,
    result: [],
    current: null,
    depth: 0,
    message: 'Start DFS from digits 1-9',
  })

  // Helper to do DFS
  const dfs = (num, depth = 0) => {
    if (num > n) return

    result.push(num)

    steps.push({
      activeLine: 6,
      phase: 'add_number',
      n,
      result: [...result],
      current: num,
      depth,
      message: `Add ${num} to result (depth ${depth})`,
    })

    // Try each digit 0-9
    for (let i = 0; i < 10; i++) {
      const nextNum = num * 10 + i
      if (nextNum > n) break

      steps.push({
        activeLine: 8,
        phase: 'try_digit',
        n,
        result: [...result],
        current: num,
        depth,
        nextDigit: i,
        message: `Try appending digit ${i}: ${num} * 10 + ${i} = ${nextNum}`,
      })

      dfs(nextNum, depth + 1)
    }

    steps.push({
      activeLine: 4,
      phase: 'backtrack',
      n,
      result: [...result],
      current: num,
      depth,
      message: `Backtrack from ${num}`,
    })
  }

  // Start with digits 1-9
  for (let i = 1; i <= 9; i++) {
    if (i > n) break

    steps.push({
      activeLine: 11,
      phase: 'start_digit',
      n,
      result: [...result],
      current: i,
      depth: 0,
      message: `Start DFS with digit ${i}`,
    })

    dfs(i)
  }

  steps.push({
    activeLine: 13,
    phase: 'complete',
    n,
    result: [...result],
    current: null,
    depth: 0,
    message: `Complete! Generated ${result.length} numbers`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'n=13',
    n: 13,
  },
  {
    label: 'n=100',
    n: 100,
  },
  {
    label: 'n=2',
    n: 2,
  },
]

export default function Problem386Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [nInput, setNInput] = useState(String(EXAMPLES[0]?.n ?? 0));
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: EXAMPLES[exIdx]?.n ?? '', inputError: e.message };
    }
  }, [nInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(n).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNInput(String(EXAMPLES[i].n)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔢 Lexicographical DFS', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
      </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : 'var(--surface2)',
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
              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>n (limit)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#027bba', marginTop: 4 }}>{step.n}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Count</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#a36907', marginTop: 4 }}>{step.result.length}</div>
                </div>
              </div>

              {/* Current number being processed */}
              {step.current !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    Current: {step.current} (Depth: {step.depth})
                  </div>
                </motion.div>
              )}

              {/* Next digit to try */}
              {step.nextDigit !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#eff6ff',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>
                    Trying digit: {step.nextDigit}
                  </div>
                </motion.div>
              )}

              {/* Result list */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Generated Numbers ({step.result.length})
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.result.slice(0, 20).map((num, idx) => (
                    <motion.div
                      key={`num-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: step.current === num ? '#fbbf24' : '#dcfce7',
                        border:
                          step.current === num
                            ? '2px solid #f59e0b'
                            : '2px solid #10b981',
                        fontSize: 12,
                        fontWeight: 600,
                        color: step.current === num ? '#78350f' : '#047857',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {step.result.length > 20 && (
                    <div style={{ padding: '6px 10px', fontSize: 12, color: '#627794', fontWeight: 600 }}>
                      ... ({step.result.length - 20} more)
                    </div>
                  )}
                </div>
              </div>

              {/* Algorithm explanation */}
              {step.phase === 'start_dfs' && (
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
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>DFS Approach:</div>
                  <div>
                    From each number, append digits 0-9. This naturally generates numbers in lexicographical order.
                  </div>
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
                  ✓ Complete! Time: O(n), Space: O(n)
                </motion.div>
              )}
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, exIdx, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
