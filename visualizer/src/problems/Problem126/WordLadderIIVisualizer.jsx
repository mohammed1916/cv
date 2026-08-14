import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './WordLadderIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('word-ladder-ii', [
  { label: 'Example 1', beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] },
  { label: 'Example 2', beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findLadders(begin, end, wordList):' },
  { line: 2, text: '    neighbors = {w: [] for w in wordList}' },
  { line: 3, text: '    distance = {w: float("inf") for w in wordList}' },
  { line: 4, text: '    # BFS to build graph' },
  { line: 5, text: '    for i in range(len(wordList)):' },
  { line: 6, text: '        for j in range(i+1, len(wordList)):' },
  { line: 7, text: '            if oneLetterDiff(wordList[i], wordList[j]):' },
  { line: 8, text: '                neighbors[wordList[i]].append(wordList[j])' },
  { line: 9, text: '    # BFS for distances' },
  { line: 10, text: '    queue = deque([begin])' },
  { line: 11, text: '    distance[begin] = 0' },
  { line: 12, text: '    while queue:' },
  { line: 13, text: '        curr = queue.popleft()' },
  { line: 14, text: '        for neighbor in neighbors[curr]:' },
  { line: 15, text: '            if distance[neighbor] > distance[curr] + 1:' },
  { line: 16, text: '                queue.append(neighbor)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(beginWord, endWord, wordList) {
const applyInput = useCallback((e) => { setInput(e); setBeginWordInput(String(e.beginWord)); setEndWordInput(String(e.endWord)); setWordListInput(JSON.stringify(e.wordList)); handleReset(); }, [handleReset]);
    const steps = []

  if (!wordList.includes(endWord)) {
    steps.push({
      activeLine: 1,
      message: 'End word not in list - no solution',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    beginWord,
    endWord,
    wordList,
    message: `Find all shortest paths from "${beginWord}" to "${endWord}"`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    beginWord,
    endWord,
    wordList,
    message: 'Build neighbor graph (one letter different)',
    relatedLines: [2, 3],
  })

  // Simplified simulation of BFS graph building
  const neighbors = {}
  wordList.forEach((w) => {
    neighbors[w] = []
  })

  for (let i = 0; i < wordList.length; i++) {
    for (let j = i + 1; j < wordList.length; j++) {
      let diff = 0
      for (let k = 0; k < wordList[i].length; k++) {
        if (wordList[i][k] !== wordList[j][k]) diff++
      }
      if (diff === 1) {
        neighbors[wordList[i]].push(wordList[j])
        neighbors[wordList[j]].push(wordList[i])
      }
    }
  }

  steps.push({
    activeLine: 5,
    beginWord,
    endWord,
    wordList,
    neighbors,
    message: 'Graph built - computing distances via BFS',
    relatedLines: [5, 6, 7, 8],
  })

  // BFS to find distances
  const distance = {}
  wordList.forEach((w) => {
    distance[w] = Infinity
  })
  distance[beginWord] = 0

  const queue = [beginWord]
  const visited = new Set([beginWord])

  steps.push({
    activeLine: 10,
    beginWord,
    endWord,
    distance: { ...distance },
    currentLevel: 0,
    message: `Start BFS from "${beginWord}"`,
    relatedLines: [10, 11],
  })

  let level = 0
  while (queue.length > 0) {
    const levelSize = queue.length
    level++

    for (let i = 0; i < levelSize; i++) {
      const curr = queue.shift()

      if (neighbors[curr]) {
        for (const neighbor of neighbors[curr]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            distance[neighbor] = distance[curr] + 1
            queue.push(neighbor)

            steps.push({
              activeLine: 14,
              beginWord,
              endWord,
              distance: { ...distance },
              current: curr,
              neighbor,
              currentLevel: level,
              message: `${curr} → ${neighbor}, distance = ${distance[neighbor]}`,
              relatedLines: [14, 15],
            })
          }
        }
      }
    }
  }

  steps.push({
    activeLine: 16,
    beginWord,
    endWord,
    distance: { ...distance },
    done: true,
    message: `Shortest distance to "${endWord}": ${distance[endWord]}`,
    relatedLines: [16],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Two-phase approach: BFS to build neighbor graph, then DFS to find all shortest paths.
        </div>
      </div>

      {step.beginWord && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Task
          </div>
          <div style={{ fontSize: 11, color: '#0c4a6e' }}>
            Begin: <strong>{step.beginWord}</strong> → End: <strong>{step.endWord}</strong>
          </div>
        </motion.div>
      )}

      {step.distance && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Distances
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(step.distance).slice(0, 8).map(([word, dist]) => (
              <div
                key={word}
                style={{
                  padding: '4px 8px',
                  backgroundColor: dist === Infinity ? '#e9d5ff' : '#c7d2fe',
                  borderRadius: 3,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#5b21b6',
                }}
              >
                {word}: {dist === Infinity ? '∞' : dist}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.neighbor && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Edge Found
          </div>
          <div style={{ fontSize: 11, color: '#065f46', fontFamily: 'monospace' }}>
            {step.current} ↔ {step.neighbor}
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

export default function WordLadderIIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [beginWordInput, setBeginWordInput] = useState("hit");
  const [endWordInput, setEndWordInput] = useState("cog");
  const [wordListInput, setWordListInput] = useState("[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]");
  const { beginWord, endWord, wordList, inputError } = useMemo(() => {
    try {
      const parsedBeginWord = beginWordInput;
      const parsedEndWord = endWordInput;
      const parsedWordList = JSON.parse(wordListInput); if (!Array.isArray(parsedWordList)) throw new Error('wordList must be an array');
      return { beginWord: parsedBeginWord, endWord: parsedEndWord, wordList: parsedWordList, inputError: '' };
    } catch (e) {
      return { beginWord: "hit", endWord: "cog", wordList: "[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", inputError: e.message };
    }
  }, [beginWordInput, endWordInput, wordListInput]);
  const steps = useMemo(
    () =>
      generateSteps(beginWord, endWord, wordList).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [beginWord, endWord, wordList]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>
    <div className="wl2-panel">
      <div className="wl2-panel-head">🔗 Word Ladder II</div>
      <div className="wl2-panel-body">
        <VisualizationPanel step={step} />
      </div>
    </div>
  
    </>)

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

  const statusPanel = (
    <div className="wl2-status">
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
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
    </>
  )

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Word Ladder II', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="wl2-shell">
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
    </div>
  )
}
