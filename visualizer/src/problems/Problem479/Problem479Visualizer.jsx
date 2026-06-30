import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem479Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = []

const EXAMPLES = getExamples('largest-palindrome-product') || [
  { label: 'Example 1', n: 2 },
]

function generateSteps(n) {
  const steps = []

  steps.push({ activeLine: 1, message: `Find largest palindrome from product of ${n}-digit numbers`, n })

  const start = Math.pow(10, n - 1)
  const end = Math.pow(10, n) - 1

  steps.push({ activeLine: 2, message: `Range: [${start}, ${end}]` })
  steps.push({ activeLine: 3, message: `Initialize maxPalindrome = 0, maxI = 0, maxJ = 0` })

  let maxPalindrome = 0, maxI = 0, maxJ = 0
  let checkCount = 0

  for (let i = end; i >= start && i >= end - 20; i--) {
    steps.push({ activeLine: 4, message: `Outer loop: i=${i}` })

    for (let j = end; j >= i && j >= end - 20; j--) {
      const product = i * j
      steps.push({ activeLine: 5, message: `Calculate: ${i} × ${j} = ${product}`, i, j, product })

      const str = product.toString()
      const reversed = str.split('').reverse().join('')
      const isPalin = str === reversed

      steps.push({ activeLine: 6, message: `Check palindrome: "${str}" === "${reversed}"? ${isPalin}`, str, isPalin })

      if (isPalin) {
        steps.push({ activeLine: 7, message: `✓ Is palindrome!` })

        if (product > maxPalindrome) {
          maxPalindrome = product
          maxI = i
          maxJ = j
          steps.push({ activeLine: 8, message: `✓ New max! ${product} > ${product - 1}`, maxPalindrome, maxI, maxJ })
        } else {
          steps.push({ activeLine: 9, message: `Not larger than current max (${maxPalindrome})` })
        }
      } else {
        steps.push({ activeLine: 10, message: `✗ Not a palindrome` })
      }

      checkCount++
      if (checkCount >= 8) break
    }

    if (checkCount >= 8) break
  }

  steps.push({ activeLine: 11, message: `Search complete`, maxPalindrome })
  steps.push({ activeLine: 12, message: `Largest palindrome: ${maxI} × ${maxJ} = ${maxPalindrome}`, done: true, result: maxPalindrome, maxI, maxJ })
  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Task</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Find the largest number that: (1) is a product of two {n}-digit numbers, (2) is a palindrome (reads same forward/backward)
        </div>
      </div>

      {step?.n && (
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #10b981' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Digit Count</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
            {step.n}-digit numbers
          </div>
        </div>
      )}

      {step?.i !== undefined && step?.j !== undefined && step?.product !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
          <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #0284c7' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#0c4a6e' }}>First Factor</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
              {step.i}
            </div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#cffafe', borderRadius: 6, border: '1px solid #06b6d4' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#0e7490' }}>Second Factor</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#06b6d4', marginTop: 4 }}>
              {step.j}
            </div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Product</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
              {step.product}
            </div>
          </div>
        </div>
      )}

      {step?.str && (
        <div style={{ padding: 12, backgroundColor: step.isPalin ? '#f0fdf4' : '#fee2e2', borderRadius: 6, border: `2px solid ${step.isPalin ? '#10b981' : '#dc2626'}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: step.isPalin ? '#166534' : '#991b1b', marginBottom: 6 }}>
            Palindrome Check
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: step.isPalin ? '#047857' : '#991b1b' }}>
            "{step.str}" {step.isPalin ? '✓ IS' : '✗ NOT'} palindrome
          </div>
        </div>
      )}

      {step?.maxPalindrome !== undefined && step.maxPalindrome > 0 && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Current Maximum</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>
              {step.maxPalindrome}
            </div>
            {step.maxI && step.maxJ && (
              <div style={{ fontSize: 10, color: '#047857' }}>
                = {step.maxI} × {step.maxJ}
              </div>
            )}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', marginBottom: 6 }}>Final Answer</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
            {step.result}
          </div>
          {step.maxI && step.maxJ && (
            <div style={{ fontSize: 11, color: '#6b21a8', marginTop: 6 }}>
              {step.maxI} × {step.maxJ}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def largestPalindrome(n):' },
  { line: 2, text: '    if n==1: return 9' },
  { line: 3, text: '    maxNum=10**n-1' },
  { line: 4, text: '    for i in range(maxNum,0,-1):' },
  { line: 5, text: '        for j in range(maxNum,i-1,-1):' },
  { line: 6, text: '            product=i*j' },
  { line: 7, text: '            s=str(product)' },
  { line: 8, text: '            if s==s[::-1]: return product' },
  { line: 9, text: '            if i*i<product: break' },
  { line: 10, text: '    return -1' },
  { line: 11, text: '' },
  { line: 12, text: '' },
]

export default function Problem479Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(ex.n).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '🔢 Largest Palindrome Product',
      content: <VisualizationPanel n={ex.n} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

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
