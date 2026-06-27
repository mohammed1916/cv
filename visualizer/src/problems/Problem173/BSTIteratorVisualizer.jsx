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

const SOLUTION_CODE = [
  { line: 1, text: 'class BSTIterator:' },
  { line: 2, text: '    def __init__(self, root):' },
  { line: 3, text: '        self.stack = []' },
  { line: 4, text: '        self._pushLeft(root)' },
  { line: 5, text: '    def _pushLeft(self, node):' },
  { line: 6, text: '        while node:' },
  { line: 7, text: '            self.stack.append(node)' },
  { line: 8, text: '            node = node.left' },
  { line: 9, text: '    def next(self):' },
  { line: 10, text: '        node = self.stack.pop()' },
  { line: 11, text: '        if node.right:' },
  { line: 12, text: '            self._pushLeft(node.right)' },
  { line: 13, text: '        return node.val' },
]

function generateSteps() {
  const steps = []
  const treeValues = [3, 1, 6, null, 2, 4, 7]
  // In-order traversal: 1, 2, 3, 4, 6, 7

  steps.push({
    activeLine: 3,
    stack: [3],
    message: 'Initialize stack. Push all left nodes from root.',
  })

  steps.push({
    activeLine: 7,
    stack: [3, 1],
    visited: [],
    message: 'Push left child (1).',
  })

  steps.push({
    activeLine: 7,
    stack: [3, 1, 2],
    visited: [],
    message: 'Continue left from 1 (already at leaf).',
  })

  steps.push({
    activeLine: 10,
    stack: [3, 1],
    visited: [1],
    message: 'next(): Pop 1 (leftmost). No right child.',
  })

  steps.push({
    activeLine: 10,
    stack: [3],
    visited: [1, 2],
    message: 'next(): Pop 2. No right child.',
  })

  steps.push({
    activeLine: 10,
    stack: [],
    visited: [1, 2, 3],
    message: 'next(): Pop 3. Right exists (6), push its left path.',
  })

  steps.push({
    activeLine: 7,
    stack: [6, 4],
    visited: [1, 2, 3],
    message: 'Push left from 6: [6, 4] on stack.',
  })

  steps.push({
    activeLine: 10,
    stack: [6],
    visited: [1, 2, 3, 4],
    message: 'next(): Pop 4. No right child.',
  })

  steps.push({
    activeLine: 10,
    stack: [],
    visited: [1, 2, 3, 4, 6],
    message: 'next(): Pop 6. Right exists (7), push left from 7.',
  })

  steps.push({
    activeLine: 7,
    stack: [7],
    visited: [1, 2, 3, 4, 6],
    message: 'Push left from 7: [7] on stack.',
  })

  steps.push({
    activeLine: 10,
    stack: [],
    visited: [1, 2, 3, 4, 6, 7],
    message: 'next(): Pop 7. No children. Done!',
  })

  return steps
}

export default function BSTIteratorVisualizer() {
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const steps = useMemo(() => generateSteps(), [])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

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
      title: '🌳 Stack State',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#1e40af' }}>Stack:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {step.stack.length === 0 ? (
                    <span style={{ fontSize: 11, color: '#64748b' }}>empty</span>
                  ) : (
                    step.stack.map((val, i) => (
                      <motion.div
                        key={i}
                        animate={{ x: i === step.stack.length - 1 ? 4 : 0 }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: i === step.stack.length - 1 ? '#0ea5e9' : '#f0f9ff',
                          border: '1px solid #0ea5e9',
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 'bold',
                          color: i === step.stack.length - 1 ? '#fff' : '#1e293b',
                        }}
                      >
                        {val}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#15803d' }}>In-order Sequence:</div>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {(step.visited || []).map((val, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        borderRadius: 3,
                        fontSize: 11,
                        fontWeight: 'bold',
                        color: '#15803d',
                      }}
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom])

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
