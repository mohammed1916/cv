import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './KokoEatingBananasVisualizer.css'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def minEatingSpeed(piles, h):' },
  { line: 2, text: '    def canFinish(speed):' },
  { line: 3, text: '        hours = sum((p + speed - 1) // speed for p in piles)' },
  { line: 4, text: '        return hours <= h' },
  { line: 5, text: '    left, right = 1, max(piles)' },
  { line: 6, text: '    while left < right:' },
  { line: 7, text: '        mid = (left + right) // 2' },
  { line: 8, text: '        if canFinish(mid):' },
  { line: 9, text: '            right = mid' },
  { line: 10, text: '        else:' },
  { line: 11, text: '            left = mid + 1' },
  { line: 12, text: '    return left' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(piles, h) {
  const steps = []
  let left = 1, right = Math.max(...piles)

  const canFinish = (speed) => {
    let hours = 0
    for (const p of piles) {
      hours += Math.ceil(p / speed)
    }
    return hours <= h
  }

  steps.push({
    activeLine: 5,
    left,
    right,
    piles,
    h,
    message: `Binary search: left=${left}, right=${right}`,
  })

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0)
    const fits = canFinish(mid)

    steps.push({
      activeLine: 7,
      left,
      right,
      mid,
      piles,
      h,
      hours,
      fits,
      message: `Try speed ${mid}: need ${hours} hours (${fits ? '✓ OK' : '✗ Too slow'})`,
    })

    if (fits) {
      right = mid
    } else {
      left = mid + 1
    }

    steps.push({
      activeLine: fits ? 9 : 11,
      left,
      right,
      mid,
      piles,
      h,
      hours,
      fits,
      message: `${fits ? 'Right=mid' : 'Left=mid+1'}: search range now [${left}, ${right}]`,
    })
  }

  steps.push({
    activeLine: 12,
    left,
    right,
    piles,
    h,
    message: `Done! Minimum speed = ${left}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Ex1', piles: [1, 1, 1, 1], h: 4 },
  { label: 'Ex2', piles: [312884132], h: 968709470 },
  { label: 'Ex3', piles: [1, 10, 1, 1], h: 3 },
]

export default function KokoEatingBananasVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [inputText, setInputText] = useState(JSON.stringify({ piles: EXAMPLES[0].piles, h: EXAMPLES[0].h }))
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { ex, inputError } = useMemo(() => { try { const value = JSON.parse(inputText), piles = value.piles, h = Number(value.h); if (!Array.isArray(piles) || !piles.length || piles.some(value => !Number.isInteger(Number(value)) || Number(value) < 1) || !Number.isInteger(h) || h < piles.length) throw new Error('Use {"piles": positive integers, "h": integer at least the pile count}.'); return { ex: { piles: piles.map(Number), h }, inputError: '' } } catch (error) { return { ex: EXAMPLES[0], inputError: error.message } } }, [inputText])
  const steps = useMemo(() => generateSteps(ex.piles, ex.h), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    setInputText(JSON.stringify({ piles: EXAMPLES[idx].piles, h: EXAMPLES[idx].h }))
    handleReset()
  }, [handleReset])

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  )

  const vizPanel = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
                <div style={{ marginTop: 8 }}>
                  h = {ex.h} hours, piles = [{ex.piles.join(', ')}]
                </div>
              </div>

              {step.mid !== undefined && (
                <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: '#1e40af' }}>
                    Speed Test: {step.mid} banana/hour → {step.hours} hours
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11 }}>Range: [{step.left}, {step.right}]</span>
                    <span style={{ padding: '2px 6px', backgroundColor: step.fits ? '#dcfce7' : '#fee2e2', borderRadius: 3, fontSize: 10, fontWeight: 'bold', color: step.fits ? '#15803d' : '#991b1b' }}>
                      {step.fits ? '✓ Fits' : '✗ Too slow'}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6 }}>Search Range Visualization:</div>
                <div style={{ display: 'flex', height: 30, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {Array.from({ length: Math.min(step.right, 20) }, (_, i) => {
                    const isInRange = i >= step.left - 1 && i < step.right
                    const isMid = step.mid !== undefined && i === step.mid - 1
                    return (
                      <motion.div
                        key={i}
                        animate={{ backgroundColor: isMid ? '#0ea5e9' : isInRange ? '#dbeafe' : 'var(--text)' }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}
                      >
                        {i + 1}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: '🍌 Binary Search', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'koko', label: 'Piles and hours (JSON)', type: 'string' }]} values={{ koko: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES.map(example => ({ ...example, input: { piles: example.piles, h: example.h } }))} activeLabel={null} applyExample={(example) => { setInputText(JSON.stringify(example.input)); handleReset() }} inputError={inputError} />, panelDivs.input)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
