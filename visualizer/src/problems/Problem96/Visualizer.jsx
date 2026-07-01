import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'

const PATTERNS = ['init', 'outer', 'term', 'commit', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'init',
  4: 'outer',
  5: 'term',
  6: 'term',
  7: 'commit',
  8: 'done',
}

const EXAMPLES = [
  { label: 'n = 3', n: 3 },
  { label: 'n = 4', n: 4 },
  { label: 'n = 5', n: 5 },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def numTrees(n):' },
  { line: 2, text: '    dp = [0] * (n + 1)' },
  { line: 3, text: '    dp[0] = dp[1] = 1' },
  { line: 4, text: '    for i in range(2, n + 1):' },
  { line: 5, text: '        for j in range(1, i + 1):' },
  { line: 6, text: '            dp[i] += dp[j - 1] * dp[i - j]' },
  { line: 7, text: '        # dp[i] complete' },
  { line: 8, text: '    return dp[n]' },
]

function generateSteps(n) {
  const steps = []
  const dp = new Array(n + 1).fill(0)

  // dp[0] and dp[1] are the base cases (empty tree / single node = 1 way).
  dp[0] = 1
  if (n >= 1) dp[1] = 1

  // filled[k] marks dp[k] as a finished value.
  const filled = new Array(n + 1).fill(false)
  filled[0] = true
  if (n >= 1) filled[1] = true

  steps.push({
    activeLine: 3,
    phase: 'init',
    dp: [...dp],
    filled: [...filled],
    i: null,
    j: null,
    left: null,
    right: null,
    expr: 'dp[0] = dp[1] = 1',
    message: `Base cases: dp[0] = 1 (empty tree) and dp[1] = 1 (single node). Building up to dp[${n}].`,
  })

  for (let i = 2; i <= n; i++) {
    steps.push({
      activeLine: 4,
      phase: 'outer',
      dp: [...dp],
      filled: [...filled],
      i,
      j: null,
      left: null,
      right: null,
      expr: `dp[${i}] = 0`,
      message: `Compute dp[${i}]: count BSTs over ${i} nodes by choosing each value 1..${i} as the root.`,
    })

    for (let j = 1; j <= i; j++) {
      const leftIdx = j - 1 // left subtree has j-1 nodes
      const rightIdx = i - j // right subtree has i-j nodes
      const termVal = dp[leftIdx] * dp[rightIdx]
      const before = dp[i]
      dp[i] += termVal

      steps.push({
        activeLine: 6,
        phase: 'term',
        dp: [...dp],
        filled: [...filled],
        i,
        j,
        left: leftIdx,
        right: rightIdx,
        term: termVal,
        expr: `dp[${i}] += dp[${leftIdx}] * dp[${rightIdx}] = ${dp[leftIdx]} * ${dp[rightIdx]} = ${termVal}`,
        message: `Root = ${j}: left subtree over ${leftIdx} nodes (dp[${leftIdx}]=${dp[leftIdx]}), right over ${rightIdx} nodes (dp[${rightIdx}]=${dp[rightIdx]}). Running dp[${i}] = ${before} + ${termVal} = ${dp[i]}.`,
      })
    }

    filled[i] = true
    steps.push({
      activeLine: 7,
      phase: 'commit',
      dp: [...dp],
      filled: [...filled],
      i,
      j: null,
      left: null,
      right: null,
      expr: `dp[${i}] = ${dp[i]}`,
      message: `dp[${i}] = ${dp[i]} — there are ${dp[i]} structurally unique BSTs over ${i} nodes.`,
    })
  }

  steps.push({
    activeLine: 8,
    phase: 'done',
    dp: [...dp],
    filled: [...filled],
    i: n,
    j: null,
    left: null,
    right: null,
    expr: `return dp[${n}] = ${dp[n]}`,
    message: `Done! dp[${n}] = ${dp[n]} — the ${n}th Catalan number.`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#5b21b6', fontSize: 13 }}>
        Press play to build the DP table for Unique BSTs (Catalan numbers).
      </div>
    )
  }

  const { dp = [], filled = [], i, left, right, expr } = step

  const cellColor = (idx) => {
    if (idx === i) return { bg: '#ede9fe', border: '3px solid #7c3aed', text: '#5b21b6' } // being built
    if (idx === left) return { bg: '#dbeafe', border: '3px solid #2563eb', text: '#1e40af' } // left operand
    if (idx === right) return { bg: '#dcfce7', border: '3px solid #16a34a', text: '#166534' } // right operand
    if (filled[idx]) return { bg: '#f5f3ff', border: '1px solid #c4b5fd', text: '#5b21b6' } // done
    return { bg: '#f8fafc', border: '1px dashed #cbd5e1', text: '#94a3b8' } // pending
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f5f3ff', borderRadius: 8, borderLeft: '4px solid #7c3aed' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          dp[k] = number of unique BSTs over k nodes. Each value 1..i is tried as the root; the count is
          dp[left subtree] * dp[right subtree], summed over every choice.
        </div>
      </div>

      {/* Current term expression */}
      <div
        style={{
          padding: 12,
          backgroundColor: '#faf5ff',
          borderRadius: 8,
          border: '2px solid #7c3aed',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 15,
          fontWeight: 700,
          color: '#5b21b6',
        }}
      >
        {expr}
      </div>

      {/* DP array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>DP Table</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {dp.map((v, idx) => {
            const c = cellColor(idx)
            return (
              <motion.div
                key={idx}
                animate={{ scale: idx === i ? 1.08 : 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 52,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    padding: '10px 6px',
                    borderRadius: 6,
                    textAlign: 'center',
                    backgroundColor: c.bg,
                    border: c.border,
                    color: c.text,
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {filled[idx] || idx === i ? v : '·'}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                  dp[{idx}]
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#475569' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#ede9fe', border: '2px solid #7c3aed', verticalAlign: 'middle', marginRight: 4 }} />dp[i] building</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#dbeafe', border: '2px solid #2563eb', verticalAlign: 'middle', marginRight: 4 }} />left dp[j-1]</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#dcfce7', border: '2px solid #16a34a', verticalAlign: 'middle', marginRight: 4 }} />right dp[i-j]</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#f5f3ff', border: '1px solid #c4b5fd', verticalAlign: 'middle', marginRight: 4 }} />filled</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#f8fafc', border: '1px dashed #cbd5e1', verticalAlign: 'middle', marginRight: 4 }} />pending</span>
      </div>

      {/* Message */}
      <motion.div
        style={{ padding: 12, backgroundColor: '#f5f3ff', borderRadius: 8, border: '1px solid #c4b5fd' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#5b21b6' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem96Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.n).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
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
    { id: 'viz', title: '📊 Unique BSTs', content: (<VisualizationPanel step={step} />) },
  ], [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom])

  return (
    <div className="problem-shell">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 12px' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: e.label === ex.label ? '2px solid #7c3aed' : '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: e.label === ex.label ? 700 : 500,
              backgroundColor: e.label === ex.label ? '#ede9fe' : '#f8fafc',
              color: '#5b21b6',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>
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
