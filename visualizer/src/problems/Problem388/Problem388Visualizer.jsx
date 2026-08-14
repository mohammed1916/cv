import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem388Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['complete', 'directory', 'file', 'init', 'parse', 'process', 'update']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'parse',
  6: 'process',
  9: 'file',
  10: 'update',
  12: 'directory',
  13: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def lengthLongestPath(input):' },
  { line: 2, text: '    lines = input.split("\\n")' },
  { line: 3, text: '    path_lengths = {0: 0}' },
  { line: 4, text: '    max_length = 0' },
  { line: 5, text: '    for line in lines:' },
  { line: 6, text: '        depth = len(line) - len(line.lstrip("\\t"))' },
  { line: 7, text: '        name = line.lstrip("\\t")' },
  { line: 8, text: '        if "." in name:  # is file' },
  { line: 9, text: '            length = path_lengths[depth] + len(name)' },
  { line: 10, text: '            max_length = max(max_length, length)' },
  { line: 11, text: '        else:  # is directory' },
  { line: 12, text: '            path_lengths[depth + 1] = path_lengths[depth] + len(name) + 1' },
  { line: 13, text: '    return max_length' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(input) {
  const steps = []
  const lines = input.split('\n')

  steps.push({
    activeLine: 1,
    phase: 'init',
    input,
    lines,
    currentLineIdx: -1,
    pathLengths: { 0: 0 },
    maxLength: 0,
    currentPath: [],
    message: 'Find longest file path in directory structure',
  })

  steps.push({
    activeLine: 2,
    phase: 'parse',
    input,
    lines,
    currentLineIdx: -1,
    pathLengths: { 0: 0 },
    maxLength: 0,
    currentPath: [],
    message: `Split input into ${lines.length} lines`,
  })

  let pathLengths = { 0: 0 }
  let maxLength = 0

  lines.forEach((line, idx) => {
    const depth = line.length - line.replace(/^\t+/, '').length
    const name = line.replace(/^\t+/, '')
    const isFile = name.includes('.')

    steps.push({
      activeLine: 6,
      phase: 'process',
      input,
      lines,
      currentLineIdx: idx,
      pathLengths: { ...pathLengths },
      maxLength,
      currentPath: Array(depth).fill(null).map((_, i) => `level${i}`),
      name,
      depth,
      isFile,
      message: `Line ${idx}: depth=${depth}, name="${name}", isFile=${isFile}`,
    })

    if (isFile) {
      const length = pathLengths[depth] + name.length
      steps.push({
        activeLine: 9,
        phase: 'file',
        input,
        lines,
        currentLineIdx: idx,
        pathLengths: { ...pathLengths },
        maxLength,
        currentPath: Array(depth).fill(null).map((_, i) => `level${i}`),
        name,
        depth,
        isFile: true,
        pathLength: length,
        message: `File "${name}": path length = ${pathLengths[depth]} + ${name.length} = ${length}`,
      })

      if (length > maxLength) {
        maxLength = length
        steps.push({
          activeLine: 10,
          phase: 'update',
          input,
          lines,
          currentLineIdx: idx,
          pathLengths: { ...pathLengths },
          maxLength,
          currentPath: Array(depth).fill(null).map((_, i) => `level${i}`),
          name,
          depth,
          isFile: true,
          pathLength: length,
          message: `Update max: ${maxLength}`,
        })
      }
    } else {
      pathLengths[depth + 1] = pathLengths[depth] + name.length + 1
      steps.push({
        activeLine: 12,
        phase: 'directory',
        input,
        lines,
        currentLineIdx: idx,
        pathLengths: { ...pathLengths },
        maxLength,
        currentPath: Array(depth).fill(null).map((_, i) => `level${i}`),
        name,
        depth,
        isFile: false,
        pathLength: pathLengths[depth + 1],
        message: `Directory "${name}": update path_lengths[${depth + 1}] = ${pathLengths[depth + 1]}`,
      })
    }
  })

  steps.push({
    activeLine: 13,
    phase: 'complete',
    input,
    lines,
    currentLineIdx: -1,
    pathLengths,
    maxLength,
    currentPath: [],
    message: `Complete! Longest path: ${maxLength}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple Dir',
    input: 'dir\n\tfile.txt',
  },
  {
    label: 'Nested',
    input: 'dir1\n\tfile1.txt\ndir2\n\tdir3\n\t\tfile2.txt',
  },
  {
    label: 'Complex',
    input: 'a\n\tb.txt\n\tc.txt\nd\n\te.txt',
  },
]

export default function Problem388Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [inputInput, setInputInput] = useState(EXAMPLES[0]?.input ?? '');
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = inputInput;
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: EXAMPLES[exIdx]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setInputInput(String(EXAMPLES[i].input)); handleReset(); }, [handleReset]);

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
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
      ),
    },
    {
      id: 'viz',
      title: '📁 Path Length Tracker',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Input Structure */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>File Structure</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {step.lines.map((line, idx) => {
                    const depth = line.length - line.replace(/^\t+/, '').length
                    const name = line.replace(/^\t+/, '')
                    return (
                      <motion.div
                        key={`line-${idx}`}
                        animate={{
                          backgroundColor: step.currentLineIdx === idx ? '#fed7aa' : '#f1f5f9',
                          borderColor: step.currentLineIdx === idx ? '#f59e0b' : '#cbd5e1',
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '2px solid',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#334155',
                          marginLeft: depth * 20,
                        }}
                      >
      
                        {name.includes('.') ? '📄' : '📁'} {name}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Current Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>Max Length</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.maxLength}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Depth</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                    {step.depth !== undefined ? step.depth : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Path Lengths Map */}
              {step.phase !== 'init' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Path Lengths</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(step.pathLengths)
                      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                      .map(([depth, length]) => (
                        <motion.div
                          key={`path-${depth}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 4,
                            backgroundColor: '#f0fdf4',
                            border: '2px solid #10b981',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#047857',
                          }}
                        >
                          depth {depth}: {length}
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Current File/Dir Info */}
              {step.isFile !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.isFile ? '#eff6ff' : '#f0fdf4',
                    border: step.isFile ? '2px solid #0284c7' : '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: step.isFile ? '#0c4a6e' : '#166534' }}>
                    {step.isFile ? '📄 File' : '📁 Directory'}: {step.name}
                    {step.isFile && ` (length: ${step.pathLength})`}
                  </div>
                </motion.div>
              )}

              {step.phase === 'update' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    ✓ New max length: {step.maxLength}
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Complete! Longest path: {step.maxLength}
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
          prevDisabled={stepIndex <= 0}
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
