import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './WordLadderIIVisualizer.css'

const EXAMPLES = getExamples('word-ladder-ii') || [
  { label: 'Example 1', beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] },
  { label: 'Example 2', beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] },
]

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
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.beginWord, input.endWord, input.wordList).map((s) => ({
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

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🔗 Word Ladder II',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
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
