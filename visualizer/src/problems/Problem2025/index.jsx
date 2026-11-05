import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2025',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array and replacement value k (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-ways-to-partition-an-array/',
  complexity: 'O(n^2) in this direct form (n capped at 30 here); a difference map gives O(n) per change.',
  examples: [
    { label: 'Change to fix', input: '{"nums":[1,2,3],"k":4}' },
    { label: 'Equal split', input: '{"nums":[1,1,1,1],"k":1}' },
    { label: 'Negative pivot', input: '{"nums":[-1,4,-1,2],"k":-3}' },
  ],
}

export default function MaximumWaysToPartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, k, total, leftSums, change, count } = step.snapshot
    return <>
      <table aria-label="Pivot sums" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '2px 6px' }}>index</th>{nums.map((_, i) => <th key={i} style={{ padding: '2px 6px' }}>{i}</th>)}</tr></thead>
        <tbody>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>value</th>{nums.map((v, i) => <td key={i} style={{
            border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center',
            background: change && change.index === i ? 'var(--primary-glow)' : 'transparent',
          }}>{change && change.index === i ? `${v}→${k}` : v}</td>)}</tr>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>left sum</th>{nums.map((_, i) => <td key={i} style={{ border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center' }}>{i >= 1 ? leftSums[i] : '-'}</td>)}</tr>
        </tbody>
      </table>
      <p>Total <strong>{total}</strong>. Pivot p is valid when its left sum is half the total.</p>
      <p>{change ? <>Changing index <strong>{change.index}</strong> to {k} (delta {change.delta}) gives <strong>{count}</strong> valid pivot(s).</> : <>Without changes: <strong>{count}</strong> valid pivot(s).</>}</p>
    </>
  }} renderReasoning={() => <p>Changing one value moves the left sum of every pivot on one side of it by the change, so the valid pivots for that change are found by matching a single difference value.</p>} />
}
