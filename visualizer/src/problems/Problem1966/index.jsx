import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const fmt = v => (Number.isFinite(v) ? v : v < 0 ? '-∞' : '∞')

const definition = {
  number: '1966',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of distinct integers (e.g. [1,3,2])',
  url: 'https://leetcode.com/problems/binary-searchable-numbers-in-an-unsorted-array/',
  complexity: 'O(n) time and O(n) space for the prefix maxima and suffix minima.',
  examples: [
    { label: 'Sorted', input: '[1,2,3,4,5]' },
    { label: 'One survivor', input: '[1,3,2]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Extreme values', input: '[-10000,10000]' },
    { label: 'Long run: twelve values', input: '[-9915,-9663,-7307,-7295,-7077,-6789,-6309,-5704,-5659,-5355,-4590,-4405]' },
  ],
}

export default function Problem1966Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const nums = run.input.nums
      return <table aria-label="Binary search checks" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Position</th>{nums.map((_, i) => <th key={i}>{i}</th>)}</tr></thead>
        <tbody>
          <tr><th>value</th>{nums.map((v, i) => <td key={i} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)', background: i === step.i ? 'color-mix(in srgb, var(--primary) 25%, var(--surface2))' : 'var(--surface2)' }}>{v}</td>)}</tr>
          <tr><th>max to left</th>{nums.map((_, i) => <td key={i} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)' }}>{step.leftMax[i] === undefined ? '' : fmt(step.leftMax[i])}</td>)}</tr>
          <tr><th>min to right</th>{nums.map((_, i) => <td key={i} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)' }}>{step.rightMin[i] === undefined ? '' : fmt(step.rightMin[i])}</td>)}</tr>
          <tr><th>guaranteed</th>{nums.map((_, i) => <td key={i} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)' }}>{step.ok && step.ok[i] !== undefined ? (step.ok[i] ? 'yes' : 'no') : ''}</td>)}</tr>
        </tbody>
      </table>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>A value is found no matter where the pivots fall when its left neighbours are all smaller and its right neighbours all larger.</p>
    </>}
  />
}
