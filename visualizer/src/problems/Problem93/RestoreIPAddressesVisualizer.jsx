import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './RestoreIPAddressesVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def restoreIpAddresses(self, s: str) -> List[str]:' },
  { line: 3, text: '        if len(s) > 12 or len(s) < 4:' },
  { line: 4, text: '            return []' },
  { line: 5, text: '        res = []' },
  { line: 6, text: '        ' },
  { line: 7, text: '        def backtrack(index, dots, ip):' },
  { line: 8, text: '            if dots == 4:' },
  { line: 9, text: '                if index == len(s):' },
  { line: 10, text: '                    res.append(ip[:-1])' },
  { line: 11, text: '                return' },
  { line: 12, text: '            ' },
  { line: 13, text: '            for i in range(index, min(index + 3, len(s))):' },
  { line: 14, text: '                part = s[index:i+1]' },
  { line: 15, text: '                if int(part) <= 255 and (len(part) == 1 or part[0] != "0"):' },
  { line: 16, text: '                    backtrack(i+1, dots+1, ip + part + ".")' },
  { line: 17, text: '        ' },
  { line: 18, text: '        backtrack(0, 0, "")' },
  { line: 19, text: '        return res' },
]

function generateSteps(s) {
  const steps = []
  const res = []
  let stepCounter = 0

  if (!s || s.length < 4 || s.length > 12) {
    steps.push({
      phase: 'invalid_length',
      index: null,
      dots: null,
      ip: '',
      part: '',
      res: [],
      activeLine: 3,
      message: `Invalid input. Length must be between 4 and 12. Current: ${s.length}`
    })
    return steps
  }

  if (!/^\d+$/.test(s)) {
    steps.push({
      phase: 'invalid_chars',
      index: null,
      dots: null,
      ip: '',
      part: '',
      res: [],
      activeLine: 2,
      message: 'Invalid input. String must contain only digits.'
    })
    return steps
  }

  steps.push({
    phase: 'init',
    index: null,
    dots: null,
    ip: '',
    part: '',
    res: [],
    activeLine: 5,
    message: 'Initialize empty results list.'
  })

  steps.push({
    phase: 'start_backtrack',
    index: 0,
    dots: 0,
    ip: '',
    part: '',
    res: [],
    activeLine: 18,
    message: 'Start backtracking: backtrack(0, 0, "")'
  })

  function backtrack(index, dots, ip) {
    // Prevent infinite loops
    if (stepCounter++ > 3000) return

    const currentIp = ip === '' ? '(empty)' : ip

    steps.push({
      phase: 'enter_backtrack',
      index,
      dots,
      ip,
      part: '',
      res: [...res],
      activeLine: 7,
      message: `Enter backtrack: index=${index}, dots=${dots}, ip="${currentIp}"`
    })

    steps.push({
      phase: 'check_dots',
      index,
      dots,
      ip,
      part: '',
      res: [...res],
      activeLine: 8,
      message: `Check if dots == 4: ${dots === 4 ? 'YES' : 'NO'}`
    })

    if (dots === 4) {
      steps.push({
        phase: 'dots_complete',
        index,
        dots,
        ip,
        part: '',
        res: [...res],
        activeLine: 9,
        message: `Dots complete. Check if index == len(s): index=${index}, len=${s.length}`
      })

      if (index === s.length) {
        const validIp = ip.slice(0, -1)
        res.push(validIp)
        steps.push({
          phase: 'valid_ip',
          index,
          dots,
          ip,
          part: '',
          res: [...res],
          activeLine: 10,
          message: `Valid IP found: "${validIp}"`
        })
      } else {
        steps.push({
          phase: 'extra_chars',
          index,
          dots,
          ip,
          part: '',
          res: [...res],
          activeLine: 11,
          message: `Extra characters remaining. Backtrack.`
        })
      }

      steps.push({
        phase: 'return_complete',
        index,
        dots,
        ip,
        part: '',
        res: [...res],
        activeLine: 11,
        message: `Return from backtrack.`
      })
      return
    }

    const limit = Math.min(index + 3, s.length)
    let tried = false

    for (let i = index; i < limit; i++) {
      const part = s.substring(index, i + 1)
      const partValue = parseInt(part, 10)
      const isValid = partValue <= 255 && (part.length === 1 || part[0] !== '0')

      steps.push({
        phase: 'try_part',
        index,
        dots,
        ip,
        part,
        partValue,
        isValid,
        res: [...res],
        activeLine: 13,
        message: `Try part "${part}" (indices ${index}-${i})`
      })

      steps.push({
        phase: 'check_valid',
        index,
        dots,
        ip,
        part,
        partValue,
        isValid,
        res: [...res],
        activeLine: 15,
        message: `Check if valid: value=${partValue} <= 255? ${partValue <= 255}, no leading zero? ${part.length === 1 || part[0] !== '0'} → ${isValid ? 'VALID' : 'INVALID'}`
      })

      if (isValid) {
        tried = true
        const newIp = ip + part + '.'
        steps.push({
          phase: 'recurse',
          index: i + 1,
          dots: dots + 1,
          ip: newIp,
          part,
          res: [...res],
          activeLine: 16,
          message: `Valid! Recurse: backtrack(${i + 1}, ${dots + 1}, "${newIp}")`
        })
        backtrack(i + 1, dots + 1, newIp)
      }
    }

    if (!tried) {
      steps.push({
        phase: 'no_valid_parts',
        index,
        dots,
        ip,
        part: '',
        res: [...res],
        activeLine: 13,
        message: `No valid parts found. Backtrack.`
      })
    }

    steps.push({
      phase: 'backtrack_return',
      index,
      dots,
      ip,
      part: '',
      res: [...res],
      activeLine: 18,
      message: `Return from backtrack(${index}, ${dots})`
    })
  }

  backtrack(0, 0, '')

  steps.push({
    phase: 'done',
    index: null,
    dots: null,
    ip: '',
    part: '',
    res: [...res],
    activeLine: 19,
    message: `Done. Found ${res.length} valid IP address(es).`
  })

  return steps
}

const EXAMPLES = getExamples('restore-ip-addresses') || [
  { label: '101023', s: '101023' },
  { label: '0000', s: '0000' },
  { label: '1111', s: '1111' },
  { label: '25525511135', s: '25525511135' },
]

export default function RestoreIPAddressesVisualizer() {
  const [input, setInput] = useState('25525511135')

  const { s, inputError } = useMemo(() => {
    try {
      if (!input) return { s: '', inputError: 'Input cannot be empty' }
      if (!/^\d+$/.test(input)) return { s: '', inputError: 'Input must contain only digits' }
      if (input.length < 4 || input.length > 12) {
        return { s: '', inputError: `Length must be 4-12 (current: ${input.length})` }
      }
      return { s: input, inputError: '' }
    } catch (e) {
      return { s: '', inputError: e.message || 'Invalid input' }
    }
  }, [input])

  const steps = useMemo(
    () => (s ? generateSteps(s) : [
      {
        phase: 'error',
        index: null,
        dots: null,
        ip: '',
        part: '',
        res: [],
        activeLine: 2,
        message: 'Enter a valid input to begin.',
        relatedLines: [2]
      }
    ]).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInput(ex.s)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dotsDisplay = step?.dots ?? 0
  const ipDisplay = step?.ip === '' ? '(empty)' : step?.ip || ''

  return (
    <div className="restore-ip-shell">
      <ResizableSplitPanels
        className="restore-ip-top-split"
        storageKey="cpviz.split.restoreip.top"
        initialLeftPercent={60}
        minLeftPx={360}
        minRightPx={280}
        left={(
          <div className="restore-ip-panel">
            <div className="restore-ip-panel-head">
              Input
              {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
            </div>
            <div className="restore-ip-panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="restore-ip-example-btn"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleReset() }}
                  placeholder="25525511135"
                  className="restore-ip-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>

              <div className="restore-ip-string-display">
                <div className="restore-ip-string-header">String: {input}</div>
                <div className="restore-ip-string-chars">
                  {input.split('').map((char, idx) => {
                    const isActive = step?.index === idx
                    const isCurrent = step?.index <= idx && idx < step?.index + 3
                    return (
                      <motion.div
                        key={idx}
                        className={`restore-ip-char ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                        animate={isActive ? { y: -5 } : { y: 0 }}
                      >
                        <span className="restore-ip-char-val">{char}</span>
                        <span className="restore-ip-char-idx">{idx}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="restore-ip-state-box">
                <div className="restore-ip-state-row">
                  <span className="label">Index:</span>
                  <span className="value">{step?.index ?? '-'}</span>
                </div>
                <div className="restore-ip-state-row">
                  <span className="label">Dots:</span>
                  <span className="value">{dotsDisplay}/4</span>
                </div>
                <div className="restore-ip-state-row">
                  <span className="label">Current IP:</span>
                  <span className="value">{ipDisplay}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        right={(
          <div className="restore-ip-panel">
            <div className="restore-ip-panel-head">Results</div>
            <div className="restore-ip-panel-body">
              <div className="restore-ip-results-container">
                {step?.res && step.res.length > 0 ? (
                  <>
                    <div className="restore-ip-results-header">
                      Found: {step.res.length}
                    </div>
                    <AnimatePresence>
                      {step.res.map((ip, idx) => (
                        <motion.div
                          key={`${ip}-${idx}`}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="restore-ip-result-item"
                        >
                          {ip}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="restore-ip-empty-results">No IPs found yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      />

      <div className="restore-ip-middle">
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      </div>

      <div className={`restore-ip-status ${step?.phase === 'valid_ip' ? 'success' : step?.phase === 'done' ? (step.res.length > 0 ? 'success' : 'neutral') : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

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
