import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'
const PATTERNS = ['check_sum', 'dfs_start', 'done', 'exploring', 'impossible', 'init_memo', 'start']
const LINE_PATTERN_MAP = {
  2: 'done',
  3: 'check_sum',
  4: 'impossible',
  5: 'init_memo',
  6: 'dfs_start',
  9: 'exploring',
  17: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def canIWin(maxChoosableInteger, desiredTotal):' },
  { line: 2, text: '    if desiredTotal <= 0: return True' },
  { line: 3, text: '    if (1 + maxChoosableInteger) * maxChoosableInteger / 2 < desiredTotal:' },
  { line: 4, text: '        return False' },
  { line: 5, text: '    memo = {}' },
  { line: 6, text: '    def dfs(available, current_sum):' },
  { line: 7, text: '        if current_sum >= desiredTotal: return False' },
  { line: 8, text: '        if available in memo: return memo[available]' },
  { line: 9, text: '        for i in range(1, maxChoosableInteger + 1):' },
  { line: 10, text: '            if available & (1 << (i-1)):' },
  { line: 11, text: '                if not dfs(available ^ (1 << (i-1)), current_sum + i):' },
  { line: 12, text: '                    memo[available] = True' },
  { line: 13, text: '                    return True' },
  { line: 14, text: '        memo[available] = False' },
  { line: 15, text: '        return False' },
  { line: 16, text: '    all_available = (1 << maxChoosableInteger) - 1' },
  { line: 17, text: '    return dfs(all_available, 0)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('can-i-win', [
  { label: 'Example 1', maxChoosable: 10, desiredTotal: 40, expected: true },
  { label: 'Example 2', maxChoosable: 10, desiredTotal: 1, expected: true },
  { label: 'Example 3', maxChoosable: 4, desiredTotal: 6, expected: true },
])

const SNIPPETS = [
  { id: 'check', label: 'Check Cases', lines: [2, 3, 4] },
  { id: 'init', label: 'Initialize', lines: [5, 6] },
  { id: 'dfs', label: 'DFS Logic', lines: [7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 'return', label: 'Return', lines: [16, 17] },
]

function generateSteps(maxChoosable, desiredTotal) {
  const steps = []

  if (maxChoosable <= 0 || desiredTotal <= 0) {
    return [{
      phase: 'done',
      activeLine: 2,
      maxChoosable,
      desiredTotal,
      canWin: desiredTotal <= 0,
      stepNum: 0,
      message: 'Invalid inputs.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    maxChoosable,
    desiredTotal,
    stepNum: 0,
    message: `Can first player reach ${desiredTotal} with numbers 1-${maxChoosable}?`,
  })

  const maxSum = (1 + maxChoosable) * maxChoosable / 2

  steps.push({
    phase: 'check_sum',
    activeLine: 3,
    maxChoosable,
    desiredTotal,
    maxSum,
    stepNum: 1,
    message: `Max possible sum: ${maxSum} (need ${desiredTotal})`,
  })

  if (maxSum < desiredTotal) {
    steps.push({
      phase: 'impossible',
      activeLine: 4,
      maxChoosable,
      desiredTotal,
      canWin: false,
      stepNum: 2,
      message: `Impossible to reach. Return False.`,
    })

    return steps
  }

  steps.push({
    phase: 'init_memo',
    activeLine: 5,
    maxChoosable,
    desiredTotal,
    stepNum: 2,
    message: `Using memoization for state caching`,
  })

  let stepNum = 3
  let trace = []

  function simulateDFS(available, currentSum, depth = 0) {
    if (trace.length > 10) return

    const bin = available.toString(2).padStart(maxChoosable, '0')

    trace.push({
      available,
      currentSum,
      depth,
      bin,
    })

    if (currentSum >= desiredTotal) {
      return false
    }

    for (let i = 1; i <= Math.min(maxChoosable, 3); i++) {
      if (available & (1 << (i - 1))) {
        const newAvailable = available ^ (1 << (i - 1))
        const result = simulateDFS(newAvailable, currentSum + i, depth + 1)
        if (!result) {
          return true
        }
      }
    }

    return false
  }

  const allAvailable = (1 << maxChoosable) - 1
  const canWinResult = simulateDFS(allAvailable, 0)

  steps.push({
    phase: 'dfs_start',
    activeLine: 6,
    maxChoosable,
    desiredTotal,
    trace,
    stepNum,
    message: `Starting game tree exploration`,
  })
  stepNum++

  for (let idx = 0; idx < Math.min(trace.length, 5); idx++) {
    const t = trace[idx]
    steps.push({
      phase: 'exploring',
      activeLine: 9,
      maxChoosable,
      desiredTotal,
      currentState: t,
      stepNum,
      message: `Exploring state: sum=${t.currentSum}, available=${t.bin}`,
    })
    stepNum++
  }

  steps.push({
    phase: 'done',
    activeLine: 17,
    maxChoosable,
    desiredTotal,
    canWin: canWinResult,
    stepNum,
    message: canWinResult ? `First player wins!` : `First player loses.`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'check_sum' || phase === 'impossible') return 'check'
  if (phase === 'init_memo') return 'init'
  if (phase === 'dfs_start' || phase === 'exploring') return 'dfs'
  if (phase === 'done') return 'return'
  return 'check'
}

function GameTreeVisualization({ step }) {
  const maxChoosable = step?.maxChoosable ?? 0
  const desiredTotal = step?.desiredTotal ?? 0
  const currentState = step?.currentState
  const canWin = step?.canWin ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 4,
          border: '2px solid #3b82f6',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>
            Max Number
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>
            {maxChoosable}
          </div>
        </div>

        <div style={{
          padding: 12,
          backgroundColor: '#fecdd3',
          borderRadius: 4,
          border: '2px solid #f87171',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
            Desired Total
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
            {desiredTotal}
          </div>
        </div>
      </div>

      {currentState && (
        <div style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 4,
          border: '2px solid #fcd34d',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
            Current State
          </div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#92400e', marginBottom: 4 }}>
            Sum: {currentState.currentSum} | Available: {currentState.bin}
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {currentState.bin.split('').map((bit, idx) => (
              <div
                key={idx}
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bit === '1' ? '#10b981' : '#f3f4f6',
                  border: `1px solid ${bit === '1' ? '#059669' : '#d1d5db'}`,
                  borderRadius: 3,
                  fontSize: 10,
                  fontWeight: 600,
                  color: bit === '1' ? '#fff' : '#9ca3af',
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div
        animate={{ scale: 1 }}
        style={{
          padding: 16,
          backgroundColor: canWin ? '#d1fae5' : '#fecdd3',
          borderRadius: 4,
          border: `2px solid ${canWin ? '#10b981' : '#f87171'}`,
          textAlign: 'center',
        }}
      >
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: canWin ? '#047857' : '#dc2626',
          marginBottom: 4,
        }}>
          First Player
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: canWin ? '#047857' : '#dc2626',
        }}>
          {canWin ? 'WINS' : 'LOSES'}
        </div>
      </motion.div>
    </div>
  )
}

function VisualizationPanel({ step, maxChoosable, desiredTotal, EXAMPLES, handleExampleClick, maxChoosableInput, desiredTotalInput, setMaxChoosableInput, setDesiredTotalInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface2)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Max Choosable Integer
          </label>
          <input
            value={maxChoosableInput}
            onChange={(e) => { setMaxChoosableInput(e.target.value); handleReset() }}
            placeholder="e.g., 10"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Desired Total
          </label>
          <input
            value={desiredTotalInput}
            onChange={(e) => { setDesiredTotalInput(e.target.value); handleReset() }}
            placeholder="e.g., 40"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: 'var(--primary-glow)',
          color: 'var(--text)',
          border: '1px solid var(--primary)',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <GameTreeVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Game Theory
        </div>
        <div style={{ fontSize: 12, color: '#178740', lineHeight: 1.4 }}>
          Minimax with memoization. Find if first player can force a win via optimal play.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem464Visualizer() {
  const [maxChoosableInput, setMaxChoosableInput] = useState('10')
  const [desiredTotalInput, setDesiredTotalInput] = useState('40')

  const { maxChoosable, desiredTotal } = useMemo(() => {
    const m = parseInt(maxChoosableInput.trim())
    const d = parseInt(desiredTotalInput.trim())

    return {
      maxChoosable: isNaN(m) || m <= 0 ? 1 : Math.min(m, 20),
      desiredTotal: isNaN(d) || d <= 0 ? 1 : d,
    }
  }, [maxChoosableInput, desiredTotalInput])

  const steps = useMemo(
    () => generateSteps(maxChoosable, desiredTotal).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [maxChoosable, desiredTotal],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setMaxChoosableInput(String(ex.maxChoosable))
    setDesiredTotalInput(String(ex.desiredTotal))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />),
    viz: (<VisualizationPanel
          step={step}
          maxChoosable={maxChoosable}
          desiredTotal={desiredTotal}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          maxChoosableInput={maxChoosableInput}
          desiredTotalInput={desiredTotalInput}
          setMaxChoosableInput={setMaxChoosableInput}
          setDesiredTotalInput={setDesiredTotalInput}
          handleReset={handleReset}
        />),
  }), [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    maxChoosable,
    desiredTotal,
    maxChoosableInput,
    desiredTotalInput,
    autoScrollCode,
    handleReset,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"maxChoosable","label":"maxChoosable","type":"string"},{"key":"desiredTotal","label":"desiredTotal","type":"string"}]}
        values={{ maxChoosable: maxChoosableInput, desiredTotal: desiredTotalInput }}
        onChange={(k, v) => { if (k === 'maxChoosable') setMaxChoosableInput(v); if (k === 'desiredTotal') setDesiredTotalInput(v); handleReset() }}
        showExamples={false}
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
        <div style={{ marginBottom: '12px', fontSize: 12, color: 'var(--text-muted)' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
