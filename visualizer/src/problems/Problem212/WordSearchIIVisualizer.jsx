import { useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import LuminoDockPanel from "../../components/LuminoDockPanel"
import FloatingPanel from "../../components/shared/FloatingPanel"
import ManualInputPanel from "../../components/shared/ManualInputPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import "./WordSearchIIVisualizer.css"
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def findWords(board, words):" },
  { line: 2, text: "    trie = build_trie(words)" },
  { line: 3, text: "    result = []" },
  { line: 4, text: "    for i in range(len(board)):" },
  { line: 5, text: "        for j in range(len(board[0])):" },
  { line: 6, text: "            dfs(board, i, j, trie, result)" },
  { line: 7, text: "    return result" },
  { line: 8, text: "def dfs(board, i, j, node, result):" },
  { line: 9, text: "    char = board[i][j]" },
  { line: 10, text: "    if char not in node.children: return" },
  { line: 11, text: "    child = node.children[char]" },
  { line: 12, text: "    if child.word:" },
  { line: 13, text: "        result.append(child.word)" },
  { line: 14, text: "        child.word = None" },
  { line: 15, text: "    board[i][j] = '#'" },
  { line: 16, text: "    for di, dj in [(0,1),(1,0),(0,-1),(-1,0)]:" },
  { line: 17, text: "        ni, nj = i + di, j + dj" },
  { line: 18, text: "        if 0 <= ni < len(board) and 0 <= nj < len(board[0]):" },
  { line: 19, text: "            if board[ni][nj] != '#':" },
  { line: 20, text: "                dfs(board, ni, nj, child, result)" },
  { line: 21, text: "    board[i][j] = char" },
]

function buildTrie(words) {
  const root = { children: {}, word: null }
  for (const word of words) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) node.children[char] = { children: {}, word: null }
      node = node.children[char]
    }
    node.word = word
  }
  return root
}

function generateSteps(board, words) {
  const steps = []
  const boardStr = board.map((r) => r.join("")).join("\n")
  steps.push({
    activeLine: 1,
    board,
    words,
    message: `Search for words in ${board.length}x${board[0].length} grid`,
    relatedLines: [1],
  })

  const trie = buildTrie(words)
  steps.push({
    activeLine: 2,
    board,
    message: `Built trie from ${words.length} words`,
    relatedLines: [2],
  })

  steps.push({
    activeLine: 4,
    board,
    message: "Start DFS from each cell",
    relatedLines: [4, 5, 6],
  })

  const result = []
  const visited = new Set()

  for (let i = 0; i < board.length && result.length < 3; i++) {
    for (let j = 0; j < board[0].length && result.length < 3; j++) {
      const char = board[i][j]
      steps.push({
        activeLine: 6,
        i,
        j,
        char,
        board,
        currentPos: [i, j],
        message: `Start DFS at (${i},${j}): "${char}"`,
        relatedLines: [6],
      })

      function dfs(ii, jj, node, path = "") {
        if (Object.keys(node.children || {}).length === 0) return
        const c = board[ii][jj]
        if (c === "#") return

        if (c in node.children) {
          const child = node.children[c]
          const newPath = path + c
          steps.push({
            activeLine: 11,
            i: ii,
            j: jj,
            char: c,
            path: newPath,
            currentPos: [ii, jj],
            message: `Found char "${c}": path = "${newPath}"`,
            relatedLines: [11],
          })

          if (child.word) {
            result.push(child.word)
            steps.push({
              activeLine: 13,
              word: child.word,
              message: `Word found: "${child.word}"`,
              relatedLines: [13],
            })
          }

          board[ii][jj] = "#"
          const dirs = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ]
          for (const [di, dj] of dirs) {
            const ni = ii + di
            const nj = jj + dj
            if (ni >= 0 && ni < board.length && nj >= 0 && nj < board[0].length && board[ni][nj] !== "#") {
              dfs(ni, nj, child, newPath)
            }
          }
          board[ii][jj] = c
        }
      }

      dfs(i, j, trie)
    }
  }

  steps.push({
    activeLine: 7,
    result,
    done: true,
    message: `Found ${result.length} words: [${result.slice(0, 3).join(", ")}]`,
    relatedLines: [7],
  })

  return steps
}

function GridDisplay({ board, highlightedCell, currentPath = [] }) {
  return (
    <div style={{ display: "inline-block", gap: 2, backgroundColor: "var(--surface2)", padding: 8, borderRadius: 4 }}>
      {board.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
          {row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  cell === "#"
                    ? "var(--text-muted)"
                    : highlightedCell && highlightedCell[0] === i && highlightedCell[1] === j
                      ? "#fbbf24"
                      : currentPath.some((p) => p[0] === i && p[1] === j)
                        ? "#93c5fd"
                        : "var(--border)",
                borderRadius: 4,
                fontFamily: "monospace",
                fontWeight: 700,
                color: cell === "#" ? "var(--text-muted)" : "#fff",
                fontSize: 14,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {cell}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Trie-based backtracking: DFS with adjacent cell exploration.
        </div>
      </div>

      {step.board && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Grid
          </div>
          <GridDisplay board={step.board} highlightedCell={step.currentPos} />
        </motion.div>
      )}

      {step.words && step.words.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 6 }}>
            Words to find
          </div>
          <div style={{ fontSize: 11, color: "#5b21b6", fontFamily: "monospace" }}>
            {step.words.slice(0, 4).join(", ")}
            {step.words.length > 4 && "..."}
          </div>
        </motion.div>
      )}

      {step.path && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontFamily: "monospace" }}>
            Current path: {step.path}
          </div>
        </motion.div>
      )}

      {step.word && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>
            ✓ Found: "{step.word}"
          </div>
        </motion.div>
      )}

      {step.result && (
        <motion.div style={{ padding: 12, backgroundColor: "#d1fae5", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 4 }}>
            Results ({step.result.length})
          </div>
          <div style={{ fontSize: 11, color: "#065f46" }}>{step.result.join(", ")}</div>
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

export default function WordSearchIIVisualizer() {
  const [boardInput, setBoardInput] = useState('[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]')
  const [wordsInput, setWordsInput] = useState('["oath","pea","eat","rain"]')

  const { board, words, inputError } = useMemo(() => {
    const fallback = {
      board: [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]],
      words: ["oath", "pea", "eat", "rain"],
    }
    try {
      const parsedBoard = JSON.parse(boardInput)
      if (!Array.isArray(parsedBoard) || parsedBoard.length === 0 || !parsedBoard.every(Array.isArray)) {
        throw new Error('board must be a non-empty array of rows, e.g. [["a","b"],["c","d"]]')
      }
      const width = parsedBoard[0].length
      if (width === 0 || !parsedBoard.every((r) => r.length === width)) {
        throw new Error('board rows must all be the same non-zero length')
      }
      if (!parsedBoard.every((r) => r.every((c) => typeof c === 'string'))) {
        throw new Error('board cells must be strings')
      }
      const parsedWords = JSON.parse(wordsInput)
      if (!Array.isArray(parsedWords) || !parsedWords.every((w) => typeof w === 'string')) {
        throw new Error('words must be an array of strings, e.g. ["oath","eat"]')
      }
      return { board: parsedBoard, words: parsedWords, inputError: '' }
    } catch (e) {
      return { ...fallback, inputError: e.message }
    }
  }, [boardInput, wordsInput])

  const steps = useMemo(() => generateSteps(board.map((r) => [...r]), words).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [board, words])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[
          { key: 'board', label: 'board', type: 'array' },
          { key: 'words', label: 'words', type: 'array' },
        ]}
        values={{ board: boardInput, words: wordsInput }}
        onChange={(k, v) => {
          if (k === 'board') setBoardInput(v)
          else if (k === 'words') setWordsInput(v)
          handleReset()
        }}
        inputError={inputError}
        showExamples={false}
      />
      <VisualizationPanel step={step} />
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: "code", title: "Code" },
      { id: "viz", title: "🔤 Grid Search", dockMode: "split-right" },
    ],
    []
  )
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
        <FloatingPanel title="Controls">
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

