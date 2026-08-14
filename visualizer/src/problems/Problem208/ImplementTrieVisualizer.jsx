import { useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import LuminoDockPanel from "../../components/LuminoDockPanel"
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import "./ImplementTrieVisualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "class TrieNode:" },
  { line: 2, text: "    def __init__(self):" },
  { line: 3, text: "        self.children = {}" },
  { line: 4, text: "        self.is_end = False" },
  { line: 5, text: "class Trie:" },
  { line: 6, text: "    def insert(self, word):" },
  { line: 7, text: "        node = self.root" },
  { line: 8, text: "        for char in word:" },
  { line: 9, text: "            if char not in node.children:" },
  { line: 10, text: "                node.children[char] = TrieNode()" },
  { line: 11, text: "            node = node.children[char]" },
  { line: 12, text: "        node.is_end = True" },
  { line: 13, text: "    def search(self, word):" },
  { line: 14, text: "        node = self.root" },
  { line: 15, text: "        for char in word:" },
  { line: 16, text: "            if char not in node.children: return False" },
  { line: 17, text: "            node = node.children[char]" },
  { line: 18, text: "        return node.is_end" },
]

function buildTrie(words) {
  const root = { children: {}, isEnd: false, val: "ROOT" }
  for (const word of words) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) node.children[char] = { children: {}, isEnd: false, val: char }
      node = node.children[char]
    }
    node.isEnd = true
  }
  return root
}

function generateSteps(word, operation) {
  const steps = []
  steps.push({ activeLine: operation === "insert" ? 6 : 13, word, operation, message: `${operation === "insert" ? "Insert" : "Search"} word: "${word}"`, relatedLines: [operation === "insert" ? 6 : 13] })
  steps.push({ activeLine: operation === "insert" ? 7 : 14, word, message: "Start at root node", relatedLines: [operation === "insert" ? 7 : 14] })
  steps.push({ activeLine: operation === "insert" ? 8 : 15, word, message: `Process each character: [${word.split("").join(", ")}]`, relatedLines: [operation === "insert" ? 8 : 15] })
  let pathChars = []
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    pathChars.push(char)
    steps.push({ activeLine: operation === "insert" ? 9 : 16, i, char, word, pathChars: [...pathChars], message: `Character ${i + 1}/${word.length}: "${char}"`, relatedLines: [operation === "insert" ? 9 : 16] })
    if (operation === "insert") {
      steps.push({ activeLine: 10, i, char, word, pathChars: [...pathChars], message: `Create node if needed`, relatedLines: [10] })
    }
    steps.push({ activeLine: operation === "insert" ? 11 : 17, i, char, word, pathChars: [...pathChars], message: `Move to child node "${char}"`, relatedLines: [operation === "insert" ? 11 : 17] })
  }
  if (operation === "insert") {
    steps.push({ activeLine: 12, word, pathChars, message: `Mark as end of word`, relatedLines: [12] })
    steps.push({ activeLine: 12, word, result: true, done: true, message: `Inserted "${word}"`, relatedLines: [12] })
  } else {
    steps.push({ activeLine: 18, word, pathChars, message: `Check if end-of-word marked`, relatedLines: [18] })
    steps.push({ activeLine: 18, word, result: true, done: true, message: `Found "${word}"`, relatedLines: [18] })
  }
  return steps
}

function TrieDisplay({ trie, highlightedPath = [] }) {
  const renderNode = (node, depth = 0, key = "root") => {
    if (!node || Object.keys(node.children).length === 0) return null
    const children = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b))
    return (
      <div key={key} style={{ marginLeft: depth > 0 ? 20 : 0, marginTop: 8 }}>
        {children.map(([char, child]) => (
          <motion.div key={char} style={{ padding: 6, backgroundColor: highlightedPath.includes(char) ? "#fbbf24" : "#e2e8f0", borderRadius: 3, marginBottom: 4, fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: highlightedPath.includes(char) ? "#000" : "#334155", border: child.isEnd ? "2px solid #10b981" : "1px solid #94a3b8" }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {char}{child.isEnd && " ✓"}
          </motion.div>
        ))}{children.map(([char, child]) => renderNode(child, depth + 1, char))}
      </div>
    )
  }
  return <div>{renderNode(trie)}</div>
}

function VisualizationPanel({ step, trie }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>Trie: each node is a character, leaf marks end-of-word.</div>
      </div>
      {step.word && <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>Word: "{step.word}"</div></motion.div>}
      {step.operation && <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, color: "#5b21b6" }}>Operation: {step.operation}</div></motion.div>}
      {step.pathChars && step.pathChars.length > 0 && <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>Path: {step.pathChars.join(" → ")}</div></motion.div>}
      {trie && <motion.div style={{ padding: 12, backgroundColor: "#f5f3ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 8 }}>Trie Structure</div><TrieDisplay trie={trie} highlightedPath={step.pathChars || []} /></motion.div>}
      {step.result !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{step.operation === "insert" ? "Inserted" : "Found"}</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function ImplementTrieVisualizer() {
  const [wordInput, setWordInput] = useState("apple");
  const [operationInput, setOperationInput] = useState("insert");
  const { word, operation, inputError } = useMemo(() => {
    try {
      const parsedWord = wordInput;
      const parsedOperation = operationInput;
      return { word: parsedWord, operation: parsedOperation, inputError: '' };
    } catch (e) {
      return { word: "apple", operation: "insert", inputError: e.message };
    }
  }, [wordInput, operationInput]);
  const [insertedWords, setInsertedWords] = useState(["app", "apple", "apply"])
  const trie = useMemo(() => buildTrie(insertedWords), [insertedWords])
  const steps = useMemo(() => generateSteps(word, operation).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [word, operation])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )
  const vizPanel = (
    <>
    <VisualizationPanel step={step} trie={trie} />
  
    </>)
  const panelConfigs = useMemo(() => [
    { id: "code", title: "Code" },
    { id: "viz", title: "Trie Tree", dockMode: "split-right" },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle />
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

