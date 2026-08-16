import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './VerifyPreorderSerializationofaBinaryTreeVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def isValidSerialization(preorder):' },
  { line: 2, text: '    nodes = preorder.split(",")' },
  { line: 3, text: '    slots = 1              # one open slot for the root' },
  { line: 4, text: '    for node in nodes:' },
  { line: 5, text: '        slots -= 1        # this node consumes a slot' },
  { line: 6, text: '        if slots < 0:' },
  { line: 7, text: '            return False  # no slot available -> invalid' },
  { line: 8, text: '        if node != "#":' },
  { line: 9, text: '            slots += 2    # a real node opens 2 child slots' },
  { line: 10, text: '    return slots == 0     # valid iff every slot is filled' },
]

// Colors (dark theme)
const C = {
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-muted)',
  accent: '#38bdf8',
  valid: '#22c55e',
  invalid: '#f87171',
  amber: '#f59e0b',
  surface: 'var(--code-bg)',
  box: 'var(--surface2)',
  border: 'var(--border)',
}

// Parse a comma-separated preorder string into tokens, guarding bad input.
function parsePreorder(input) {
  const raw = String(input ?? '').trim().replace(/^"|"$/g, '').trim()
  if (!raw) {
    return { tokens: [], error: 'Enter a comma-separated preorder string, e.g. 9,3,4,#,#,1,#,#,2,#,6,#,#' }
  }
  const parts = raw.split(',').map((t) => t.trim())
  const tokens = []
  for (const p of parts) {
    if (p === '') return { tokens: [], error: 'Empty token found — check for stray or trailing commas.' }
    if (p === '#') { tokens.push('#'); continue }
    if (!/^-?\d+$/.test(p)) return { tokens: [], error: `Invalid token "${p}" — use integers or "#".` }
    tokens.push(p)
  }
  return { tokens, error: '' }
}

function exampleToString(example) {
  if (!example) return ''
  if (typeof example === 'string') return example
  if (typeof example.preorder === 'string') return example.preorder
  const inp = example.inputs ?? example
  if (typeof inp === 'string') return inp
  if (inp && typeof inp.preorder === 'string') return inp.preorder
  if (inp && typeof inp === 'object') {
    const v = Object.values(inp).find((x) => typeof x === 'string')
    if (v) return v
  }
  return ''
}

function generateSteps(preorder) {
  const { tokens, error } = parsePreorder(preorder)
  if (error || tokens.length === 0) return []

  const steps = []
  let slots = 1

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [1, 2, 3],
    message: `Split into ${tokens.length} token${tokens.length === 1 ? '' : 's'}. Start with slots = 1 (one open slot for the root).`,
    tokens,
    tokenIndex: -1,
    slots,
    valid: null,
  })

  let invalid = false
  let failIndex = tokens.length - 1

  for (let i = 0; i < tokens.length; i++) {
    const node = tokens[i]
    slots -= 1
    steps.push({
      phase: 'consume',
      activeLine: 5,
      relatedLines: [4, 5, 6],
      message: `Read token "${node}" — it fills one open slot: slots = ${slots}.`,
      tokens,
      tokenIndex: i,
      slots,
      valid: null,
    })

    if (slots < 0) {
      invalid = true
      failIndex = i
      steps.push({
        phase: 'invalid',
        activeLine: 7,
        relatedLines: [6, 7],
        message: `slots < 0 — token "${node}" has no parent slot to fill. Return False.`,
        tokens,
        tokenIndex: i,
        slots,
        valid: false,
      })
      break
    }

    if (node === '#') {
      steps.push({
        phase: 'null',
        activeLine: 8,
        relatedLines: [6, 8],
        message: `"#" is a null child — it opens no new slots. slots stays at ${slots}.`,
        tokens,
        tokenIndex: i,
        slots,
        valid: null,
      })
    } else {
      slots += 2
      steps.push({
        phase: 'node',
        activeLine: 9,
        relatedLines: [8, 9],
        message: `Node "${node}" opens 2 child slots (left + right): slots = ${slots}.`,
        tokens,
        tokenIndex: i,
        slots,
        valid: null,
      })
    }
  }

  const finalValid = !invalid && slots === 0
  steps.push({
    phase: 'done',
    activeLine: 10,
    relatedLines: [10],
    message: invalid
      ? 'INVALID — the tree ran out of open slots before all tokens were placed.'
      : finalValid
        ? 'VALID — every token was processed and slots == 0. This is a well-formed preorder.'
        : `INVALID — all tokens processed but slots = ${slots} ≠ 0 (unfilled slots remain).`,
    tokens,
    tokenIndex: invalid ? failIndex : tokens.length - 1,
    slots,
    valid: finalValid,
  })

  return steps
}

const REGISTRY_EXAMPLES = getExamplesOr('verify-preorder-serialization-tree', [])
const FALLBACK_EXAMPLES = [
  { label: 'Valid tree', preorder: '9,3,4,#,#,1,#,#,2,#,6,#,#' },
  { label: 'Single node', preorder: '1,#,#' },
  { label: 'Only null', preorder: '#' },
  { label: 'Invalid (extra node)', preorder: '9,#,#,1' },
  { label: 'Invalid (incomplete)', preorder: '1,#' },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : FALLBACK_EXAMPLES

const MAX_SLOT_BOXES = 16

export default function VerifyPreorderSerializationofaBinaryTreeVisualizer() {
  const [inputValue, setInputValue] = useState(exampleToString(EXAMPLES[0]) || '9,3,4,#,#,1,#,#,2,#,6,#,#')

  const parsed = useMemo(() => parsePreorder(inputValue), [inputValue])
  const inputError = parsed.error

  const steps = useMemo(() => generateSteps(inputValue), [inputValue])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  // Derived view state
  const vizTokens = step?.tokens ?? parsed.tokens
  const activeIndex = step?.tokenIndex ?? -1
  const slotCount = step ? step.slots : 1
  const phase = step?.phase ?? null
  const validity = step?.valid ?? null

  const isInvalidActive = phase === 'invalid'
  const shownSlots = Math.max(0, Math.min(slotCount, MAX_SLOT_BOXES))

  function tokenStyle(i) {
    const isActive = i === activeIndex
    const isPast = activeIndex >= 0 && i < activeIndex
    const isNull = vizTokens[i] === '#'
    let border = C.border
    let bg = C.box
    let color
    if (isActive) {
      if (isInvalidActive) { border = C.invalid; bg = 'rgba(248,113,113,0.15)'; color = C.invalid }
      else { border = C.accent; bg = 'rgba(56,189,248,0.15)'; color = isNull ? C.amber : C.text }
    } else if (isPast) {
      color = isNull ? 'rgba(245,158,11,0.6)' : C.dim
    } else {
      color = isNull ? 'rgba(245,158,11,0.8)' : C.muted
    }
    return {
      padding: '10px 14px',
      minWidth: 30,
      textAlign: 'center',
      borderRadius: 8,
      border: `2px solid ${border}`,
      background: bg,
      color,
      fontFamily: 'monospace',
      fontSize: 16,
      fontWeight: 700,
      opacity: isPast && !isActive ? 0.65 : 1,
    }
  }

  return (
    <div className="verify-preorder-serializationofa-binary-tree-shell">
      <div className="verify-preorder-serializationofa-binary-tree-panel">
        <div className="verify-preorder-serializationofa-binary-tree-panel-head">Preorder Input</div>
        <div className="verify-preorder-serializationofa-binary-tree-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="verify-preorder-serializationofa-binary-tree-textarea"
            placeholder="e.g. 9,3,4,#,#,1,#,#,2,#,6,#,#"
            spellCheck={false}
          />
          {inputError && <div className="verify-preorder-serializationofa-binary-tree-error">{inputError}</div>}
        </div>
      </div>

      <div className="verify-preorder-serializationofa-binary-tree-panel">
        <div className="verify-preorder-serializationofa-binary-tree-panel-head">Visualization — Slots Method</div>
        <div className="verify-preorder-serializationofa-binary-tree-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="verify-preorder-serializationofa-binary-tree-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="verify-preorder-serializationofa-binary-tree-step-info">
                <h3>{step?.message || 'Press play (or Next) to trace the slots algorithm.'}</h3>
              </div>

              {vizTokens.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 13 }}>
                  Provide a valid preorder string to visualize.
                </div>
              ) : (
                <>
                  {/* Token sequence */}
                  <div>
                    <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Token sequence
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {vizTokens.map((t, i) => (
                        <motion.div
                          key={i}
                          style={tokenStyle(i)}
                          animate={{ scale: i === activeIndex ? 1.1 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {t}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Slots counter */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: C.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Open slots
                      </span>
                      <span style={{ color: slotCount < 0 ? C.invalid : C.accent, fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>
                        slots = {slotCount}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 34, alignItems: 'center' }}>
                      {shownSlots === 0 ? (
                        <span style={{ color: slotCount < 0 ? C.invalid : C.dim, fontSize: 13, fontFamily: 'monospace' }}>
                          {slotCount < 0 ? '(negative — no slot to fill!)' : '(no open slots)'}
                        </span>
                      ) : (
                        Array.from({ length: shownSlots }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              border: `2px dashed ${C.accent}`,
                              background: 'rgba(56,189,248,0.12)',
                            }}
                          />
                        ))
                      )}
                      {slotCount > MAX_SLOT_BOXES && (
                        <span style={{ color: C.muted, fontSize: 13, fontFamily: 'monospace' }}>
                          +{slotCount - MAX_SLOT_BOXES} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verdict */}
                  {validity !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 10,
                        fontSize: 18,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        color: validity ? C.valid : C.invalid,
                        background: validity ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)',
                        border: `2px solid ${validity ? C.valid : C.invalid}`,
                      }}
                    >
                      {validity ? '✓ VALID preorder serialization' : '✗ INVALID preorder serialization'}
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="verify-preorder-serializationofa-binary-tree-panel">
        <div className="verify-preorder-serializationofa-binary-tree-panel-head">Code</div>
        <div className="verify-preorder-serializationofa-binary-tree-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="verify-preorder-serializationofa-binary-tree-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="verify-preorder-serializationofa-binary-tree-example-btn"
              onClick={() => { setInputValue(exampleToString(example)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}

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
        />
      </FloatingPanel>
    </div>
  )
}
