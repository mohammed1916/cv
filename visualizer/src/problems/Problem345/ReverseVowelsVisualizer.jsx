import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './ReverseVowelsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'move_left', 'move_right', 'found', 'swap', 'advance', 'done']

const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'init',
  5: 'move_left',
  6: 'move_left',
  7: 'move_right',
  8: 'move_right',
  9: 'swap',
  10: 'advance',
  11: 'advance',
  12: 'done',
}

const EXAMPLES = [
  { label: 'Example 1', s: 'leetcode' },
  { label: 'Example 2', s: 'IceCreAm' },
  { label: 'hello', s: 'hello' },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def reverseVowels(s: str) -> str:' },
  { line: 2, text: '    s = list(s); vowels = set("aeiouAEIOU")' },
  { line: 3, text: '    left, right = 0, len(s) - 1' },
  { line: 4, text: '    while left < right:' },
  { line: 5, text: '        while left < right and s[left] not in vowels:' },
  { line: 6, text: '            left += 1' },
  { line: 7, text: '        while left < right and s[right] not in vowels:' },
  { line: 8, text: '            right -= 1' },
  { line: 9, text: '        s[left], s[right] = s[right], s[left]' },
  { line: 10, text: '        left += 1' },
  { line: 11, text: '        right -= 1' },
  { line: 12, text: '    return "".join(s)' },
]

const VOWELS = new Set('aeiouAEIOU')

function generateSteps(input) {
  const chars = (input ?? '').split('')
  const steps = []
  const vowelPos = new Set(chars.map((c, i) => (VOWELS.has(c) ? i : -1)).filter((i) => i >= 0))

  steps.push({
    phase: 'init',
    activeLine: 3,
    chars: [...chars],
    left: 0,
    right: chars.length - 1,
    vowelPos: new Set(vowelPos),
    swapped: new Set(),
    message: `Initialize two pointers: left=0, right=${chars.length - 1}`,
  })

  let left = 0
  let right = chars.length - 1
  const swapped = new Set()

  while (left < right) {
    // Advance left until it lands on a vowel.
    while (left < right && !VOWELS.has(chars[left])) {
      steps.push({
        phase: 'move_left',
        activeLine: 5,
        chars: [...chars],
        left,
        right,
        vowelPos: new Set(vowelPos),
        swapped: new Set(swapped),
        message: `left=${left}: '${chars[left]}' is not a vowel, advance left`,
      })
      left++
    }

    // Move right back until it lands on a vowel.
    while (left < right && !VOWELS.has(chars[right])) {
      steps.push({
        phase: 'move_right',
        activeLine: 7,
        chars: [...chars],
        left,
        right,
        vowelPos: new Set(vowelPos),
        swapped: new Set(swapped),
        message: `right=${right}: '${chars[right]}' is not a vowel, move right back`,
      })
      right--
    }

    if (left < right) {
      steps.push({
        phase: 'found',
        activeLine: 9,
        chars: [...chars],
        left,
        right,
        pair: [left, right],
        vowelPos: new Set(vowelPos),
        swapped: new Set(swapped),
        message: `Both vowels found: left='${chars[left]}' @${left}, right='${chars[right]}' @${right}`,
      })

      // Swap the two vowels.
      const tmp = chars[left]
      chars[left] = chars[right]
      chars[right] = tmp
      swapped.add(left)
      swapped.add(right)

      steps.push({
        phase: 'swap',
        activeLine: 9,
        chars: [...chars],
        left,
        right,
        pair: [left, right],
        vowelPos: new Set(vowelPos),
        swapped: new Set(swapped),
        message: `Swap vowels: s[${left}] ↔ s[${right}] → '${chars[left]}' ↔ '${chars[right]}'`,
      })

      left++
      right--

      steps.push({
        phase: 'advance',
        activeLine: 10,
        chars: [...chars],
        left,
        right,
        vowelPos: new Set(vowelPos),
        swapped: new Set(swapped),
        message: `Advance both pointers: left=${left}, right=${right}`,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 12,
    chars: [...chars],
    left: -1,
    right: -1,
    vowelPos: new Set(vowelPos),
    swapped: new Set(swapped),
    message: `Done: "${chars.join('')}"`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#7f849c', fontSize: 13 }}>
        Press play to reverse the vowels with two pointers.
      </div>
    )
  }

  const { chars = [], left, right, vowelPos = new Set(), swapped = new Set(), pair } = step
  const pairSet = new Set(pair ?? [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#1e3a8a', fontStyle: 'italic' }}>
          Two pointers scan inward: advance <strong>left</strong> to the next vowel, move <strong>right</strong> back to
          the previous vowel, then swap the pair.
        </div>
      </div>

      {/* Character cells */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '28px 8px' }}>
        {chars.map((ch, idx) => {
          const isVowel = vowelPos.has(idx)
          const isLeft = idx === left
          const isRight = idx === right
          const isSwapped = swapped.has(idx)
          const inPair = pairSet.has(idx)

          let bg = '#313244'
          let color = '#cdd6f4'
          if (isSwapped) {
            bg = '#a6e3a1'
            color = '#11111b'
          } else if (isVowel) {
            bg = '#89b4fa'
            color = '#11111b'
          }

          let border = '2px solid #45475a'
          if (isLeft) border = '3px solid #f38ba8'
          else if (isRight) border = '3px solid #fab387'
          else if (isVowel) border = '2px solid #74c7ec'

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 44 }}>
              {/* Pointer markers */}
              <div style={{ height: 18, fontSize: 12, fontWeight: 800 }}>
                {isLeft && <span style={{ color: '#f38ba8' }}>L{isRight ? '/R' : ''}</span>}
                {!isLeft && isRight && <span style={{ color: '#fab387' }}>R</span>}
              </div>
              <motion.div
                layout
                animate={{ scale: inPair ? 1.12 : 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: bg,
                  color,
                  border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.div>
              <div style={{ fontSize: 11, color: '#7f849c' }}>{idx}</div>
            </div>
          )
        })}
      </div>

      {/* Pointer status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fde8ec', borderRadius: 6, border: '1px solid #f38ba8', fontSize: 13 }}>
          <span style={{ color: '#9d1f3a', fontWeight: 700 }}>left</span> = {left >= 0 ? left : '—'}
        </div>
        <div style={{ padding: 10, backgroundColor: '#fdece0', borderRadius: 6, border: '1px solid #fab387', fontSize: 13 }}>
          <span style={{ color: '#9a5518', fontWeight: 700 }}>right</span> = {right >= 0 ? right : '—'}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#4c4f69' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: '#89b4fa', display: 'inline-block' }} /> Vowel
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: '#313244', display: 'inline-block' }} /> Consonant
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: '#a6e3a1', display: 'inline-block' }} /> Swapped
        </span>
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 6, border: '2px solid #3b82f6', textAlign: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function ReverseVowelsVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("leetcode");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "leetcode", inputError: e.message };
    }
  }, [sInput]);
  const steps = useMemo(
    () => generateSteps(s).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [s]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔤 Reverse Vowels', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
        </div>),
    viz: (<VisualizationPanel step={step} />),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"}]}
          values={{ s: sInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 12px' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: ex.label === e.label ? '2px solid #3b82f6' : '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: ex.label === e.label ? '#eff6ff' : '#f1f5f9',
              color: '#1e293b',
            }}
          >
            {e.label}: "{e.s}"
          </button>
        ))}
      </div>
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
