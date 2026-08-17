import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SuperUglyNumberVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { DPTable } from '../../components/shared'
import PointerRail from '../../components/shared/PointerRail'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'candidate', 'advance', 'done']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'candidate',
  7: 'advance',
  9: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def nthSuperUglyNumber(self, n: int, primes: List[int]) -> int:' },
  { line: 3, text: '        ugly, pointers, next_vals = [1], [0] * len(primes), list(primes)' },
  { line: 4, text: '        for _ in range(1, n):' },
  { line: 5, text: '            ugly.append(min(next_vals))' },
  { line: 6, text: '            for p, prime in enumerate(primes):' },
  { line: 7, text: '                while next_vals[p] == ugly[-1]:' },
  { line: 8, text: '                    pointers[p] += 1; next_vals[p] = prime * ugly[pointers[p]]' },
  { line: 9, text: '        return ugly[-1]' },
]

function generateSteps({ n, primes }) {
  const steps = []
  const ugly = [1]; const pointers = Array(primes.length).fill(0); const next = [...primes]
  steps.push({ phase: 'init', activeLine: 2, ugly: [...ugly], pointers: [...pointers], next: [...next], primes, message: 'Start the DP sequence at 1. Each prime points at a multiplier in the sequence.' })
  for (let index = 1; index < n; index += 1) {
    const value = Math.min(...next); ugly.push(value)
    steps.push({ phase: 'candidate', activeLine: 5, ugly: [...ugly], activeIndex: index, pointers: [...pointers], next: [...next], primes, message: `${value} is the smallest available prime multiple, so append it to the DP sequence.` })
    for (let primeIndex = 0; primeIndex < primes.length; primeIndex += 1) {
      if (next[primeIndex] !== value) continue
      while (next[primeIndex] === value) { pointers[primeIndex] += 1; next[primeIndex] = primes[primeIndex] * ugly[pointers[primeIndex]] }
      steps.push({ phase: 'advance', activeLine: 7, ugly: [...ugly], activeIndex: index, pointers: [...pointers], next: [...next], primes, activePrime: primeIndex, message: `Advance prime ${primes[primeIndex]}'s pointer to avoid emitting ${value} again.` })
    }
  }
  steps.push({ phase: 'done', activeLine: 9, ugly, activeIndex: n - 1, pointers, next, primes, message: `The ${n}th super ugly number is ${ugly[n - 1]}.` })
  return steps
}

const EXAMPLES = getExamplesOr('super-ugly-number', [
  { label: '12th with 2, 7, 13, 19', n: 12, primes: [2, 7, 13, 19] },
  { label: '12th with 2, 3, 5', n: 12, primes: [2, 3, 5] },
  { label: 'First number', n: 1, primes: [2, 3, 5] },
])

export default function SuperUglyNumberVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Number.isInteger(data.n) || data.n < 1 || data.n > 24 || !Array.isArray(data.primes) || !data.primes.length || !data.primes.every((prime) => Number.isInteger(prime) && prime > 1)) throw new Error('Use { "n": 12, "primes": [2, 7, 13, 19] }; n must be 1–24 and primes must be integers greater than 1.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input) : []
  }, [input])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'code', title: 'Code', dockMode: 'split-bottom' },
    { id: 'sequence', title: '📈 DP sequence', dockMode: 'split-right' },
    { id: 'candidates', title: 'Prime pointers', dockMode: 'split-bottom' },
  ], [])
  const panelContents = {
    code: (<div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} disableResizer />
      {showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}
    </div>),
    input: (<div className="super-ugly-number-panel"><div className="super-ugly-number-panel-head">n and prime factors</div><div className="super-ugly-number-panel-body">
      <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="super-ugly-number-textarea" placeholder="Enter input..." />
      <div className="super-ugly-number-examples">{EXAMPLES.map((example) => <button key={example.label} className="super-ugly-number-example-btn" onClick={() => applyExample(example)}>{example.label}</button>)}</div>
    </div></div>),
    sequence: (<div className="super-ugly-number-panel super-ugly-number-panel-viz">
      <div className="super-ugly-number-panel-head">DP sequence</div>
      <div className="super-ugly-number-panel-body">
        {!input ? <div className="super-ugly-number-error">{inputError}</div> : <>
          <div className="super-ugly-number-step-info"><h3>{step?.message ?? 'Press Play or Step to begin.'}</h3></div>
          <DPTable title="Ugly-number DP sequence" values={[step?.ugly || [1]]} activeCell={{ row: 0, column: step?.activeIndex ?? -1 }} />
          <PointerRail title="Prime pointers on the DP sequence" values={step?.ugly || [1]} pointers={(step?.primes || input.primes).map((prime, index) => ({ id: `prime-${prime}`, label: `p${prime}`, index: step?.pointers?.[index] ?? 0, tone: step?.activePrime === index ? 'warning' : 'primary' }))} note="Each prime multiplies the ugly number at its pointer." />
        </>}
      </div>
    </div>),
    candidates: (<div className="super-ugly-number-panel super-ugly-number-panel-viz"><div className="super-ugly-number-panel-head">Prime candidates</div><div className="super-ugly-number-panel-body"><div className="super-ugly-number-candidates">{(step?.primes || input?.primes || []).map((prime, index) => <div key={prime} className={step?.activePrime === index ? 'active' : ''}><b>{prime}</b><span>ptr {step?.pointers?.[index] ?? 0}</span><code>next {step?.next?.[index] ?? prime}</code></div>)}</div></div></div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="super-ugly-number-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.input && createPortal(panelContents.input, panelDivs.input)}
            {panelDivs.sequence && createPortal(panelContents.sequence, panelDivs.sequence)}
            {panelDivs.candidates && createPortal(panelContents.candidates, panelDivs.candidates)}
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
