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
import "./AddAndSearchWordVisualizer.css"
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
  { line: 4, text: "        self.is_word = False" },
  { line: 5, text: "class WordDictionary:" },
  { line: 6, text: "    def addWord(self, word):" },
  { line: 7, text: "        node = self.root" },
  { line: 8, text: "        for char in word:" },
  { line: 9, text: "            if char not in node.children:" },
  { line: 10, text: "                node.children[char] = TrieNode()" },
  { line: 11, text: "            node = node.children[char]" },
  { line: 12, text: "        node.is_word = True" },
  { line: 13, text: "    def search(self, word):" },
  { line: 14, text: "        def dfs(idx, node):" },
  { line: 15, text: "            if idx == len(word):" },
  { line: 16, text: "                return node.is_word" },
  { line: 17, text: "            char = word[idx]" },
  { line: 18, text: "            if char == '.': " },
  { line: 19, text: "                for child in node.children.values():" },
  { line: 20, text: "                    if dfs(idx + 1, child): return True" },
  { line: 21, text: "            elif char in node.children:" },
  { line: 22, text: "                return dfs(idx + 1, node.children[char])" },
  { line: 23, text: "            return False" },
  { line: 24, text: "        return dfs(0, self.root)" },
]

const EXAMPLES = [
  { label: 'Wildcard match', word: '.ad', isAdd: 'false' },
  { label: 'Exact match', word: 'bad', isAdd: 'false' },
  { label: 'Missing word', word: 'pad', isAdd: 'false' },
  { label: 'Add word', word: 'sad', isAdd: 'true' },
]

function buildWordTrie(words) {
  const root = { children: {}, isWord: false, val: "ROOT" }
  for (const word of words) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) node.children[char] = { children: {}, isWord: false, val: char }
      node = node.children[char]
    }
    node.isWord = true
  }
  return root
}

function generateSteps(word, isAdd, trie, addedWords) {
  const steps = []
  const action = isAdd ? "Add" : "Search"
  steps.push({
    activeLine: isAdd ? 6 : 13,
    word,
    action,
    message: `${action} word: "${word}"`,
    relatedLines: [isAdd ? 6 : 13],
  })

  if (isAdd) {
    const found = addedWords.some((candidate) => candidate.length === word.length && [...word].every((char, index) => char === '.' || char === candidate[index]))
    steps.push({
      activeLine: 7,
      word,
      message: "Start at root node",
      relatedLines: [7],
    })
    steps.push({
      activeLine: 8,
      word,
      message: `Process each character: [${word.split("").join(", ")}]`,
      relatedLines: [8],
    })

    let pathChars = []
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      pathChars.push(char)
      steps.push({
        activeLine: 8,
        i,
        char,
        word,
        pathChars: [...pathChars],
        message: `Char ${i + 1}/${word.length}: "${char}"`,
        relatedLines: [8],
      })
      steps.push({
        activeLine: 9,
        i,
        char,
        message: `Check if child exists`,
        relatedLines: [9],
      })
      steps.push({
        activeLine: 11,
        i,
        char,
        pathChars: [...pathChars],
        message: `Move to child node`,
        relatedLines: [11],
      })
    }

    steps.push({
      activeLine: 12,
      word,
      pathChars,
      message: `Mark as end-of-word`,
      relatedLines: [12],
    })
    steps.push({
      activeLine: 12,
      word,
      done: true,
      result: true,
      message: `Added "${word}"`,
      relatedLines: [12],
    })
  } else {
    steps.push({
      activeLine: 14,
      word,
      message: "Start DFS search from root",
      relatedLines: [14],
    })
    steps.push({
      activeLine: 15,
      word,
      message: "Will check each character with wildcard support",
      relatedLines: [15],
    })

    let pathChars = []
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      if (char === ".") {
        pathChars.push(".")
        steps.push({
          activeLine: 18,
          i,
          char: ".",
          word,
          pathChars: [...pathChars],
          message: `Wildcard at position ${i}: can match any character`,
          relatedLines: [18, 19],
        })
        steps.push({
          activeLine: 20,
          i,
          message: `Try all children recursively`,
          relatedLines: [20],
        })
      } else {
        pathChars.push(char)
        steps.push({
          activeLine: 17,
          i,
          char,
          word,
          pathChars: [...pathChars],
          message: `Exact match required for "${char}"`,
          relatedLines: [17],
        })
        steps.push({
          activeLine: 21,
          i,
          char,
          message: `Check if child "${char}" exists`,
          relatedLines: [21],
        })
      }
    }

    steps.push({
      activeLine: 16,
      word,
      pathChars,
      done: true,
      result: found,
      message: found ? 'Found matching word' : 'No matching word exists',
      relatedLines: [16],
    })
  }

  return steps
}

function TrieNodeDisplay({ node, level = 0, maxLevel = 2, highlighted = [] }) {
  if (level > maxLevel || !node) return null
  const children = Object.entries(node.children || {}).sort(([a], [b]) => a.localeCompare(b))
  if (children.length === 0) return null

  return (
    <div style={{ marginLeft: level > 0 ? 16 : 0, marginTop: 6 }}>
      {children.map(([char, child]) => (
        <motion.div
          key={char}
          style={{
            padding: 6,
            backgroundColor: highlighted.includes(char) ? "#fbbf24" : "var(--text)",
            borderRadius: 3,
            marginBottom: 4,
            fontSize: 11,
            fontFamily: "monospace",
            fontWeight: 600,
            color: highlighted.includes(char) ? "#000" : "var(--border)",
            border: child.isWord ? "2px solid #06b6d4" : "1px solid var(--text-muted)",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {char}
          {child.isWord && " ✓"}
        </motion.div>
      ))}
      {children.map(([char, child]) => (
        <div key={`tree-${char}`}>
          <TrieNodeDisplay node={child} level={level + 1} maxLevel={maxLevel} highlighted={highlighted} />
        </div>
      ))}
    </div>
  )
}

function VisualizationPanel({ step, trie }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Trie with wildcard: "." matches any single character during search.
        </div>
      </div>

      {step.word && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>
            Word: "{step.word}"
          </div>
        </motion.div>
      )}

      {step.action && (
        <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#5b21b6" }}>
            Operation: {step.action}
          </div>
        </motion.div>
      )}

      {step.pathChars && step.pathChars.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>
            Path: {step.pathChars.join(" → ")}
          </div>
        </motion.div>
      )}

      {trie && (
        <motion.div style={{ padding: 12, backgroundColor: "#f5f3ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 8 }}>
            Trie Structure
          </div>
          <TrieNodeDisplay node={trie} highlighted={step.pathChars || []} />
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: step.result ? "#dcfce7" : "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: step.result ? "#0c865d" : "#b91c1c" }}>
            {step.action === "Add" ? "Added ✓" : step.result ? "Found ✓" : "Not found"}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function AddAndSearchWordVisualizer() {
  const [addedWords, setAddedWords] = useState(["bad", "dad", "mad"])
  const [searchWordInput, setSearchWordInput] = useState(EXAMPLES[0].word);
  const [isAddInput, setIsAddInput] = useState(EXAMPLES[0].isAdd);
  const { isAdd, searchWord, inputError } = useMemo(() => {
    try {
      const parsedIsAdd = isAddInput === 'true'; if (!['true', 'false'].includes(isAddInput)) throw new Error('isAdd must be true or false.');
      const parsedSearchWord = searchWordInput.trim().toLowerCase(); if (!/^[a-z.]+$/.test(parsedSearchWord)) throw new Error('Use lowercase letters and . only.');
      return { isAdd: parsedIsAdd, searchWord: parsedSearchWord, inputError: '' };
    } catch (e) {
      return { isAdd: false, searchWord: EXAMPLES[0].word, inputError: e.message };
    }
  }, [isAddInput, searchWordInput]);
  const trie = useMemo(() => buildWordTrie(isAdd ? [...addedWords, searchWord] : addedWords), [addedWords, isAdd, searchWord])
  const steps = useMemo(() => generateSteps(searchWord, isAdd, trie, addedWords).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [searchWord, isAdd, trie, addedWords])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )

  const vizPanel = <VisualizationPanel step={step} trie={trie} />

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'input', title: 'Input' },
      { id: "viz", title: "🔍 Wildcard Search", dockMode: "split-bottom" },
      { id: "code", title: "Code", dockMode: "split-right" },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'searchWord', label: 'Word / wildcard', type: 'string' }, { key: 'isAdd', label: 'isAdd: true | false', type: 'string' }]} values={{ searchWord: searchWordInput, isAdd: isAddInput }} onChange={(key, value) => { if (key === 'searchWord') setSearchWordInput(value); if (key === 'isAdd') setIsAddInput(value); handleReset() }} examples={EXAMPLES} activeLabel={null} applyExample={(example) => { setSearchWordInput(example.word); setIsAddInput(example.isAdd); handleReset() }} inputError={inputError} />, panelDivs.input)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
            patternOverlayLabel="Pattern"
            showPatternOverlayToggle
          />
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
