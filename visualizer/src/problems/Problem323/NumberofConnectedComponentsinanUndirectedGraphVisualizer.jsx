import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './NumberofConnectedComponentsinanUndirectedGraphVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { GraphFrontierLane } from '../../components/shared'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'component', 'traverse', 'done']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'component',
  7: 'traverse',
  10: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'function countComponents(n, edges) {' },
  { line: 2, text: '  const graph = Array.from({ length: n }, () => []);' },
  { line: 3, text: '  for (const [u, v] of edges) graph[u].push(v), graph[v].push(u);' },
  { line: 4, text: '  const visited = new Set(); let components = 0;' },
  { line: 5, text: '  for (let start = 0; start < n; start++) {' },
  { line: 6, text: '    if (visited.has(start)) continue; components++;' },
  { line: 7, text: '    const stack = [start]; while (stack.length) {' },
  { line: 8, text: '      const node = stack.pop(); if (visited.has(node)) continue;' },
  { line: 9, text: '      visited.add(node); stack.push(...graph[node]);' },
  { line: 10, text: '    } } return components;' },
  { line: 11, text: '}' },
]

function generateSteps({ n, edges }) {
  const steps = []
  const graph = Array.from({ length: n }, () => [])
  edges.forEach(([u, v]) => { graph[u].push(v); graph[v].push(u) })
  const nodes = Array.from({ length: n }, (_, index) => String(index))
  const visited = new Set(); let components = 0
  steps.push({ phase: 'init', activeLine: 3, nodes, edges, visited: [], components, message: 'Build the undirected adjacency list.' })
  for (let start = 0; start < n; start += 1) {
    if (visited.has(start)) continue
    components += 1
    const stack = [start]
    steps.push({ phase: 'component', activeLine: 6, nodes, edges, visited: [...visited].map(String), activeNode: String(start), components, stack: [...stack], message: `Node ${start} is unvisited, so it starts component ${components}.` })
    while (stack.length) {
      const node = stack.pop()
      if (visited.has(node)) continue
      visited.add(node)
      for (const neighbor of graph[node]) if (!visited.has(neighbor)) stack.push(neighbor)
      steps.push({ phase: 'traverse', activeLine: 9, nodes, edges, visited: [...visited].map(String), activeNode: String(node), components, stack: [...stack], message: `Visit ${node}; add its unvisited neighbors to the DFS stack.` })
    }
  }
  steps.push({ phase: 'done', activeLine: 10, nodes, edges, visited: [...visited].map(String), components, stack: [], message: `All nodes are visited. The graph has ${components} connected component${components === 1 ? '' : 's'}.` })
  return steps
}

const EXAMPLES = getExamplesOr('connected-components-undirected', [
  { label: 'Two components', n: 5, edges: [[0, 1], [1, 2], [3, 4]] },
  { label: 'One component', n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { label: 'Isolated nodes', n: 4, edges: [[0, 1]] },
])

export default function NumberofConnectedComponentsinanUndirectedGraphVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Number.isInteger(data.n) || data.n < 0 || data.n > 12 || !Array.isArray(data.edges) || !data.edges.every((edge) => Array.isArray(edge) && edge.length === 2 && edge.every((node) => Number.isInteger(node) && node >= 0 && node < data.n))) throw new Error('Use { "n": 5, "edges": [[0, 1], [1, 2]] } with 0 ≤ node < n and n ≤ 12.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(
    () => (input ? generateSteps(input) : []).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [input],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'input', title: 'Input', dockMode: 'split-bottom' },
    { id: 'graph', title: '🕸️ DFS graph', dockMode: 'split-right' },
    { id: 'frontier', title: 'DFS frontier', dockMode: 'split-bottom' },
  ], [])
  const panelContents = {
    code: (<div style={{ position: 'relative', height: '100%', minHeight: 0 }}><CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} disableResizer />{showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}</div>),
    input: (<div className="numberof-connected-componentsinan-undirected-graph-panel"><div className="numberof-connected-componentsinan-undirected-graph-panel-head">Nodes and edges</div><div className="numberof-connected-componentsinan-undirected-graph-panel-body"><textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="numberof-connected-componentsinan-undirected-graph-textarea" placeholder="Enter input..." /><div className="numberof-connected-componentsinan-undirected-graph-examples">{EXAMPLES.map((example, i) => <button key={i} className="numberof-connected-componentsinan-undirected-graph-example-btn" onClick={() => applyExample(example)}>{example.label}</button>)}</div></div></div>),
    graph: (<div className="numberof-connected-componentsinan-undirected-graph-panel numberof-connected-componentsinan-undirected-graph-panel-viz"><div className="numberof-connected-componentsinan-undirected-graph-panel-head">DFS graph</div><div className="numberof-connected-componentsinan-undirected-graph-panel-body">
      {!input ? <div className="numberof-connected-componentsinan-undirected-graph-error">{inputError}</div> : <><div className="numberof-connected-componentsinan-undirected-graph-step-info"><h3>{step?.message ?? 'Press Play or Step to begin.'}</h3></div><GraphFrontierLane nodes={step?.nodes || []} edges={step?.edges || []} activeNode={step?.activeNode} visited={step?.visited || []} /></>}
    </div></div>),
    frontier: (<div className="numberof-connected-componentsinan-undirected-graph-panel numberof-connected-componentsinan-undirected-graph-panel-viz"><div className="numberof-connected-componentsinan-undirected-graph-panel-head">Traversal state</div><div className="numberof-connected-componentsinan-undirected-graph-panel-body"><div className="numberof-connected-componentsinan-undirected-graph-state"><span>components <b>{step?.components ?? 0}</b></span><span>DFS stack <code>[{(step?.stack || []).join(', ')}]</code></span></div></div></div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="numberof-connected-componentsinan-undirected-graph-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.input && createPortal(panelContents.input, panelDivs.input)}
            {panelDivs.graph && createPortal(panelContents.graph, panelDivs.graph)}
            {panelDivs.frontier && createPortal(panelContents.frontier, panelDivs.frontier)}
          </>
        )}
      </>
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
    </div>
  )
}
