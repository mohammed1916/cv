import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a list nums (JSON)',
  url: 'https://leetcode.com/problems/largest-unique-number/',
  complexity: 'O(n) time to count and O(k log k) to order the k distinct values, with O(k) extra space. The visualization caps the list at 20 entries.',
  examples: [
    { label: 'Mixed repeats', input: '{"nums":[5,7,7,3,5,9]}' },
    { label: 'No unique value', input: '{"nums":[4,4,2,2]}' },
    { label: 'Single zero', input: '{"nums":[0]}' },
  ],
}

export default function LargestUniqueNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const entries = Object.entries(step.snapshot.counts).sort((a, b) => Number(b[0]) - Number(a[0]))
    return <>
      <table aria-label="Counts by value" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th style={{ padding: '4px 10px' }}>Value</th><th style={{ padding: '4px 10px' }}>Count</th></tr></thead>
        <tbody>{entries.map(([value, count]) => {
          const current = String(step.snapshot.current) === value
          return <tr key={value} data-value={value} style={{ background: current ? 'var(--surface2)' : 'transparent', fontWeight: count === 1 ? 700 : 400 }}>
            <td style={{ padding: '4px 10px' }}>{value}</td><td style={{ padding: '4px 10px' }}>{count}</td>
          </tr>
        })}</tbody>
      </table>
      <output aria-label="Answer so far">{`Answer: ${step.snapshot.answer ?? '–'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Count first:</strong> every appearance adds one to its value's count.</p>
    <p><strong>Search from the top:</strong> the first value, scanning downward from the largest, whose count is exactly one is the answer.</p>
  </>} />
}
