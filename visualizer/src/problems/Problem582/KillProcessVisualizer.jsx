import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VisualizerPlaybackSection from '../../components/VisualizerPlaybackSection'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useParsedInput } from '../../hooks/useParsedInput'
import { useApplyExample } from '../../hooks/useApplyExample'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamplesOr } from '../../config/examplesRegistry'
import './KillProcessVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'traverse',
  6: 'kill',
  7: 'cascade',
}
const PATTERNS = ['init', 'traverse', 'kill', 'cascade']
const SOLUTION_CODE = [
  { line: 1, text: 'def killProcess(pid, ppid, kill_pid):' },
  { line: 2, text: '    children = defaultdict(list)' },
  { line: 3, text: '    for i, parent in enumerate(ppid):' },
  { line: 4, text: '        children[parent].append(i)' },
  { line: 5, text: '    killed = set()' },
  { line: 6, text: '    def dfs(node):' },
  { line: 7, text: '        killed.add(node)' },
  { line: 8, text: '        for child in children[node]:' },
  { line: 9, text: '            dfs(child)' },
  { line: 10, text: '    dfs(kill_pid)' },
  { line: 11, text: '    return [pid[i] for i in killed]' },
]

const CANVAS_W = 600
const CANVAS_H = 350

// Build adjacency map from parent array
function buildProcessTree(pid, ppid, kill_pid) {
  if (!pid || !ppid || pid.length === 0) {
    return { children: new Map(), nodes: [], kill_pid: -1 }
  }

  const children = new Map()
  const nodes = []

  for (let i = 0; i < pid.length; i++) {
    const p = ppid[i]
    if (!children.has(p)) {
      children.set(p, [])
    }
    children.get(p).push(i)
    nodes.push(i)
  }

  return { children, nodes, kill_pid }
}

function generateSteps(pid, ppid, kill_pid) {
  const steps = []

  if (!pid || !ppid || pid.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 11,
      relatedLines: [11],
      message: 'Empty input.',
      killed: [],
      done: true,
    })
    return steps
  }

  const { children, nodes } = buildProcessTree(pid, ppid, kill_pid)

  // Find the index of kill_pid
  const killIdx = pid.indexOf(kill_pid)
  if (killIdx === -1) {
    steps.push({
      phase: 'done',
      activeLine: 11,
      relatedLines: [11],
      message: `Process ${kill_pid} not found.`,
      killed: [],
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 2,
    relatedLines: [2, 3, 4, 5],
    message: `Initialize children map: build adjacency list from parent array`,
    killed: new Set(),
    callStack: [],
  })

  steps.push({
    phase: 'init',
    activeLine: 5,
    relatedLines: [5],
    message: `Create killed set to track all killed processes`,
    killed: new Set(),
    callStack: [],
  })

  const killed = new Set()
  const callStack = []

  function dfs(nodeIdx) {
    callStack.push(pid[nodeIdx])

    steps.push({
      phase: 'traverse',
      activeLine: 6,
      relatedLines: [6],
      message: `Call dfs(${pid[nodeIdx]}) — process ${nodeIdx} in tree`,
      currentNode: nodeIdx,
      killed: new Set(killed),
      callStack: [...callStack],
    })

    killed.add(nodeIdx)

    steps.push({
      phase: 'kill',
      activeLine: 7,
      relatedLines: [7],
      message: `Kill process ${pid[nodeIdx]} (id: ${nodeIdx})`,
      currentNode: nodeIdx,
      killed: new Set(killed),
      callStack: [...callStack],
    })

    const childrenList = children.get(nodeIdx) || []

    if (childrenList.length > 0) {
      steps.push({
        phase: 'cascade',
        activeLine: 8,
        relatedLines: [8, 9],
        message: `Cascade: process ${pid[nodeIdx]} has ${childrenList.length} child(ren): ${childrenList.map(c => pid[c]).join(', ')}`,
        currentNode: nodeIdx,
        killed: new Set(killed),
        callStack: [...callStack],
        childrenToKill: childrenList,
      })

      for (const childIdx of childrenList) {
        dfs(childIdx)
      }
    }

    callStack.pop()

    steps.push({
      phase: 'return',
      activeLine: 9,
      relatedLines: [9],
      message: `Return from dfs(${pid[nodeIdx]})`,
      currentNode: -1,
      killed: new Set(killed),
      callStack: [...callStack],
    })
  }

  dfs(killIdx)

  const result = Array.from(killed).map(idx => pid[idx])

  steps.push({
    phase: 'done',
    activeLine: 11,
    relatedLines: [11],
    message: `Done: Killed ${result.length} process(es): [${result.join(', ')}]`,
    killed: new Set(killed),
    callStack: [],
    done: true,
  })

  return steps
}

const EXAMPLES = getExamplesOr('kill-process', [
  {
    label: 'Example 1',
    pid: [1, 3, 3, 3, 5, 6],
    ppid: [3, 1, 3, 3, 1, 5],
    kill: 5,
  },
  {
    label: 'Example 2',
    pid: [1],
    ppid: [-1],
    kill: 1,
  },
])

const SNIPPETS = [
  { id: 'init', label: 'Build Tree', lines: [2, 3, 4, 5] },
  { id: 'dfs', label: 'DFS Traverse', lines: [6] },
  { id: 'kill', label: 'Kill Process', lines: [7] },
  { id: 'cascade', label: 'Cascade Kill', lines: [8, 9] },
  { id: 'return', label: 'Return', lines: [11] },
]

function snippetIdForPhase(phase) {
  if (phase === 'done') return 'return'
  if (phase === 'traverse') return 'dfs'
  if (phase === 'kill') return 'kill'
  if (phase === 'cascade') return 'cascade'
  return 'init'
}

function ProcessNode({ idx, pid, currentNode, isKilled, isCascading, onClick }) {
  return (
    <div className="kp-node" onClick={onClick} role="button" tabIndex={0}>
      <motion.div
        className={`kp-node-circle ${currentNode === idx ? 'active' : ''} ${isKilled ? (isCascading ? 'cascading' : 'killed') : ''}`}
        animate={currentNode === idx ? { scale: 1.2 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {pid[idx]}
      </motion.div>
    </div>
  )
}

function ProcessTreeVisualization({ pid, ppid, step, children, onNodeClick }) {
  if (!pid || pid.length === 0) {
    return <div className="kp-empty">Empty input.</div>
  }

  // Find root (node with ppid -1)
  const rootIdx = ppid.findIndex(p => p === -1)
  if (rootIdx === -1) return <div className="kp-empty">Invalid tree structure.</div>

  // Build tree structure for rendering
  const renderTree = (nodeIdx) => {
    const childrenList = (children.get(nodeIdx) || []).sort((a, b) => a - b)

    if (childrenList.length === 0) {
      return (
        <ProcessNode
          key={nodeIdx}
          idx={nodeIdx}
          pid={pid}
          currentNode={step?.currentNode}
          isKilled={step?.killed?.has(nodeIdx)}
          isCascading={step?.childrenToKill?.includes(nodeIdx)}
          onClick={() => onNodeClick?.(nodeIdx)}
        />
      )
    }

    return (
      <div key={nodeIdx} className="kp-node">
        <ProcessNode
          idx={nodeIdx}
          pid={pid}
          currentNode={step?.currentNode}
          isKilled={step?.killed?.has(nodeIdx)}
          isCascading={step?.childrenToKill?.includes(nodeIdx)}
          onClick={() => onNodeClick?.(nodeIdx)}
        />
        <div className="kp-node-children">
          {childrenList.map(childIdx => (
            <div key={childIdx} className="kp-node-child">
              {renderTree(childIdx)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <div className="kp-tree">{renderTree(rootIdx)}</div>
}

export default function KillProcessVisualizer() {
  const [pidInput, setPidInput] = useState('[1,3,3,3,5,6]')
  const [ppidInput, setPpidInput] = useState('[3,1,3,3,1,5]')
  const [killInput, setKillInput] = useState('5')

  const { value: pid, error: pidError } = useParsedInput(
    pidInput,
    (s) => {
      const parsed = JSON.parse(s)
      if (!Array.isArray(parsed)) throw new Error('pid must be array')
      return parsed
    },
    [1, 3, 3, 3, 5, 6]
  )

  const { value: ppid, error: ppidError } = useParsedInput(
    ppidInput,
    (s) => {
      const parsed = JSON.parse(s)
      if (!Array.isArray(parsed)) throw new Error('ppid must be array')
      return parsed
    },
    [3, 1, 3, 3, 1, 5]
  )

  const kill_pid = useMemo(() => {
    try {
      return parseInt(killInput, 10)
    } catch {
      return -1
    }
  }, [killInput])

  const { children } = useMemo(
    () => buildProcessTree(pid, ppid, kill_pid),
    [pid, ppid, kill_pid]
  )

  const { steps } = useMemo(() => {
    const generated = generateSteps(pid, ppid, kill_pid)
    return {
      steps: generated.map((current) => ({
        ...current,
        snippetId: snippetIdForPhase(current.phase),
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    }
  }, [pid, ppid, kill_pid])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useApplyExample(
    (ex) => {
      setPidInput(JSON.stringify(ex.pid))
      setPpidInput(JSON.stringify(ex.ppid))
      setKillInput(String(ex.kill))
    },
    handleReset
  )

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })

  const vizFeatureDefs = getVisualizationFeatures('kill-process')
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  const inputError = pidError || ppidError

  return (
    <div className="kp-shell">
      <ManualInputPanel
        fields={[{"key":"pid","label":"pid","type":"string"},{"key":"ppid","label":"ppid","type":"string"},{"key":"kill","label":"kill","type":"string"}]}
        values={{ pid: pidInput, ppid: ppidInput, kill: killInput }}
        onChange={(k, v) => { if (k === 'pid') setPidInput(v); if (k === 'ppid') setPpidInput(v); if (k === 'kill') setKillInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="kp-top">
        <section className="kp-panel main">
          <header className="kp-head">
            <span>Process Tree</span>
            {inputError && <span className="kp-error">{inputError}</span>}
          </header>
          <div className="kp-body">
            <div className="kp-examples">
              {EXAMPLES.map((ex) => (
                <button key={ex.label} className="kp-chip" onClick={() => applyExample(ex)}>
                  {ex.label}
                </button>
              ))}
            </div>

            <div>
              <label style={{ color: '#6773a1', fontSize: '11px', fontWeight: 600 }}>pid (process IDs):</label>
              <input className="kp-input" value={pidInput} onChange={(e) => {
                setPidInput(e.target.value)
                handleReset()
              }} />
            </div>

            <div>
              <label style={{ color: '#6773a1', fontSize: '11px', fontWeight: 600 }}>ppid (parent IDs):</label>
              <input className="kp-input" value={ppidInput} onChange={(e) => {
                setPpidInput(e.target.value)
                handleReset()
              }} />
            </div>

            <div className="kp-control-group">
              <label>Kill Process:</label>
              <input
                type="number"
                value={killInput}
                onChange={(e) => {
                  setKillInput(e.target.value)
                  handleReset()
                }}
              />
            </div>

            <div className="kp-canvas">
              <ProcessTreeVisualization
                pid={pid}
                ppid={ppid}
                step={step}
                children={children}
              />
            </div>
          </div>
        </section>

        <section className="kp-panel kp-side-panel">
          <header className="kp-head"><span>Call Stack</span></header>
          <div className="kp-body">
            <div className="kp-stack">
              {(step?.callStack ?? []).map((val, i) => (
                <div key={i} className={`kp-frame ${i === (step.callStack.length - 1) ? 'top' : ''}`}>
                  dfs({val})
                </div>
              ))}
              {(step?.callStack?.length === 0) && <div className="kp-empty">—</div>}
            </div>
            <div
              className={`kp-result ${step?.phase === 'done' ? 'ok' : ''}`}
              style={{ marginTop: 12 }}
            >
              {step?.phase === 'done'
                ? `Killed: ${step.killed.size} process(es)`
                : step?.killed
                ? `Killed: ${step.killed.size}`
                : 'Starting…'}
            </div>
          </div>
        </section>
      </div>

      <VisualizerPlaybackSection
        step={step}
        codeLines={SOLUTION_CODE}
        statusClassName="kp-status"
        statusDone={step?.phase === 'done'}
        statusMessage={step?.message}
        fallbackStatus="Press Play to begin."
        playback={{
          stepIndex,
          stepForward,
          stepBack,
          togglePlay,
          handleReset,
          isPlaying,
          speed,
          setSpeed,
          isDone,
        }}
        connectivity={{
          snippetOptions: SNIPPETS,
          activeSnippetId: connectivity.activeSnippetId,
          highlightedLines: connectivity.highlightedLines,
          linkInfo: connectivity.linkInfo,
          onLineSelect: connectivity.handleLineSelect,
          onSnippetSelect: connectivity.handleSnippetSelect,
        }}
        visualizationFeatures={vizFeatures}
        onVisualizationToggle={toggleVizFeature}
      />
    </div>
  )
}
