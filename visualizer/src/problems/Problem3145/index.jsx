import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare to answer the queries.' },
    { id: 'exponent', label: 'Exponent sum', description: 'Sum the exponents of the range using block counts.' },
    { id: 'power', label: 'Power mod', description: 'Raise 2 to the exponent sum, modulo the query modulus.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with queries: triples [from, to, mod] with 0 <= from <= to <= 300 and 1 <= mod <= 1000, e.g. {"queries":[[1,3,7]]}',
  url: 'https://leetcode.com/problems/find-products-of-elements-of-big-array/',
  complexity: 'O(q * log^2 N) time, where N is the largest index. The visualization caps indices at 300.',
  examples: [
    { label: 'Example 1', input: '{"queries":[[1,3,7]]}' },
    { label: 'Example 2', input: '{"queries":[[2,5,3],[7,7,4]]}' },
  ],
}

export default function ProductsOfBigArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Queries">
    <thead><tr><th>Query</th><th>[from, to, mod]</th><th>Exponent sum</th><th>Answer</th></tr></thead>
    <tbody>{run.input.queries.map((q, i) => (
      <tr key={i} data-current={step.query === i ? 'yes' : undefined}>
        <td>{i}</td>
        <td>{`[${q.join(', ')}]`}</td>
        <td>{step.query === i && step.total !== null ? step.total : '-'}</td>
        <td>{step.query === i && step.value !== null ? step.value : '-'}</td>
      </tr>))}</tbody>
  </table>} renderReasoning={() => <>
    <p>Each element of the big array is a power of two, so a range product is 2 raised to the sum of the exponents in that range.</p>
    <p>Consecutive powerful arrays appear in blocks of known size, so the exponent sum up to any index comes from a closed formula plus one partial block.</p>
  </>} />
}
