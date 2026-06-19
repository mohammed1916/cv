import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem536Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def str2tree(s):' },
  { line: 2, text: '    if not s: return None' },
  { line: 3, text: '    i = 0' },
  { line: 4, text: '    def helper(s, start):' },
  { line: 5, text: '        if start[0] >= len(s): return None' },
  { line: 6, text: '        sign, val = 1, 0' },
  { line: 7, text: '        if s[start[0]] == "-": sign = -1; start[0] += 1' },
  { line: 8, text: '        while start[0] < len(s) and s[start[0]].isdigit():' },
  { line: 9, text: '            val = val * 10 + int(s[start[0]]); start[0] += 1' },
  { line: 10, text: '        node = TreeNode(sign * val)' },
  { line: 11, text: '        if start[0] < len(s) and s[start[0]] == "(":' },
  { line: 12, text: '            start[0] += 1' },
  { line: 13, text: '            node.left = helper(s, start)' },
  { line: 14, text: '            start[0] += 1  # skip ")"' },
  { line: 15, text: '        return node' },
]

function generateSteps(s) {
  const steps = []
  let idx = 0
  const nodes = []

  steps.push({
    activeLine: 1,
    idx: 0,
    nodes: [],
    message: `Parse string: "${s}"`,
  })

  let i = 0
  while (i < s.length) {
    if (s[i] === '(') {
      steps.push({
        activeLine: 11,
        idx: i,
        nodes: [...nodes],
        message: `Found '(' at position ${i}`,
      })
      i++
    } else if (s[i] === ')') {
      steps.push({
        activeLine: 14,
        idx: i,
        nodes: [...nodes],
        message: `Found ')' at position ${i}`,
      })
      i++
    } else {
      let sign = 1
      let val = 0
      let startIdx = i

      if (s[i] === '-') {
        sign = -1
        i++
      }

      while (i < s.length && /\d/.test(s[i])) {
        val = val * 10 + parseInt(s[i])
        i++
      }

      const nodeVal = sign * val
      nodes.push(nodeVal)

      steps.push({
        activeLine: 10,
        idx: i,
        nodes: [...nodes],
        lastNode: nodeVal,
        message: `Parsed node value: ${nodeVal}`,
      })
    }
  }

  steps.push({
    activeLine: 15,
    idx: s.length,
    nodes: [...nodes],
    message: `Tree construction complete`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', s: '4(2(3)(1))(6(5)(7))' },
  { label: 'Example 2', s: '2(4(7)())' },
  { label: 'Example 3', s: '1' },
]

export default function Problem536Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.s), [ex])
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
        title: '🌳 String to Tree',
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

                  {/* String display with position */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Input String:</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
                      {ex.s.split('').map((char, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 6px',
                            backgroundColor: i === step.idx ? '#dbeafe' : '#ffffff',
                            border: `1px solid ${i === step.idx ? '#0ea5e9' : '#cbd5e1'}`,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                          }}
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nodes parsed */}
                  {step.nodes.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Nodes Parsed:</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.nodes.map((node, i) => (
                          <motion.span
                            key={i}
                            animate={{ scale: i === step.nodes.length - 1 && step.lastNode ? 1.15 : 1 }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: i === step.nodes.length - 1 && step.lastNode ? '#dcfce7' : '#dbeafe',
                              border: '1px solid #10b981',
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {node}
                          </motion.span>
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
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.s]
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
