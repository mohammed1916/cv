import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'factor', label: 'Primes', description: 'Record the last index where each prime appears.' },
    { id: 'scan', label: 'Scan splits', description: 'Track how far the prefix primes reach.' },
    { id: 'done', label: 'Complete', description: 'Report the first valid split.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/split-the-array-to-make-coprime-products/',
  complexity: 'O(n * sqrt(M)) time for n values up to M, using trial division. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,7,8,15,3,5]}' },
    { label: 'Example 2', input: '{"nums":[4,7,15,8]}' },
  ],
}

export default function CoprimeProductSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Prime factors">
      <thead><tr><th>Index</th><th>Value</th><th>Prime factors</th></tr></thead>
      <tbody>{run.input.nums.map((value, i) => <tr key={i} className={i === step.index ? 'is-active' : ''}>
        <td>{i}</td><td>{value}</td><td>{run.factors[i].join(', ') || 'none'}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Reach">{`Reach ${step.reach}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Two products share no prime exactly when every prime in the prefix ends before the split.</p>
    <p>Tracking the furthest last index among the prefix primes answers that in one pass.</p>
  </>} />
}
