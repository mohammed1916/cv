import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

// ─── Pattern annotations ───────────────────────────────────────────────────
const PATTERNS = ['init', 'split', 'skip', 'pop', 'push', 'join', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'split',
  3: 'init',
  4: 'skip',
  5: 'skip',
  6: 'pop',
  7: 'pop',
  8: 'push',
  9: 'join',
  10: 'done',
}

const EXAMPLES = [
  { label: 'Example 1', path: '/home//foo/' },
  { label: 'Example 2', path: '/a/./b/../../c/' },
  { label: 'Example 3', path: '/../' },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def simplifyPath(path: str) -> str:' },
  { line: 2, text: '    parts = path.split("/")' },
  { line: 3, text: '    stack = []' },
  { line: 4, text: '    for part in parts:' },
  { line: 5, text: '        if part == "" or part == ".":' },
  { line: 6, text: '            continue' },
  { line: 7, text: '        elif part == "..":' },
  { line: 8, text: '            if stack: stack.pop()' },
  { line: 9, text: '        else:' },
  { line: 10, text: '            stack.append(part)' },
  { line: 11, text: '    return "/" + "/".join(stack)' },
]

function buildPath(stack) {
  return '/' + stack.join('/')
}

function generateSteps(path) {
  const steps = []
  const parts = path.split('/')
  const stack = []

  steps.push({
    activeLine: 2,
    phase: 'split',
    parts: [...parts],
    index: -1,
    stack: [...stack],
    action: 'split',
    built: buildPath(stack),
    message: `Split "${path}" by "/" → [${parts.map((p) => `"${p}"`).join(', ')}].`,
  })

  steps.push({
    activeLine: 3,
    phase: 'init',
    parts: [...parts],
    index: -1,
    stack: [...stack],
    action: 'init',
    built: buildPath(stack),
    message: 'Initialize an empty stack to hold the canonical path components.',
  })

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (part === '' || part === '.') {
      steps.push({
        activeLine: 6,
        phase: 'skip',
        parts: [...parts],
        index: i,
        stack: [...stack],
        action: 'skip',
        built: buildPath(stack),
        message:
          part === ''
            ? `Component is empty (from "//" or a trailing slash) → skip.`
            : `Component is "." (current directory) → skip.`,
      })
    } else if (part === '..') {
      if (stack.length > 0) {
        const popped = stack[stack.length - 1]
        stack.pop()
        steps.push({
          activeLine: 8,
          phase: 'pop',
          parts: [...parts],
          index: i,
          stack: [...stack],
          action: 'pop',
          popped,
          built: buildPath(stack),
          message: `Component is ".." → pop "${popped}" (go up one directory). Stack: [${stack.join(', ')}].`,
        })
      } else {
        steps.push({
          activeLine: 8,
          phase: 'pop',
          parts: [...parts],
          index: i,
          stack: [...stack],
          action: 'pop',
          built: buildPath(stack),
          message: `Component is ".." but stack is empty → stay at root, nothing to pop.`,
        })
      }
    } else {
      stack.push(part)
      steps.push({
        activeLine: 10,
        phase: 'push',
        parts: [...parts],
        index: i,
        stack: [...stack],
        action: 'push',
        pushed: part,
        built: buildPath(stack),
        message: `Component is a directory name → push "${part}". Stack: [${stack.join(', ')}].`,
      })
    }
  }

  const result = buildPath(stack)
  steps.push({
    activeLine: 11,
    phase: 'join',
    parts: [...parts],
    index: parts.length,
    stack: [...stack],
    action: 'join',
    built: result,
    message: `Join the stack with "/" and prepend "/" → "${result}".`,
  })

  steps.push({
    activeLine: 11,
    phase: 'done',
    parts: [...parts],
    index: parts.length,
    stack: [...stack],
    action: 'done',
    built: result,
    done: true,
    message: `Canonical path: "${result}".`,
  })

  return steps
}

const ACTION_COLORS = {
  split: { bg: '#e0f2fe', border: '#0284c7', text: '#075985' },
  init: { bg: '#e0f2fe', border: '#0284c7', text: '#075985' },
  skip: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  pop: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
  push: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
  join: { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6' },
  done: { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6' },
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play (or step forward) to simplify the path.
      </div>
    )
  }

  const { parts = [], index = -1, stack = [], action = 'init', built = '/', popped, pushed } = step
  const color = ACTION_COLORS[action] ?? ACTION_COLORS.init

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      {/* Action badge */}
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          backgroundColor: color.bg,
          border: `2px solid ${color.border}`,
          color: color.text,
        }}
      >
        {action}
        {action === 'pop' && popped != null ? ` "${popped}"` : ''}
        {action === 'push' && pushed != null ? ` "${pushed}"` : ''}
      </div>

      {/* Tokens row */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
          Components (split by "/")
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {parts.map((p, i) => {
            const isCurrent = i === index
            return (
              <motion.div
                key={i}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                style={{
                  padding: '8px 10px',
                  minWidth: 28,
                  textAlign: 'center',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  fontWeight: isCurrent ? 800 : 500,
                  backgroundColor: isCurrent ? color.bg : '#ffffff',
                  border: isCurrent ? `3px solid ${color.border}` : '1px solid #cbd5e1',
                  color: isCurrent ? color.text : '#334155',
                }}
              >
                {p === '' ? '∅' : p}
              </motion.div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#627794', marginTop: 4 }}>∅ = empty component</div>
      </div>

      {/* Stack (vertical column) */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
          Stack {stack.length > 0 ? '(top → bottom)' : '(empty)'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, alignItems: 'flex-start' }}>
          {stack.length === 0 ? (
            <div style={{ fontSize: 13, color: '#627794', fontStyle: 'italic', padding: '8px 0' }}>
              (empty — currently at root "/")
            </div>
          ) : (
            stack.map((item, i) => (
              <motion.div
                key={`${i}-${item}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: '8px 16px',
                  minWidth: 80,
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  backgroundColor: i === stack.length - 1 ? '#dcfce7' : '#f0fdf4',
                  border: i === stack.length - 1 ? '2px solid #16a34a' : '1px solid #86efac',
                  color: '#166534',
                }}
              >
                {item}
                {i === stack.length - 1 && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: '#12873d', fontWeight: 800 }}>← top</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Built path */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
          Result path
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 16,
            fontFamily: 'monospace',
            fontWeight: 800,
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            wordBreak: 'break-all',
          }}
        >
          {built}
        </div>
      </div>

      {/* Message */}
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          fontSize: 13,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#334155',
        }}
      >
        {step.message}
      </div>
    </div>
  )
}

export default function Problem71Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [pathInput, setPathInput] = useState("/home//foo/");
  const { path, inputError } = useMemo(() => {
    try {
      const parsedPath = pathInput;
      return { path: parsedPath, inputError: '' };
    } catch (e) {
      return { path: "/home//foo/", inputError: e.message };
    }
  }, [pathInput]);
  const steps = useMemo(
    () =>
      generateSteps(path).map((c) => ({
        ...c,
        relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
      })),
    [path]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setPathInput(String(e.path)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // ─── Panel extracts ───────────────────────────────────────────────────
  const examplesPanel = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 12px' }}>
      {EXAMPLES.map((e) => (
        <button
          key={e.label}
          className="problem71-button"
          onClick={() => applyEx(e)}
          style={{ fontWeight: ex.label === e.label ? 800 : 500 }}
        >
          {e.label}: {e.path}
        </button>
      ))}
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const vizPanel = <>
    <ManualInputPanel
      fields={[{"key":"path","label":"path","type":"string"}]}
      values={{ path: pathInput }}
      onChange={(k, v) => { if (k === 'path') setPathInput(v); handleReset() }}
      examples={EXAMPLES}
      activeLabel={ex?.label}
      applyExample={applyEx}
      inputError={inputError}
    />
    <VisualizationPanel step={step} />
  </>

  const statusPanel = (
    <div className="problem71-status" style={{ padding: '6px 12px', fontSize: 12, color: '#64748b' }}>
      Step {stepIndex + 1} / {steps.length}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'examples', title: 'Examples', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'viz', title: '📁 Simplify Path', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem71-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.examples && createPortal(examplesPanel, panelDivs.examples)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
