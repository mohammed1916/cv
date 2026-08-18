import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../../components/shared/FloatingPanel"
import CodeTracePanel from "../../../components/CodeTracePanel"
import PlaybackControls from "../../../components/PlaybackControls"
import PatternOverlay from "../../../components/PatternOverlay"
import { usePlaybackState } from "../../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../../hooks/usePatternOverlay"
import ManualInputPanel from '../../../components/shared/ManualInputPanel'
import "./WordLadderIIVisualizer.css"
import { createPortal } from 'react-dom'
const SOLUTION_CODE = [
  { line: 1, text: "def findLadders(beginWord, endWord, wordList):" },
  { line: 2, text: "    neighbors = {w: [] for w in wordList}" },
  { line: 3, text: "    for w in wordList:" },
  { line: 4, text: "        for prev_w in wordList:" },
  { line: 5, text: "            if diff(w, prev_w) == 1:" },
  { line: 6, text: "                neighbors[w].append(prev_w)" },
  { line: 7, text: "    dist = {w: float(inf) for w in wordList}" },
  { line: 8, text: "    dist[beginWord] = 0" },
  { line: 9, text: "    bfs_distances(dist, neighbors, beginWord)" },
  { line: 10, text: "    result = []" },
  { line: 11, text: "    dfs(endWord, beginWord, dist, neighbors, result)" },
  { line: 12, text: "    return result" },
]

function generateSteps(beginWord, endWord, wordList) {
  const steps = []
  const words = [...new Set([...wordList, beginWord])]
  steps.push({ activeLine: 1, beginWord, endWord, message: `Find shortest paths from "${beginWord}" to "${endWord}"`, relatedLines: [1] })
  steps.push({ activeLine: 2, message: "Build word transformation graph", relatedLines: [2, 3, 4, 5, 6] })
  const oneCharDiff = (w1, w2) => w1.split("").filter((c, i) => c !== w2[i]).length === 1
  const neighbors = {}
  words.forEach(w => { neighbors[w] = [] })
  words.forEach(w1 => {
    words.forEach(w2 => {
      if (w1 !== w2 && oneCharDiff(w1, w2)) neighbors[w1].push(w2)
    })
  })
  steps.push({ activeLine: 6, neighbors: { ...neighbors }, message: "Graph edges: words differ by 1 char", relatedLines: [6] })
  steps.push({ activeLine: 7, message: "Initialize distances with BFS", relatedLines: [7, 8, 9] })
  const dist = {}
  words.forEach(w => { dist[w] = Infinity })
  dist[beginWord] = 0
  const queue = [beginWord]
  let qIdx = 0
  while (qIdx < queue.length) {
    const word = queue[qIdx++]
    steps.push({ activeLine: 9, word, dist: { ...dist }, message: `BFS from "${word}" (dist=${dist[word]})`, relatedLines: [9] })
    for (const next of neighbors[word] || []) {
      if (dist[next] > dist[word] + 1) {
        dist[next] = dist[word] + 1
        queue.push(next)
        steps.push({ activeLine: 9, next, dist: { ...dist }, message: `Update dist["${next}"]=${dist[next]}`, relatedLines: [9] })
      }
    }
  }
  steps.push({ activeLine: 11, dist: { ...dist }, message: "Start backtracking from endWord", relatedLines: [11] })
  const result = []
  function dfs(word, path) {
    if (word === beginWord) {
      const foundPath = [...path]
      result.push(foundPath)
      steps.push({ activeLine: 11, path: foundPath, result: result.map((found) => [...found]), message: `Found path: ${foundPath.join(" -> ")}`, relatedLines: [11] })
      return
    }
    for (const prev of neighbors[word] || []) {
      if (dist[prev] === dist[word] - 1) {
        steps.push({ activeLine: 11, current: word, prev, dist: { ...dist }, message: `Backtrack: "${word}" <- "${prev}"`, relatedLines: [11] })
        dfs(prev, [prev, ...path])
      }
    }
  }
  if (dist[endWord] !== Infinity) dfs(endWord, [endWord])
  steps.push({ activeLine: 12, result, done: true, message: `Found ${result.length} path(s)`, relatedLines: [12] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>BFS finds distances; DFS backtracks shortest paths.</div>
      </div>
      {step.beginWord && <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, color: "#065f46" }}>From: {step.beginWord} → To: {step.endWord}</div></motion.div>}
      {step.neighbors && Object.keys(step.neighbors).length > 0 && <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 6 }}>Graph Edges</div><div style={{ fontSize: 11, color: "#5b21b6", fontFamily: "monospace", maxHeight: 120, overflow: "auto" }}>{Object.entries(step.neighbors).slice(0, 5).map(([w, ns]) => <div key={w}>{w}: {ns.join(", ") || "none"}</div>)}</div></motion.div>}
      {step.dist && <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>Distances</div><div style={{ fontSize: 11, color: "#92400e", fontFamily: "monospace" }}>{Object.entries(step.dist).slice(0, 8).map(([w, d]) => <div key={w}>{w}: {d === Infinity ? "∞" : d}</div>)}</div></motion.div>}
      {step.path && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>{step.path.join(" → ")}</div></motion.div>}
      {step.result && step.result.length > 0 && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 6 }}>Paths Found</div><div>{step.result.slice(0, 3).map((p, i) => <div key={i} style={{ fontSize: 11, color: "#065f46" }}>{p.join(" → ")}</div>)}</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function WordLadderIIVisualizer() {
  const EXAMPLES = [{ label: 'Two shortest paths', input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] } }, { label: 'No path', input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] } }]
  const [inputText, setInputText] = useState(JSON.stringify(EXAMPLES[0].input))
  const { beginWord, endWord, wordList, inputError } = useMemo(() => { try { const value = JSON.parse(inputText); if (typeof value.beginWord !== 'string' || typeof value.endWord !== 'string' || !value.beginWord.length || value.beginWord.length !== value.endWord.length || !Array.isArray(value.wordList) || value.wordList.some(word => typeof word !== 'string' || word.length !== value.beginWord.length)) throw new Error('Use same-length beginWord/endWord strings and a same-length wordList.'); return { ...value, inputError: '' } } catch (error) { return { ...EXAMPLES[0].input, inputError: error.message } } }, [inputText])
  const steps = useMemo(() => generateSteps(beginWord, endWord, wordList).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [beginWord, endWord, wordList])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: "Word Ladder Paths", dockMode: 'split-bottom' },
    { id: 'code', title: "Code", dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel step={step} />),
  }), [step, connectivity, setActiveLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'ladder', label: 'Word ladder paths (JSON)', type: 'string' }]} values={{ ladder: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES} activeLabel={null} applyExample={(example) => { setInputText(JSON.stringify(example.input)); handleReset() }} inputError={inputError} />, panelDivs.input)}
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
