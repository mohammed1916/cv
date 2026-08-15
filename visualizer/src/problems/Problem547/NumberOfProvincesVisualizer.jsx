import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './NumberOfProvinces.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['check', 'loop']

const LINE_PATTERN_MAP = {
  3: 'loop',
  12: 'check',
  13: 'check'
}


const SOLUTION_CODE = [
  { line: 1, text: 'def findCircleNum(isConnected):' },
  { line: 2, text: '    n = len(isConnected)' },
  { line: 3, text: '    parent = list(range(n))' },
  { line: 4, text: '    def find(x):' },
  { line: 5, text: '        if parent[x] != x: parent[x] = find(parent[x])' },
  { line: 6, text: '        return parent[x]' },
  { line: 7, text: '    def union(x, y):' },
  { line: 8, text: '        px, py = find(x), find(y)' },
  { line: 9, text: '        if px != py: parent[px] = py' },
  { line: 10, text: '    for i in range(n):' },
  { line: 11, text: '        for j in range(i+1, n):' },
  { line: 12, text: '            if isConnected[i][j]: union(i, j)' },
  { line: 13, text: '    return len(set(find(i) for i in range(n)))' },
]

function generateSteps(isConnected) {
  const steps = []
  const n = isConnected.length
  const parent = Array.from({ length: n }, (_, i) => i)

  steps.push({
    activeLine: 3,
    parent: [...parent],
    connections: [],
    visited: new Set(),
    message: `Initialize union-find with ${n} nodes. Each node is its own parent.`,
  })

  const find = (x) => {
    if (parent[x] === x) return x
    parent[x] = find(parent[x])
    return parent[x]
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j]) {
        const px = find(i)
        const py = find(j)

        if (px !== py) {
          parent[px] = py
          steps.push({
            activeLine: 12,
            parent: [...parent],
            connections: [[i, j]],
            visited: new Set([i, j]),
            highlighted: [i, j],
            message: `Connected(${i}, ${j}): Union roots ${px} and ${py}.`,
          })
        }
      }
    }
  }

  const roots = new Set()
  for (let i = 0; i < n; i++) {
    roots.add(find(i))
  }

  steps.push({
    activeLine: 13,
    parent: [...parent],
    connections: [],
    visited: new Set(),
    provinceCount: roots.size,
    message: `Complete. Found ${roots.size} province(s) (connected component(s)).`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Two Provinces',
    isConnected: [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 1],
    ],
  },
  {
    label: 'Example 2: Three Provinces',
    isConnected: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  },
  {
    label: 'Example 3: One Province',
    isConnected: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
  {
    label: 'Example 4: Complex',
    isConnected: [
      [1, 0, 0, 1],
      [0, 1, 1, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
    ],
  },
]

export default function NumberOfProvincesVisualizer() {
  const [isConnectedInput, setIsConnectedInput] = useState(JSON.stringify(EXAMPLES[0].isConnected))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0].label)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { isConnected, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(isConnectedInput)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('isConnected must be a non-empty 2D array')
      }
      if (!parsed.every((row) => Array.isArray(row) && row.length === parsed.length)) {
        throw new Error('isConnected must be a square matrix (n x n)')
      }
      if (!parsed.every((row) => row.every((v) => v === 0 || v === 1))) {
        throw new Error('isConnected entries must be 0 or 1')
      }
      return { isConnected: parsed, inputError: '' }
    } catch (e) {
      return { isConnected: [[1]], inputError: e.message }
    }
  }, [isConnectedInput])

  const steps = useMemo(() => generateSteps(isConnected), [isConnected])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] ?? null : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((example) => {
    setIsConnectedInput(JSON.stringify(example.isConnected))
    setActiveLabel(example.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'isConnected') setIsConnectedInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const n = isConnected.length

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔗 Union-Find Graph', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

          <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />


          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <ManualInputPanel
            fields={[{ key: 'isConnected', label: 'isConnected', type: 'array' }]}
            values={{ isConnected: isConnectedInput }}
            onChange={handleFieldChange}
            examples={EXAMPLES}
            activeLabel={activeLabel}
            applyExample={applyExample}
            inputError={inputError}
          />

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Union-Find State:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({ length: n }).map((_, i) => {
                    const parent = step.parent[i]
                    const isHighlighted = step.highlighted?.includes(i)
                    const isRoot = parent === i
                    return (
                      <motion.div
                        key={i}
                        animate={{ scale: isHighlighted ? 1.15 : 1 }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: isHighlighted ? '2px solid #0ea5e9' : '1px solid var(--border)',
                          backgroundColor: isHighlighted ? '#0ea5e9' : isRoot ? '#dcfce7' : 'var(--surface2)',
                          color: isHighlighted ? '#fff' : 'var(--surface2)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {i} → {parent !== i ? parent : 'ROOT'}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#f0fdf4', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#166534' }}>Adjacency Matrix:</div>
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
                  {Array.from({ length: n }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: n }).map((_, j) => {
                        const isCellConnected = isConnected[i][j] === 1
                        const isHighlighted = step.highlighted?.includes(i) && step.highlighted?.includes(j)
                        return (
                          <motion.div
                            key={`${i}-${j}`}
                            animate={{ scale: isHighlighted ? 1.2 : 1 }}
                            style={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              border: isHighlighted ? '2px solid #ef4444' : '1px solid var(--border)',
                              backgroundColor: isHighlighted ? '#ef4444' : isCellConnected ? '#dcfce7' : '#f5f5f5',
                              color: isHighlighted ? '#fff' : 'var(--surface2)',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {isConnected[i][j]}
                          </motion.div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {step.provinceCount !== undefined && (
                <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                  Provinces Found: {step.provinceCount}
                </div>
              )}
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, applyExample, handleFieldChange, isConnectedInput, activeLabel, inputError, n, isConnected, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
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
      
    </div>
  )
}
