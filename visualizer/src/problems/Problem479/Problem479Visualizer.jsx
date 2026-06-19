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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem479Visualizer.css'

const EXAMPLES = getExamples('largest-palindrome-product')

function generateSteps(n) {
  const steps = []
  steps.push({ activeLine: 1, n, index: 0, maxPalindrome: 0, i: 0, j: 0, message: `Find largest palindrome product of ${n}-digit numbers` })

  let maxPalindrome = 0, maxI = 0, maxJ = 0
  const start = Math.pow(10, n - 1)
  const end = Math.pow(10, n) - 1

  for (let i = end; i >= start && i >= end - 100; i--) {
    for (let j = end; j >= i && j >= end - 100; j--) {
      const product = i * j
      const str = product.toString()
      const isPalin = str === str.split('').reverse().join('')

      if (isPalin && product > maxPalindrome) {
        maxPalindrome = product
        maxI = i
        maxJ = j
        steps.push({ activeLine: 2, n, index: i, maxPalindrome, i, j, message: `Found palindrome: ${i} × ${j} = ${product}` })
      }
    }
  }

  steps.push({ activeLine: 3, n, index: end, maxPalindrome, i: maxI, j: maxJ, done: true, message: `Largest palindrome product: ${maxPalindrome}` })
  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>Find the largest palindromic number that is a product of two n-digit numbers.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <div style={{ padding: 16, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Digits: {n}</div>
        <div style={{ fontSize: 12, color: '#059669' }}>Range: {Math.pow(10, n-1).toLocaleString()} to {(Math.pow(10, n) - 1).toLocaleString()}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div style={{ padding: 16, backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, marginBottom: 8 }}>First Factor</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#dc2626' }}>{step?.i ?? 0}</div>
        </motion.div>

        <motion.div style={{ padding: 16, backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, marginBottom: 8 }}>Second Factor</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#dc2626' }}>{step?.j ?? 0}</div>
        </motion.div>
      </div>

      <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Product</div>
        <div style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>{step?.maxPalindrome ?? 0}</div>
      </motion.div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem479Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 2 })
  const SOLUTION_CODE = useSolutionCode('largest-palindrome-product')

  const steps = useMemo(() => generateSteps(ex.n).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '🔢 Largest Palindrome Product', content: <VisualizationPanel n={ex.n} step={step} applyEx={applyEx} /> },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
