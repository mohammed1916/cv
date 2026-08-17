import ManualInputPanel from '../../components/shared/ManualInputPanel'
﻿import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['done', 'error', 'hour_bits', 'init', 'match_found']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  6: 'hour_bits',
  8: 'match_found',
  10: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def readBinaryWatch(n):' },
  { line: 2, text: '    def countBits(num):' },
  { line: 3, text: '        return bin(num).count("1")' },
  { line: 4, text: '    ' },
  { line: 5, text: '    times = []' },
  { line: 6, text: '    for h in range(12):  # Hours: 0-11' },
  { line: 7, text: '        for m in range(60):  # Minutes: 0-59' },
  { line: 8, text: '            if countBits(h) + countBits(m) == n:' },
  { line: 9, text: '                times.append(f"{h}:{m:02d}")' },
  { line: 10, text: '    return times' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nStr) {
  const steps = []

  try {
    const n = Number(nStr)
    if (isNaN(n) || n < 0 || n > 11) throw new Error('n must be between 0 and 11')

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Find all times with exactly ${n} LED(s) lit`,
      n,
      validTimes: [],
      totalChecked: 0,
    })

    const validTimes = []
    let checked = 0

    // Check hours
    const hourBitCounts = {}
    for (let h = 0; h < 12; h++) {
      const bits = h.toString(2).split('').filter(b => b === '1').length
      hourBitCounts[h] = bits
    }

    steps.push({
      phase: 'hour_bits',
      activeLine: 6,
      message: `Hour LED counts: ${Object.entries(hourBitCounts).map(([h, c]) => `${h}:${c}`).join(', ')}`,
      n,
      hourBitCounts,
      validTimes: [],
      totalChecked: 0,
    })

    // Check all hours and minutes
    for (let h = 0; h < 12; h++) {
      const hBits = hourBitCounts[h]

      for (let m = 0; m < 60; m++) {
        const mBits = m.toString(2).split('').filter(b => b === '1').length
        const totalBits = hBits + mBits

        checked++

        if (totalBits === n) {
          const timeStr = `${h}:${m < 10 ? '0' + m : m}`
          validTimes.push(timeStr)

          steps.push({
            phase: 'match_found',
            activeLine: 8,
            message: `Match! ${h}:${m < 10 ? '0' + m : m} → ${h} (${hBits} bits) + ${m} (${mBits} bits) = ${totalBits}`,
            n,
            currentH: h,
            currentM: m,
            hBits,
            mBits,
            validTimes: [...validTimes],
            totalChecked: checked,
          })
        }
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 10,
      message: `Found ${validTimes.length} valid time(s) from ${checked} combinations`,
      n,
      validTimes,
      totalChecked: checked,
    })

  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamplesOr('binary-watch', [
  { label: 'Example 1: n=1', n: '1' },
  { label: 'Example 2: n=0', n: '0' },
  { label: 'Example 3: n=3', n: '3' },
])

export default function Problem401Visualizer() {
  const [nInput, setNInput] = useState('1')

  const { n, inputError } = useMemo(() => {
    try {
      const val = Number(nInput)
      if (isNaN(val) || val < 0 || val > 11) throw new Error('n must be 0-11')
      return { n: val, inputError: '' }
    } catch (e) {
      return { n: 1, inputError: e.message || 'Invalid input' }
    }
  }, [nInput])

  const steps = useMemo(
    () => generateSteps(nInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(ex.n)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const renderBinaryWatch = (hour, minute) => {
    const hourBits = hour.toString(2).padStart(4, '0')
    const minuteBits = minute.toString(2).padStart(6, '0')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {hourBits.split('').map((bit, idx) => (
            <div
              key={`h${idx}`}
              style={{
                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: bit === '1' ? '#10b981' : 'var(--border)',
                color: '#5577a4', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold'
              }}
            >
              {bit}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {minuteBits.split('').map((bit, idx) => (
            <div
              key={`m${idx}`}
              style={{
                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: bit === '1' ? '#10b981' : 'var(--border)',
                color: '#5577a4', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold'
              }}
            >
              {bit}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input', dockMode: 'split-top' },
    { id: 'visualization', title: 'Visualization' },
    { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const inputPanel = <ManualInputPanel fields={[{"key":"n","label":"n","type":"number"}]} values={{ n: nInput }} onChange={(key, value) => { if (key === 'n') setNInput(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={inputError} />
  const visualizationPanel = <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: '12px' }}>
          {step?.currentH !== undefined && step?.currentM !== undefined && (
            <div style={{ backgroundColor: 'var(--surface2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>
                Current Time: {step.currentH}:{step.currentM < 10 ? '0' + step.currentM : step.currentM}
              </div>
              {renderBinaryWatch(step.currentH, step.currentM)}
              {step?.hBits !== undefined && step?.mBits !== undefined && (
                <div style={{ marginTop: '8px', color: '#5a779b', fontSize: '12px' }}>
                  Hour bits: {step.hBits}, Minute bits: {step.mBits}, Total: {step.hBits + step.mBits}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1, backgroundColor: 'var(--surface2)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            <div>
              <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>Valid Times ({step?.validTimes?.length || 0})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '200px', overflow: 'auto' }}>
                {step?.validTimes?.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No valid times yet</div>
                ) : (
                  step?.validTimes?.map((time, idx) => (
                    <motion.div
                      key={time + idx}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      style={{
                        backgroundColor: 'var(--border)', padding: '6px 8px', borderRadius: '4px',
                        color: '#11c589', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px'
                      }}
                    >
                      {time}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {step?.totalChecked !== undefined && (
              <div style={{ backgroundColor: 'var(--border)', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Progress</div>
                <div style={{ color: '#0c865d', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                  {step.totalChecked} / 720 combinations checked
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--surface2)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', backgroundColor: '#10b981',
                    width: `${(step.totalChecked / 720) * 100}%`
                  }} />
                </div>
              </div>
            )}
          </div>
  </div>
  const codePanel = <div style={{ height: '100%', padding: '12px' }}>
                    <div style={{ position: "relative" }}>
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
      <div style={{
        backgroundColor: step?.phase === 'done' ? '#10b98166' : step?.error ? '#ef444466' : 'var(--surface2)',
        padding: '12px', borderRadius: '6px', color: step?.phase === 'done' ? '#86efac' : step?.error ? '#fca5a5' : 'var(--border)',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
  </div>

  return (
    <>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
      {panelDivs && <>
        {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
        {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
        {panelDivs.code && createPortal(codePanel, panelDivs.code)}
      </>}
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
    </>
  )
}
