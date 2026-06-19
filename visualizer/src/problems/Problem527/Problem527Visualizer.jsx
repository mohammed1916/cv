import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem527Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def wordsAbbreviation(words):' },
  { line: 2, text: '    def abbrev(w, k):' },
  { line: 3, text: '        if k >= len(w) - 1: return w' },
  { line: 4, text: '        return w[:k] + str(len(w)-k-1) + w[-1]' },
  { line: 5, text: '    groups = {}' },
  { line: 6, text: '    for i, w in enumerate(words):' },
  { line: 7, text: '        if w not in groups: groups[w] = []' },
  { line: 8, text: '        groups[w].append(i)' },
  { line: 9, text: '    result = [""] * len(words)' },
  { line: 10, text: '    for w, indices in groups.items():' },
  { line: 11, text: '        k = 1' },
  { line: 12, text: '        while len(set(abbrev(w,k) for _ in indices)) < len(indices):' },
  { line: 13, text: '            k += 1' },
  { line: 14, text: '        for idx in indices: result[idx] = abbrev(w, k)' },
  { line: 15, text: '    return result' },
]

function generateSteps(words) {
  const steps = []
  const groups = {}

  steps.push({
    activeLine: 1,
    groups: {},
    message: 'Initialize groups dictionary for grouping identical words.',
  })

  words.forEach((w, i) => {
    if (!(w in groups)) groups[w] = []
    groups[w].push(i)

    steps.push({
      activeLine: 8,
      groups: { ...groups },
      currentWord: w,
      currentIdx: i,
      message: `Group word "${w}" with index ${i}`,
    })
  })

  const result = [''] * words.length

  Object.entries(groups).forEach(([w, indices]) => {
    steps.push({
      activeLine: 10,
      groups: { ...groups },
      currentWord: w,
      currentIndices: indices,
      k: 0,
      message: `Process word group: "${w}" at indices [${indices.join(',')}]`,
    })

    let k = 1
    while (true) {
      const abbrevs = new Set()
      indices.forEach(() => {
        const abbr = k >= w.length - 1 ? w : w.substring(0, k) + (w.length - k - 1) + w[w.length - 1]
        abbrevs.add(abbr)
      })

      steps.push({
        activeLine: 12,
        groups: { ...groups },
        currentWord: w,
        currentIndices: indices,
        k,
        abbreviations: Array.from(abbrevs),
        message: `Try k=${k}: abbreviations = {${Array.from(abbrevs).join(', ')}}`,
      })

      if (abbrevs.size >= indices.length) break
      k++
    }

    const finalAbbr = k >= w.length - 1 ? w : w.substring(0, k) + (w.length - k - 1) + w[w.length - 1]
    indices.forEach((idx) => {
      result[idx] = finalAbbr
    })

    steps.push({
      activeLine: 14,
      groups: { ...groups },
      currentWord: w,
      currentIndices: indices,
      k,
      finalAbbreviation: finalAbbr,
      message: `Final abbreviation for "${w}": "${finalAbbr}"`,
    })
  })

  steps.push({
    activeLine: 15,
    groups: { ...groups },
    result: result.slice(),
    message: `Return result: [${result.join(', ')}]`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', words: ['like', 'god', 'internal', 'me', 'internet'] },
  { label: 'Example 2', words: ['ab', 'a', 'ab', 'a'] },
  { label: 'Example 3', words: ['hello', 'world'] },
]

export default function Problem527Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.words), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '📝 Word Abbreviation',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Input words */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Input Words:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.words.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: step.currentIndices?.includes(i) ? '#dbeafe' : '#f1f5f9',
                            border: `1px solid ${step.currentIndices?.includes(i) ? '#0ea5e9' : '#cbd5e1'}`,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current word and k value */}
                  {step.currentWord && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Current Word</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>
                          {step.currentWord}
                        </div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>K Value</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.k || 0}</div>
                      </div>
                    </div>
                  )}

                  {/* Abbreviations */}
                  {step.abbreviations && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>
                        Generated Abbreviations:
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.abbreviations.map((abbr) => (
                          <span
                            key={abbr}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dcfce7',
                              border: '1px solid #10b981',
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#15803d',
                              fontFamily: 'monospace',
                            }}
                          >
                            {abbr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final result */}
                  {step.result && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Result:</div>
                      <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>
                        {`[${step.result.join(', ')}]`}
                      </div>
                    </div>
                  )}
                </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.words]
  )

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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
