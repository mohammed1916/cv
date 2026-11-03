import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1296',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/divide-array-in-sets-of-k-consecutive-numbers/',
  complexity: 'O(n log n) time for sorting the distinct values, and O(n) space for the counts.',
  examples: [
    { label: 'Partitionable', input: '{"nums":[1,2,3,3,4,4,5,6],"k":4}' },
    { label: 'Gap in a run', input: '{"nums":[1,2,4,5,6,7],"k":3}' },
    { label: 'Length mismatch', input: '{"nums":[5,5,6,6,7,7,8,8,9],"k":4}' },
  ],
}

export default function DivideConsecutiveSets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { remaining, focus, offset, need, k } = step.snapshot
    const inRun = v => focus !== null && v >= focus && v < focus + k
    return <>
      <p>Run length {k}. {focus === null ? 'No run is being checked.' : `Starting value ${focus}, needing ${need} copies per value.`}</p>
      <div role="img" aria-label="Remaining copies" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {remaining.map(([v, c]) => <div key={v} data-value={v} style={{
          minWidth: 56, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${v === focus ? 2 : 1}px solid ${inRun(v) ? 'var(--text)' : 'var(--border)'}`,
          background: v === focus + offset && offset !== null ? '#fde68a' : inRun(v) ? 'var(--surface2)' : 'transparent', color: c === 0 ? '#a8a29e' : '#1c1917',
        }}><div>{v}</div><small>{c} left</small></div>)}
      </div>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Smallest first:</strong> the smallest value left cannot continue an earlier run, so it must start every group that still uses it.</p>
    <p><strong>Consume a run:</strong> each start consumes the same number of copies from k consecutive values, or the partition fails.</p>
    <p>{step.message}</p>
  </>} />
}
