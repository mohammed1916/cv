import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem427Visualizer.css'

const EXAMPLES = getExamples('expression-tree-from-tokens')

function generateSteps(tokens) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    tokens,
    stack: [],
    parseIndex: 0,
    treeNodes: [],
    message: `Parse tokens to build expression tree: ${tokens.join(' ')}`,
  })

  let stack = []
  let treeNodes = []
  let parseIndex = 0

  for (let i = 0; i < Math.min(tokens.length, 5); i++) {
    const token = tokens[i]
    stack.push(token)

    steps.push({
      activeLine: 2,
      phase: 'parse_token',
      tokens,
      stack: [...stack],
      parseIndex: i + 1,
      currentToken: token,
      treeNodes: [...treeNodes],
      message: `Process token: "${token}"`,
    })

    if (!/\d/.test(token) && token !== '-') {
      treeNodes.push(`Node(${token})`)
    } else if (/\d/.test(token)) {
      treeNodes.push(`Leaf(${token})`)
    }
  }

  steps.push({
    activeLine: 3,
    phase: 'build_tree',
    tokens,
    stack: [...stack],
    parseIndex: tokens.length,
    treeNodes: [...treeNodes],
    treeComplete: true,
    message: `Expression tree constructed`,
  })

  return steps
}

function TokenListVisualization({ tokens, parseIndex, currentToken }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Token Stream</div>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {tokens.map((token, idx) => {
          const isParsed = idx < parseIndex
          const isCurrent = token === currentToken && idx < parseIndex + 1

          return (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: isCurrent ? '3px solid #0284c7' : isParsed ? '2px solid #10b981' : '2px solid #cbd5e1',
                backgroundColor: isCurrent ? '#dbeafe' : isParsed ? '#ecfdf5' : '#f1f5f9',
                fontSize: 12,
                fontWeight: 600,
                color: isCurrent ? '#0c4a6e' : isParsed ? '#047857' : '#64748b',
                fontFamily: 'monospace',
              }}
              animate={{
                scale: isCurrent ? 1.08 : 1,
              }}
            >
              {token}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function StackVisualization({ stack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Parse Stack</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 6,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        {stack.length > 0 ? (
          stack.map((item, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                backgroundColor: '#8b5cf6',
                color: '#f3e8ff',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {item}
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>empty stack</div>
        )}
      </div>
    </div>
  )
}

function ExpressionTreeVisualization({ treeNodes, treeComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Expression Tree {treeComplete && '✓'}
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 100,
      }}>
        {treeNodes.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {treeNodes.map((node, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: node.startsWith('Leaf') ? '2px solid #10b981' : '2px solid #0284c7',
                  backgroundColor: node.startsWith('Leaf') ? '#ecfdf5' : '#dbeafe',
                  fontSize: 11,
                  fontWeight: 600,
                  color: node.startsWith('Leaf') ? '#047857' : '#0c4a6e',
                  fontFamily: 'monospace',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {node}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>building tree...</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
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
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TokenListVisualization
          tokens={step?.tokens || []}
          parseIndex={step?.parseIndex || 0}
          currentToken={step?.currentToken}
        />

        <StackVisualization stack={step?.stack || []} />

        <ExpressionTreeVisualization
          treeNodes={step?.treeNodes || []}
          treeComplete={step?.treeComplete || false}
        />
      </div>
    </div>
  )
}

export default function Problem427Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { tokens: ['3', '+', '4'], label: 'Simple' })
  const SOLUTION_CODE = useSolutionCode('expression-tree-from-tokens')

  const steps = useMemo(
    () =>
      generateSteps(ex.tokens).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🌳 Expression Tree',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
