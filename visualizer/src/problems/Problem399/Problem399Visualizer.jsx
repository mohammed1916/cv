import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = ['build_edge', 'dfs_end', 'dfs_start', 'done', 'error', 'init', 'query_invalid', 'query_start']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  6: 'build_edge',
  9: 'dfs_start',
  21: 'query_start',
  22: 'query_invalid',
  25: 'dfs_end',
  26: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def calcEquation(equations, values, queries):' },
  { line: 2, text: '    from collections import defaultdict' },
  { line: 3, text: '    graph = defaultdict(list)' },
  { line: 4, text: '    ' },
  { line: 5, text: '    for (a, b), val in zip(equations, values):' },
  { line: 6, text: '        graph[a].append((b, val))' },
  { line: 7, text: '        graph[b].append((a, 1/val))' },
  { line: 8, text: '    ' },
  { line: 9, text: '    def dfs(start, end, visited):' },
  { line: 10, text: '        if start == end:' },
  { line: 11, text: '            return 1.0' },
  { line: 12, text: '        visited.add(start)' },
  { line: 13, text: '        for neighbor, weight in graph[start]:' },
  { line: 14, text: '            if neighbor not in visited:' },
  { line: 15, text: '                result = dfs(neighbor, end, visited)' },
  { line: 16, text: '            if result > 0:' },
  { line: 17, text: '                return result * weight' },
  { line: 18, text: '        return -1.0' },
  { line: 19, text: '    ' },
  { line: 20, text: '    results = []' },
  { line: 21, text: '    for num, den in queries:' },
  { line: 22, text: '        if num not in graph or den not in graph:' },
  { line: 23, text: '            results.append(-1)' },
  { line: 24, text: '        else:' },
  { line: 25, text: '            results.append(dfs(num, den, set()))' },
  { line: 26, text: '    return results' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(equationsStr, valuesStr, queryStr) {
  const steps = []

  try {
    const equations = JSON.parse(equationsStr)
    const values = JSON.parse(valuesStr)
    const query = JSON.parse(queryStr)

    if (!Array.isArray(equations) || !Array.isArray(values) || !Array.isArray(query)) {
      throw new Error('All inputs must be arrays')
    }

    // Build graph
    const graph = {}
    equations.forEach(([a, b], idx) => {
      if (!graph[a]) graph[a] = []
      if (!graph[b]) graph[b] = []
      const val = values[idx]
      graph[a].push({ neighbor: b, weight: val })
      graph[b].push({ neighbor: a, weight: 1 / val })
    })

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Build graph from ${equations.length} equations`,
      graph,
      nodes: Object.keys(graph),
    })

    equations.forEach(([a, b], idx) => {
      const val = values[idx]
      steps.push({
        phase: 'build_edge',
        activeLine: 6,
        message: `Add edge: ${a} -> ${b} (weight: ${val}), ${b} -> ${a} (weight: ${(1/val).toFixed(4)})`,
        graph,
        nodes: Object.keys(graph),
        currentEdge: { a, b, val },
      })
    })

    // Process queries
    const results = []
    query.forEach(([num, den]) => {
      steps.push({
        phase: 'query_start',
        activeLine: 21,
        message: `Query: ${num} / ${den}`,
        graph,
        nodes: Object.keys(graph),
        currentQuery: { num, den },
      })

      if (!graph[num] || !graph[den]) {
        results.push(-1)
        steps.push({
          phase: 'query_invalid',
          activeLine: 22,
          message: `${!graph[num] ? num : den} not in graph. Result: -1`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          result: -1,
        })
      } else {
        // Simulate DFS
        let foundPath = false
        let pathResult = -1
        const visitedInDFS = new Set()
        const path = []

        // Simple DFS simulation
        function dfsSimulate(start, end, visited, currentWeight) {
          if (start === end) {
            path.push(start)
            foundPath = true
            pathResult = currentWeight
            return currentWeight
          }
          visited.add(start)
          path.push(start)

          for (const edge of graph[start]) {
            if (!visited.has(edge.neighbor)) {
              const result = dfsSimulate(edge.neighbor, end, visited, currentWeight * edge.weight)
              if (foundPath) return result
            }
          }
          path.pop()
          return -1
        }

        steps.push({
          phase: 'dfs_start',
          activeLine: 9,
          message: `Start DFS from ${num} to ${den}`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          visited: visitedInDFS,
        })

        dfsSimulate(num, den, visitedInDFS, 1.0)

        results.push(foundPath ? pathResult : -1)
        steps.push({
          phase: 'dfs_end',
          activeLine: 25,
          message: `DFS complete. Path: ${foundPath ? path.join(' -> ') : 'Not found'}. Result: ${foundPath ? pathResult.toFixed(4) : -1}`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          path: foundPath ? path : [],
          result: foundPath ? pathResult : -1,
        })
      }
    })

    steps.push({
      phase: 'done',
      activeLine: 26,
      message: `All queries processed. Results: [${results.map(r => r === -1 ? -1 : r.toFixed(4)).join(', ')}]`,
      graph,
      nodes: Object.keys(graph),
      allResults: results,
    })

  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamples('evaluate-division') || [
  { label: 'Example 1', equations: '[["a","b"],["b","c"]]', values: '[2.0,3.0]', query: '[["a","c"],["b","a"],["a","e"]]' },
  { label: 'Example 2', equations: '[["a","b"],["b","c"],["bc","cd"]]', values: '[1.5,2.5,5.0]', query: '[["a","c"],["c","b"],["bc","cd"],["cd","bc"]]' },
]

export default function Problem399Visualizer() {
  const [equationsInput, setEquationsInput] = useState('[["a","b"],["b","c"]]')
  const [valuesInput, setValuesInput] = useState('[2.0,3.0]')
  const [queryInput, setQueryInput] = useState('[["a","c"],["b","a"],["a","e"]]')

  const { equations, values, query, inputError } = useMemo(() => {
    try {
      const eqs = JSON.parse(equationsInput)
      const vals = JSON.parse(valuesInput)
      const q = JSON.parse(queryInput)
      if (!Array.isArray(eqs) || !Array.isArray(vals) || !Array.isArray(q)) {
        throw new Error('All inputs must be arrays')
      }
      return { equations: eqs, values: vals, query: q, inputError: '' }
    } catch (e) {
      return {
        equations: [["a","b"],["b","c"]],
        values: [2.0, 3.0],
        query: [["a","c"],["b","a"],["a","e"]],
        inputError: e.message || 'Invalid input'
      }
    }
  }, [equationsInput, valuesInput, queryInput])

  const steps = useMemo(
    () => generateSteps(equationsInput, valuesInput, queryInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [equationsInput, valuesInput, queryInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setEquationsInput(ex.equations)
    setValuesInput(ex.values)
    setQueryInput(ex.query)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Equations</div>
              <input
                value={equationsInput}
                onChange={(e) => { setEquationsInput(e.target.value); handleReset() }}
                placeholder='[["a","b"],["b","c"]]'
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Values</div>
              <input
                value={valuesInput}
                onChange={(e) => { setValuesInput(e.target.value); handleReset() }}
                placeholder='[2.0,3.0]'
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Query</div>
            <input
              value={queryInput}
              onChange={(e) => { setQueryInput(e.target.value); handleReset() }}
              placeholder='[["a","c"],["b","a"]]'
              style={{
                width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
              }}
            />
          </div>

          {inputError && (
            <div style={{ color: '#f87171', fontSize: '12px' }}>{inputError}</div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px', backgroundColor: '#334155', color: '#e2e8f0',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Graph Structure</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {step?.nodes?.map((node) => (
                <div key={node} style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '4px' }}>{node}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step?.graph?.[node]?.map((edge, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: step?.currentEdge?.a === node && step?.currentEdge?.b === edge.neighbor ? '#f87171' : '#334155',
                          padding: '4px 8px', borderRadius: '3px', fontSize: '11px', color: '#cbd5e1'
                        }}
                      >
                        → {edge.neighbor} ({edge.weight.toFixed(4)})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Current Query</div>
              {step?.currentQuery && (
                <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', color: '#e2e8f0', fontWeight: 'bold' }}>
                  {step.currentQuery.num} / {step.currentQuery.den}
                </div>
              )}
            </div>

            {step?.path && step.path.length > 0 && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Path Found</div>
                <div style={{ color: '#a78bfa', fontSize: '12px', fontFamily: 'monospace' }}>
                  {step.path.join(' → ')}
                </div>
              </div>
            )}

            {step?.result !== undefined && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Result</div>
                <div style={{ color: '#f87171', fontSize: '18px', fontWeight: 'bold' }}>
                  {step.result === -1 ? '-1' : step.result.toFixed(4)}
                </div>
              </div>
            )}

            {step?.allResults && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>All Results</div>
                <div style={{ color: '#f87171', fontSize: '12px', fontFamily: 'monospace', marginTop: '4px' }}>
                  [{step.allResults.map(r => r === -1 ? '-1' : r.toFixed(4)).join(', ')}]
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: step?.phase === 'done' ? '#10b98166' : step?.error ? '#ef444466' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.phase === 'done' ? '#86efac' : step?.error ? '#fca5a5' : '#cbd5e1',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div>
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
    </div>
  )
}
