import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Distinct values', description: 'Only distinct values of nums can form pairs.' },
    { id: 'tally', label: 'Tally bits', description: 'Count distinct values for each number of set bits.' },
    { id: 'pair', label: 'Combine', description: 'Pair every bit count x with every bit count y that is large enough.' },
    { id: 'done', label: 'Complete', description: 'Report the number of excellent pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive integers and k as JSON, e.g. {"nums": [1,2,3,1], "k": 3}',
  url: 'https://leetcode.com/problems/number-of-excellent-pairs/',
  complexity: 'O(d + 32 * 32) time for d distinct values. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums": [1,2,3,1], "k": 3}' },
    { label: 'Example 2', input: '{"nums": [5,1,1], "k": 10}' },
  ],
}

export default function ExcellentPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = step.tally.map((count, bits) => ({ bits, count })).filter(row => row.count > 0)
    return <>
      <table aria-label="Distinct values by set bit count">
        <thead><tr><th>Set bits</th><th>Distinct values</th></tr></thead>
        <tbody>{shown.map(row => (
          <tr key={row.bits} className={step.pair && (step.pair[0] === row.bits || step.pair[1] === row.bits) ? 'is-current' : ''}>
            <td>{row.bits}</td><td>{row.count}</td>
          </tr>
        ))}</tbody>
      </table>
      <output aria-label="Pairs so far">{`Pairs counted: ${step.total} (k = ${run.input.k})`}</output>
    </>
  }} renderReasoning={() => (
    <>
      <p>For any two numbers, the bits set in their OR plus the bits set in their AND equal the bits set in each number added together.</p>
      <p>So a pair is excellent exactly when the two set-bit counts add up to at least k, and only the distinct values matter.</p>
    </>
  )} />
}
