import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1578',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with colors (string) and neededTime (JSON list)',
  url: 'https://leetcode.com/problems/minimum-time-to-make-rope-colorful/',
  complexity: 'O(n) time and O(1) extra space: one pass that tracks the current group sum and maximum.',
  examples: [
    { label: 'Sample A', input: '{"colors":"aabaa","neededTime":[1,2,3,4,1]}' },
    { label: 'Long run', input: '{"colors":"cccca","neededTime":[5,1,7,2,3]}' },
    { label: 'No repeats', input: '{"colors":"abcd","neededTime":[4,3,2,1]}' },
  ],
}

export default function ColourfulRope() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { colors, neededTime } = run.input
    const { start, end, j, best, total, removed } = step.snapshot
    return <>
      <div role="img" aria-label="Balloons in a row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {colors.split('').map((c, k) => {
          const inGroup = start >= 0 && k >= start && (end >= 0 ? k <= end : k <= j)
          return <div key={k} data-index={k} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${k === j || k === best ? 2 : 1}px solid ${k === best ? '#16a34a' : 'var(--border)'}`,
            background: removed.includes(k) ? '#fecaca' : inGroup ? 'var(--surface2)' : 'transparent', color: '#1c1917',
          }}><div>{c} · {neededTime[k]}</div><small>{k}</small></div>
        })}
      </div>
      <p>Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Groups:</strong> only neighbours with the same colour conflict, so each run is handled on its own.</p>
    <p><strong>Within a run:</strong> keep the most expensive balloon and remove the rest, which costs the run total minus that maximum.</p>
  </>} />
}
