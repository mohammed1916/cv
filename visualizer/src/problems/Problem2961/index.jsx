import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
    { id: 'reduce', label: 'Reduce', description: 'Compute a^b modulo 10.' },
    { id: 'power', label: 'Power', description: 'Raise that to c, modulo m.' },
    { id: 'keep', label: 'Keep', description: 'The value matches the target, so keep the index.' },
    { id: 'skip', label: 'Skip', description: 'The value does not match the target.' },
    { id: 'done', label: 'Complete', description: 'Report every matching index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with variables ([a, b, c, m] rows) and target (JSON)',
  url: 'https://leetcode.com/problems/double-modular-exponentiation/',
  complexity: 'O(n log max(b, c)) time for n variables. The visualization caps n at 6.',
  examples: [
    { label: 'Example 1', input: '{"variables":[[2,3,3,10],[3,3,3,1],[6,1,1,4]],"target":2}' },
    { label: 'No match', input: '{"variables":[[39,3,1000,1000]],"target":17}' },
  ],
}

export default function DoubleModularExponentiation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Variables and results">
      <thead><tr><th>Index</th><th>[a, b, c, m]</th><th>x = a^b mod 10</th><th>y = x^c mod m</th></tr></thead>
      <tbody>{run.input.variables.map((row, i) => <tr key={i} data-role={i === step.at ? 'active' : undefined}>
        <td>{i}</td><td>[{row.join(', ')}]</td>
        <td>{i === step.at && step.x !== null ? step.x : ''}</td>
        <td>{i === step.at && step.y !== null ? step.y : ''}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Result so far">{`Target ${run.input.target}. Matches so far: [${step.result.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>The expression is ((a^b mod 10)^c) mod m. Taking the power modulo 10 first keeps the numbers small, and the second power is then reduced modulo m.</p>
    <p>A modulus of one makes every value zero, which the reduction handles without a special case.</p>
  </>} />
}
