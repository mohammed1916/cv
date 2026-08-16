import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem427Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('expression-tree-from-tokens')

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('expression-tree-from-tokens', [
  { label: 'Example 1', tokens: ['2', '1', '+', '3', '*'] },
])

const isOp = (t) => t === '+' || t === '-' || t === '*' || t === '/'

function generateSteps(tokens) {
  const steps = []
  let id = 0
  const stack = [] // each entry: { val, _left, _right, id }
  const snap = () => stack.map(n => ({ ...n }))

  steps.push({
    activeLine: 2,
    tokens, idx: -1, stack: [],
    message: 'Initialize an empty stack of subtree nodes',
  })

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    steps.push({
      activeLine: 3,
      tokens, idx: i, stack: snap(),
      message: `Read token "${token}"`,
    })

    const node = { val: token, _left: null, _right: null, id: id++ }
    steps.push({
      activeLine: 4,
      tokens, idx: i, stack: snap(),
      message: `Create node for "${token}"`,
    })

    if (isOp(token)) {
      const right = stack.pop()
      node._right = right
      steps.push({
        activeLine: 6,
        tokens, idx: i, stack: snap(), highlightId: right?.id,
        message: `Operator "${token}": pop right operand (${right?.val})`,
      })
      const left = stack.pop()
      node._left = left
      steps.push({
        activeLine: 7,
        tokens, idx: i, stack: snap(), highlightId: left?.id,
        message: `Pop left operand (${left?.val}) — both become children of "${token}"`,
      })
    }

    stack.push(node)
    steps.push({
      activeLine: 8,
      tokens, idx: i, stack: snap(), highlightId: node.id,
      message: `Push subtree rooted at "${token}" onto the stack`,
    })
  }

  steps.push({
    activeLine: 9,
    tokens, idx: tokens.length, stack: snap(),
    done: true,
    message: 'Return the single remaining node — the expression tree root',
  })

  return steps
}

function TreeNodeView({ node }) {
  if (!node) return null
  const hasChildren = node._left || node._right
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', backgroundColor: isOp(node.val) ? '#fed7aa' : '#fde68a',
        border: '2px solid #ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#7c2d12',
      }}>{node.val}</div>
      {hasChildren && (
        <div style={{ display: 'flex', gap: 16 }}>
          <TreeNodeView node={node._left} />
          <TreeNodeView node={node._right} />
        </div>
      )}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#7c2d12', fontSize: 13 }}>Press play to build the expression tree.</div>
  const { tokens, idx, stack = [] } = step
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#ffedd5', borderRadius: 6, borderLeft: '4px solid #ea580c' }}>
        <div style={{ fontSize: 12, color: '#7c2d12', fontStyle: 'italic' }}>
          Scan postfix tokens: operands push leaf nodes; an operator pops two subtrees as its children, then pushes itself.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tokens.map((t, i) => (
          <div key={i} style={{
            padding: '6px 10px', borderRadius: 4, fontSize: 13, fontWeight: 700,
            backgroundColor: i === idx ? '#ea580c' : '#ffedd5',
            color: i === idx ? '#fff' : '#7c2d12',
            border: '1px solid #fdba74',
          }}>{t}</div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7c2d12', marginBottom: 6 }}>Stack (bottom → top)</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: 60, padding: 8, backgroundColor: '#fff7ed', borderRadius: 6, border: '1px solid #fdba74' }}>
          {stack.length === 0 && <span style={{ fontSize: 12, color: '#6c7686' }}>empty</span>}
          {stack.map((n) => (
            <motion.div key={n.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ border: step.highlightId === n.id ? '2px dashed #ea580c' : 'none', borderRadius: 6, padding: 4 }}>
              <TreeNodeView node={n} />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#ffedd5', borderRadius: 6, border: '2px solid #ea580c', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#ca4c0a' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem427Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [tokensInput, setTokensInput] = useState("[\"2\",\"1\",\"+\",\"3\",\"*\"]");
  const { tokens, inputError } = useMemo(() => {
    try {
      const parsedTokens = JSON.parse(tokensInput); if (!Array.isArray(parsedTokens)) throw new Error('tokens must be an array');
      return { tokens: parsedTokens, inputError: '' };
    } catch (e) {
      return { tokens: "[\"2\",\"1\",\"+\",\"3\",\"*\"]", inputError: e.message };
    }
  }, [tokensInput]);
  const steps = useMemo(
    () => generateSteps(tokens).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [tokens]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setTokensInput(JSON.stringify(e.tokens)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌲 Expression Tree', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel step={step} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"tokens","label":"tokens","type":"array"}]}
          values={{ tokens: tokensInput }}
          onChange={(k, v) => { if (k === 'tokens') setTokensInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
      
    </div>
  )
}
