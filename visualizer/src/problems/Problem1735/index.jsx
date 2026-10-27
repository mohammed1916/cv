import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pascal', label: 'Pascal table', description: 'Fill the binomial table needed for stars and bars.' },
    { id: 'query', label: 'Query', description: 'Factor k and multiply the binomials of its prime exponents.' },
    { id: 'done', label: 'Complete', description: 'Return the answer for every query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Queries (JSON object with queries as [n, k] pairs)',
  url: 'https://leetcode.com/problems/count-ways-to-make-array-with-product/',
  complexity: 'O(q * sqrt(k) + table size) time for q queries. The visualization caps n at 6 and k at 20.',
  examples: [
    { label: 'Two queries', input: '{"queries":[[2,6],[5,1]]}' },
    { label: 'Three queries', input: '{"queries":[[2,6],[5,1],[3,4]]}' },
  ],
}

export default function ProductArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Queries" length={run.input.queries.length}
      valueAt={i => `[${run.input.queries[i][0]}, ${run.input.queries[i][1]}]`}
      active={step.query ?? -1}
      roleAt={i => (i < step.answers.length ? `answer ${step.answers[i]}` : '')} />
    <DPTable title="Pascal’s triangle: C(i, j)" values={step.table}
      rowLabels={step.table.map((_, i) => i)} columnLabels={step.table[0].map((_, j) => j)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>An array with product k has positive entries, so each prime p with exponent e must be split across the n positions. That split is stars and bars: C(e + n - 1, n - 1).</p>
    <p>Different primes never interact, so the answer multiplies their counts.</p>
  </>} />
}
