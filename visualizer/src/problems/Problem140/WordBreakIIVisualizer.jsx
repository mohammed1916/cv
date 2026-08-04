import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './WordBreakIIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('word-break-ii', [
  { label: 'Example 1', s: 'catsandcatsdog', wordDict: ['cat', 'cats', 'and', 'sand', 'dog'] },
  { label: 'Example 2', s: 'pineapplepenapple', wordDict: ['apple', 'pen', 'applepen', 'pine', 'pineapple'] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def wordBreak(s, wordDict):' },
  { line: 2, text: '    memo = {}' },
  { line: 3, text: '    def dfs(start):' },
  { line: 4, text: '        if start == len(s): return [""]' },
  { line: 5, text: '        if start in memo: return memo[start]' },
  { line: 6, text: '        result = []' },
  { line: 7, text: '        for word in wordDict:' },
  { line: 8, text: '            if s[start:].startswith(word):' },
  { line: 9, text: '                rest = dfs(start + len(word))' },
  { line: 10, text: '                for r in rest:' },
  { line: 11, text: '                    result.append(word + " " + r)' },
  { line: 12, text: '        memo[start] = result' },
  { line: 13, text: '        return result' },
  { line: 14, text: '    return [r.strip() for r in dfs(0)]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s, wordDict) {
  const steps = []

  if (!s || !wordDict || wordDict.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty string or word dict',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Find all word break combinations: "${s}"`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: 'Initialize memoization cache',
    relatedLines: [2],
  })

  const memo = {}
  const allResults = []

  const dfs = (start, path = []) => {
    const key = start

    if (start === s.length) {
      steps.push({
        activeLine: 4,
        currentPath: path,
        message: `✓ Complete: ${path.join(' ')}`,
        relatedLines: [4],
      })
      allResults.push([...path])
      return [[]]
    }

    if (memo[key]) {
      steps.push({
        activeLine: 5,
        currentIndex: start,
        currentPath: path,
        message: `Cache hit at index ${start}: returning memoized results`,
        relatedLines: [5],
      })
      return memo[key]
    }

    const result = []

    steps.push({
      activeLine: 7,
      currentIndex: start,
      currentPath: path,
      substring: s.substring(start),
      message: `Try words from position ${start}: "${s.substring(start)}"`,
      relatedLines: [7],
    })

    for (const word of wordDict) {
      if (s.substring(start).startsWith(word)) {
        steps.push({
          activeLine: 8,
          currentIndex: start,
          currentPath: path,
          word,
          message: `Match found: "${word}" at index ${start}`,
          relatedLines: [8],
        })

        const rest = dfs(start + word.length, [...path, word])

        for (const r of rest) {
          const combined = [...path, word, ...r]
          if (combined.length > 0) {
            result.push(combined)
          }
        }
      }
    }

    memo[key] = result

    steps.push({
      activeLine: 12,
      currentIndex: start,
      currentPath: path,
      memoSize: Object.keys(memo).length,
      message: `Memoized index ${start}: ${result.length} result(s)`,
      relatedLines: [12],
    })

    return result
  }

  dfs(0)

  steps.push({
    activeLine: 14,
    allResults,
    done: true,
    message: `Complete! Found ${allResults.length} word break combination(s).`,
    relatedLines: [14],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          DFS with memoization: try words, recursively solve rest, collect results.
        </div>
      </div>

      {step.substring && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Remaining Substring
          </div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#0c4a6e', fontWeight: 500 }}>
            "{step.substring}"
          </div>
        </motion.div>
      )}

      {step.word && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Matched Word
          </div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#065f46', fontWeight: 600 }}>
            "{step.word}"
          </div>
        </motion.div>
      )}

      {step.currentPath && step.currentPath.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Current Path
          </div>
          <div style={{ fontSize: 12, color: '#5b21b6' }}>
            {step.currentPath.join(' ')}
          </div>
        </motion.div>
      )}

      {step.allResults && step.allResults.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Valid Combinations ({step.allResults.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
            {step.allResults.map((result, idx) => (
              <div key={idx} style={{ fontSize: 11, color: '#065f46' }}>
                {result.join(' ')}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function WordBreakIIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.s, input.wordDict).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panels into consts
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} linePatternMap={LINE_PATTERN_MAP} />}
    </div>
  )

  const primaryPanel = (
    <div className="wbii-panel">
      <VisualizationPanel step={step} />
    </div>
  )

  const statusPanel = (
    <div className="wbii-status">
      <div style={{ fontSize: 11, color: '#cbd5e1', padding: '4px 8px' }}>
        Step {stepIndex >= 0 ? stepIndex + 1 : 0} / {steps.length}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '📝 Word Break II', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="wbii-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
